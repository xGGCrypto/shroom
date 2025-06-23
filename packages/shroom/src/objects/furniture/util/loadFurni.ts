import { notNullOrUndefined } from "../../../util/notNullOrUndefined";
import { HitTexture } from "../../hitdetection/HitTexture";
import { IFurnitureAssetsData } from "../data/interfaces/IFurnitureAssetsData";
import { IFurnitureIndexData } from "../data/interfaces/IFurnitureIndexData";
import { IFurnitureVisualizationData } from "../data/interfaces/IFurnitureVisualizationData";
import { FurnitureExtraData } from "../FurnitureExtraData";
import { IFurnitureAssetBundle } from "../IFurnitureAssetBundle";
import { FurniDrawDefinition } from "./DrawDefinition";
import { getFurniDrawDefinition } from "./getFurniDrawDefinition";







/**
 * Function type for retrieving a draw definition for a furniture item.
 * @param direction The direction to render
 * @param animation Optional animation id
 * @returns The draw definition for the furniture
 * @category Furniture
 */
export type GetFurniDrawDefinition = (
  direction: number,
  animation?: string
) => FurniDrawDefinition;

/**
 * Function type for hitmap testing of a furniture item.
 * @param x X coordinate
 * @param y Y coordinate
 * @param transform Transform object
 * @returns True if the point is inside the hitmap
 * @category Furniture
 */
export type Hitmap = (
  x: number,
  y: number,
  transform: { x: number; y: number }
) => boolean;

/**
 * Result object returned by loadFurni, containing draw definition, textures, and metadata.
 * @category Furniture
 */
export type LoadFurniResult = {
  /** Returns the draw definition for a given direction/animation. */
  getDrawDefinition: GetFurniDrawDefinition;
  /** Returns the hit texture for a given asset name, if available. */
  getTexture: (name: string) => HitTexture | undefined;
  /** Returns the extra data for the furniture. */
  getExtraData: () => FurnitureExtraData;
  /** List of valid directions for the furniture. */
  directions: number[];
  /** Visualization data for the furniture. */
  visualizationData: IFurnitureVisualizationData;
};

/**
 * Loads all data and assets for a furniture item from a bundle, returning draw and texture helpers.
 * @param typeWithColor The furniture type string (may include color)
 * @param bundle The asset bundle to load from
 * @returns A promise resolving to the loaded furniture result
 * @category Furniture
 */
export async function loadFurni(
  typeWithColor: string,
  bundle: IFurnitureAssetBundle
): Promise<LoadFurniResult> {
  const assetsData = await bundle.getAssets();
  const indexData = await bundle.getIndex();
  const visualizationData = await bundle.getVisualization();
  const validDirections = visualizationData.getDirections(64);
  const sortedDirections = [...validDirections].sort((a, b) => a - b);

  const assetMap = assetsData.getAssets();

  // Loads all textures for the assets in the bundle.
  const loadTextures = async () => {
    const assetsToLoad = Array.from(assetMap).filter(
      (asset) => asset.source == null || asset.source === asset.name
    );

    const loadedTextures = await Promise.all(
      assetsToLoad.map(async (asset) => {
        try {
          const image = await bundle.getTexture(asset.name);

          return [asset.name, image] as const;
        } catch (e) {
          console.warn(`Failed to load furniture asset: ${asset.name}`, e);
          return null;
        }
      })
    );

    return new Map(loadedTextures.filter(notNullOrUndefined));
  };
  const textures = await loadTextures();

  return {
    getDrawDefinition: (direction: number, animation?: string) =>
      getFurniDrawDefinition(
        {
          type: typeWithColor,
          direction,
          animation,
        },
        {
          assetsData,
          visualizationData,
        }
      ),
    getTexture: (name) => {
      const texture = textures.get(name);
      return texture;
    },
    getExtraData: () => {
      return indexData;
    },
    visualizationData,
    directions: sortedDirections,
  };
}
