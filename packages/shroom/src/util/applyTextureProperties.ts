import { ShroomScaleModes, ShroomTexture } from "../pixi-proxy";

/**
 * Applies nearest-neighbor scaling to a texture for pixel-perfect rendering.
 * @param texture The texture to modify.
 */
export function applyTextureProperties(texture: ShroomTexture): void {
  if (!texture || !texture.baseTexture) {
    throw new Error("Invalid texture provided to applyTextureProperties");
  }
  texture.baseTexture.scaleMode = ShroomScaleModes.NEAREST;
}
