import {
  ShroomApplication,
  ShroomContainer,
  ShroomDisplayObject,
  ShroomSprite,
  ShroomTexture,
  ShroomTicker,
} from "../../pixi-proxy";

import { ClickHandler } from "../hitdetection/ClickHandler";
// import { FurniDrawPart } from "./util/DrawDefinition"; // UNUSED
import { IFurnitureEventHandlers } from "./util/IFurnitureEventHandlers";
import { LoadFurniResult } from "./util/loadFurni";
// import { HitTexture } from "../hitdetection/HitTexture"; // UNUSED
import { MaskNode } from "../../interfaces/IRoomVisualization";
import { HighlightFilter } from "./filter/HighlightFilter";
import {
  FurnitureFetch,
  IFurnitureLoader,
} from "../../interfaces/IFurnitureLoader";
// import { FurnitureAsset } from "./data/interfaces/IFurnitureAssetsData"; // UNUSED
// import { FurnitureLayer } from "./data/interfaces/IFurnitureVisualizationData"; // UNUSED
import { IAnimationTicker } from "../../interfaces/IAnimationTicker";
import { IRoomContext } from "../../interfaces/IRoomContext";
import { Shroom } from "../Shroom";
import { IFurnitureVisualization } from "./IFurnitureVisualization";
import { FurnitureSprite } from "./FurnitureSprite";
import { AnimatedFurnitureVisualization } from "./visualization/AnimatedFurnitureVisualization";
import { getDirectionForFurniture } from "./util/getDirectionForFurniture";
import { IEventManager } from "../events/interfaces/IEventManager";
import {
  EventGroupIdentifier,
  FURNITURE,
  IEventGroup,
} from "../events/interfaces/IEventGroup";
import { NOOP_EVENT_MANAGER } from "../events/EventManager";
import { FurnitureVisualizationView } from "./FurnitureVisualizationView";
import { EventOverOutHandler } from "../events/EventOverOutHandler";

const highlightFilter = new HighlightFilter(0x999999, 0xffffff);

type MaskIdGetter = (direction: number) => string | undefined;

export type SpriteWithStaticOffset = {
  x: number;
  y: number;
  sprite: ShroomSprite;
  zIndex?: number;
};

interface BaseFurnitureDependencies {
  placeholder: ShroomTexture | undefined;
  visualization: IFurnitureRoomVisualization;
  animationTicker: IAnimationTicker;
  furnitureLoader: IFurnitureLoader;
  application: ShroomApplication;
  eventManager: IEventManager;
}

export interface BaseFurnitureProps {
  type: FurnitureFetch;
  direction: number;
  animation: string | undefined;
  getMaskId?: MaskIdGetter;
  onLoad?: () => void;
}

type ResolveLoadFurniResult = (result: LoadFurniResult) => void;

/**
 * The core class for all furniture objects in the room engine.
 * Handles loading, visualization, event management, animation, and state for a single furniture instance.
 *
 * Use `BaseFurniture.fromRoomContext` or `BaseFurniture.fromShroom` for convenient construction.
 */
export class BaseFurniture implements IFurnitureEventHandlers, IEventGroup {

  /**
   * All sprites associated with this furniture, keyed by sprite name.
   * @readonly
   */
  private readonly _sprites: Map<string, FurnitureSprite> = new Map();

  /**
   * The result of loading the furniture data.
   */
  private _loadFurniResult: LoadFurniResult | undefined;

  /**
   * The x position of the furniture.
   */
  private _x = 0;
  /**
   * The y position of the furniture.
   */
  private _y = 0;
  /**
   * The z-index (draw order) of the furniture.
   */
  private _zIndex = 0;
  /**
   * The current direction of the furniture.
   */
  private _direction = 0;
  /**
   * The current animation state of the furniture.
   */
  private _animation: string;
  /**
   * The type of furniture (fetch key).
   */
  private readonly _type: FurnitureFetch;
  /**
   * The fallback texture to use if the furniture cannot be loaded.
   */
  private _unknownTexture: ShroomTexture | undefined;
  /**
   * The fallback sprite to use if the furniture cannot be loaded.
   */
  private _unknownSprite: FurnitureSprite | undefined;

  /**
   * Handles click events for this furniture.
   * @readonly
   */
  private readonly _clickHandler = new ClickHandler();
  /**
   * Handles pointer over/out events for this furniture.
   * @readonly
   */
  private readonly _overOutHandler = new EventOverOutHandler();

  /**
   * Promise that resolves when the furniture data is loaded.
   * @readonly
   */
  private readonly _loadFurniResultPromise: Promise<LoadFurniResult>;
  /**
   * The valid directions for this furniture, if known.
   */
  private _validDirections: number[] | undefined;
  /**
   * Resolver for the load furniture result promise.
   */
  private _resolveLoadFurniResult: ResolveLoadFurniResult | undefined;
  /**
   * The visualization view for this furniture.
   */
  private _view: FurnitureVisualizationView | undefined;

  /**
   * The visualization logic for this furniture.
   */
  private _visualization: IFurnitureVisualization | undefined;
  /**
   * Fallback visualization if the main visualization is not loaded.
   * @readonly
   */
  private readonly _fallbackVisualization = new AnimatedFurnitureVisualization();

  /**
   * Whether the position needs to be refreshed.
   */
  private _refreshPosition = false;
  /**
   * Whether the furniture needs to be refreshed.
   */
  private _refreshFurniture = false;
  /**
   * Whether the z-index needs to be refreshed.
   */
  private _refreshZIndex = false;

  /**
   * Whether the furniture is highlighted.
   */
  private _highlight = false;
  /**
   * The alpha (opacity) value for the furniture.
   */
  private _alpha = 1;
  /**
   * Whether this furniture instance has been destroyed.
   */
  private _destroyed = false;

  /**
   * The mask nodes currently applied to this furniture.
   */
  private _maskNodes: MaskNode[] = [];
  /**
   * The mask sprites currently applied to this furniture.
   */
  private _maskSprites: FurnitureSprite[] = [];

  /**
   * Function to cancel the animation ticker subscription, if any.
   */
  private _cancelTicker: (() => void) | undefined = undefined;
  /**
   * Function to get the mask ID for this furniture.
   */
  private _getMaskId: MaskIdGetter;

  /**
   * Optional callback to run when the furniture is loaded.
   */
  private _onLoad: (() => void) | undefined;

  /**
   * The dependencies for this furniture instance.
   */
  private _dependencies?: {
    placeholder: ShroomTexture | undefined;
    visualization: IFurnitureRoomVisualization;
    animationTicker: IAnimationTicker;
    furnitureLoader: IFurnitureLoader;
    eventManager: IEventManager;
  };

  /**
   * Constructs a new BaseFurniture instance.
   * @param props - The furniture properties and optional dependencies.
   */
  constructor({
    type,
    direction,
    animation = "0",
    getMaskId = () => undefined,
    dependencies,
    onLoad,
  }: {
    dependencies?: BaseFurnitureDependencies;
  } & BaseFurnitureProps) {
    this._direction = direction;
    this._animation = animation || "0";
    this._type = type;
    this._getMaskId = getMaskId;
    this._onLoad = onLoad;

    if (dependencies != null) {
      this.dependencies = dependencies;
    }

    ShroomTicker.shared.add(this._onTicker);

    this._loadFurniResultPromise = new Promise<LoadFurniResult>((resolve) => {
      this._resolveLoadFurniResult = resolve;
    });
  }

  /**
   * Creates a BaseFurniture instance from a room context and props.
   * @param context - The room context.
   * @param props - The furniture properties.
   */
  static fromRoomContext(context: IRoomContext, props: BaseFurnitureProps) {
    return new BaseFurniture({
      dependencies: {
        placeholder: context.configuration.placeholder,
        animationTicker: context.animationTicker,
        furnitureLoader: context.furnitureLoader,
        visualization: context.visualization,
        application: context.application,
        eventManager: context.eventManager,
      },
      ...props,
    });
  }

  /**
   * Creates a BaseFurniture instance from a Shroom and container.
   * @param shroom - The Shroom instance.
   * @param container - The container for visualization.
   * @param props - The furniture properties.
   */
  static fromShroom(
    shroom: Shroom,
    container: ShroomContainer,
    props: BaseFurnitureProps
  ) {
    return new BaseFurniture({
      dependencies: {
        animationTicker: shroom.dependencies.animationTicker,
        furnitureLoader: shroom.dependencies.furnitureLoader,
        placeholder: shroom.dependencies.configuration.placeholder,
        application: shroom.dependencies.application,
        eventManager: NOOP_EVENT_MANAGER,
        visualization: {
          container,
          addMask: () => {
            return {
              remove: () => {
                // Do nothing
              },
              update: () => {
                // Do nothing
              },
              sprite: null as any,
            };
          },
        },
      },
      ...props,
    });
  }

  /**
   * Gets the dependencies for this furniture instance.
   * @throws Error if dependencies are not set.
   */
  public get dependencies() {
    if (this._dependencies == null) throw new Error("Invalid dependencies");

    return this._dependencies;
  }

  /**
   * Sets the dependencies for this furniture instance and triggers loading.
   */
  public set dependencies(value) {
    this._dependencies = value;
    this._loadFurniture();
  }

  /**
   * Gets the current visualization for this furniture, or a fallback if not loaded.
   */
  public get visualization() {
    if (this._visualization == null) return this._fallbackVisualization;

    return this._visualization;
  }

  /**
   * Sets the visualization for this furniture and updates the display.
   */
  public set visualization(value) {
    this._visualization?.destroy();
    this._visualization = value;
    this._updateFurniture();
  }

  /**
   * Returns true if the furniture is mounted (dependencies are set).
   */
  public get mounted() {
    return this._dependencies != null;
  }

  /**
   * Gets the extra data for this furniture (async).
   * @returns A promise resolving to the extra data.
   */
  public get extradata() {
    return this._loadFurniResultPromise.then((result) => {
      return result.getExtraData();
    });
  }

  /**
   * Gets the valid directions for this furniture (async).
   * @returns A promise resolving to the array of valid directions.
   */
  public get validDirections() {
    return this._loadFurniResultPromise.then((result) => {
      return result.directions;
    });
  }

  /**
   * Gets whether the furniture is highlighted.
   */
  public get highlight() {
    return this._highlight;
  }

  /**
   * Sets whether the furniture is highlighted.
   */
  public set highlight(value) {
    this._highlight = value;
    this._refreshFurniture = true;
  }

  /**
   * Gets the alpha (opacity) value for the furniture.
   */
  public get alpha() {
    return this._alpha;
  }

  /**
   * Sets the alpha (opacity) value for the furniture.
   */
  public set alpha(value) {
    this._alpha = value;
    this._refreshFurniture = true;
  }

  /**
   * Gets the click event handler for this furniture.
   */
  public get onClick() {
    return this._clickHandler.onClick;
  }

  /**
   * Sets the click event handler for this furniture.
   */
  public set onClick(value) {
    this._clickHandler.onClick = value;
  }

  /**
   * Gets the double-click event handler for this furniture.
   */
  public get onDoubleClick() {
    return this._clickHandler.onDoubleClick;
  }

  /**
   * Sets the double-click event handler for this furniture.
   */
  public set onDoubleClick(value) {
    this._clickHandler.onDoubleClick = value;
  }

  /**
   * Gets the pointer down event handler for this furniture.
   */
  public get onPointerDown() {
    return this._clickHandler.onPointerDown;
  }

  /**
   * Sets the pointer down event handler for this furniture.
   */
  public set onPointerDown(value) {
    this._clickHandler.onPointerDown = value;
  }

  /**
   * Gets the pointer up event handler for this furniture.
   */
  public get onPointerUp() {
    return this._clickHandler.onPointerUp;
  }

  /**
   * Sets the pointer up event handler for this furniture.
   */
  public set onPointerUp(value) {
    this._clickHandler.onPointerUp = value;
  }

  /**
   * Gets the pointer out event handler for this furniture.
   */
  public get onPointerOut() {
    return this._overOutHandler.onOut;
  }

  /**
   * Sets the pointer out event handler for this furniture.
   */
  public set onPointerOut(value) {
    this._overOutHandler.onOut = value;
  }

  /**
   * Gets the pointer over event handler for this furniture.
   */
  public get onPointerOver() {
    return this._overOutHandler.onOver;
  }

  /**
   * Sets the pointer over event handler for this furniture.
   */
  public set onPointerOver(value) {
    this._overOutHandler.onOver = value;
  }

  /**
   * Gets the x position of the furniture.
   */
  public get x() {
    return this._x;
  }

  /**
   * Sets the x position of the furniture.
   */
  public set x(value) {
    if (value !== this.x) {
      this._x = value;
      this._refreshPosition = true;
    }
  }

  /**
   * Gets the y position of the furniture.
   */
  public get y() {
    return this._y;
  }

  /**
   * Sets the y position of the furniture.
   */
  public set y(value) {
    if (value !== this.y) {
      this._y = value;
      this._refreshPosition = true;
    }
  }

  /**
   * Gets the z-index (draw order) of the furniture.
   */
  public get zIndex() {
    return this._zIndex;
  }

  /**
   * Sets the z-index (draw order) of the furniture.
   */
  public set zIndex(value) {
    if (value !== this.zIndex) {
      this._zIndex = value;
      this._refreshZIndex = true;
    }
  }

  /**
   * Gets the current direction of the furniture.
   */
  public get direction() {
    return this._direction;
  }

  /**
   * Sets the direction of the furniture and updates the visualization.
   */
  public set direction(value) {
    this._direction = value;
    this._updateDirection();
  }

  /**
   * Rotates the furniture to the next valid direction.
   * @returns A promise that resolves when the direction is updated.
   */
  /**
   * Rotates the furniture to the next valid direction, wrapping around if needed.
   * @returns A promise that resolves when the direction is updated.
   */
  public async rotate() {
    if (!this._validDirections) {
      this._validDirections =
        this._loadFurniResult?.directions || (await this.validDirections);
    }

    if (!this._validDirections || this._validDirections.length === 0) {
      throw new Error("No valid directions available for this furniture.");
    }

    const currIndex = this._validDirections.indexOf(this._direction);
    let nextIndex = currIndex + 1;
    if (nextIndex >= this._validDirections.length) {
      nextIndex = 0;
    }
    this.direction = getDirectionForFurniture(
      this._validDirections[nextIndex],
      this._validDirections
    );
  }

  /**
   * Gets the current animation state of the furniture.
   */
  public get animation() {
    return this._animation;
  }

  /**
   * Sets the animation state of the furniture and updates the visualization.
   */
  public set animation(value) {
    this._animation = value;

    if (this.mounted) {
      this.visualization.updateAnimation(this.animation);
      this._handleAnimationChange();
    }
  }

  /**
   * Gets the mask ID getter function for this furniture.
   */
  public get maskId() {
    return this._getMaskId;
  }

  /**
   * Sets the mask ID getter function for this furniture.
   */
  public set maskId(value) {
    this._getMaskId = value;
  }

  /**
   * Gets the event group identifier for this furniture (always FURNITURE).
   */
  getEventGroupIdentifier(): EventGroupIdentifier {
    return FURNITURE;
  }

  /**
   * Destroys this furniture instance, cleaning up sprites, listeners, and views.
   */
  destroy() {
    this._destroySprites();

    this._destroyed = true;
    ShroomTicker.shared.remove(this._onTicker);
    this._cancelTicker && this._cancelTicker();
    this._cancelTicker = undefined;

    this._view?.destroy();
  }

  /**
   * Ticker callback to update furniture state as needed.
   * @private
   */
  private _onTicker = () => {
    if (this._refreshFurniture) {
      this._refreshFurniture = false;
      this._updateFurniture();
    }

    if (this._refreshPosition) {
      this._refreshPosition = false;
      this._updatePosition();
    }

    if (this._refreshZIndex) {
      this._refreshZIndex = false;
      this._updateZIndex();
    }
  };

  /**
   * Updates the direction of the visualization to match the furniture's direction.
   * @private
   */
  private _updateDirection() {
    if (!this.mounted) return;

    if (this._validDirections != null) {
      this.visualization.updateDirection(
        getDirectionForFurniture(this.direction, this._validDirections)
      );
    }
  }

  /**
   * Applies a callback to all sprites associated with this furniture.
   * @param cb - The callback to apply.
   * @private
   */
  private _updateSprites(cb: (element: FurnitureSprite) => void) {
    this._sprites.forEach(cb);

    if (this._unknownSprite != null) {
      cb(this._unknownSprite);
    }
  }

  /**
   * Updates the z-index of all sprites to match the furniture's z-index.
   * @private
   */
  private _updateZIndex() {
    this._updateSprites((element: FurnitureSprite) => {
      element.baseZIndex = this.zIndex;
    });
  }

  /**
   * Updates the position of all sprites and the view to match the furniture's position.
   * @private
   */
  private _updatePosition() {
    this._updateSprites((element: FurnitureSprite) => {
      element.baseX = this.x;
      element.baseY = this.y;
    });

    if (this._view == null) return;

    this._view.x = this.x;
    this._view.y = this.y;
    this._view.zIndex = this.zIndex;
    this._view.updateLayers();
  }

  /**
   * Updates the furniture's sprites and visualization, or shows a fallback if not loaded.
   * @private
   */
  private _updateFurniture() {
    if (!this.mounted) return;

    if (this._loadFurniResult != null) {
      this._updateFurnitureSprites(this._loadFurniResult);
    } else {
      this._updateUnknown();
    }
  }

  /**
   * Updates the fallback sprite if the furniture cannot be loaded.
   * @private
   */
  private _updateUnknown() {
    if (!this.mounted) return;

    if (this._unknownSprite == null) {
      this._unknownSprite = new FurnitureSprite({
        eventManager: this.dependencies.eventManager,
        group: this,
      });

      this._unknownSprite.baseX = this.x;
      this._unknownSprite.baseY = this.y;

      this._unknownSprite.offsetY = -32;

      if (this._unknownTexture != null) {
        this._unknownSprite.texture = this._unknownTexture;
      }

      this._unknownSprite.zIndex = this.zIndex;
      this.dependencies.visualization.container.addChild(this._unknownSprite);
      this._updatePosition();
    }
  }

  /**
   * Creates a new visualization view for the furniture.
   * @param loadFurniResult - The loaded furniture data.
   * @returns The new FurnitureVisualizationView instance.
   * @private
   */
  private _createNewView(loadFurniResult: LoadFurniResult) {
    this._view?.destroy();

    const view = new FurnitureVisualizationView(
      this.dependencies.eventManager,
      this._clickHandler,
      this._overOutHandler,
      this.dependencies.visualization.container,
      loadFurniResult
    );

    view.x = this.x;
    view.y = this.y;
    view.zIndex = this.zIndex;
    view.alpha = this.alpha ?? 1;
    view.highlight = this.highlight ?? false;

    this._view = view;

    return view;
  }

  /**
   * Updates the sprites and visualization for the loaded furniture.
   * @param loadFurniResult - The loaded furniture data.
   * @private
   */
  private _updateFurnitureSprites(loadFurniResult: LoadFurniResult) {
    if (!this.mounted) return;

    this._maskNodes.forEach((node) => node.remove());
    this._maskNodes = [];

    this._unknownSprite?.destroy();
    this._unknownSprite = undefined;

    this.visualization.setView(this._createNewView(loadFurniResult));

    this.visualization.update(this);
    this._validDirections = loadFurniResult.directions;

    this._updateDirection();

    this.visualization.updateAnimation(this.animation);
    this.visualization.updateFrame(this.dependencies.animationTicker.current());

    this._handleAnimationChange();
    this._updatePosition();
  }

  /**
   * Destroys all sprites and mask nodes associated with this furniture.
   * @private
   */
  private _destroySprites() {
    this._sprites.forEach((sprite) => sprite.destroy());
    this._maskNodes.forEach((node) => node.remove());
    this._unknownSprite?.destroy();
    this._sprites.clear();
  }

  /**
   * Loads the furniture data and updates the visualization.
   * @private
   */
  private _loadFurniture() {
    if (!this.mounted) return;

    this._unknownTexture = this.dependencies.placeholder ?? undefined;

    this.dependencies.furnitureLoader.loadFurni(this._type)
      .then((result) => {
        if (this._destroyed) return;

        this._loadFurniResult = result;
        this._resolveLoadFurniResult && this._resolveLoadFurniResult(result);
        this._updateFurniture();

        this._onLoad && this._onLoad();
      })
      .catch((err) => {
        // Improved error handling: log error and show fallback
        // eslint-disable-next-line no-console
        console.error("Failed to load furniture:", err);
        this._updateUnknown();
      });

    this._updateFurniture();
  }

  /**
   * Handles changes to the animation state, subscribing or unsubscribing from the animation ticker as needed.
   * @private
   */
  private _handleAnimationChange() {
    if (
      this.visualization.isAnimated(this.animation) &&
      this._cancelTicker == null
    ) {
      this._cancelTicker = this.dependencies.animationTicker.subscribe(
        (frame) => {
          this.visualization.updateFrame(frame);
        }
      );
      this.visualization.update(this);
      this.visualization.updateFrame(
        this.dependencies.animationTicker.current()
      );
    }

    if (
      !this.visualization.isAnimated(this.animation) &&
      this._cancelTicker != null
    ) {
      this._cancelTicker();
      this._cancelTicker = undefined;

      this.visualization.update(this);
      this.visualization.updateFrame(
        this.dependencies.animationTicker.current()
      );
    }
  }

  /**
   * Computes the effective alpha value for a sprite layer.
   * @param params - The alpha values.
   * @returns The computed alpha value.
   * @private
   */
  private _getAlpha({
    layerAlpha,
    baseAlpha,
  }: {
    layerAlpha?: number;
    baseAlpha: number;
  }) {
    if (layerAlpha != null) return (layerAlpha / 255) * baseAlpha;

    return baseAlpha;
  }
}

export interface IFurnitureRoomVisualization {
  container: ShroomContainer;
  addMask(maskId: string, element: ShroomDisplayObject): MaskNode;
}
