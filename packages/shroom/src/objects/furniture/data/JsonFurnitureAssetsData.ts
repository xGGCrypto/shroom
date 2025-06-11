import { notNullOrUndefined } from "../../../util/notNullOrUndefined";
import { FurnitureAssetsJson } from "./FurnitureAssetsJson";
import {
  FurnitureAsset,
  IFurnitureAssetsData,
} from "./interfaces/IFurnitureAssetsData";

/**
 * Provides access to furniture asset data from a JSON object.
 * Implements IFurnitureAssetsData for asset lookup.
 */
export class JsonFurnitureAssetsData implements IFurnitureAssetsData {
  /**
   * Constructs a JsonFurnitureAssetsData instance from a FurnitureAssetsJson object.
   * @param _assets - The JSON object containing asset data.
   */
  constructor(private _assets: FurnitureAssetsJson) {}

  /**
   * Gets a single asset by name.
   * @param name - The asset name.
   * @returns The FurnitureAsset, or undefined if not found.
   */
  getAsset(name: string): FurnitureAsset | undefined {
    return this._assets[name];
  }

  /**
   * Gets all assets as an array.
   * @returns An array of all FurnitureAsset objects.
   */
  getAssets(): FurnitureAsset[] {
    return Object.values(this._assets).filter(notNullOrUndefined);
  }
}
