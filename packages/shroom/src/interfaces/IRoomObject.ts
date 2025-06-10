import { IRoomContext } from "./IRoomContext";
/**
 * Interface for a room object that can be added to a room context.
 */
export interface IRoomObject {
  /** Sets the parent room context for this object. */
  setParent(room: IRoomContext): void;
  /** Destroys the room object and releases resources. */
  destroy(): void;
}
