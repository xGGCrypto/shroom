import { IRoomObject } from "./IRoomObject";
/**
 * Interface for a container that manages room objects.
 */
export interface IRoomObjectContainer {
  /** Adds a room object to the container. */
  addRoomObject(roomObject: IRoomObject): void;
  /** Removes a room object from the container. */
  removeRoomObject(roomObject: IRoomObject): void;
}
