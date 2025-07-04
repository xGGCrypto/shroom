import { ShroomBlendModes, ShroomContainer } from "../../pixi-proxy";
import { EventOverOutHandler } from "../events/EventOverOutHandler";

import {
  EventGroupIdentifier,
  FURNITURE,
  IEventGroup,
} from "../events/interfaces/IEventGroup";
import { IEventManager } from "../events/interfaces/IEventManager";
import { ClickHandler } from "../hitdetection/ClickHandler";
import { HitTexture } from "../hitdetection/HitTexture";
import { FurnitureAsset } from "./data/interfaces/IFurnitureAssetsData";
import { IFurnitureVisualizationData } from "./data/interfaces/IFurnitureVisualizationData";
import { HighlightFilter } from "./filter/HighlightFilter";
import { FurnitureSprite } from "./FurnitureSprite";
import {
  IFurnitureVisualizationLayer,
  IFurnitureVisualizationView,
} from "./IFurnitureVisualizationView";
import { FurniDrawDefinition, FurniDrawPart } from "./util/DrawDefinition";
import { LoadFurniResult } from "./util/loadFurni";

const highlightFilter = new HighlightFilter(0x999999, 0xffffff);

/**
 * FurnitureVisualizationView manages the rendering and interaction of a furniture object,
 * including its display layers, animation, direction, and event handling.
 * It provides a high-level API for updating the visual state of furniture in the room.
 *
 * @category Furniture
 */
export class FurnitureVisualizationView
  implements IFurnitureVisualizationView, IBaseFurniture, IEventGroup {
  /** The current direction index for the furniture visualization. */
  private _direction: number | undefined;
  /** The current animation name or id for the furniture visualization. */
  private _animation: string | undefined;

  /** Cache for draw definitions, keyed by direction and animation. */
  private _cache: Map<string, FurniDrawDefinition> = new Map();
  /** The current display layers for the furniture. */
  private _layers: FurnitureVisualizationLayer[] | undefined;

  /** The X position of the furniture visualization. */
  private _x: number | undefined;
  /** The Y position of the furniture visualization. */
  private _y: number | undefined;
  /** The Z-index of the furniture visualization. */
  private _zIndex: number | undefined;
  /** The alpha (opacity) of the furniture visualization. */
  private _alpha: number | undefined;
  /** Whether the furniture visualization is highlighted. */
  private _highlight: boolean | undefined;

  public get x() {
    if (this._x == null) throw new Error("x not set");

    return this._x;
  }

  public set x(value) {
    this._x = value;
  }

  public get y() {
    if (this._y == null) throw new Error("y not set");

    return this._y;
  }

  public set y(value) {
    this._y = value;
  }

  public get zIndex() {
    if (this._zIndex == null) throw new Error("zIndex not set");

    return this._zIndex;
  }

  public set zIndex(value) {
    this._zIndex = value;
  }

  public get alpha() {
    if (this._alpha == null) throw new Error("alpha not set");

    return this._alpha;
  }

  public set alpha(value) {
    this._alpha = value;
  }

  public get highlight() {
    if (this._highlight == null) throw new Error("highlight not set");

    return this._highlight;
  }

  public set highlight(value) {
    this._highlight = value;
  }

  /**
   * Creates a new FurnitureVisualizationView.
   * @param _eventManager The event manager for handling input events.
   * @param _clickHandler The click handler for click events.
   * @param _overOutHandler The handler for pointer over/out events.
   * @param _container The container to render furniture sprites into.
   * @param _furniture The loaded furniture data and assets.
   */
  constructor(
    private _eventManager: IEventManager,
    private _clickHandler: ClickHandler,
    private _overOutHandler: EventOverOutHandler,
    private _container: ShroomContainer,
    private _furniture: LoadFurniResult
  ) {}

  /**
   * Gets the event group identifier for this visualization (always FURNITURE).
   */
  getEventGroupIdentifier(): EventGroupIdentifier {
    return FURNITURE;
  }

  /**
   * Gets the display layers of the furniture. Throws if not yet set.
   * @throws If updateDisplay has not been called yet.
   */
  getLayers(): IFurnitureVisualizationLayer[] {
    if (this._layers == null)
      throw new Error(
        "Layers not set yet. Call `updateDisplay` before accessing the layers."
      );
    return this._layers;
  }

  /**
   * Gets the visualization data for this furniture.
   */
  getVisualizationData(): IFurnitureVisualizationData {
    return this._furniture.visualizationData;
  }

  /**
   * Sets the animation to display for this furniture.
   * @param animation The animation name or id.
   */
  setDisplayAnimation(animation?: string): void {
    this._animation = animation;
  }

  /**
   * Sets the direction to display for this furniture.
   * @param direction The direction index.
   */
  setDisplayDirection(direction: number): void {
    this._direction = direction;
  }

  /**
   * Updates all display layers to match the current position, alpha, and highlight state.
   */
  updateLayers() {
    this._layers?.forEach((layer) => {
      layer.x = this.x;
      layer.y = this.y;
      layer.zIndex = this.zIndex;
      layer.alpha = this.alpha;
      layer.highlight = this.highlight;
      layer.update();
    });
  }

  /**
   * Updates the display layers for the current direction and animation.
   * Destroys old layers and creates new ones as needed.
   * @throws If direction is not set.
   */
  updateDisplay(): void {
    if (this._direction == null) throw new Error("Direction was not set");

    const direction = this._direction;
    const animation = this._animation;

    this._layers?.forEach((layer) => layer.destroy());
    this._layers = this._getDrawDefinition(direction, animation).parts.map(
      (part) =>
        new FurnitureVisualizationLayer(
          this,
          this._container,
          part,
          this._eventManager,
          this._clickHandler,
          this._overOutHandler,
          (id) => this._furniture.getTexture(id)
        )
    );

    this.updateLayers();
  }

  /**
   * Destroys all display layers and cleans up resources.
   */
  destroy() {
    this._layers?.forEach((layer) => layer.destroy());
  }

  /**
   * Gets or computes the draw definition for a given direction and animation, with caching.
   * @param direction The direction index.
   * @param animation The animation name or id.
   * @returns The draw definition for the given parameters.
   */
  private _getDrawDefinition(direction: number, animation?: string) {
    animation = animation ?? "undefined";

    const key = `${direction}_${animation}`;
    const current = this._cache.get(key);
    if (current != null) return current;

    const definition = this._furniture.getDrawDefinition(direction, animation);

    this._cache.set(key, definition);

    return definition;
  }
}

/**
 * FurnitureVisualizationLayer represents a single visual layer of a furniture object.
 * It manages the sprite(s) for a given layer, including frame animation, color, highlight, and event handling.
 * Layers are created and managed by FurnitureVisualizationView and are responsible for rendering and updating their own sprites.
 *
 * @category Furniture
 */
/**
 * FurnitureVisualizationLayer represents a single visual layer of a furniture object.
 * It manages the sprite(s) for a given layer, including frame animation, color, highlight, and event handling.
 * Layers are created and managed by FurnitureVisualizationView and are responsible for rendering and updating their own sprites.
 *
 * @category Furniture
 */
/**
 * FurnitureVisualizationLayer represents a single visual layer of a furniture object.
 * It manages the sprite(s) for a given layer, including frame animation, color, highlight, and event handling.
 * Layers are created and managed by FurnitureVisualizationView and are responsible for rendering and updating their own sprites.
 *
 * @category Furniture
 */
class FurnitureVisualizationLayer
  implements IFurnitureVisualizationLayer, IBaseFurniture {
  /**
   * Number of times to repeat the current frame before advancing.
   */
  public readonly frameRepeat: number;
  /**
   * The index of this layer within the furniture visualization.
   */
  public readonly layerIndex: number;
  /**
   * The number of assets (frames) in this layer.
   */
  public readonly assetCount: number;

  /**
   * Map of frame index to sprite instance.
   */
  private _sprites = new Map<number, FurnitureSprite>();
  /**
   * The X position of the layer.
   */
  private _x: number | undefined;
  /**
   * The Y position of the layer.
   */
  private _y: number | undefined;
  /**
   * The Z-index of the layer.
   */
  private _zIndex: number | undefined;
  /**
   * The alpha (opacity) of the layer.
   */
  private _alpha: number | undefined;
  /**
   * Whether the layer is highlighted.
   */
  private _highlight: boolean | undefined;
  /**
   * Whether the sprite position has changed and needs updating.
   */
  private _spritePositionChanged = false;
  /**
   * Whether the sprites have changed and need to be recreated.
   */
  private _spritesChanged = false;
  /**
   * The current frame index for animation.
   */
  private _frameIndex = 0;
  /**
   * The color tint to apply to the layer, if any.
   */
  private _color: number | undefined;
  /**
   * Set of sprites currently mounted in the container.
   */
  private _mountedSprites = new Set<FurnitureSprite>();


  public get highlight() {
    if (this._highlight == null) throw new Error("highlight not set");

    return this._highlight;
  }

  public set highlight(value) {
    if (value === this._highlight) return;

    this._highlight = value;
    this._spritesChanged = true;
  }

  public get alpha() {
    if (this._alpha == null) throw new Error("alpha not set");

    return this._alpha;
  }

  public set alpha(value) {
    if (value === this._alpha) return;

    this._alpha = value;
    this._spritesChanged = true;
  }

  public get x() {
    if (this._x == null) throw new Error("x not set");

    return this._x;
  }

  public set x(value) {
    if (value === this._x) return;

    this._x = value;
    this._spritePositionChanged = true;
  }

  public get y() {
    if (this._y == null) throw new Error("y not set");

    return this._y;
  }

  public set y(value) {
    if (this._y === value) return;

    this._y = value;
    this._spritePositionChanged = true;
  }

  public get zIndex() {
    if (this._zIndex == null) throw new Error("zIndex not set");

    return this._zIndex;
  }

  public set zIndex(value) {
    if (this._zIndex === value) return;

    this._zIndex = value;
    this._spritePositionChanged = true;
  }

  public get tag() {
    return this._part.layer?.tag;
  }

  constructor(
    private _parent: FurnitureVisualizationView,
    private _container: ShroomContainer,
    private _part: FurniDrawPart,
    private _eventManager: IEventManager,
    private _clickHandler: ClickHandler,
    private _overOutHandler: EventOverOutHandler,
    private _getTexture: (id: string) => HitTexture | undefined
  ) {
    this.frameRepeat = _part.frameRepeat;
    this.layerIndex = _part.layerIndex;
    this.assetCount = _part.assets.length;
  }

  setColor(color: number): void {
    if (this._color === color) return;

    this._color = color;
    this._spritesChanged = true;
  }

  setCurrentFrameIndex(value: number): void {
    const previousFrameIndex = this._frameIndex;
    this._frameIndex = value;

    const previousFrame = this._getSprite(previousFrameIndex);
    if (previousFrame != null) {
      this._setSpriteVisible(previousFrame, false);
    }

    const newFrame = this._getSprite(this._frameIndex);
    if (newFrame != null) {
      this._setSpriteVisible(newFrame, true);
      this._addSprite(newFrame);

      if (this._color != null) {
        newFrame.tint = this._color;
      }
    }
  }

  update() {
    if (this._spritePositionChanged) {
      this._spritePositionChanged = false;
      this._updateSpritesPosition();
    }

    if (this._spritesChanged) {
      this._spritesChanged = false;
      this._destroySprites();
      this._updateSprites();
    }
  }

  destroy() {
    this._destroySprites();
  }

  private _updateSpritePosition(sprite: FurnitureSprite) {
    sprite.baseX = this.x;
    sprite.baseY = this.y;
    sprite.baseZIndex = this.zIndex;
  }

  private _addSprite(sprite: FurnitureSprite) {
    if (this._mountedSprites.has(sprite)) return;

    this._mountedSprites.add(sprite);
    this._container.addChild(sprite);
    this._overOutHandler.register(sprite.events);
  }

  private _destroySprites() {
    this._sprites.forEach((sprite) => {
      this._container.removeChild(sprite);
      this._overOutHandler.remove(sprite.events);
      sprite.destroy();
    });
    this._sprites = new Map();
    this._mountedSprites = new Set();
  }

  private _setSpriteVisible(sprite: FurnitureSprite, visible: boolean) {
    if (visible) {
      sprite.ignore = false;
      sprite.visible = true;
    } else {
      sprite.ignore = true;
      sprite.visible = false;
    }
  }

  private _updateSprites() {
    const frameIndex = this._frameIndex;
    const sprite = this._getSprite(frameIndex);

    this._sprites.forEach((sprite) => this._setSpriteVisible(sprite, false));

    if (sprite != null) {
      this._addSprite(sprite);
      this._setSpriteVisible(sprite, true);
    }
  }

  private _updateSpritesPosition() {
    this._sprites.forEach((sprite) => {
      this._updateSpritePosition(sprite);
    });
  }

  private _getSpriteInfo(frameIndex: number) {
    const asset: FurnitureAsset | undefined = this._part.assets[frameIndex];

    if (asset == null) return;

    const texture = this._getTexture(getAssetTextureName(asset));

    return {
      asset,
      texture,
    };
  }

  private _getSprite(frameIndex: number) {
    const current = this._sprites.get(frameIndex);
    if (current != null) {
      return current;
    }

    const spriteInfo = this._getSpriteInfo(frameIndex);
    if (spriteInfo == null) return;

    const { z, layer, shadow, mask, tint } = this._part;
    const { asset, texture } = spriteInfo;

    const zIndex = z ?? 0;

    const sprite = new FurnitureSprite({
      eventManager: this._eventManager,
      mirrored: asset.flipH,
      tag: layer?.tag,
      group: this._parent,
    });

    const ignoreMouse = layer?.ignoreMouse != null && layer.ignoreMouse;
    sprite.ignoreMouse = ignoreMouse;

    sprite.events.addEventListener("click", (event) => {
      this._clickHandler.handleClick(event);
    });

    sprite.events.addEventListener("pointerup", (event) => {
      this._clickHandler.handlePointerUp(event);
    });

    sprite.events.addEventListener("pointerdown", (event) => {
      this._clickHandler.handlePointerDown(event);
    });

    sprite.hitTexture = texture;

    // Apply asset styling
    const highlight = this._highlight && layer?.ink == null && !shadow && !mask;

    if (highlight) {
      sprite.filters = [highlightFilter];
    } else {
      sprite.filters = [];
    }

    const scaleX = asset.flipH ? -1 : 1;

    const offsetX = +(32 - asset.x * scaleX);
    const offsetY = -asset.y + 16;

    sprite.offsetX = offsetX;
    sprite.offsetY = offsetY;
    sprite.offsetZIndex = zIndex;

    sprite.baseX = this.x;
    sprite.baseY = this.y;
    sprite.baseZIndex = this.zIndex;

    if (shadow) {
      sprite.baseZIndex = this.zIndex;
      sprite.offsetZIndex = -this.zIndex;
    }

    if (tint != null) {
      sprite.tint = parseInt(tint, 16);
    }

    const alpha = this._getAlpha({
      baseAlpha: this.alpha,
      layerAlpha: layer?.alpha,
    });

    if (layer != null) {
      if (layer.ink != null) {
        if (this.highlight) {
          sprite.visible = false;
        }
        sprite.blendMode =
          layer.ink === "ADD" ? ShroomBlendModes.ADD : ShroomBlendModes.NORMAL;
      }
    }

    if (shadow) {
      if (this.highlight) {
        sprite.visible = false;
        sprite.alpha = 0;
      } else {
        sprite.visible = true;
        sprite.alpha = alpha / 5;
      }
    } else {
      sprite.visible = true;
      sprite.alpha = alpha;
    }

    if (mask) {
      sprite.tint = 0xffffff;
    }

    if (this._color != null) {
      sprite.tint = this._color;
    }

    this._setSpriteVisible(sprite, false);
    this._sprites.set(frameIndex, sprite);

    this._overOutHandler.register(sprite.events);

    return sprite;
  }

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

const getAssetTextureName = (asset: FurnitureAsset) =>
  asset.source ?? asset.name;

export interface IBaseFurniture {
  x: number;
  y: number;
  zIndex: number;
  alpha: number;
  highlight: boolean;
}
