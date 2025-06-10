import { HitTexture } from "../../../hitdetection/HitTexture";
import { IAvatarEffectData } from "./IAvatarEffectData";
import { IAvatarManifestData } from "./IAvatarManifestData";
import { IManifestLibrary } from "./IManifestLibrary";

/**
 * Interface for an avatar effect bundle, which provides access to effect data, textures, and manifest information.
 * Extends {@link IManifestLibrary}.
 */
export interface IAvatarEffectBundle extends IManifestLibrary {
  /**
   * Returns the effect data for this bundle.
   */
  getData(): Promise<IAvatarEffectData>;
  /**
   * Returns a texture for the given asset name.
   * @param name The asset name.
   */
  getTexture(name: string): Promise<HitTexture>;
  /**
   * Returns the manifest data for this bundle.
   */
  getManifest(): Promise<IAvatarManifestData>;
}
