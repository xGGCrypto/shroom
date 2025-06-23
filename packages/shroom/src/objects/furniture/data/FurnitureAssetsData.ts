import { XmlData } from "../../../data/XmlData";
import { FurnitureAssetsJson } from "./FurnitureAssetsJson";
import {
  FurnitureAsset,
  IFurnitureAssetsData,
} from "./interfaces/IFurnitureAssetsData";

/**
 * Parses and provides access to furniture asset data from XML.
 * Implements IFurnitureAssetsData for asset lookup and conversion to JSON.
 */
export class FurnitureAssetsData
  extends XmlData
  implements IFurnitureAssetsData {
  /**
   * Internal map of asset name to asset data.
   */
  private _assets = new Map<string, FurnitureAsset>();

  /**
   * Constructs a FurnitureAssetsData instance from XML.
   * @param xml - The XML string containing asset data.
   * @throws Error if any asset is missing required attributes or has invalid values.
   */
  constructor(xml: string) {
    super(xml);

    this.querySelectorAll("asset").forEach((element) => {
      const name = element.getAttribute("name");
      const x = Number(element.getAttribute("x"));
      const y = Number(element.getAttribute("y"));
      const source = element.getAttribute("source");
      const flipH = element.getAttribute("flipH") === "1";

      if (name == null) throw new Error("FurnitureAssetsData: Asset missing 'name' attribute");
      if (isNaN(x)) throw new Error(`FurnitureAssetsData: Asset '${name}' has invalid x: ${element.getAttribute("x")}`);
      if (isNaN(y)) throw new Error(`FurnitureAssetsData: Asset '${name}' has invalid y: ${element.getAttribute("y")}`);

      this._assets.set(name, {
        x,
        y,
        source: source ?? undefined,
        flipH,
        name,
        valid: true,
      });
    });
  }

  /**
   * Loads and parses furniture asset data from a URL.
   * @param url - The URL to fetch the XML from.
   * @returns A promise resolving to a FurnitureAssetsData instance.
   */
  static async fromUrl(url: string) {
    const response = await fetch(url);
    const text = await response.text();
    return new FurnitureAssetsData(text);
  }

  /**
   * Converts the asset data to a JSON object.
   * @returns A FurnitureAssetsJson object mapping asset names to asset data.
   */
  toJson(): FurnitureAssetsJson {
    const assets = this.getAssets();
    const assetsObject: { [key: string]: FurnitureAsset } = {};
    assets.forEach((asset) => {
      assetsObject[asset.name] = asset;
    });
    return assetsObject;
  }

  /**
   * Gets a single asset by name.
   * @param name - The asset name.
   * @returns The FurnitureAsset, or undefined if not found.
   */
  getAsset(name: string): FurnitureAsset | undefined {
    return this._assets.get(name);
  }

  /**
   * Gets all assets as an array.
   * @returns An array of all FurnitureAsset objects.
   */
  getAssets(): FurnitureAsset[] {
    return Array.from(this._assets.values());
  }

  /**
   * Checks if an asset exists by name.
   * @param name - The asset name.
   * @returns True if the asset exists, false otherwise.
   */
  hasAsset(name: string): boolean {
    return this._assets.has(name);
  }
}
