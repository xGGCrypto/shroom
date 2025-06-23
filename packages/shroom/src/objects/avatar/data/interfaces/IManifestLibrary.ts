import { HitTexture } from "../../../hitdetection/HitTexture";
import { IAvatarManifestData } from "./IAvatarManifestData";

/**
 * Interface for accessing a manifest library, which provides manifest data and textures for assets.
 */
export interface IManifestLibrary {
  /**
   * Returns the manifest data for this library.
   */
  getManifest(): Promise<IAvatarManifestData>;
  /**
   * Returns a texture for the given asset name, or undefined if not found.
   * @param name The asset name.
   */
  getTexture(name: string): Promise<HitTexture | undefined>;
}
