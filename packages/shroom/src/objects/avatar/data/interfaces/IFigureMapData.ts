/**
 * Interface for accessing avatar figure map data, which maps part IDs and types to libraries.
 */
export interface IFigureMapData {
  /**
   * Returns the library name for a given part ID and type, if present.
   * @param id The part identifier.
   * @param type The part type.
   */
  getLibraryOfPart(id: string, type: string): string | undefined;
  /**
   * Returns all available library names.
   */
  getLibraries(): string[];
}
