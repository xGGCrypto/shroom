import { ShroomTexture } from "../pixi-proxy";
import { applyTextureProperties } from "./applyTextureProperties";

export async function loadRoomTexture(url: string): Promise<ShroomTexture> {
  const image = new Image();

  image.crossOrigin = "anonymous";
  image.src = url;

  await new Promise<void>((resolve) => {
    image.onload = () => {
      resolve();
    };
  });

  const texture = ShroomTexture.from(image);
  applyTextureProperties(texture);

  return texture;
}
