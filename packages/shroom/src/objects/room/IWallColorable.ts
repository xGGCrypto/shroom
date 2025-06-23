import { ShroomTexture } from "../../pixi-proxy";

/**
 * Interface for objects that support wall coloring and texturing.
 */
export interface IWallColorable {
  /** Color for the left wall. */
  wallLeftColor: number;
  /** Color for the right wall. */
  wallRightColor: number;
  /** Color for the top wall. */
  wallTopColor: number;
  /** Texture for the wall surface. */
  wallTexture: ShroomTexture;
}
