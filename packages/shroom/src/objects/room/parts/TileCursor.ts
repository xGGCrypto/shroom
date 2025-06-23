import { ShroomContainer, ShroomGraphics } from "../../../pixi-proxy";
import { BehaviorSubject, Observable } from "rxjs";
import { RoomPosition } from "../../../types/RoomPosition";
import { isPointInside } from "../../../util/isPointInside";
import {
  EventGroupIdentifier,
  IEventGroup,
  TILE_CURSOR,
} from "../../events/interfaces/IEventGroup";
import { IEventManager } from "../../events/interfaces/IEventManager";
import { IEventManagerEvent } from "../../events/interfaces/IEventManagerEvent";
import { IEventTarget } from "../../events/interfaces/IEventTarget";
import { Rectangle } from "../IRoomRectangle";

/**
 * Represents a tile cursor for room interaction and highlighting.
 * Handles pointer events, hover state, and hit detection for a room tile.
 */
export class TileCursor
  extends ShroomContainer
  implements IEventTarget, IEventGroup {
  private _roomX: number;
  private _roomY: number;
  private _roomZ: number;
  private _graphics: ShroomGraphics;
  private _hover = false;
  private _subject = new BehaviorSubject<Rectangle | undefined>(undefined);

  /**
   * Creates a new TileCursor.
   * @param _eventManager The event manager for registering events.
   * @param _position The room position this cursor represents.
   * @param onClick Callback for click events.
   * @param onOver Callback for pointer over events.
   * @param onOut Callback for pointer out events.
   */
  constructor(
    private _eventManager: IEventManager,
    private _position: RoomPosition,
    private onClick: (
      position: RoomPosition,
      event: IEventManagerEvent
    ) => void,
    private onOver: (position: RoomPosition) => void,
    private onOut: (position: RoomPosition) => void
  ) {
    super();
    this._roomX = _position.roomX;
    this._roomY = _position.roomY;
    this._roomZ = _position.roomZ;
    this._graphics = this._createGraphics();
    this._updateGraphics();

    this.addChild(this._graphics);

    this._eventManager.register(this);
  }

  /**
   * Gets the event group identifier for this cursor.
   */
  getEventGroupIdentifier(): EventGroupIdentifier {
    return TILE_CURSOR;
  }

  /**
   * Gets the event group for this cursor (self).
   */
  getGroup(): IEventGroup {
    return this;
  }

  /**
   * Gets an observable for the cursor's rectangle (for hit detection).
   */
  getRectangleObservable(): Observable<Rectangle | undefined> {
    return this._subject;
  }

  /**
   * Gets the event Z order for this cursor (for event stacking).
   */
  getEventZOrder(): number {
    return -1000;
  }

  /**
   * No-op for pointer target changed (not used).
   */
  triggerPointerTargetChanged(event: IEventManagerEvent): void {}

  /**
   * Handles click events and invokes the callback.
   */
  triggerClick(event: IEventManagerEvent): void {
    if (typeof this.onClick === 'function') {
      this.onClick(
        {
          roomX: this._roomX,
          roomY: this._roomY,
          roomZ: this._roomZ,
        },
        event
      );
    }
  }

  /**
   * No-op for pointer down event (not used).
   */
  triggerPointerDown(event: IEventManagerEvent): void {}
  /**
   * No-op for pointer up event (not used).
   */
  triggerPointerUp(event: IEventManagerEvent): void {}

  /**
   * Handles pointer over events and invokes the callback.
   */
  triggerPointerOver(event: IEventManagerEvent): void {
    this._updateHover(true);
    if (typeof this.onOver === 'function') {
      this.onOver({ roomX: this._roomX, roomY: this._roomY, roomZ: this._roomZ });
    }
  }

  /**
   * Handles pointer out events and invokes the callback.
   */
  triggerPointerOut(event: IEventManagerEvent): void {
    this._updateHover(false);
    if (typeof this.onOut === 'function') {
      this.onOut({ roomX: this._roomX, roomY: this._roomY, roomZ: this._roomZ });
    }
  }

  /**
   * Creates a debug sprite (not used).
   */
  createDebugSprite() {
    return undefined;
  }

  /**
   * Checks if a point (x, y) is inside the cursor's polygon.
   * Defensive: returns false if points are invalid.
   * @param x The X coordinate.
   * @param y The Y coordinate.
   */
  hits(x: number, y: number): boolean {
    const pos = this.getGlobalPosition();
    const diffX = x - pos.x;
    const diffY = y - pos.y;
    if (!points || !points.p1 || !points.p2 || !points.p3 || !points.p4) return false;
    return this._pointInside(
      [diffX, diffY],
      [
        [points.p1.x, points.p1.y],
        [points.p2.x, points.p2.y],
        [points.p3.x, points.p3.y],
        [points.p4.x, points.p4.y],
      ]
    );
  }

  /**
   * Gets the Z index for hit detection (for event stacking).
   */
  getHitDetectionZIndex(): number {
    return -1000;
  }

  /**
   * Destroys the tile cursor and cleans up resources.
   */
  destroy() {
    super.destroy();
    if (this._graphics) this._graphics.destroy();
    if (this._eventManager) this._eventManager.remove(this);
  }

  /**
   * Updates the transform and notifies observers of the rectangle change.
   */
  updateTransform() {
    super.updateTransform();
    this._subject.next(this._getCurrentRectangle());
  }

  /**
   * Gets the current rectangle for the cursor in global coordinates.
   */
  private _getCurrentRectangle(): Rectangle {
    const position = this.getGlobalPosition();
    return {
      x: position.x,
      y: position.y,
      width: 64,
      height: 32,
    };
  }

  /**
   * Creates the graphics object for the cursor.
   */
  private _createGraphics() {
    const graphics = new ShroomGraphics();
    return graphics;
  }

  /**
   * Updates the cursor's graphics based on hover state.
   * Defensive: checks for graphics before drawing.
   */
  private _updateGraphics() {
    const graphics = this._graphics;
    if (!graphics) return;
    graphics.clear();
    if (this._hover) {
      drawBorder(graphics, 0x000000, 0.33, 0);
      drawBorder(graphics, 0xa7d1e0, 1, -2);
      drawBorder(graphics, 0xffffff, 1, -3);
    }
  }

  /**
   * Updates the hover state and triggers callbacks.
   * Defensive: only calls callbacks if defined.
   */
  private _updateHover(hover: boolean) {
    if (this._hover === hover) return;
    this._hover = hover;
    this._updateGraphics();
    if (hover) {
      if (typeof this.onOver === 'function') this.onOver(this._position);
    } else {
      if (typeof this.onOut === 'function') this.onOut(this._position);
    }
  }

  /**
   * Checks if a point is inside the given polygon.
   * @param point The point to check.
   * @param vs The polygon vertices.
   */
  private _pointInside(point: [number, number], vs: [number, number][]) {
    if (!Array.isArray(vs) || vs.length < 3) return false;
    return isPointInside(point, vs);
  }
}

const points = {
  p1: { x: 0, y: 16 },
  p2: { x: 32, y: 0 },
  p3: { x: 64, y: 16 },
  p4: { x: 32, y: 32 },
};

function drawBorder(
  graphics: ShroomGraphics,
  color: number,
  alpha = 1,
  offsetY: number
) {
  graphics.beginFill(color, alpha);
  graphics.moveTo(points.p1.x, points.p1.y + offsetY);
  graphics.lineTo(points.p2.x, points.p2.y + offsetY);
  graphics.lineTo(points.p3.x, points.p3.y + offsetY);
  graphics.lineTo(points.p4.x, points.p4.y + offsetY);
  graphics.endFill();

  graphics.beginHole();
  graphics.moveTo(points.p1.x + 6, points.p1.y + offsetY);
  graphics.lineTo(points.p2.x, points.p2.y + 3 + offsetY);
  graphics.lineTo(points.p3.x - 6, points.p3.y + offsetY);
  graphics.lineTo(points.p4.x, points.p4.y - 3 + offsetY);
  graphics.endHole();
}
