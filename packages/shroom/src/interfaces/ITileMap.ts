import { ParsedTileType } from "../util/parseTileMap";
/**
 * Interface for a tile map, providing access to tile data.
 */
export interface ITileMap {
  /** Returns the tile at the given room position, or undefined if out of bounds. */
  getTileAtPosition(roomX: number, roomY: number): ParsedTileType | undefined;
  /** Returns the parsed tile types as a 2D array. */
  getParsedTileTypes(): ParsedTileType[][];
}
