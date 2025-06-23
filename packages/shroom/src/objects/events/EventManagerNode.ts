import RBush from "rbush";
import { Subscription } from "rxjs";
import { Rectangle } from "../room/IRoomRectangle";
import { IEventManagerNode } from "./interfaces/IEventManagerNode";
import { IEventTarget } from "./interfaces/IEventTarget";

/**
 * Represents a node in the event system, tracking its rectangle and event target.
 * Handles spatial indexing and rectangle updates for event hit testing.
 */
export class EventManagerNode implements IEventManagerNode {
  private _rectangle: Rectangle | undefined;
  private _subscription: Subscription;

  /**
   * The minimum X coordinate of the node's rectangle.
   * @throws Error if the rectangle is not set.
   */
  public get minX() {
    if (this._rectangle == null) throw new Error("Rectangle wasn't set");

    return this._rectangle.x;
  }

  /**
   * The maximum X coordinate of the node's rectangle.
   * @throws Error if the rectangle is not set.
   */
  public get maxX() {
    if (this._rectangle == null) throw new Error("Rectangle wasn't set");

    return this._rectangle.x + this._rectangle.width;
  }

  /**
   * The minimum Y coordinate of the node's rectangle.
   * @throws Error if the rectangle is not set.
   */
  public get minY() {
    if (this._rectangle == null) throw new Error("Rectangle wasn't set");

    return this._rectangle.y;
  }

  /**
   * The maximum Y coordinate of the node's rectangle.
   * @throws Error if the rectangle is not set.
   */
  public get maxY() {
    if (this._rectangle == null) throw new Error("Rectangle wasn't set");

    return this._rectangle.y + this._rectangle.height;
  }

  /**
   * Creates a new EventManagerNode and subscribes to rectangle updates.
   * @param target - The event target.
   * @param _bush - The RBush instance for spatial indexing.
   */
  constructor(
    public readonly target: IEventTarget,
    private _bush: RBush<EventManagerNode>
  ) {
    let initialRectangle : Rectangle | undefined;
    this._subscription = target.getRectangleObservable().subscribe((value) => {
      // avoid updating for no reason as it lowers FPS in more than half
      if (initialRectangle?.height != value?.height ||
        initialRectangle?.width != value?.width ||
        initialRectangle?.x != value?.x ||
        initialRectangle?.y != value?.y 
        ) {
        this._updateRectangle(value);
      }
      if (!initialRectangle) {
        initialRectangle = value;
      }
    });
  }

  /**
   * Removes this node from the spatial index and unsubscribes from updates.
   */
  destroy(): void {
    if (this._rectangle != null) {
      this._bush.remove(this);
    }
    this._subscription.unsubscribe();
  }

  /**
   * Updates the node's rectangle and spatial index entry.
   * @param rectangle - The new rectangle, or undefined to remove.
   */
  private _updateRectangle(rectangle: Rectangle | undefined): void {
    if (this._rectangle != null) {
      this._bush.remove(this);
    }

    this._rectangle = rectangle;

    if (rectangle != null) {
      this._bush.insert(this);
    }
  }
}
