# Project Improvement Report

## Summary

Full audit of the **shroom** monorepo (6 workspace packages: `shroom`, `cli`, `e2e`, `example`, `docs`, `storybook`). The codebase is a TypeScript-based 2D isometric room renderer built on Pixi.js, with a CLI tool for asset extraction and a WebSocket forwarding proxy.

**Key findings:** A critical data-mapping bug in `FurnitureData.ts`, `.env` files tracked in version control, a WebSocket proxy with no authentication, several deprecated/vulnerable dependencies, unbounded in-memory caches, and multiple performance anti-patterns. There are also several positive patterns already in place (cache eviction in asset bundles, fetch timeouts, XML parse-error detection, proper ESLint type-checking).

---

## High Priority Issues

| # | Title | Category | File(s) |
|---|-------|----------|---------|
| 1 | Swapped wall/floor ID mapping | Bug/Data Integrity | `packages/shroom/src/objects/furniture/FurnitureData.ts` |
| 2 | `.env` files committed to VCS | Security | `packages/e2e/.env`, `packages/example/.env`, `packages/storybook/.env` |
| 3 | WebSocket proxy has no authentication | Security | `packages/cli/src/tools/proxy/runForwardingServer.ts` |
| 4 | Protocol-relative URLs downgraded to HTTP | Security | `packages/cli/src/tools/dump/downloadFile.ts` |
| 5 | Deprecated dependency: `request` | Security | `packages/shroom/package.json` |
| 6 | Outdated `xml2js` with prototype pollution history | Security | `packages/shroom/package.json`, `packages/cli/package.json` |
| 7 | No URL validation on fetch calls | Security | Multiple asset-loading files |
| 8 | `@typescript-eslint/no-explicit-any` disabled | Security/Maintainability | `packages/shroom/eslint.config.mjs` |

## Medium Priority Improvements

| # | Title | Category | File(s) |
|---|-------|----------|---------|
| 9 | Unbounded `FurnitureLoader` and `AvatarLoader` caches | Performance/Scalability | `FurnitureLoader.ts`, `AvatarLoader.ts` |
| 10 | New EasyStar instance created per `findPath()` call | Performance | `Pathfinding.ts` |
| 11 | `JSON.parse(JSON.stringify())` deep clone | Performance | `Pathfinding.ts` |
| 12 | O(n²) variable substitution | Performance | `parseExternalVariables.ts` |
| 13 | Source maps enabled in production builds | Security/Performance | `webpack.config.js` (shroom, e2e, example) |
| 14 | Outdated GitHub Actions (checkout@v3, setup-node@v3) | Security/CI | `.github/workflows/*.yml` |
| 15 | Node.js 18 only in CI (EOL April 2025) | Security/CI | `.github/workflows/*.yml` |
| 16 | Outdated core dependencies | Maintainability | All `package.json` files |
| 17 | Bug in dump log message | Bug | `packages/cli/src/tools/dump/dump.ts` |

## Low Priority Suggestions

| # | Title | Category | File(s) |
|---|-------|----------|---------|
| 18 | Deprecated webpack `contentBase` option | Maintainability | Webpack configs |
| 19 | Manual `HotModuleReplacementPlugin` | Maintainability | Webpack configs |
| 20 | Deprecated `file-loader` | Maintainability | Webpack configs |
| 21 | `rm -rf` in build scripts (cross-platform) | Maintainability | `package.json` scripts |
| 22 | Missing `engines` field in `package.json` | Maintainability | Root `package.json` |
| 23 | `as any` type casts in RoomCamera | Maintainability | `RoomCamera.ts` |

---

## Detailed Findings

### 1. Swapped Wall/Floor ID Mapping in FurnitureData
**Priority:** High  
**Category:** Bug / Data Integrity  
**File(s):** `packages/shroom/src/objects/furniture/FurnitureData.ts` (lines 71–80, 144–147)

**Problem**  
In the `getTypeById` method, the lookup logic is inverted:
```typescript
const type =
  placementType != "floor" ? data.floorIdToType[id] : data.wallIdToType[id];
```
When `placementType` is `"wall"`, it looks up `floorIdToType`, and vice versa.

Additionally, in `_prepareData` (lines 145–147):
```typescript
register(parsed.furnidata.roomitemtypes[0].furnitype, "wall");   // roomitemtypes → wall??
register(parsed.furnidata.wallitemtypes[0].furnitype, "floor");   // wallitemtypes → floor??
```
`roomitemtypes` is mapped to `"wall"` and `wallitemtypes` is mapped to `"floor"`. These two errors may currently cancel each other out, but they create fragile, confusing code that will break the moment one is fixed without the other.

**Impact**  
Any consumer relying on accurate wall vs. floor furniture lookups gets incorrect results. Pathfinding, furniture placement, and data queries are all affected.

**Recommended Fix**  
```diff
-register(parsed.furnidata.roomitemtypes[0].furnitype, "wall");
-register(parsed.furnidata.wallitemtypes[0].furnitype, "floor");
+register(parsed.furnidata.roomitemtypes[0].furnitype, "floor");
+register(parsed.furnidata.wallitemtypes[0].furnitype, "wall");
```
And fix `getTypeById`:
```diff
 const type =
-  placementType != "floor" ? data.floorIdToType[id] : data.wallIdToType[id];
+  placementType === "floor" ? data.floorIdToType[id] : data.wallIdToType[id];
```
**Important:** Fix both at the same time, or verify carefully that the double-inversion is intentional and document it.

---

### 2. `.env` Files Committed to Version Control
**Priority:** High  
**Category:** Security  
**File(s):** `packages/e2e/.env`, `packages/example/.env`, `packages/storybook/.env`

**Problem**  
Despite `.env` being listed in the root `.gitignore`, per-package `.env` files exist in the repository. The root `.gitignore` entry only covers `/.env` (root-level), not `packages/*/.env`. These files currently contain resource URLs (including a CORS proxy URL), not secrets, but this pattern creates a vector for accidental secret leakage.

**Impact**  
Any future developer adding secrets or API keys to these `.env` files will have them committed to the public repository.

**Recommended Fix**
1. Add `**/.env` to `.gitignore` (or specific patterns like `packages/**/.env`).
2. Remove the existing `.env` files from git tracking: `git rm --cached packages/e2e/.env packages/example/.env packages/storybook/.env`.
3. Create `.env.example` files with placeholder values for documentation.

---

### 3. WebSocket Proxy Has No Authentication
**Priority:** High  
**Category:** Security  
**File(s):** `packages/cli/src/tools/proxy/runForwardingServer.ts`

**Problem**  
The `runForwardingServer` function creates a WebSocket server that forwards all traffic to a target TCP server with zero authentication, no rate limiting, and no origin checking. Any client can connect and forward arbitrary traffic.

**Impact**  
If this proxy is deployed on a network-accessible host, it becomes an open relay. An attacker could use it to proxy malicious traffic to internal services.

**Recommended Fix**
- Add origin validation via the `verifyClient` option on `WebSocket.Server`.
- Add an authentication token check (e.g., query parameter or first-message handshake).
- Add connection rate limiting.
- Bind to `127.0.0.1` by default instead of all interfaces.

```typescript
const server = new WebSocket.Server({
  ...webSocketOptions,
  host: "127.0.0.1", // bind to localhost only
  verifyClient: (info) => {
    const allowedOrigins = ["http://localhost:3000"];
    return allowedOrigins.includes(info.origin);
  },
});
```

---

### 4. Protocol-Relative URLs Downgraded to HTTP
**Priority:** High  
**Category:** Security  
**File(s):** `packages/cli/src/tools/dump/downloadFile.ts` (lines 5–10)

**Problem**
```typescript
function makeAbsolute(url: string) {
  if (url.slice(0, 2) === "//") {
    return `http:${url}`;  // Forces HTTP, not HTTPS
  }
  return url;
}
```
Protocol-relative URLs (`//example.com/path`) are converted to `http:` instead of `https:`, sending requests over an unencrypted connection.

**Impact**  
Downloaded assets could be intercepted or tampered with via a man-in-the-middle attack.

**Recommended Fix**
```diff
-return `http:${url}`;
+return `https:${url}`;
```

---

### 5. Deprecated Dependency: `request`
**Priority:** High  
**Category:** Security  
**File(s):** `packages/shroom/package.json` (line 38)

**Problem**  
The `request` npm package has been [deprecated since February 2020](https://github.com/request/request/issues/3142) and receives no security patches.

**Impact**  
Known vulnerabilities will never be patched. Even as a devDependency, it increases supply-chain risk.

**Recommended Fix**  
Remove `request` from devDependencies. If it's actually used somewhere, replace with `node-fetch` or native `fetch` (Node 18+).

---

### 6. Outdated `xml2js` with Prototype Pollution History
**Priority:** High  
**Category:** Security  
**File(s):** `packages/shroom/package.json`, `packages/cli/package.json`

**Problem**  
`xml2js` v0.4.23 has a known prototype pollution vulnerability (CVE-2023-0842). The library is used to parse furniture data XML which may come from untrusted external sources.

**Impact**  
If an attacker can control the XML input (e.g., a malicious furniture data file), they could potentially pollute object prototypes.

**Recommended Fix**  
Update to `xml2js@>=0.5.0` or switch to a more actively maintained XML parser like `fast-xml-parser`. When using `xml2js`, configure `explicitArray: false` and avoid passing `$` attributes directly to object constructors.

---

### 7. No URL Validation on Fetch Calls
**Priority:** High  
**Category:** Security  
**File(s):** `LegacyAssetBundle.ts`, `ShroomAssetBundle.ts`, `FurnitureData.ts`, `AvatarLoader.ts`

**Problem**  
The `resourcePath` parameter passed throughout the application is concatenated directly into fetch URLs without any validation:
```typescript
const imageUrl = `${this._folderUrl}/${name}`;
```
If `resourcePath` comes from user input (e.g., environment variable, query parameter), it could be used for SSRF attacks.

**Impact**  
Potential Server-Side Request Forgery (SSRF) if the application is server-rendered, or open redirect / data exfiltration in browser contexts.

**Recommended Fix**  
Validate `resourcePath` at construction time:
```typescript
function validateResourcePath(path: string): string {
  const url = new URL(path, window.location.origin);
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`Invalid resource path protocol: ${url.protocol}`);
  }
  return url.toString();
}
```

---

### 8. `@typescript-eslint/no-explicit-any` Disabled
**Priority:** High  
**Category:** Security / Maintainability  
**File(s):** `packages/shroom/eslint.config.mjs` (line 27)

**Problem**
```javascript
"@typescript-eslint/no-explicit-any": "off",
```
This allows unrestricted `any` usage, bypassing TypeScript's type safety. The codebase has over a dozen `as any` casts.

**Impact**  
`any` types silence type errors that could catch real bugs. The `FurnitureData._prepareData` method has 10+ eslint-disable comments for `unsafe-*` rules, suggesting the `any` usage is masking real type issues.

**Recommended Fix**  
1. Set `"@typescript-eslint/no-explicit-any": "warn"` as a first step.
2. Gradually type the `xml2js` output with proper interfaces.
3. Remove `as any` casts by providing correct generic types (e.g., for event listeners in `RoomCamera.ts`).

---

### 9. Unbounded Caches in FurnitureLoader and AvatarLoader
**Priority:** Medium  
**Category:** Performance / Scalability  
**File(s):** `packages/shroom/src/objects/furniture/FurnitureLoader.ts`, `packages/shroom/src/objects/avatar/AvatarLoader.ts`

**Problem**  
`FurnitureLoader._furnitureCache` and `FurnitureLoader._assetBundles` are `Map` instances with no eviction policy. `AvatarLoader._effectCache` and `_lookOptionsCache` have the same issue. In a long-running session loading many furniture items or avatars, these grow unboundedly.

Note: `LegacyAssetBundle` and `ShroomAssetBundle` *do* have cache eviction (good!), but the loaders sitting above them do not.

**Impact**  
Memory usage grows monotonically in long-lived sessions, potentially causing OOM crashes or browser tab crashes.

**Recommended Fix**  
Apply the same LRU eviction pattern used in `LegacyAssetBundle`:
```typescript
private _furnitureCache: Map<string, Promise<LoadFurniResult>> = new Map();
private _cacheOrder: string[] = [];
private _cacheLimit = 200; // configurable

private _evictIfNeeded(key: string) {
  if (this._cacheOrder.length >= this._cacheLimit) {
    const oldest = this._cacheOrder.shift();
    if (oldest) this._furnitureCache.delete(oldest);
  }
  this._cacheOrder.push(key);
}
```

---

### 10. New EasyStar Instance Per `findPath()` Call
**Priority:** Medium  
**Category:** Performance  
**File(s):** `packages/shroom/src/objects/room/Pathfinding.ts` (line 230)

**Problem**
```typescript
public findPath(...): Promise<PathStep[]> {
  return new Promise((resolve) => {
    const easystar = new EasyStar.js(); // new instance every call
    easystar.setGrid(grid);
    easystar.setAcceptableTiles([1, 0]);
    easystar.findPath(...);
    easystar.calculate();
  });
}
```
Creating a new EasyStar instance, setting the grid, and calculating for every single pathfinding request is wasteful.

**Impact**  
Increased GC pressure and higher latency for pathfinding, especially if called frequently (e.g., for multiple avatars walking simultaneously).

**Recommended Fix**  
Reuse a single `EasyStar` instance, updating the grid only when the navigation mesh changes:
```typescript
private _easystar = new EasyStar.js();

public updateGrid() {
  this._easystar.setGrid(this.grid);
  this._easystar.setAcceptableTiles([1, 0]);
}

public findPath(origin: RoomPosition, target: RoomPosition): Promise<PathStep[]> {
  return new Promise((resolve) => {
    this._easystar.findPath(origin.roomX, origin.roomY, target.roomX, target.roomY, (result) => {
      // ... process result
    });
    this._easystar.calculate();
  });
}
```

---

### 11. `JSON.parse(JSON.stringify())` for Deep Clone
**Priority:** Medium  
**Category:** Performance  
**File(s):** `packages/shroom/src/objects/room/Pathfinding.ts` (lines 309–311)

**Problem**
```typescript
private _clone<T>(grid: T): T {
  return JSON.parse(JSON.stringify(grid));
}
```
This serialize/deserialize pattern is one of the slowest ways to clone a 2D array of numbers.

**Impact**  
For a 50×50 room, this creates and parses a ~5KB JSON string on every pathfinding call. For larger rooms or frequent calls, this adds up.

**Recommended Fix**
```typescript
private _cloneGrid(grid: Grid2D): Grid2D {
  return grid.map(row => [...row]);
}
```

---

### 12. O(n²) Variable Substitution
**Priority:** Medium  
**Category:** Performance  
**File(s):** `packages/cli/src/tools/dump/parseExternalVariables.ts`

**Problem**
```typescript
map.forEach((replaceValue, key) => {
  map.forEach((value, okey) => {
    if (value) {
      map.set(okey, value.replace("${" + key + "}", replaceValue));
    }
  });
});
```
This is O(n²) where n is the number of variables. For each variable, it iterates all other variables to perform substitution.

**Impact**  
With typical Habbo external variables (~100-200 entries), this performs 10,000–40,000 string operations. While tolerable for a CLI tool, it's unnecessarily slow.

**Recommended Fix**  
Use a topological or iterative approach that only revisits values containing `${...}` patterns:
```typescript
let changed = true;
while (changed) {
  changed = false;
  map.forEach((value, key) => {
    const resolved = value.replace(/\$\{([^}]+)\}/g, (_, varName) => {
      const replacement = map.get(varName);
      if (replacement && !replacement.includes('${')) {
        changed = true;
        return replacement;
      }
      return `\${${varName}}`;
    });
    if (resolved !== value) map.set(key, resolved);
  });
}
```

---

### 13. Source Maps Enabled in Production Builds
**Priority:** Medium  
**Category:** Security / Performance  
**File(s):** `packages/shroom/webpack.config.js`, `packages/e2e/webpack.config.js`

**Problem**
```javascript
devtool: "source-map",
```
Full source maps are generated. While the shroom package is open-source, including source maps in production bundles increases bundle size and exposes internal structure.

**Impact**  
Larger download sizes. In closed-source deployments using this library, source maps would expose proprietary code.

**Recommended Fix**  
Use environment-conditional source maps:
```javascript
devtool: process.env.NODE_ENV === "production" ? false : "source-map",
```

---

### 14. Outdated GitHub Actions Versions
**Priority:** Medium  
**Category:** Security / CI  
**File(s):** `.github/workflows/node.js.yml`, `.github/workflows/shroom-publish.yml`

**Problem**  
Both workflows use `actions/checkout@v3` and `actions/setup-node@v3`. These are outdated; current versions are `@v4`.

**Impact**  
Older action versions may have unfixed security issues and miss performance improvements.

**Recommended Fix**
```diff
-- uses: actions/checkout@v3
+- uses: actions/checkout@v4
-- uses: actions/setup-node@v3
+- uses: actions/setup-node@v4
```

---

### 15. Node.js 18 Only in CI
**Priority:** Medium  
**Category:** Security / CI  
**File(s):** `.github/workflows/node.js.yml`, `.github/workflows/shroom-publish.yml`

**Problem**  
CI only tests on Node.js 18.x, which reached EOL in April 2025.

**Impact**  
The project is not tested against supported Node.js versions and may break silently on newer runtimes.

**Recommended Fix**
```yaml
strategy:
  matrix:
    node-version: [20.x, 22.x]
```

---

### 16. Outdated Core Dependencies
**Priority:** Medium  
**Category:** Maintainability  
**File(s):** All `package.json` files

**Problem**  
Several key dependencies are significantly outdated:

| Package | Current | Latest | Notes |
|---------|---------|--------|-------|
| TypeScript | ^4.x | 5.x | Missing template literal types, satisfies, etc. |
| React | ^16.14 | 19.x | Missing hooks improvements, concurrent features |
| node-fetch | ^2.6.1 | 3.x (or native) | ESM-only in v3, but native `fetch` available in Node 18+ |
| Jest | ^26 | 29.x | Missing snapshot improvements, ESM support |
| Pixi.js | ^6.5.9 | 8.x | Major rendering improvements |
| @tweenjs/tween.js | ^16.6.0 | 25.x | Very outdated API |

**Impact**  
Missing security patches, performance improvements, and modern features. Increasing difficulty finding compatible tooling.

**Recommended Fix**  
Create a phased upgrade plan. Start with TypeScript 5.x (usually non-breaking), then Jest, then React (largest effort).

---

### 17. Bug in Dump Log Message
**Priority:** Medium  
**Category:** Bug  
**File(s):** `packages/cli/src/tools/dump/dump.ts` (line 67)

**Problem**
```typescript
const effectsSwf = await glob(`${downloadPath}/effects/**/*.swf`);
console.log(
  `Found ${figureSwfs.length} effect swfs.`  // Wrong variable! Should be effectsSwf.length
);
```

**Impact**  
Misleading log output — reports the figure count instead of the effects count.

**Recommended Fix**
```diff
-`Found ${figureSwfs.length} effect swfs. Starting the extraction process.`
+`Found ${effectsSwf.length} effect swfs. Starting the extraction process.`
```

---

### 18. Deprecated Webpack `contentBase` Option
**Priority:** Low  
**Category:** Maintainability  
**File(s):** `packages/shroom/webpack.config.js` (line 55), `packages/e2e/webpack.config.js` (line 53)

**Problem**  
`devServer.contentBase` was removed in webpack-dev-server v4+. The correct option is `devServer.static`.

**Recommended Fix**
```diff
 devServer: {
-  contentBase: [path.join(__dirname, 'public')]
+  static: [path.join(__dirname, 'public')]
 }
```

---

### 19. Manual HotModuleReplacementPlugin
**Priority:** Low  
**Category:** Maintainability  
**File(s):** Webpack configs (shroom, e2e)

**Problem**  
`new webpack.HotModuleReplacementPlugin()` is manually added. In webpack-dev-server v4+, HMR is enabled automatically via `devServer.hot: true`.

**Recommended Fix**  
Remove the manual plugin and set `devServer.hot: true`.

---

### 20. Deprecated `file-loader`
**Priority:** Low  
**Category:** Maintainability  
**File(s):** Webpack configs

**Problem**  
`file-loader` is deprecated in favor of webpack 5's built-in [Asset Modules](https://webpack.js.org/guides/asset-modules/).

**Recommended Fix**
```diff
 {
   test: /\.(png|svg|bmp)$/,
-  loader: "file-loader",
+  type: "asset/resource",
 }
```

---

### 21. `rm -rf` in Build Scripts (Cross-Platform)
**Priority:** Low  
**Category:** Maintainability  
**File(s):** `packages/shroom/package.json`, `packages/cli/package.json`

**Problem**
```json
"build": "rm -rf dist && tsc"
```
`rm -rf` doesn't work natively on Windows.

**Recommended Fix**  
Use `rimraf` or the `del-cli` package for cross-platform support:
```json
"build": "rimraf dist && tsc"
```

---

### 22. Missing `engines` Field
**Priority:** Low  
**Category:** Maintainability  
**File(s):** Root `package.json`

**Problem**  
No `engines` field specifies the required Node.js version, so contributors may use incompatible versions.

**Recommended Fix**
```json
"engines": {
  "node": ">=20.0.0"
}
```

---

### 23. `as any` Type Casts in RoomCamera
**Priority:** Low  
**Category:** Maintainability  
**File(s):** `packages/shroom/src/objects/room/RoomCamera.ts` (lines 77–78, 89–90)

**Problem**
```typescript
this._target.addEventListener("pointermove", this._handlePointerMove as any);
```
Event handler types are cast to `any` to avoid type mismatches between `PointerEvent` and `EventListener`.

**Recommended Fix**  
Wrap the handler or use proper typing:
```typescript
private _wrappedPointerMove = (e: Event) => this._handlePointerMove(e as PointerEvent);
this._target.addEventListener("pointermove", this._wrappedPointerMove);
```

---

## Positive Notes

- **Cache eviction in asset bundles**: `LegacyAssetBundle` and `ShroomAssetBundle` both implement LRU-style cache eviction with configurable limits — well-designed.
- **Fetch timeouts**: The `withTimeout` utility in `assets/common.ts` properly races fetch promises against a timeout — prevents hanging requests.
- **XML parse error detection**: `XmlData.ts` checks for `<parsererror>` nodes and sets a `_parseError` flag — good defensive coding.
- **ESLint type-checked rules**: Using `recommendedTypeChecked` with `@typescript-eslint` is best practice for catching runtime errors at build time.
- **Proper `destroy()` cleanup**: `Room.destroy()` removes all room objects and cleans up the visualization. `RoomCamera.destroy()` detaches all event listeners. This is important for preventing memory leaks.
- **Pointer ID tracking in RoomCamera**: The camera properly tracks `pointerId` to avoid multi-touch conflicts — good attention to detail.
