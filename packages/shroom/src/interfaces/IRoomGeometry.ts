/**
 * Interface for room geometry calculations.
 */
export interface IRoomGeometry {
  /**
   * Converts room coordinates (roomX, roomY, roomZ) to screen coordinates (x, y).
   */
  getPosition(
    roomX: number,
    roomY: number,
    roomZ: number
  ): { x: number; y: number };
}
