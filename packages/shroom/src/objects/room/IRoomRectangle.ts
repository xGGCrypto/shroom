/**
 * Represents an object that exposes a rectangular area in room coordinates.
 * Typically used for bounds, hit areas, or layout regions.
 */
export interface IRoomRectangle {
  /**
   * The rectangle bounds in room coordinates.
   */
  rectangle: Rectangle;
}

/**
 * A simple rectangle structure.
 */
export interface Rectangle {
  /** The X coordinate of the rectangle's top-left corner. */
  x: number;
  /** The Y coordinate of the rectangle's top-left corner. */
  y: number;
  /** The width of the rectangle. */
  width: number;
  /** The height of the rectangle. */
  height: number;
}
