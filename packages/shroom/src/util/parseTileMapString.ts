import { TileType } from "../types/TileType";

function toTileType(str: string) {
  return str as TileType;
}

/**
 * Parses a tilemap string into a 2D array of TileType.
 * @param str The tilemap string.
 * @returns 2D array of TileType.
 */
export function parseTileMapString(str: string): TileType[][] {
  if (typeof str !== "string") throw new Error("Input must be a string");
  // Thanks @Fusion for this code to sanitize the tilemap string into a readable format.
  str = str.replace(/\r/g, "\n");
  str = str.replace(/ /g, "");
  return str
    .split("\n")
    .map((row) => row.trim())
    .filter((row) => row.length > 0)
    .map((row) => row.split("").map(toTileType));
}
