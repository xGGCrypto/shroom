import { IRoomContext } from "../../interfaces/IRoomContext";
import { IRoomObject } from "../../interfaces/IRoomObject";
import { IRoomObjectContainer } from "../../interfaces/IRoomObjectContainer";

/**
 * Container for room objects, managing their lifecycle and context.
 * Implements the IRoomObjectContainer interface.
 */
export class RoomObjectContainer implements IRoomObjectContainer {
  /** Internal set of room objects managed by this container. */
  private _roomObjects: Set<IRoomObject> = new Set();
  /** The context in which the room objects exist. */
  private _context: IRoomContext | undefined;

  /**
   * Returns a readonly set of all room objects in this container.
   */
  public get roomObjects(): ReadonlySet<IRoomObject> {
    return this._roomObjects;
  }

  /**
   * Gets the current context for the room objects.
   */
  public get context() {
    return this._context;
  }

  /**
   * Sets the context for the room objects.
   */
  public set context(value) {
    this._context = value;
  }

  /**
   * Adds a room object to the container and sets its parent context.
   * Throws if the context is not set.
   * @param object The room object to add.
   */
  addRoomObject(object: IRoomObject) {
    if (this._context == null)
      throw new Error("Context wasn't supplied to RoomObjectContainer");

    if (this._roomObjects.has(object)) {
      // The object already exists in this room.
      return;
    }

    object.setParent(this._context);
    this._roomObjects.add(object);
  }

  /**
   * Removes a room object from the container and destroys it.
   * @param object The room object to remove.
   */
  removeRoomObject(object: IRoomObject) {
    if (!this._roomObjects.has(object)) {
      return;
    }

    this._roomObjects.delete(object);
    object.destroy();
  }
}
