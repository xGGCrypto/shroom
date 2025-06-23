import { ShroomTexture } from "../../pixi-proxy";

/**
 * Interface for objects that support tile coloring and texturing.
 */
export interface ITileColorable {
  /** Color for the left side of the tile. */
  tileLeftColor: number;
  /** Color for the right side of the tile. */
  tileRightColor: number;
  /** Color for the top of the tile. */
  tileTopColor: number;
  /** Texture for the tile surface. */
  tileTexture: ShroomTexture;
}
