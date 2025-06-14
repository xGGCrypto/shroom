import { HitTexture } from "../hitdetection/HitTexture";
import { IFurnitureAssetsData } from "./data/interfaces/IFurnitureAssetsData";
import { IFurnitureIndexData } from "./data/interfaces/IFurnitureIndexData";
import { IFurnitureVisualizationData } from "./data/interfaces/IFurnitureVisualizationData";

/**
 * Interface for a bundle of assets related to a furniture item.
 * Provides methods to retrieve assets, visualization, textures, and index data.
 * @category Furniture
 */
export interface IFurnitureAssetBundle {
  /**
   * Retrieves the assets data for the furniture item.
   * @returns A promise resolving to the assets data.
   */
  getAssets(): Promise<IFurnitureAssetsData>;
  /**
   * Retrieves the visualization data for the furniture item.
   * @returns A promise resolving to the visualization data.
   */
  getVisualization(): Promise<IFurnitureVisualizationData>;
  /**
   * Retrieves a texture by name for the furniture item.
   * @param name The name of the texture to retrieve.
   * @returns A promise resolving to the hit texture.
   */
  getTexture(name: string): Promise<HitTexture>;
  /**
   * Retrieves the index data for the furniture item.
   * @returns A promise resolving to the index data.
   */
  getIndex(): Promise<IFurnitureIndexData>;
}
