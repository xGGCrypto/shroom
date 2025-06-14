/**
 * Returns a string mask ID for a given direction and room coordinates.
 * Defensive: returns undefined for unknown directions.
 *
 * @param direction The direction (0, 2, 4, 6).
 * @param roomX The X coordinate in the room.
 * @param roomY The Y coordinate in the room.
 * @returns The mask ID string, or undefined if direction is not recognized.
 */
export function getMaskId(direction: number, roomX: number, roomY: number): string | undefined {
  switch (direction) {
    case 2:
    case 6:
      return `x_${roomX}`;
    case 0:
    case 4:
      return `y_${roomY}`;
    default:
      return undefined;
  }
}
