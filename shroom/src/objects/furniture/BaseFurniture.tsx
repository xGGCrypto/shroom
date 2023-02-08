import * as PIXI from "pixi.js";

import { ClickHandler } from "../hitdetection/ClickHandler";
import { FurniDrawPart } from "./util/DrawDefinition";
import { IFurnitureEventHandlers } from "./util/IFurnitureEventHandlers";
import { LoadFurniResult } from "./util/loadFurni";
import { HitTexture } from "../hitdetection/HitTexture";
import { MaskNode } from "../../interfaces/IRoomVisualization";
import { HighlightFilter } from "./filter/HighlightFilter";
import {
  FurnitureFetch,
  IFurnitureLoader,
} from "../../interfaces/IFurnitureLoader";
import { FurnitureAsset } from "./data/interfaces/IFurnitureAssetsData";
import { FurnitureLayer } from "./data/interfaces/IFurnitureVisualizationData";
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
  sprite: PIXI.Sprite;
  zIndex?: number;
};

interface BaseFurnitureDependencies {
  placeholder: PIXI.Texture | undefined;
  visualization: IFurnitureRoomVisualization;
  animationTicker: IAnimationTicker;
  furnitureLoader: IFurnitureLoader;
  application: PIXI.Application;
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

export class BaseFurniture implements IFurnitureEventHandlers, IEventGroup {
  private _sprites: Map<string, FurnitureSprite> = new Map();
  private _loadFurniResult: LoadFurniResult | undefined;

  private _x = 0;
  private _y = 0;
  private _zIndex = 0;
  private _direction = 0;
  private _animation: string;
  private _type: FurnitureFetch;
  private _unknownTexture: PIXI.Texture | undefined;
  private _unknownSprite: FurnitureSprite | undefined;

  private _clickHandler = new ClickHandler();
  private _overOutHandler = new EventOverOutHandler();

  private _loadFurniResultPromise: Promise<LoadFurniResult>;
  private _validDirections: number[] | undefined;
  private _resolveLoadFurniResult: ResolveLoadFurniResult | undefined;
  private _view: FurnitureVisualizationView | undefined;

  private _visualization: IFurnitureVisualization | undefined;
  private _fallbackVisualization = new AnimatedFurnitureVisualization();

  private _refreshPosition = false;
  private _refreshFurniture = false;
  private _refreshZIndex = false;

  private _highlight = false;
  private _alpha = 1;
  private _destroyed = false;

  private _maskNodes: MaskNode[] = [];
  private _maskSprites: FurnitureSprite[] = [];

  private _cancelTicker: (() => void) | undefined = undefined;
  private _getMaskId: MaskIdGetter;

  private _onLoad: (() => void) | undefined;

  private _dependencies?: {
    placeholder: PIXI.Texture | undefined;
    visualization: IFurnitureRoomVisualization;
    animationTicker: IAnimationTicker;
    furnitureLoader: IFurnitureLoader;
    eventManager: IEventManager;
  };

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

    PIXI.Ticker.shared.add(this._onTicker);

    this._loadFurniResultPromise = new Promise<LoadFurniResult>((resolve) => {
      this._resolveLoadFurniResult = resolve;
    });
  }

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

  static fromShroom(
    shroom: Shroom,
    container: PIXI.Container,
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

  public get dependencies() {
    if (this._dependencies == null) throw new Error("Invalid dependencies");

    return this._dependencies;
  }

  public set dependencies(value) {
    this._dependencies = value;
    this._loadFurniture();
  }

  public get visualization() {
    if (this._visualization == null) return this._fallbackVisualization;

    return this._visualization;
  }

  public set visualization(value) {
    this._visualization?.destroy();
    this._visualization = value;
    this._updateFurniture();
  }

  public get mounted() {
    return this._dependencies != null;
  }

  public get extradata() {
    return this._loadFurniResultPromise.then((result) => {
      return result.getExtraData();
    });
  }

  public get validDirections() {
    return this._loadFurniResultPromise.then((result) => {
      return result.directions;
    });
  }

  public get highlight() {
    return this._highlight;
  }

  public set highlight(value) {
    this._highlight = value;
    this._refreshFurniture = true;
  }

  public get alpha() {
    return this._alpha;
  }

  public set alpha(value) {
    this._alpha = value;
    this._refreshFurniture = true;
  }

  public get onClick() {
    return this._clickHandler.onClick;
  }

  public set onClick(value) {
    this._clickHandler.onClick = value;
  }

  public get onDoubleClick() {
    return this._clickHandler.onDoubleClick;
  }

  public set onDoubleClick(value) {
    this._clickHandler.onDoubleClick = value;
  }

  public get onPointerDown() {
    return this._clickHandler.onPointerDown;
  }

  public set onPointerDown(value) {
    this._clickHandler.onPointerDown = value;
  }

  public get onPointerUp() {
    return this._clickHandler.onPointerUp;
  }

  public set onPointerUp(value) {
    this._clickHandler.onPointerUp = value;
  }

  public get onPointerOut() {
    return this._overOutHandler.onOut;
  }

  public set onPointerOut(value) {
    this._overOutHandler.onOut = value;
  }

  public get onPointerOver() {
    return this._overOutHandler.onOver;
  }

  public set onPointerOver(value) {
    this._overOutHandler.onOver = value;
  }

  public get x() {
    return this._x;
  }

  public set x(value) {
    if (value !== this.x) {
      this._x = value;
      this._refreshPosition = true;
    }
  }

  public get y() {
    return this._y;
  }

  public set y(value) {
    if (value !== this.y) {
      this._y = value;
      this._refreshPosition = true;
    }
  }

  public get zIndex() {
    return this._zIndex;
  }

  public set zIndex(value) {
    if (value !== this.zIndex) {
      this._zIndex = value;
      this._refreshZIndex = true;
    }
  }

  public get direction() {
    return this._direction;
  }

  public set direction(value) {
    this._direction = value;
    this._updateDirection();
  }

  public async rotate() {
    if (!this._validDirections) { 
      this._validDirections = this._loadFurniResult?.directions || await this.validDirections;
    }
    
    const currIndex = this._validDirections?.indexOf(this._direction);
    this.direction = getDirectionForFurniture(this._validDirections[currIndex +1], this._validDirections);
  }

  public get animation() {
    return this._animation;
  }

  public set animation(value) {
    this._animation = value;

    if (this.mounted) {
      this.visualization.updateAnimation(this.animation);
      this._handleAnimationChange();
    }
  }

  public get maskId() {
    return this._getMaskId;
  }

  public set maskId(value) {
    this._getMaskId = value;
  }

  getEventGroupIdentifier(): EventGroupIdentifier {
    return FURNITURE;
  }

  destroy() {
    this._destroySprites();

    this._destroyed = true;
    PIXI.Ticker.shared.remove(this._onTicker);
    this._cancelTicker && this._cancelTicker();
    this._cancelTicker = undefined;

    this._view?.destroy();
  }

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

  private _updateDirection() {
    if (!this.mounted) return;

    if (this._validDirections != null) {
      this.visualization.updateDirection(
        getDirectionForFurniture(this.direction, this._validDirections)
      );
    }
  }

  private _updateSprites(cb: (element: FurnitureSprite) => void) {
    this._sprites.forEach(cb);

    if (this._unknownSprite != null) {
      cb(this._unknownSprite);
    }
  }

  private _updateZIndex() {
    this._updateSprites((element: FurnitureSprite) => {
      element.baseZIndex = this.zIndex;
    });
  }

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

  private _updateFurniture() {
    if (!this.mounted) return;

    if (this._loadFurniResult != null) {
      this._updateFurnitureSprites(this._loadFurniResult);
    } else {
      this._updateUnknown();
    }
  }

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

  private _destroySprites() {
    this._sprites.forEach((sprite) => sprite.destroy());
    this._maskNodes.forEach((node) => node.remove());
    this._unknownSprite?.destroy();
    this._sprites = new Map();
  }

  private _loadFurniture() {
    if (!this.mounted) return;

    this._unknownTexture = this.dependencies.placeholder ?? undefined;

    this.dependencies.furnitureLoader.loadFurni(this._type).then((result) => {
      if (this._destroyed) return;

      this._loadFurniResult = result;
      this._resolveLoadFurniResult && this._resolveLoadFurniResult(result);
      this._updateFurniture();

      this._onLoad && this._onLoad();
    });

    this._updateFurniture();
  }

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
  container: PIXI.Container;
  addMask(maskId: string, element: PIXI.DisplayObject): MaskNode;
}
