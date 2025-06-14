/**
 * Calculates the screen position for a given room coordinate and wall offsets.
 * Defensive: checks for valid input.
 *
 * @param roomX The X coordinate in the room.
 * @param roomY The Y coordinate in the room.
 * @param roomZ The Z (height) coordinate in the room.
 * @param wallOffsets The wall offset values (x, y).
 * @returns The screen position as an object with x and y properties.
 */
export function getPosition(
  roomX: number,
  roomY: number,
  roomZ: number,
  wallOffsets: { x: number; y: number }
): { x: number; y: number } {
  if (!wallOffsets || typeof wallOffsets.x !== 'number' || typeof wallOffsets.y !== 'number') {
    throw new Error('Invalid wallOffsets for getPosition');
  }
  const base = 32;
  const xVal = (roomX + wallOffsets.x);
  const yVal = (roomY + wallOffsets.y);
  const xPos = xVal * base - yVal * base;
  const yPos = xVal * (base / 2) + yVal * (base / 2);
  return {
    x: xPos,
    y: yPos - roomZ * 32,
  };
}
