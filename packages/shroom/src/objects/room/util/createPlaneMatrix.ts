import { ShroomMatrix } from "../../../pixi-proxy";

/**
 * Represents four points (a, b, c, d) in 2D space for a plane.
 */
export interface PlanePoints {
  a: { x: number; y: number };
  b: { x: number; y: number };
  c: { x: number; y: number };
  d: { x: number; y: number };
}

/**
 * Creates a transformation matrix for a plane given four points and dimensions.
 * Defensive: checks for invalid input and normalizes values close to width/height.
 *
 * @param points The four points (a, b, c, d) of the plane.
 * @param params Object containing width, height, x, and y for the plane.
 * @returns The transformation matrix for the plane.
 * @throws Error if width or height is zero or points are invalid.
 */
export function createPlaneMatrix(
  points: PlanePoints,
  {
    width,
    height,
    x,
    y,
  }: { width: number; height: number; x: number; y: number }
): ShroomMatrix {
  if (!points || typeof points !== 'object') {
    throw new Error('Invalid points object for createPlaneMatrix');
  }
  if (!width || !height) {
    throw new Error('Width and height must be non-zero for createPlaneMatrix');
  }
  let diffDxCx = points.d.x - points.c.x;
  let diffDyCy = points.d.y - points.c.y;
  let diffBxCx = points.b.x - points.c.x;
  let diffByCy = points.b.y - points.c.y;

  if (Math.abs(diffBxCx - width) <= 1) {
    diffBxCx = width;
  }
  if (Math.abs(diffByCy - width) <= 1) {
    diffByCy = width;
  }
  if (Math.abs(diffDxCx - height) <= 1) {
    diffDxCx = height;
  }
  if (Math.abs(diffDyCy - height) <= 1) {
    diffDyCy = height;
  }

  const a = diffBxCx / width;
  const b = diffByCy / width;
  const c = diffDxCx / height;
  const d = diffDyCy / height;

  const baseX = x + points.c.x;
  const baseY = y + points.c.y;

  return new ShroomMatrix(a, b, c, d, baseX, baseY);
}
