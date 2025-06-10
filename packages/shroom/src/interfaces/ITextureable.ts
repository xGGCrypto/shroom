import { ShroomTexture } from "../pixi-proxy";
/**
 * Interface for objects that can have a texture and color applied.
 */
export interface ITexturable {
  /** The texture to apply. */
  texture: ShroomTexture | undefined;
  /** The color to apply. */
  color: string | undefined;
}
