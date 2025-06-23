/**
 * Interface for objects that can provide landscape mask levels for a given room coordinate.
 */
export interface ILandscapeContainer {
  /**
   * Returns the mask level for the given room coordinates.
   * @param roomX The X coordinate in room space.
   * @param roomY The Y coordinate in room space.
   * @returns The mask level as a coordinate object.
   */
  getMaskLevel(roomX: number, roomY: number): { roomX: number; roomY: number };
}
