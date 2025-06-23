import { ShroomTexture } from "../pixi-proxy";
import { applyTextureProperties } from "./applyTextureProperties";

/**
 * Loads an image from a URL and returns a ShroomTexture with nearest-neighbor scaling.
 * @param url The image URL.
 * @returns The loaded ShroomTexture.
 */
export async function loadRoomTexture(url: string): Promise<ShroomTexture> {
  if (!url) throw new Error("No URL provided to loadRoomTexture");
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = url;
  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = (err) => reject(new Error("Failed to load image: " + url));
  });
  const texture = ShroomTexture.from(image);
  applyTextureProperties(texture);
  return texture;
}
