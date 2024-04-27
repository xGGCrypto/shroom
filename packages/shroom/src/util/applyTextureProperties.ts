import { ShroomScaleModes, ShroomTexture } from "../pixi-proxy";

export function applyTextureProperties(texture: ShroomTexture) {
  texture.baseTexture.scaleMode = ShroomScaleModes.NEAREST;
}
