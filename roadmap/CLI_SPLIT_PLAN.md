# CLI Downloader Split Plan

This plan outlines the steps to decouple the CLI downloader tools from the core `@xggcrypto/shroom` library and into a dedicated package. This will reduce the bundle size of the web library and improve maintainability.

## 1. Motivation

*   **Bundle Size**: Currently, `@xggcrypto/shroom` includes CLI-specific dependencies like `ink`, `bin-pack`, and `node-fetch` which are not needed for web rendering.
*   **Separation of Concerns**: The logic for extracting assets from SWFs and external variables is distinct from the logic for rendering a 2D isometric room.
*   **Decoupling**: The CLI currently depends on `shroom` for types, but `shroom` also contains some CLI-only scripts and entry points.

---

## 2. Proposed Package Structure

We will introduce a new package and update the existing ones:

1.  **`@xggcrypto/shroom` (Core)**: 
    *   **Focus**: Web-based isometric rendering engine (Pixi.js).
    *   **Dependencies**: `pixi.js`, `tween.js`, `xml2js`, `bytebuffer`, `rbush`.
    *   **Remove**: `ink`, `bin-pack`, `node-fetch`, `jszip`, `parcel` (move to dev), all CLI-related scripts/bins.

2.  **`@xggcrypto/shroom-downloader` (New)**:
    *   **Focus**: Shared logic for downloading and extracting game assets.
    *   **Code**: Move `packages/cli/src/tools/dump` here.
    *   **Dependencies**: `canvas`, `swf-extract`, `bin-pack`, `node-fetch`, `bluebird`, `glob`, `xml2js`, `jsdom`.

3.  **`@xggcrypto/shroom-cli` (Existing)**:
    *   **Focus**: CLI runner and forwarding proxy.
    *   **Code**: `packages/cli/src/index.ts` and `runForwardingServer.ts`.
    *   **Dependencies**: `@xggcrypto/shroom-downloader`, `yargs`, `ws`.

---

## 3. Step-by-Step Migration

### Phase 1: Create Downloader Package
1.  Initialize `packages/downloader/package.json`.
2.  Copy `packages/cli/src/tools/dump` to `packages/downloader/src`.
3.  Add necessary dependencies (extracted from `shroom` and `cli`).
4.  Export the main `dump` function and related utilities.

### Phase 2: Update CLI Package
1.  Update `packages/cli/package.json` to depend on `@xggcrypto/shroom-downloader`.
2.  Update `packages/cli/src/index.ts` to import `dump` from the new package.
3.  Clean up its own `dependencies` list.

### Phase 3: Sanitize Shroom Core
1.  **Remove CLI Dependencies**:
    *   `npm uninstall ink bin-pack node-fetch jszip jsdom` in `packages/shroom`.
2.  **Clean package.json**:
    *   Remove `"bin": { "shroom": "dist/cli/index.js" }`.
    *   Remove `"dump"` script.
    *   Move `parcel` to `devDependencies`.
3.  **Delete Stale Dist**:
    *   Ensure `dist/cli` is no longer generated.

---

## 4. Shared Types and Interfaces

To avoid circular dependencies, some types will remain in `@xggcrypto/shroom` or be moved to a shared `types` package if necessary:
*   `FurnitureInfo`, `AvatarManifestData`, etc. should stay in `shroom` as they are used by the rendering engine to understand the data it consumes.
*   The downloader will depend on `shroom` to ensure the data it extracts matches the format expected by the renderer.

---

## 5. Verification Plan

### 5.1. Downloader Verification
Run the downloader via the new CLI to ensure assets are still extracted correctly:
```bash
# In packages/cli
npm run build
node dist/index.js dump --url [REF_URL] --location ./test-dump
```

### 5.2. Web Bundle Verification
Verify that `shroom` no longer includes `ink` or other CLI-only bloat:
```bash
# In packages/shroom
npm run build
# Check dist/index.js (or use bundle-analyzer) to ensure CLI deps are gone
```

### 5.3. Integration Test
Ensure the `example` app still loads and renders assets extracted by the new downloader package.
