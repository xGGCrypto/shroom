import { IAssetBundle } from "../../assets/IAssetBundle";
import { HitTexture } from "../hitdetection/HitTexture";
import { AvatarEffectData } from "./data/AvatarEffectData";
import { AvatarManifestData } from "./data/AvatarManifestData";
import { IAvatarEffectBundle } from "./data/interfaces/IAvatarEffectBundle";
import { IAvatarEffectData } from "./data/interfaces/IAvatarEffectData";
import { IAvatarManifestData } from "./data/interfaces/IAvatarManifestData";

/**
 * Loads and manages avatar effect data and textures from asset bundles.
 * Uses caching for textures and manifest.
 */
export class AvatarEffectBundle implements IAvatarEffectBundle {
  private _data: Promise<IAvatarEffectData>;
  private _textures: Map<string, Promise<HitTexture>> = new Map();
  private _manifest: Promise<IAvatarManifestData>;

  /**
   * Constructs a new AvatarEffectBundle from an asset bundle.
   * @param _bundle The asset bundle containing effect data and textures.
   */
  constructor(private _bundle: IAssetBundle) {
    this._data = _bundle
      .getString(`animation.bin`)
      .then((xml) => new AvatarEffectData(xml));

    this._manifest = _bundle
      .getString(`manifest.bin`)
      .then((xml) => new AvatarManifestData(xml));
  }

  /**
   * Gets the effect data (animation) for this bundle.
   */
  async getData(): Promise<IAvatarEffectData> {
    return this._data;
  }

  /**
   * Gets a texture by name from the bundle, caching the result.
   * @param name The texture name (without extension).
   */
  async getTexture(name: string): Promise<HitTexture> {
    const current = this._textures.get(name);
    if (current != null) return current;

    const blob = await this._bundle.getBlob(`${name}.png`);

    const texture = HitTexture.fromBlob(blob);
    this._textures.set(name, texture);

    return texture;
  }

  /**
   * Gets the manifest data for this bundle.
   */
  async getManifest(): Promise<IAvatarManifestData> {
    return this._manifest;
  }
}
