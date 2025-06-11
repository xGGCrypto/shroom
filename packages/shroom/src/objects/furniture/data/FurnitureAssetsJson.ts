import { FurnitureAsset } from "./interfaces/IFurnitureAssetsData";

/**
 * JSON representation of all furniture assets, mapping asset names to asset data.
 */
export interface FurnitureAssetsJson {
  [key: string]: FurnitureAsset | undefined;
}
