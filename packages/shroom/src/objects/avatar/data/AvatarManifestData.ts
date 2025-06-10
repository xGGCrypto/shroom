import { AvatarData } from "./AvatarData";
import {
  IAvatarManifestData,
  ManifestAlias,
  ManifestAsset,
} from "./interfaces/IAvatarManifestData";
import { getRequiredAttribute, getOptionalAttribute } from "./xmlUtils";

export class AvatarManifestData
  extends AvatarData
  implements IAvatarManifestData {
  private _assets: ManifestAsset[] = [];
  private _assetbyName: Map<string, ManifestAsset> = new Map();

  private _aliases: ManifestAlias[] = [];

  constructor(xml: string) {
    super(xml);
    this._cacheData();
  }

  getAliases(): ManifestAlias[] {
    return this._aliases;
  }

  getAssets(): ManifestAsset[] {
    return this._assets;
  }

  getAssetByName(name: string): ManifestAsset | undefined {
    return this._assetbyName.get(name);
  }

  private _cacheData() {
    const assets = this.querySelectorAll(`assets asset`);
    const aliases = this.querySelectorAll(`aliases alias`);

    for (const asset of assets) {
      const offsetParam = asset.querySelector(`param[key="offset"]`);
      const value = offsetParam ? getRequiredAttribute(offsetParam, "value") : undefined;
      const name = getRequiredAttribute(asset, "name");
      if (value != null) {
        const offsets = value.split(",");
        const x = Number(offsets[0]);
        const y = Number(offsets[1]);
        const assetObj: ManifestAsset = { name, x, y, flipH: false, flipV: false };
        this._assets.push(assetObj);
        this._assetbyName.set(name, assetObj);
      }
    }

    for (const alias of aliases) {
      const name = getRequiredAttribute(alias, "name");
      const link = getRequiredAttribute(alias, "link");
      const fliph = getOptionalAttribute(alias, "fliph") === "1";
      const flipv = getOptionalAttribute(alias, "flipv") === "1";
      const aliasObj: ManifestAlias = {
        name,
        link,
        fliph,
        flipv,
      };
      this._aliases.push(aliasObj);
    }
  }
}
