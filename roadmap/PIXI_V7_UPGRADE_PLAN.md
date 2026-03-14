# Pixi.js v6 to v7 Upgrade Plan

This document outlines the steps required to upgrade the `shroom` project from Pixi.js v6.x to v7.x. Pixi.js v7 introduces a more modular architecture, improved performance, and a completely new event system (Federated Events).

## 1. Overview of Key Changes

*   **Modularization**: Pixi v7 is split into many smaller packages, though the monolithic `pixi.js` package still exists.
*   **Event System**: The `InteractionManager` is replaced by the `EventSystem`. `InteractionEvent` is replaced by `FederatedEvent`.
*   **Event Mode**: The `interactive` boolean is replaced by the more granular `eventMode` property (`'none'`, `'passive'`, `'auto'`, `'static'`, `'dynamic'`).
*   **Renderer Plugins**: Most plugins (like `extract`, `prepare`) are now built-in systems or separate extensions.
*   **Filters**: Filters have been moved to their own packages (e.g., `@pixi/filter-color-matrix`).

---

## 2. Phase 1: Dependency Updates

Update all `package.json` files in the monorepo that depend on `pixi.js`.

### packages/shroom/package.json
```diff
- "pixi.js": "^6.5.9",
+ "pixi.js": "^7.3.0",
```

### packages/e2e/package.json
```diff
- "pixi.js": "^6.5.9",
+ "pixi.js": "^7.3.0",
```

**Note**: If using specific filters, you may need to add:
```bash
npm install @pixi/filter-color-matrix
```

---

## 3. Phase 2: `pixi-proxy` Migration

The `packages/shroom/src/pixi-proxy/index.ts` file is our primary abstraction layer. Most of the heavy lifting will be done here.

### [MODIFY] `packages/shroom/src/pixi-proxy/index.ts`

```typescript
// Proposed v7 Changes
export {
  Application as ShroomApplication,
  Texture as ShroomTexture,
  BaseTexture as ShroomBaseTexture,
  Sprite as ShroomSprite,
  Spritesheet as ShroomSpritesheet,
  Container as ShroomContainer,
  BLEND_MODES as ShroomBlendModes,
  // FederatedPointerEvent is the v7 equivalent of InteractionEvent for pointer events
  FederatedPointerEvent as ShroomInteractionEvent, 
  // There is no direct InteractionManager anymore; it's handled by EventSystem
  EventSystem as ShroomInteractionManager,
  TilingSprite as ShroomTilingSprite,
  Ticker as ShroomTicker,
  DisplayObject as ShroomDisplayObject,
  Filter as ShroomFilter,
  Graphics as ShroomGraphics,
  Matrix as ShroomMatrix,
  Point as ShroomPoint,
  Rectangle as ShroomRectangle,
  Renderer as ShroomRenderer,
  RenderTexture as ShroomRenderTexture,
  Polygon as ShroomPolygon,
  // SCALE_MODES remains similar
  SCALE_MODES as ShroomScaleModes,
} from "pixi.js";

// Filters might need separate imports in v7 if they aren't in the main bundle
import { ColorMatrixFilter } from "@pixi/filter-color-matrix";
export class ShroomColorMatrixFilter extends ColorMatrixFilter {}
```

---

## 4. Phase 3: Code Adjustments

### 4.1. Interactive -> eventMode
In v7, `interactive = true` is deprecated. Use `eventMode` instead.

**Target Files**: `WallLeft.ts`, `RoomCamera.ts`, and any others found during build.

```typescript
// Before (v6)
displayObject.interactive = true;

// After (v7)
displayObject.eventMode = 'static'; // or 'dynamic' if it moves
```

### 4.2. Hit Testing and Interaction Manager
The `InteractionManager` is no longer a plugin on the renderer.

**Target File**: `packages/shroom/src/objects/events/EventManagerContainer.ts`

```typescript
// Before (v6)
const interactionManager = this._application.renderer.plugins.interaction;

// After (v7)
const eventSystem = this._application.renderer.events;
```

### 4.3. Extract Plugin
The `extract` plugin is now accessed directly via the renderer.

**Target File**: `packages/shroom/src/objects/furniture/FurnitureHelper.ts`

```typescript
// Before (v6)
const image = shroom.dependencies.application.renderer.plugins.extract.image(container);

// After (v7)
const image = shroom.dependencies.application.renderer.extract.image(container);
```

---

## 5. Phase 4: Asset Loading (Recommended)

While Pixi v7 supports legacy loaders, transitioning to the new `Assets` API is recommended for better performance and manifest support.

1.  Replace `Loader` (deprecated) with `Assets.load()`.
2.  Update `LegacyAssetBundle.ts` and `ShroomAssetBundle.ts` to use `Assets` instead of `Texture.fromURL` or custom fetch/blob handling where applicable.

---

## 6. Verification Plan

### 6.1. Automated Tests
Run the existing test suite to ensure core logic (non-rendering) remains intact.
```bash
npm test --workspace=@xggcrypto/shroom
```

### 6.2. Manual Verification
1.  **Rendering**: Verify that the room, furniture, and avatars render correctly in the `example` app and `storybook`.
2.  **Interaction**: Verify that clicking tiles, furniture, and avatars still triggers the expected events.
3.  **Camera**: Ensure zooming and panning in `RoomCamera` still function correctly with the new `eventMode`.
4.  **Performance**: Monitor frame rates in large rooms to ensure no regressions.

---

## 7. Rollback Plan

If critical issues are found:
1.  Revert `package.json` changes.
2.  Restore `pixi-proxy/index.ts` from git history.
3.  Revert `eventMode` and `plugins` access changes.
4.  Run `npm install` to restore v6 dependencies.
