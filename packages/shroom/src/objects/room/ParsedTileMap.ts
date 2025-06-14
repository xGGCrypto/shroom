import { TileType } from "../../types/TileType";
import { parseTileMap } from "../../util/parseTileMap";

/**
 * Wrapper class for parsed tile map data, providing access to tile types, wall offsets, and largest difference.
 */
export class ParsedTileMap {
  private _data: ReturnType<typeof parseTileMap>;

  /**
   * The largest difference in tile heights or other relevant metric.
   */
  public get largestDiff() {
    return this._data.largestDiff;
  }

  /**
   * The parsed tile types as a 2D array.
   */
  public get parsedTileTypes() {
    return this._data.tilemap;
  }

  /**
   * The wall offsets for the parsed tile map.
   */
  public get wallOffsets() {
    return this._data.wallOffsets;
  }

  /**
   * Creates a new ParsedTileMap from a 2D array of tile types.
   * @param tilemap The 2D array of tile types to parse.
   */
  constructor(private tilemap: TileType[][]) {
    this._data = parseTileMap(tilemap);
  }
}
