/**
 * Interface for accessing avatar figure data, including colors, parts, and hidden layers.
 */
export interface IFigureData {
  /**
   * Returns the color value for a given set type and color ID, if present.
   * @param setType The set type identifier.
   * @param colorId The color identifier.
   */
  getColor(setType: string, colorId: string): string | undefined;
  /**
   * Returns all parts for a given set type and set ID, if present.
   * @param setType The set type identifier.
   * @param id The set identifier.
   */
  getParts(setType: string, id: string): FigureDataPart[] | undefined;
  /**
   * Returns all hidden layers for a given set type and set ID.
   * @param setType The set type identifier.
   * @param id The set identifier.
   */
  getHiddenLayers(setType: string, id: string): string[];
}

/**
 * Represents a part in avatar figure data.
 */
export type FigureDataPart = {
  /** The part identifier. */
  id: string;
  /** Whether the part is colorable. */
  colorable: boolean;
  /** The type of the part. */
  type: string;
  /** The index of the part. */
  index: number;
};
