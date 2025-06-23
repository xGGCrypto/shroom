import { createPlaneMatrix } from "./util/createPlaneMatrix";

/**
 * Returns the transformation matrix for a floor tile at the given coordinates.
 * @param x The X coordinate of the tile.
 * @param y The Y coordinate of the tile.
 */
export function getFloorMatrix(x: number, y: number) {
  return createPlaneMatrix(
    {
      c: { x: 0, y: 16 },
      d: { x: 32, y: 0 },
      a: { x: 64, y: 16 },
      b: { x: 32, y: 32 },
    },
    { width: 32, height: 32, x, y }
  );
}

/**
 * Returns the transformation matrix for a left wall at the given coordinates and dimensions.
 * @param x The X coordinate of the wall.
 * @param y The Y coordinate of the wall.
 * @param dim The dimensions of the wall (width, height).
 */
export function getLeftMatrix(
  x: number,
  y: number,
  dim: { width: number; height: number }
) {
  return createPlaneMatrix(
    {
      b: { x: 0, y: 16 },
      c: { x: dim.width, y: 16 + dim.width / 2 },
      d: { x: dim.width, y: 16 + dim.width / 2 + dim.height },
      a: { x: 0, y: 16 + dim.height },
    },
    { width: dim.width, height: dim.height, x, y }
  );
}

/**
 * Returns the transformation matrix for a right wall at the given coordinates and dimensions.
 * @param x The X coordinate of the wall.
 * @param y The Y coordinate of the wall.
 * @param dim The dimensions of the wall (width, height).
 */
export function getRightMatrix(
  x: number,
  y: number,
  dim: { width: number; height: number }
) {
  return createPlaneMatrix(
    {
      b: { x: 32, y: 32 },
      c: { x: 32 + dim.width, y: 32 - dim.width / 2 },
      d: { x: 32 + dim.width, y: 32 + dim.height - dim.width / 2 },
      a: { x: 32, y: 32 + dim.height },
    },
    {
      width: dim.width,
      height: dim.height,
      x: x,
      y: y,
    }
  );
}
