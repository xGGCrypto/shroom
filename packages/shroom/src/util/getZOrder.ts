/**
 * Computes a z-order value for rendering based on x, y, z coordinates.
 * @param x The x coordinate.
 * @param y The y coordinate.
 * @param z The z coordinate.
 * @returns The computed z-order value.
 */
export function getZOrder(x: number, y: number, z: number): number {
  return x * 1000 + y * 1000 + z;
}
