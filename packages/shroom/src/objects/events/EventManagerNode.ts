import RBush from "rbush";
import { Subscription } from "rxjs";
import { Rectangle } from "../room/IRoomRectangle";
import { IEventManagerNode } from "./interfaces/IEventManagerNode";
import { IEventTarget } from "./interfaces/IEventTarget";

export class EventManagerNode implements IEventManagerNode {
  private _rectangle: Rectangle | undefined;
  private _subscription: Subscription;

  public get minX() {
    if (this._rectangle == null) throw new Error("Rectangle wasn't set");

    return this._rectangle.x;
  }

  public get maxX() {
    if (this._rectangle == null) throw new Error("Rectangle wasn't set");

    return this._rectangle.x + this._rectangle.width;
  }

  public get minY() {
    if (this._rectangle == null) throw new Error("Rectangle wasn't set");

    return this._rectangle.y;
  }

  public get maxY() {
    if (this._rectangle == null) throw new Error("Rectangle wasn't set");

    return this._rectangle.y + this._rectangle.height;
  }

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

  destroy(): void {
    if (this._rectangle != null) {
      this._bush.remove(this);
    }
    this._subscription.unsubscribe();
  }

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
