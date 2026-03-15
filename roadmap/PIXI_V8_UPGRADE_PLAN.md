# Pixi.js v8 Upgrade Plan

> **Current version:** `pixi.js ^7.4.2`
> **Target version:** `pixi.js ^8.x`
> **Reference:** [Official v8 Migration Guide](https://pixijs.com/8.x/guides/migrations/v8)

---

## Overview

Pixi.js v8 is a major rewrite with significant performance gains (WebGPU support, smaller bundles via tree-shaking). However, it contains many breaking API changes that affect the shroom codebase. This plan documents every required change, organized by phase, with file-level impact analysis.

---

## Phase 1: Dependency Updates

### 1.1 Package Changes

| Package | v7 | v8 |
|---|---|---|
| `pixi.js` | `^7.4.2` | `^8.x` |
| `@pixi/filter-color-matrix` | `^7.4.2` | **Removed** → use `pixi-filters/color-matrix` |

**Files to update:**
- `packages/shroom/package.json` — Update `pixi.js`, remove `@pixi/filter-color-matrix`, add `pixi-filters`
- `packages/example/package.json` — Update `pixi.js`
- Root `package-lock.json` — Regenerated via `npm install`

### 1.2 Sub-package Consolidation

v8 returns to a **single-package structure**. All `@pixi/*` sub-imports must be replaced with `pixi.js` imports. Currently affected:

| File | v7 Import | v8 Import |
|---|---|---|
| [pixi-proxy/index.ts](../packages/shroom/src/pixi-proxy/index.ts) | `@pixi/filter-color-matrix` | `pixi-filters/color-matrix` |

---

## Phase 2: Application Initialization (Async)

v8 requires **async initialization** of the Application via `app.init()`.

### v7 (Current)
```typescript
const app = new PIXI.Application({ view, backgroundColor: 0x000000, ... });
```

### v8 (Target)
```typescript
const app = new PIXI.Application();
await app.init({ canvas: view, background: 0x000000, ... });
```

> [!IMPORTANT]
> The `view` option is renamed to `canvas` in v8.
> `backgroundColor` is replaced by `background` (accepts a `ColorSource` primitive, NOT an object).

**Files to update:**
- [example/src/index.ts](../packages/example/src/index.ts) — Convert to async init
- [DummyRoom.ts](../packages/example/src/DummyRoom.ts) — Adjust for async Application

---

## Phase 3: pixi-proxy Migration

The [pixi-proxy/index.ts](../packages/shroom/src/pixi-proxy/index.ts) layer must be updated to reflect all renamed/removed exports.

| v7 Export | v8 Replacement | Notes |
|---|---|---|
| `BaseTexture` | **Removed** | Use `TextureSource` / `ImageSource` |
| `DisplayObject` | **Removed** | Use `Container` |
| `BLEND_MODES` (enum) | `'add'`, `'normal'` (strings) | Enums → string literals |
| `SCALE_MODES` (enum) | `'nearest'`, `'linear'` (strings) | Enums → string literals |
| `Filter` | `Filter` | Constructor signature changed |
| `Spritesheet` | `Spritesheet` | Constructor takes `Texture` instead of `BaseTexture` |

### Proposed v8 pixi-proxy

```typescript
export {
  Application as ShroomApplication,
  Texture as ShroomTexture,
  // BaseTexture → REMOVED
  Sprite as ShroomSprite,
  Spritesheet as ShroomSpritesheet,
  Container as ShroomContainer,
  // BLEND_MODES → use string literals
  FederatedPointerEvent as ShroomInteractionEvent,
  EventSystem as ShroomInteractionManager,
  Color as ShroomColor,
  TilingSprite as ShroomTilingSprite,
  Ticker as ShroomTicker,
  // DisplayObject → REMOVED, use Container
  Filter as ShroomFilter,
  Graphics as ShroomGraphics,
  Matrix as ShroomMatrix,
  Point as ShroomPoint,
  Rectangle as ShroomRectangle,
  // Renderer → WebGLRenderer or autoDetectRenderer
  RenderTexture as ShroomRenderTexture,
  Polygon as ShroomPolygon,
} from "pixi.js";

// BLEND_MODES: export string constants
export const ShroomBlendModes = { ADD: 'add', NORMAL: 'normal' } as const;

// SCALE_MODES: export string constants
export const ShroomScaleModes = { NEAREST: 'nearest', LINEAR: 'linear' } as const;

// DisplayObject alias for migration
export { Container as ShroomDisplayObject } from "pixi.js";

// Filter: ColorMatrixFilter from pixi-filters
import { ColorMatrixFilter } from 'pixi-filters/color-matrix';
export class ShroomColorMatrixFilter extends ColorMatrixFilter {}
```

---

## Phase 4: BaseTexture Removal

`BaseTexture` is fully removed in v8. Replace with `TextureSource` / `ImageSource`.

**Affected files:**

| File | Current Usage | v8 Replacement |
|---|---|---|
| [JsonFurnitureAssetBundle.ts](../packages/shroom/src/objects/furniture/JsonFurnitureAssetBundle.ts) | `ShroomBaseTexture.from(image)` | `new ImageSource({ resource: image })` |
| [JsonFurnitureAssetBundle.ts](../packages/shroom/src/objects/furniture/JsonFurnitureAssetBundle.ts) | `new ShroomSpritesheet(baseTexture, json)` | `new ShroomSpritesheet({ ... })` (takes `Texture`) |
| [applyTextureProperties.ts](../packages/shroom/src/util/applyTextureProperties.ts) | `texture.baseTexture.scaleMode = NEAREST` | `texture.source.scaleMode = 'nearest'` |

---

## Phase 5: DisplayObject Removal

`DisplayObject` is removed in v8; `Container` is now the base class. Since we alias `DisplayObject` as `ShroomDisplayObject` in pixi-proxy, we can remap to `Container` there and then fix any specific type issues.

**Affected files:**

| File | Usage |
|---|---|
| [WallLeft.ts](../packages/shroom/src/objects/room/parts/WallLeft.ts) | `ShroomDisplayObject` type for hit area element |
| [StairCorner.ts](../packages/shroom/src/objects/room/parts/StairCorner.ts) | `ShroomDisplayObject` import |
| [BaseFurniture.ts](../packages/shroom/src/objects/furniture/BaseFurniture.ts) | `ShroomDisplayObject` import |

---

## Phase 6: Graphics API Overhaul

v8 completely changes the Graphics API. The pattern shifts from **"begin fill → draw shape → end fill"** to **"build shape → fill/stroke"**.

### Mapping

| v7 Method | v8 Method |
|---|---|
| `beginFill(color, alpha)` | `.fill({ color, alpha })` (called AFTER shape) |
| `endFill()` | Removed (implicit) |
| `moveTo(x, y)` | `.moveTo(x, y)` (unchanged) |
| `lineTo(x, y)` | `.lineTo(x, y)` (unchanged) |
| `drawRect(x, y, w, h)` | `.rect(x, y, w, h)` |
| `drawCircle(x, y, r)` | `.circle(x, y, r)` |
| `lineStyle(width, color)` | `.stroke({ width, color })` |

### Affected Files

#### [TileCursor.ts](../packages/shroom/src/objects/room/parts/TileCursor.ts) — `drawBorder` function

**v7:**
```typescript
graphics.beginFill(color, alpha);
graphics.moveTo(p1.x, p1.y);
graphics.lineTo(p2.x, p2.y);
graphics.lineTo(p3.x, p3.y);
graphics.lineTo(p4.x, p4.y);
graphics.endFill();
```

**v8:**
```typescript
graphics.moveTo(p1.x, p1.y);
graphics.lineTo(p2.x, p2.y);
graphics.lineTo(p3.x, p3.y);
graphics.lineTo(p4.x, p4.y);
graphics.closePath();
graphics.fill({ color, alpha });
```

#### [WallLeft.ts](../packages/shroom/src/objects/room/parts/WallLeft.ts) — hit area graphics

**v7:**
```typescript
graphics.beginFill(0xff00ff);
// draw shape...
graphics.endFill();
```

**v8:**
```typescript
// draw shape first...
graphics.fill(0xff00ff);
```

---

## Phase 7: cacheAsBitmap → cacheAsTexture

`cacheAsBitmap` is replaced by `cacheAsTexture()` / `updateCacheTexture()`.

**Affected file:**
- [RoomModelVisualization.ts](../packages/shroom/src/objects/room/RoomModelVisualization.ts) — `_setCache` method

**v7:**
```typescript
container.cacheAsBitmap = true;
```

**v8:**
```typescript
container.cacheAsTexture(true);
// After updates:
container.updateCacheTexture();
```

---

## Phase 8: Filter System Changes

The `Filter` constructor signature has changed significantly.

**Affected file:**
- [HighlightFilter.ts](../packages/shroom/src/objects/furniture/filter/HighlightFilter.ts)

**v7:**
```typescript
super(vertex, fragment, { backgroundColor: new Float32Array([...]) });
```

**v8:**
```typescript
super({
  glProgram: GlProgram.from({ vertex, fragment }),
  resources: {
    filterUniforms: {
      backgroundColor: { value: new Float32Array([...]), type: 'vec4<f32>' },
      borderColor:     { value: new Float32Array([...]), type: 'vec4<f32>' },
    },
  },
});
```

> [!WARNING]
> Uniforms in v8 require explicit `type` definitions. The `uniforms` shorthand accessor may also change — verify uniform access patterns.

---

## Phase 9: Renderer & View Changes

- `renderer.view` is replaced by `renderer.canvas`
- `Renderer` is replaced by `WebGLRenderer` or `autoDetectRenderer()`

**Affected file:**
- [RoomCamera.ts](../packages/shroom/src/objects/room/RoomCamera.ts) — `this._room.application.renderer.view` → `.renderer.canvas`

---

## Phase 10: Blend Modes & Scale Modes

v8 replaces enum-based constants with string literals.

| v7 | v8 |
|---|---|
| `BLEND_MODES.ADD` | `'add'` |
| `BLEND_MODES.NORMAL` | `'normal'` |
| `SCALE_MODES.NEAREST` | `'nearest'` |
| `SCALE_MODES.LINEAR` | `'linear'` |

**Affected files:**
- [FurnitureVisualizationView.ts](../packages/shroom/src/objects/furniture/FurnitureVisualizationView.ts) — `ShroomBlendModes.ADD` / `ShroomBlendModes.NORMAL`
- [applyTextureProperties.ts](../packages/shroom/src/util/applyTextureProperties.ts) — `ShroomScaleModes.NEAREST`
- [example/src/index.ts](../packages/example/src/index.ts) — `PIXI.BaseTexture.defaultOptions.scaleMode`

> [!TIP]
> By exporting string constants from pixi-proxy (as shown in Phase 3), most consumer code can stay unchanged.

---

## Phase 11: Spritesheet Constructor

v8 Spritesheet constructor takes a `Texture` instead of a `BaseTexture`.

**Affected file:**
- [JsonFurnitureAssetBundle.ts](../packages/shroom/src/objects/furniture/JsonFurnitureAssetBundle.ts)

**v7:**
```typescript
const baseTexture = ShroomBaseTexture.from(image);
const spritesheet = new ShroomSpritesheet(baseTexture, json);
```

**v8:**
```typescript
const source = new ImageSource({ resource: image });
const texture = new Texture({ source });
const spritesheet = new ShroomSpritesheet({ texture, data: json });
```

---

## Summary: Files Requiring Changes

| File | Changes |
|---|---|
| `pixi-proxy/index.ts` | Complete rewrite of exports |
| `example/src/index.ts` | Async init, `canvas`, `background`, scale mode |
| `RoomModelVisualization.ts` | `cacheAsTexture()` |
| `RoomCamera.ts` | `renderer.canvas` |
| `TileCursor.ts` | Graphics API (fill after shape) |
| `WallLeft.ts` | Graphics API (fill after shape) |
| `HighlightFilter.ts` | Filter constructor + uniform types |
| `JsonFurnitureAssetBundle.ts` | `ImageSource` + `Texture`, `Spritesheet` constructor |
| `applyTextureProperties.ts` | `texture.source.scaleMode` |
| `FurnitureVisualizationView.ts` | Blend mode strings |
| `BaseFurniture.ts` | `DisplayObject` → `Container` |
| `StairCorner.ts` | `DisplayObject` → `Container` |
| `package.json` (shroom) | Dep updates |
| `package.json` (example) | Dep updates |

---

## Verification Plan

1. **Clean build**: `npm run build` in `packages/shroom` — zero TypeScript errors
2. **Example build**: `npm run build` in `packages/example` — zero webpack errors
3. **Browser test**: `npm run dev` in `packages/example` — verify room renders, tiles, walls, avatars, furniture, tile cursor, camera dragging
4. **Filter test**: Verify `HighlightFilter` renders correctly on furniture hover
5. **Cache test**: Re-enable `cacheAsTexture()` and verify no color crashes
6. **Performance**: Confirm render performance is equal to or better than v7

---

## Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| `@pixi/filter-color-matrix` not available in `pixi-filters` | High | May need to inline the shader or use v8's built-in `ColorMatrixFilter` |
| Spritesheet API changes break furniture loading | High | Test with multiple furniture types |
| WebGPU renderer behaves differently from WebGL | Medium | Use `autoDetectRenderer()` to keep WebGL as fallback |
| Graphics API migration introduces visual bugs | Medium | Visual regression testing on all room elements |
| Third-party deps (`@tweenjs/tween.js`) incompatible | Low | These are Pixi-independent |
