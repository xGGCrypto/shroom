import { IRoomContext } from "../interfaces/IRoomContext";
import { IRoomObject } from "../interfaces/IRoomObject";

/**
 * Abstract base class for all objects that exist within a room context.
 * Handles context assignment, destruction, and provides access to core room services.
 */
export abstract class RoomObject implements IRoomObject {
  private _context: IRoomContext | undefined;
  private _isDestroyed = false;

  /**
   * Assigns this object to a room context. Throws if already assigned.
   * @param room The room context to assign.
   */
  setParent(room: IRoomContext): void {
    if (this._context != null)
      throw new Error("RoomObject already provided with a context.");

    this._isDestroyed = false;
    this._context = room;

    this.registered();
  }

  /**
   * Destroys this object, removing it from its container and cleaning up resources.
   */
  destroy() {
    if (this._isDestroyed) return;

    // Important: set isDestroyed to true so this doesn't infinite loop.
    this._isDestroyed = true;

    this.roomObjectContainer.removeRoomObject(this);

    this._context = undefined;
    this.destroyed();
  }

  /**
   * Returns the current room context, or throws if not assigned.
   */
  protected getRoomContext(): IRoomContext {
    if (this._context == null) throw new Error("Invalid context");

    return this._context;
  }

  /**
   * Called when the object is destroyed. Subclasses must implement cleanup logic.
   */
  abstract destroyed(): void;
  /**
   * Called when the object is registered to a context. Subclasses must implement setup logic.
   */
  abstract registered(): void;

  /**
   * Returns true if the object is currently mounted in a context.
   */
  protected get mounted() {
    return this._context != null;
  }

  /**
   * Shortcut to the room instance from the context.
   */
  protected get room() {
    return this.getRoomContext().room;
  }

  /**
   * Shortcut to the configuration from the context.
   */
  protected get configuration() {
    return this.getRoomContext().configuration;
  }

  /**
   * Shortcut to the furniture loader from the context.
   */
  protected get furnitureLoader() {
    return this.getRoomContext().furnitureLoader;
  }

  /**
   * Shortcut to the animation ticker from the context.
   */
  protected get animationTicker() {
    return this.getRoomContext().animationTicker;
  }

  /**
   * Shortcut to the room visualization from the context.
   */
  protected get roomVisualization() {
    return this.getRoomContext().visualization;
  }

  /**
   * Shortcut to the geometry from the context.
   */
  protected get geometry() {
    return this.getRoomContext().geometry;
  }

  /**
   * Shortcut to the room object container from the context.
   */
  protected get roomObjectContainer() {
    return this.getRoomContext().roomObjectContainer;
  }

  /**
   * Shortcut to the avatar loader from the context.
   */
  protected get avatarLoader() {
    return this.getRoomContext().avatarLoader;
  }

  /**
   * Shortcut to the event manager from the context.
   */
  protected get eventManager() {
    return this.getRoomContext().eventManager;
  }

  /**
   * Shortcut to the tilemap from the context.
   */
  protected get tilemap() {
    return this.getRoomContext().tilemap;
  }

  /**
   * Shortcut to the landscape container from the context.
   */
  protected get landscapeContainer() {
    return this.getRoomContext().landscapeContainer;
  }

  /**
   * Shortcut to the application from the context.
   */
  protected get application() {
    return this.getRoomContext().application;
  }
}
