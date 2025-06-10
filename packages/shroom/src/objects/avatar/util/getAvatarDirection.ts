/**
 * Normalizes and clamps the avatar direction index to the valid range (0-7).
 * If the direction is out of the -8 to 15 range, returns 0.
 * Handles negative and overflow directions by wrapping.
 *
 * @param direction - The direction index (may be out of range).
 * @returns The normalized direction index (0-7).
 */
export function getAvatarDirection(direction: number): number {
  if (direction < -8) {
    return 0;
  }

  if (direction > 15) {
    return 0;
  }

  if (direction < 0) {
    return direction + 8;
  }

  if (direction > 7) {
    return direction - 8;
  }

  return direction;
}
