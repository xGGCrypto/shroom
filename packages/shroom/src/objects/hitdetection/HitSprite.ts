import {
  ShroomSprite,
  ShroomTexture,
  ShroomTilingSprite,
} from "../../pixi-proxy";
import { BehaviorSubject, Observable } from "rxjs";
import { EventEmitter } from "../events/EventEmitter";
import { IEventGroup } from "../events/interfaces/IEventGroup";
import { IEventManager } from "../events/interfaces/IEventManager";
import { IEventManagerEvent } from "../events/interfaces/IEventManagerEvent";
import { IEventTarget } from "../events/interfaces/IEventTarget";
import { Hitmap } from "../furniture/util/loadFurni";
import { Rectangle } from "../room/IRoomRectangle";
import { HitTexture } from "./HitTexture";

export type HitEventHandler = (event: IEventManagerEvent) => void;

/**
 * HitSprite extends a PIXI sprite to provide pixel-perfect hit detection, event handling, and group management for interactive objects.
 * It supports custom hitmaps, mirroring, and emits pointer/click events via an internal event emitter.
 *
 * @category HitDetection
 */
export class HitSprite extends ShroomSprite implements IEventTarget {
  private _group: IEventGroup;

  private _hitTexture: HitTexture | undefined;
  private _tag: string | undefined;
  private _mirrored: boolean;
  private _ignore = false;
  private _ignoreMouse = false;
  private _eventManager: IEventManager;
  private _rectangleSubject = new BehaviorSubject<Rectangle | undefined>(
    undefined
  );

  private _eventEmitter = new EventEmitter<HitSpriteEventMap>();

  private _getHitmap:
    | (() => (
        x: number,
        y: number,
        transform: { x: number; y: number }
      ) => boolean)
    | undefined;

  /**
   * Event emitter for pointer and click events on this sprite.
   */
  public get events() {
    return this._eventEmitter;
  }

  /**
   * Constructs a HitSprite.
   * @param options Options for event manager, group, mirroring, tag, and custom hitmap.
   */
  constructor({
    eventManager,
    mirrored = false,
    getHitmap,
    tag,
    group,
  }: {
    eventManager: IEventManager;
    getHitmap?: () => Hitmap;
    mirrored?: boolean;
    tag?: string;
    group: IEventGroup;
  }) {
    super();
    this._group = group;
    this._mirrored = mirrored;
    this._getHitmap = getHitmap;
    this._tag = tag;
    this.mirrored = this._mirrored;
    this._eventManager = eventManager;
    eventManager.register(this);
  }

  /**
   * Returns the event group this sprite belongs to.
   */
  getGroup(): IEventGroup {
    return this._group;
  }

  /**
   * Returns an observable for the sprite's bounding rectangle (for hit detection updates).
   */
  getRectangleObservable(): Observable<Rectangle | undefined> {
    return this._rectangleSubject;
  }

  /**
   * Returns the z-order for event handling (usually the sprite's zIndex).
   */
  getEventZOrder(): number {
    return this.zIndex;
  }

  /**
   * Triggers a pointer target changed event.
   * @param event The event object.
   */
  triggerPointerTargetChanged(event: IEventManagerEvent): void {
    event.tag = this._tag;
    this._eventEmitter.trigger("pointertargetchanged", event);
  }

  /**
   * Triggers a click event.
   * @param event The event object.
   */
  triggerClick(event: IEventManagerEvent): void {
    event.tag = this._tag;
    this._eventEmitter.trigger("click", event);
  }

  /**
   * Triggers a pointer down event.
   * @param event The event object.
   */
  triggerPointerDown(event: IEventManagerEvent): void {
    event.tag = this._tag;
    this._eventEmitter.trigger("pointerdown", event);
  }

  /**
   * Triggers a pointer up event.
   * @param event The event object.
   */
  triggerPointerUp(event: IEventManagerEvent): void {
    event.tag = this._tag;
    this._eventEmitter.trigger("pointerup", event);
  }

  /**
   * Triggers a pointer over event.
   * @param event The event object.
   */
  triggerPointerOver(event: IEventManagerEvent): void {
    event.tag = this._tag;
    this._eventEmitter.trigger("pointerover", event);
  }

  /**
   * Triggers a pointer out event.
   * @param event The event object.
   */
  triggerPointerOut(event: IEventManagerEvent): void {
    event.tag = this._tag;
    this._eventEmitter.trigger("pointerout", event);
  }

  /**
   * Creates a debug sprite visualizing the hit area (for development/testing).
   * @returns A semi-transparent tiling sprite, or undefined if no hit texture is set.
   */
  createDebugSprite(): ShroomSprite | undefined {
    if (this._hitTexture == null) return;
    const hitMap = this._hitTexture.getHitMap();
    if (hitMap == null) return;
    const sprite = new ShroomTilingSprite(
      ShroomTexture.WHITE,
      this._hitTexture.texture.width,
      this._hitTexture.texture.height
    );
    sprite.alpha = 0.1;
    const pos = this.getGlobalPosition();
    sprite.x = pos.x;
    sprite.y = pos.y;
    return sprite;
  }

  /**
   * Whether this sprite ignores mouse events (for hit detection).
   */
  public get ignoreMouse() {
    return this._ignoreMouse;
  }
  public set ignoreMouse(value) {
    this._ignoreMouse = value;
  }

  /**
   * The event group this sprite belongs to.
   */
  public get group() {
    return this._group;
  }

  /**
   * Whether this sprite is ignored for hit detection.
   */
  public get ignore() {
    return this._ignore;
  }
  public set ignore(value) {
    this._ignore = value;
  }

  /**
   * Whether this sprite is mirrored horizontally.
   */
  public get mirrored() {
    return this._mirrored;
  }
  public set mirrored(value) {
    this._mirrored = value;
    this.scale.x = this._mirrored ? -1 : 1;
  }

  /**
   * The hit texture used for pixel-perfect hit detection.
   */
  public get hitTexture() {
    return this._hitTexture;
  }
  public set hitTexture(value) {
    if (value != null) {
      this.texture = value.texture;
      this._hitTexture = value;
      this._getHitmap = () => (
        x: number,
        y: number,
        transform: { x: number; y: number }
      ) =>
        value.hits(x, y, transform, {
          mirrorHorizonally: this._mirrored,
        });
    }
  }

  /**
   * Returns the z-index used for hit detection ordering.
   */
  getHitDetectionZIndex(): number {
    return this.zIndex;
  }

  /**
   * Cleans up the sprite and unregisters it from the event manager.
   */
  destroy() {
    super.destroy();
    this._eventManager.remove(this);
  }

  /**
   * Returns the bounding rectangle of the sprite for hit detection.
   */
  getHitBox(): Rectangle {
    const pos = this.getGlobalPosition();
    if (this._mirrored) {
      return {
        x: pos.x - this.texture.width,
        y: pos.y,
        width: this.texture.width,
        height: this.texture.height,
      };
    }
    return {
      x: pos.x,
      y: pos.y,
      width: this.texture.width,
      height: this.texture.height,
    };
  }

  /**
   * Checks if the given global coordinates hit this sprite (pixel-perfect if hit texture is set).
   * @param x The global X coordinate.
   * @param y The global Y coordinate.
   * @returns True if the point hits the sprite, false otherwise.
   */
  hits(x: number, y: number): boolean {
    if (this._getHitmap == null) return false;
    if (this.ignore) return false;
    if (this.ignoreMouse) return false;
    const hitBox = this.getHitBox();
    const inBoundsX = hitBox.x <= x && x <= hitBox.x + hitBox.width;
    const inBoundsY = hitBox.y <= y && y <= hitBox.y + hitBox.height;
    if (inBoundsX && inBoundsY) {
      const hits = this._getHitmap();
      const pos = this.getGlobalPosition();
      return hits(x, y, {
        x: pos.x,
        y: pos.y,
      });
    }
    return false;
  }

  /**
   * Updates the transform and notifies observers of the new hit rectangle.
   */
  updateTransform() {
    super.updateTransform();
    this._rectangleSubject.next(this.getHitBox());
  }
}

export type HitSpriteEventMap = {
  click: IEventManagerEvent;
  pointerup: IEventManagerEvent;
  pointerdown: IEventManagerEvent;
  pointerover: IEventManagerEvent;
  pointerout: IEventManagerEvent;
  pointertargetchanged: IEventManagerEvent;
};
