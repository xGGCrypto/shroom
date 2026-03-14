# Project Extensibility & Architecture Report

## Summary

The **shroom** monorepo is a TypeScript-based 2D isometric room renderer built on Pixi.js, organized as 6 workspaces (`shroom`, `cli`, `e2e`, `example`, `docs`, `storybook`). The core library in `packages/shroom` provides room rendering, furniture placement, avatar display, pathfinding, and event handling.

### Key Architectural Observations

**Strengths:**
- **Interface layer exists** — `interfaces/` directory defines contracts for loaders (`IFurnitureLoader`, `IAvatarLoader`), configuration (`IConfiguration`), and room objects (`IRoomObject`), enabling dependency injection at the loader level.
- **Pixi.js abstraction layer** — `pixi-proxy/` re-exports all Pixi.js types under `Shroom*` aliases, centralizing the rendering engine dependency for easier migration.
- **Custom event system** — `EventManager` uses RBush spatial indexing for efficient hit-testing with custom propagation semantics.
- **Asset bundle abstraction** — `IAssetBundle` interface supports both legacy XML and modern JSON asset formats transparently.
- **RoomObject lifecycle** — Abstract `RoomObject` with `registered()`/`destroyed()` hooks provides a clean lifecycle model.

**Weaknesses:**
- **God classes** — `BaseFurniture` (908 lines), `RoomModelVisualization` (824 lines), `Avatar` (643 lines), and `FurnitureVisualizationView` (643 lines) handle too many responsibilities.
- **Service Locator anti-pattern** — `IRoomContext` aggregates 12 dependencies; `RoomObject` exposes 10 shortcut getters, tightly coupling every room object to the entire context.
- **No plugin/hook system** — Extending behavior requires subclassing or modifying source code directly.
- **Massive delegation boilerplate** — `FloorFurniture` and `WallFurniture` duplicate ~20+ getter/setter pairs that simply delegate to `BaseFurniture`.
- **Concrete type in interface** — `IRoomContext.room` references the concrete `Room` class, breaking interface abstraction.
- **No cross-module event bus** — Modules communicate through direct references, not events.

---

## High Impact Refactors

| # | Title | Category |
|---|-------|----------|
| 1 | Split `BaseFurniture` god class | Refactor |
| 2 | Break `IRoomContext` into focused interfaces | Architecture |
| 3 | Introduce a plugin/hook system for `Room` | Architecture |
| 4 | Eliminate delegation boilerplate in `FloorFurniture`/`WallFurniture` | Refactor |
| 5 | Split `RoomModelVisualization` into sub-components | Refactor |

## Medium Impact Refactors

| # | Title | Category |
|---|-------|----------|
| 6 | Extract `FurnitureVisualizationLayer` into its own file | Refactor |
| 7 | Create a cross-module event bus | Architecture |
| 8 | Replace concrete `Room` reference in `IRoomContext` | Architecture |
| 9 | Consolidate avatar/furniture shared patterns | Refactor |
| 10 | Make `IConfiguration` extensible | Architecture |

## Low Impact Refactors

| # | Title | Category |
|---|-------|----------|
| 11 | Standardize module barrel exports | DX |
| 12 | Extract magic numbers into constants | DX |
| 13 | Remove stale `window.addEventListener` in `EventEmitter.ts` | Refactor |
| 14 | Add comprehensive JSDoc for public API | DX |

## Suggested Features

| # | Feature | Category |
|---|---------|----------|
| 15 | Room object lifecycle events | Feature |
| 16 | Furniture behavior plugin API | Feature |
| 17 | Configurable asset loading strategy | Feature |
| 18 | Room serialization / deserialization | Feature |

## Architectural Improvements

| # | Improvement | Category |
|---|-------------|----------|
| 19 | Dependency injection container | Architecture |
| 20 | Middleware pipeline for asset loading | Architecture |
| 21 | Pixi-proxy as a full abstraction layer | Architecture |

---

## Detailed Recommendations

### 1. Split `BaseFurniture` God Class
**Priority:** High  
**Category:** Refactor  
**File(s):** `packages/shroom/src/objects/furniture/BaseFurniture.ts` (908 lines)

**Current Situation**  
`BaseFurniture` handles loading, visualization management, event handling, animation state, highlight/alpha overlays, and dependency wiring — all in a single 908-line class with 67 outline items.

**Problem**  
Adding any feature (e.g., furniture stacking, custom interactions, new visual effects) requires modifying this file, risking regressions. The class violates the Single Responsibility Principle.

**Recommendation**  
Split into focused classes:

```
BaseFurniture (orchestration only, ~100 lines)
├── FurnitureStateManager     — roomX/Y/Z, direction, animation, extradata
├── FurnitureVisualizationController — visualization lifecycle, highlight, alpha
├── FurnitureEventController  — click, pointer, over/out handlers
└── FurnitureLoadingController — asset loading, dependency resolution
```

**Example Implementation**
```typescript
// FurnitureStateManager.ts
export class FurnitureStateManager {
  private _roomX = 0;
  private _roomY = 0;
  private _roomZ = 0;
  private _direction = 0;
  private _animation = "0";

  constructor(initial: { roomX: number; roomY: number; roomZ: number; direction: number }) { ... }

  get roomX() { return this._roomX; }
  set roomX(value: number) { this._roomX = value; this.onChange?.(); }
  
  onChange?: () => void;
}

// BaseFurniture.ts (simplified orchestrator)
export class BaseFurniture {
  readonly state: FurnitureStateManager;
  readonly events: FurnitureEventController;
  readonly visualization: FurnitureVisualizationController;
  
  constructor(props: BaseFurnitureProps) {
    this.state = new FurnitureStateManager(props);
    this.events = new FurnitureEventController();
    this.visualization = new FurnitureVisualizationController();
    this.state.onChange = () => this.visualization.update(this.state);
  }
}
```

---

### 2. Break `IRoomContext` into Focused Interfaces
**Priority:** High  
**Category:** Architecture  
**File(s):** `packages/shroom/src/interfaces/IRoomContext.ts`, `packages/shroom/src/objects/RoomObject.ts`

**Current Situation**  
`IRoomContext` aggregates 12 properties. Every `RoomObject` depends on the entire context via 10 shortcut getters, even if it only needs 2-3 services.

```typescript
export interface IRoomContext {
  geometry: IRoomGeometry;
  furnitureLoader: IFurnitureLoader;
  avatarLoader: IAvatarLoader;
  animationTicker: IAnimationTicker;
  visualization: IRoomVisualization;
  roomObjectContainer: IRoomObjectContainer;
  configuration: IConfiguration;
  tilemap: ITileMap;
  landscapeContainer: ILandscapeContainer;
  application: ShroomApplication;
  room: Room;  // ← concrete type!
  eventManager: IEventManager;
}
```

**Problem**  
- An `Avatar` only needs `avatarLoader`, `animationTicker`, `visualization`, and `eventManager`, but receives all 12.
- Adding a new service to `IRoomContext` forces all room objects to recompile.
- The `room: Room` reference uses a concrete class, breaking interface abstraction.

**Recommendation**  
Use Interface Segregation. Split into focused sub-interfaces:

```typescript
interface IRoomRenderContext {
  geometry: IRoomGeometry;
  visualization: IRoomVisualization;
  application: ShroomApplication;
}

interface IRoomLoaderContext {
  furnitureLoader: IFurnitureLoader;
  avatarLoader: IAvatarLoader;
}

interface IRoomAnimationContext {
  animationTicker: IAnimationTicker;
}

// Room objects declare only what they need:
class Avatar extends RoomObject {
  protected getRequiredContext(): Pick<IRoomContext, 'avatarLoader' | 'animationTicker' | 'visualization'> { ... }
}
```

---

### 3. Introduce a Plugin/Hook System for `Room`
**Priority:** High  
**Category:** Architecture  
**File(s):** `packages/shroom/src/objects/room/Room.ts`

**Current Situation**  
`Room` provides no extension points. Adding new behaviors (room effects, custom interactions, overlays, automation) requires directly modifying the `Room` class or wrapping it externally.

**Problem**  
Third-party consumers cannot extend room behavior without forking. The `Room` class grows linearly with each new feature.

**Recommendation**  
Introduce a plugin system with lifecycle hooks:

```typescript
interface IRoomPlugin {
  name: string;
  onRoomCreated?(room: Room): void;
  onObjectAdded?(room: Room, object: IRoomObject): void;
  onObjectRemoved?(room: Room, object: IRoomObject): void;
  onTileClick?(room: Room, position: RoomPosition): boolean; // return false to prevent default
  onBeforeRender?(room: Room): void;
  onDestroy?(room: Room): void;
}

// Usage:
const room = Room.create(shroom, {
  tilemap: myMap,
  plugins: [
    new PathfindingPlugin(),
    new FurnitureStackingPlugin(),
    new RoomEffectsPlugin(),
  ],
});
```

This transforms the current `Pathfinding` class from a manually-instantiated utility into a proper room plugin, and opens the door for all future features to be plugins.

---

### 4. Eliminate Delegation Boilerplate in `FloorFurniture`/`WallFurniture`
**Priority:** High  
**Category:** Refactor  
**File(s):** `packages/shroom/src/objects/furniture/FloorFurniture.ts` (474 lines), `packages/shroom/src/objects/furniture/WallFurniture.ts` (273 lines)

**Current Situation**  
`FloorFurniture` has ~20 pairs of getter/setters that simply delegate to the internal `_baseFurniture`:
```typescript
get onClick() { return this._baseFurniture.onClick; }
set onClick(value) { this._baseFurniture.onClick = value; }
get onDoubleClick() { return this._baseFurniture.onDoubleClick; }
set onDoubleClick(value) { this._baseFurniture.onDoubleClick = value; }
// ... repeated 20+ times
```

**Problem**  
Each new property on `BaseFurniture` requires adding boilerplate in both `FloorFurniture` and `WallFurniture`. This is error-prone and inflates file sizes.

**Recommendation**  
Option A — **Composition with public access**:
```typescript
class FloorFurniture extends RoomObject implements IFurniture {
  public readonly base: BaseFurniture;
  // Only override what's unique to FloorFurniture (move, placement, z-ordering)
}
// Consumer: furniture.base.onClick = handler;
```

Option B — **Mixin pattern** using TypeScript's mixin support:
```typescript
function FurnitureEventMixin<T extends Constructor<{ base: BaseFurniture }>>(Base: T) {
  return class extends Base {
    get onClick() { return this.base.onClick; }
    set onClick(value) { this.base.onClick = value; }
    // ... auto-generated or reduced via proxy
  };
}
```

Option C — **Proxy delegation** for the event/visual properties:
```typescript
class FloorFurniture extends RoomObject {
  private _base: BaseFurniture;
  
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        if (prop in target) return (target as any)[prop];
        if (prop in target._base) return (target._base as any)[prop];
      }
    });
  }
}
```

---

### 5. Split `RoomModelVisualization` into Sub-Components
**Priority:** High  
**Category:** Refactor  
**File(s):** `packages/shroom/src/objects/room/RoomModelVisualization.ts` (824 lines, 74 outline items)

**Current Situation**  
This class manages tiles, walls, landscape, cursors, masking, coloring, layering, and event propagation for the entire room — all in a single file.

**Problem**  
Modifying the tile rendering system risks breaking wall rendering. There's no way to swap out the tile renderer or wall renderer independently.

**Recommendation**  
Extract into focused renderers:
```
RoomModelVisualization (orchestrator, ~200 lines)
├── TileRenderer        — tile creation, coloring, height
├── WallRenderer        — wall creation, coloring, depth
├── LandscapeRenderer   — landscape, masking
├── CursorRenderer      — tile cursor display
└── RoomLayerManager    — container ordering, z-index management
```

Each renderer should implement a common `IRoomPartRenderer` interface:
```typescript
interface IRoomPartRenderer {
  initialize(parsedTileMap: ParsedTileMap): void;
  update(): void;
  destroy(): void;
}
```

---

### 6. Extract `FurnitureVisualizationLayer` into Its Own File
**Priority:** Medium  
**Category:** Refactor  
**File(s):** `packages/shroom/src/objects/furniture/FurnitureVisualizationView.ts` (643 lines, 2 classes)

**Current Situation**  
`FurnitureVisualizationView.ts` contains two full classes: `FurnitureVisualizationView` (~230 lines) and `FurnitureVisualizationLayer` (~380 lines).

**Problem**  
Two classes in one file makes it harder to find, test, and reason about each class independently. The layer class is reusable but hidden inside the view file.

**Recommendation**  
Extract `FurnitureVisualizationLayer` into `FurnitureVisualizationLayer.ts`. This is a straightforward file split with no behavioral changes.

---

### 7. Create a Cross-Module Event Bus
**Priority:** Medium  
**Category:** Architecture  
**File(s):** New module: `packages/shroom/src/events/`

**Current Situation**  
The existing `EventManager` is specialized for spatial hit-testing (click/pointer events on room objects). There is no general-purpose event bus for cross-module communication. Components communicate via direct references.

**Problem**  
To react to furniture being added, removed, or state changes, consumers must manually poll or wrap methods. There's no way to "listen" for room-level events.

**Recommendation**  
Create a typed event bus using the existing `EventEmitter<TMap>` pattern:

```typescript
// RoomEventBus.ts
interface RoomEvents {
  "object:added": { object: IRoomObject };
  "object:removed": { object: IRoomObject };
  "furniture:loaded": { furniture: IFurniture; result: LoadFurniResult };
  "avatar:moved": { avatar: Avatar; from: RoomPosition; to: RoomPosition };
  "tilemap:changed": { oldMap: TileType[][]; newMap: TileType[][] };
  "room:destroyed": {};
}

export class RoomEventBus extends EventEmitter<RoomEvents> {}
```

Wire this into `RoomObjectContainer.addRoomObject` and `removeRoomObject` to emit events automatically. This enables the plugin system (recommendation #3) and decouples consumers.

---

### 8. Replace Concrete `Room` Reference in `IRoomContext`
**Priority:** Medium  
**Category:** Architecture  
**File(s):** `packages/shroom/src/interfaces/IRoomContext.ts` (line 27)

**Current Situation**
```typescript
import { Room } from "../objects/room/Room";
export interface IRoomContext {
  room: Room;  // concrete class in an interface!
}
```

**Problem**  
This creates a circular dependency path and prevents testing room objects with mock rooms. Any file importing `IRoomContext` transitively imports the entire `Room` class and its dependencies.

**Recommendation**
```typescript
export interface IRoom {
  roomWidth: number;
  roomHeight: number;
  getTileAtPosition(roomX: number, roomY: number): ParsedTileType | undefined;
  changeTileMap(tileMap: TileType[][]): void;
  getParsedTileTypes(): ParsedTileType[][];
}

export interface IRoomContext {
  room: IRoom;  // interface, not concrete class
}
```

---

### 9. Consolidate Avatar/Furniture Shared Patterns
**Priority:** Medium  
**Category:** Refactor  
**File(s):** `Avatar.ts`, `BaseAvatar.ts`, `FloorFurniture.ts`, `BaseFurniture.ts`

**Current Situation**  
Avatar and furniture share near-identical patterns:
- Both have `onClick`, `onDoubleClick`, `onPointerDown/Up/Over/Out` event handlers
- Both use `ClickHandler` and `EventOverOutHandler`
- Both have `highlight`, `alpha`, `zIndex` properties
- Both load assets via a loader and cache them
- Both integrate with `EventManager` via `IEventGroup`

**Problem**  
Changes to event handling patterns must be duplicated in both avatar and furniture code. Bug fixes in one don't automatically propagate to the other.

**Recommendation**  
Extract a shared `InteractiveRoomEntity` base or mixin:

```typescript
// InteractiveEntity.ts
export interface InteractiveEntityOptions {
  eventManager: IEventManager;
  clickHandler: ClickHandler;
  overOutHandler: EventOverOutHandler;
}

export class InteractiveEntity {
  onClick?: HitEventHandler;
  onDoubleClick?: HitEventHandler;
  onPointerDown?: HitEventHandler;
  onPointerUp?: HitEventHandler;
  onPointerOver?: HitEventHandler;
  onPointerOut?: HitEventHandler;
  
  highlight: boolean = false;
  alpha: number = 1;
  
  // Shared implementation for event registration, hit testing, etc.
}
```

---

### 10. Make `IConfiguration` Extensible
**Priority:** Medium  
**Category:** Architecture  
**File(s):** `packages/shroom/src/interfaces/IConfiguration.ts`

**Current Situation**
```typescript
export interface IConfiguration {
  placeholder?: ShroomTexture;
  tileColor?: { floorColor?: string; leftFade?: number; rightFade?: number };
  avatarMovementDuration?: number;
  furnitureMovementDuration?: number;
}
```
Only 4 hardcoded properties. Adding a new config option requires modifying this interface.

**Problem**  
No way for plugins or consumers to add custom configuration without modifying the core interface.

**Recommendation**  
Support typed extension via generics or a config map:

```typescript
export interface IConfiguration {
  // Core options
  placeholder?: ShroomTexture;
  tileColor?: { floorColor?: string; leftFade?: number; rightFade?: number };
  avatarMovementDuration?: number;
  furnitureMovementDuration?: number;
  
  // Extension point
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T): void;
}
```

Or use a branded key pattern for type safety:
```typescript
const MY_PLUGIN_OPTION = Symbol("myPlugin.option") as ConfigKey<number>;
config.get(MY_PLUGIN_OPTION); // typed as number | undefined
```

---

### 11. Standardize Module Barrel Exports
**Priority:** Low  
**Category:** Developer Experience  
**File(s):** Various `index.ts` files

**Current Situation**  
Some directories have `index.ts` barrel exports, others don't. The main `src/index.ts` exports 87 lines of cherry-picked items. Some sub-modules like `objects/furniture/visualization/` lack an `index.ts`.

**Recommendation**  
Ensure every feature directory has a clean `index.ts` that exports only the public API. Use the `/** @internal */` JSDoc tag for implementation details that shouldn't be exported.

---

### 12. Extract Magic Numbers into Named Constants
**Priority:** Low  
**Category:** Developer Experience  
**File(s):** Various

**Current Situation**  
Magic numbers appear throughout:
- `30000` — timeout milliseconds (in `LegacyAssetBundle`, `ShroomAssetBundle`)
- `10` — pixels before drag starts (`RoomCamera.ts` line 357)
- `500` — default animation duration (`RoomCamera.ts` line 243)
- `0`, `1`, `2`, ... `7` — direction constants (`Avatar.ts`, `Pathfinding.ts`)
- `-1`, `-2`, `-3`, `-4` — grid state values (`Pathfinding.ts`)

**Recommendation**  
Create a `constants.ts` at the package root:
```typescript
export const DEFAULT_FETCH_TIMEOUT_MS = 30000;
export const DRAG_THRESHOLD_PX = 10;
export const DEFAULT_CAMERA_ANIMATION_MS = 500;

export enum Direction {
  North = 0, NorthEast = 1, East = 2, SouthEast = 3,
  South = 4, SouthWest = 5, West = 6, NorthWest = 7,
}

export enum GridState {
  Blocked = -1, CanLayOn = -2, CanSitOn = -3, CanStandOn = -4,
}
```

---

### 13. Remove Stale Code in `EventEmitter.ts`
**Priority:** Low  
**Category:** Refactor  
**File(s):** `packages/shroom/src/objects/events/EventEmitter.ts` (line 96)

**Current Situation**
```typescript
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
window.addEventListener;
```
An unexplained bare `window.addEventListener` expression exists at the module level, suppressed by an eslint-disable comment. There are also duplicate JSDoc blocks.

**Recommendation**  
Remove the dead expression and deduplicate the JSDoc comments.

---

### 14. Add Comprehensive JSDoc for Public API
**Priority:** Low  
**Category:** Developer Experience  
**File(s):** `packages/shroom/src/index.ts` and all exported classes

**Current Situation**  
Some classes have JSDoc (`Room`, `Shroom`, `FurnitureLoader`), but many public types and methods lack documentation. The exported `index.ts` has minimal comments.

**Recommendation**  
Add JSDoc with `@example` tags for all top-level exported classes. Consider generating API docs using TypeDoc from the JSDoc comments.

---

### 15. Room Object Lifecycle Events
**Priority:** Medium  
**Category:** Feature  
**File(s):** New or modified: `Room.ts`, `RoomObjectContainer.ts`

**Description**  
Emit events when room objects are added, removed, moved, or have their state changed.

**Benefit**  
Enables reactive UIs, logging, analytics, undo/redo, and plugin systems without polling.

**Implementation**  
Integrate with the event bus from recommendation #7:
```typescript
// In RoomObjectContainer.addRoomObject:
this._eventBus.trigger("object:added", { object });
```

---

### 16. Furniture Behavior Plugin API
**Priority:** Medium  
**Category:** Feature  
**File(s):** `packages/shroom/src/objects/furniture/IFurniture.ts`, `FloorFurniture.ts`

**Description**  
`IFurnitureBehavior` already exists as a concept (`FloorFurniture` constructor accepts `behaviors?: IFurnitureBehavior<FloorFurniture>[]`), but it's underdeveloped — no documentation, no built-in behaviors, and unclear lifecycle.

**Benefit**  
Formalize the behavior API to allow composable, reusable furniture behaviors (e.g., `StackableBehavior`, `SittableBehavior`, `AnimationTriggerBehavior`).

**Implementation**
```typescript
interface IFurnitureBehavior<T extends IFurniture> {
  onAttach(furniture: T): void;
  onDetach(furniture: T): void;
  onStateChange?(furniture: T, change: StateChange): void;
  onTick?(furniture: T, deltaTime: number): void;
}

// Built-in behaviors:
class StackableBehavior implements IFurnitureBehavior<FloorFurniture> { ... }
class SittableBehavior implements IFurnitureBehavior<FloorFurniture> { ... }
```

---

### 17. Configurable Asset Loading Strategy
**Priority:** Medium  
**Category:** Feature  
**File(s):** `FurnitureLoader.ts`, `AvatarLoader.ts`, `LegacyAssetBundle.ts`, `ShroomAssetBundle.ts`

**Description**  
Allow consumers to configure how assets are loaded: from remote URLs, local files, IndexedDB cache, service worker cache, or a custom backend.

**Benefit**  
Enables offline support, CDN switching, and testing with mock assets.

**Implementation**
```typescript
interface IAssetLoadingStrategy {
  fetchBlob(url: string, options?: FetchOptions): Promise<Blob>;
  fetchText(url: string, options?: FetchOptions): Promise<string>;
  fetchArrayBuffer(url: string, options?: FetchOptions): Promise<ArrayBuffer>;
}

// Built-in strategies:
class NetworkStrategy implements IAssetLoadingStrategy { ... }
class CacheThenNetworkStrategy implements IAssetLoadingStrategy { ... }
class IndexedDBStrategy implements IAssetLoadingStrategy { ... }
```

Pass the strategy into `Shroom.create`:
```typescript
const shroom = Shroom.create({
  application,
  resourcePath: "https://cdn.example.com/resources",
  assetStrategy: new CacheThenNetworkStrategy(),
});
```

---

### 18. Room Serialization / Deserialization
**Priority:** Low  
**Category:** Feature  
**File(s):** New module

**Description**  
Provide a way to serialize a room's complete state (tilemap, furniture positions/types, avatar positions) to JSON and restore it.

**Benefit**  
Enables room saving/loading, multiplayer state sync, undo/redo, and room previews.

**Implementation**
```typescript
interface RoomSnapshot {
  version: number;
  tilemap: TileType[][];
  furniture: Array<{
    type: string;
    roomX: number; roomY: number; roomZ: number;
    direction: number;
    animation?: string;
  }>;
  avatars: Array<{
    look: string;
    roomX: number; roomY: number; roomZ: number;
    direction: number;
  }>;
}

class RoomSerializer {
  static serialize(room: Room): RoomSnapshot { ... }
  static deserialize(snapshot: RoomSnapshot, shroom: Shroom): Room { ... }
}
```

---

### 19. Dependency Injection Container
**Priority:** Medium  
**Category:** Architecture  

**Current Situation**  
`Shroom.createShared` manually wires dependencies with null-coalescing fallbacks:
```typescript
const _furnitureData = furnitureData ?? FurnitureData.create(resourcePath);
const _avatarLoader = avatarLoader ?? AvatarLoader.createForAssetBundle(resourcePath);
```
`Room` then passes all dependencies into `IRoomContext` manually.

**Problem**  
Adding a new service requires modifying `Shroom`, `Room`, `IRoomContext`, and any class that uses it.

**Recommendation**  
Use a lightweight DI container (or a simple factory registry):

```typescript
class ShroomContainer {
  private _services = new Map<symbol, any>();
  
  register<T>(key: ServiceKey<T>, factory: () => T): void { ... }
  resolve<T>(key: ServiceKey<T>): T { ... }
}

// Registration:
container.register(FURNITURE_LOADER, () => FurnitureLoader.createForJson(data, path));
container.register(AVATAR_LOADER, () => AvatarLoader.createForAssetBundle(path));

// Resolution (in RoomObject):
const loader = this.container.resolve(FURNITURE_LOADER);
```

---

### 20. Middleware Pipeline for Asset Loading
**Priority:** Low  
**Category:** Architecture  

**Current Situation**  
Asset loading goes directly from loader → fetch → parse. There's no way to intercept, transform, or monitor the loading pipeline.

**Recommendation**  
Add a middleware pattern:
```typescript
type AssetMiddleware = (
  request: AssetRequest,
  next: (request: AssetRequest) => Promise<AssetResponse>
) => Promise<AssetResponse>;

// Usage:
shroom.use(loggingMiddleware);       // logs all asset loads
shroom.use(cachingMiddleware);       // caches to IndexedDB
shroom.use(transformMiddleware);     // converts legacy formats
```

---

### 21. Strengthen Pixi-Proxy as a Full Abstraction Layer
**Priority:** Low  
**Category:** Architecture  
**File(s):** `packages/shroom/src/pixi-proxy/index.ts`

**Current Situation**  
`pixi-proxy` currently just re-exports Pixi.js types with `Shroom*` aliases:
```typescript
export { Application as ShroomApplication, Texture as ShroomTexture, ... } from "pixi.js";
```
This provides naming abstraction but no behavioral abstraction. The rest of the codebase uses Pixi-specific APIs directly (e.g., `.interactive`, `InteractionEvent`).

**Problem**  
Migrating to Pixi.js v7 or v8 (which changed the interaction system entirely) would require touching every file that uses interaction events.

**Recommendation**  
Wrap Pixi APIs behind shroom-specific interfaces where breaking changes are likely:
```typescript
// pixi-proxy/interaction.ts
export interface IShroomInteractionEvent {
  readonly data: { pointerId: number; getLocalPosition(obj: any): { x: number; y: number } };
  stopPropagation(): void;
}

// Adapter for Pixi v6:
export function wrapInteractionEvent(event: PIXI.InteractionEvent): IShroomInteractionEvent { ... }
```

---

## Positive Findings

These patterns are already well-designed and should be preserved:

- **`IAssetBundle` interface** — The abstraction over `LegacyAssetBundle` and `ShroomAssetBundle` is clean and allows easy addition of new asset formats (e.g., a hypothetical `RemoteCDNAssetBundle`).
- **`EventManager` with RBush** — Using a spatial index for hit-testing is an excellent choice for performance. The custom propagation system with `skip()` and `skipExcept()` is well-thought-out.
- **`RoomObject` lifecycle hooks** — The `registered()`/`destroyed()` template method pattern provides a clear lifecycle contract.
- **`ParsedTileMap` separation** — Separating tile map parsing from rendering is good separation of concerns.
- **`FurnitureVisualization` hierarchy** — The `FurnitureVisualization` → `AnimatedFurnitureVisualization` → `FurnitureBottleVisualization` inheritance chain is a clean strategy pattern for different visualization types.
- **Cache eviction in asset bundles** — The LRU-style eviction in `LegacyAssetBundle` and `ShroomAssetBundle` prevents memory leaks for long-running sessions.
- **Test infrastructure** — The `EventManager.test.ts` (15KB) shows thorough testing of the event system with 316 lines of coverage.
