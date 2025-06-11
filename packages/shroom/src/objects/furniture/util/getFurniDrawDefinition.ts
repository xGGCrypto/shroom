







import { FurniDrawDefinition, FurniDrawPart } from "./DrawDefinition";
import {
  IFurnitureVisualizationData,
  FurnitureLayer,
  FurnitureAnimationLayer,
  FurnitureDirectionLayer,
} from "../data/interfaces/IFurnitureVisualizationData";
import {
  FurnitureAsset,
  IFurnitureAssetsData,
} from "../data/interfaces/IFurnitureAssetsData";
import { getCharFromLayerIndex } from ".";

/**
 * Options for generating a furniture draw definition.
 * @category Furniture
 */
export interface FurniDrawDefinitionOptions {
  /** The furniture type string, possibly including color (e.g., "chair*2"). */
  type: string;
  /** The direction to render (e.g., 0, 90, 180, 270). */
  direction: number;
  /** Optional animation identifier. */
  animation?: string;
}

/**
 * Dependencies required to generate a furniture draw definition.
 * @category Furniture
 */
export interface FurniDrawDefinitionDependencies {
  /** Visualization data for the furniture. */
  visualizationData: IFurnitureVisualizationData;
  /** Asset data for the furniture. */
  assetsData: IFurnitureAssetsData;
}

/**
 * Generates a draw definition for a furniture item, including all parts and assets to render.
 * Handles color, direction, animation, and shadow logic.
 *
 * @param options Options for the draw definition (type, direction, animation).
 * @param deps Visualization and asset data dependencies.
 * @returns The draw definition for the furniture item.
 * @throws If required data is missing or invalid.
 * @category Furniture
 */
export function getFurniDrawDefinition(
  { type: typeWithColor, direction, animation }: FurniDrawDefinitionOptions,
  { visualizationData, assetsData }: FurniDrawDefinitionDependencies
): FurniDrawDefinition {
  const typeSplitted = typeWithColor.split("*");
  const type = typeSplitted[0];

  // If color is not set, fallback to the `0` color for the item.
  const color = typeSplitted[1] ?? "0";

  const size = 64;
  const parts: FurniDrawPart[] = [];
  const animationNumber = animation != null ? Number(animation) : undefined;
  const layerCount = visualizationData.getLayerCount(size);

  const getAssetName = (char: string, frame: number) =>
    `${type}_${size}_${char}_${direction}_${frame}`;

  // Add shadow part if available
  const shadow = assetsData.getAsset(getAssetName("sd", 0));

  if (shadow != null) {
    parts.push({
      assets: [shadow],
      frameRepeat: 1,
      shadow: true,
      layer: undefined,
      layerIndex: -1,
    });
  }

  const mask = assetsData.getAsset(`${type}_${size}_${direction}_mask`);

  if (mask != null) {
    parts.push({
      assets: [mask],
      frameRepeat: 1,
      layer: undefined,
      shadow: false,
      mask: true,
      layerIndex: -2,
    });
  }

  for (let layerIndex = 0; layerIndex < layerCount; layerIndex++) {
    const directionLayer = visualizationData.getDirectionLayer(
      size,
      direction,
      layerIndex
    );
    const layer = visualizationData.getLayer(size, layerIndex);
    const char = getCharFromLayerIndex(layerIndex);
    const animationLayer =
      animationNumber != null
        ? visualizationData.getAnimationLayer(size, animationNumber, layerIndex)
        : undefined;

    const colorLayer =
      color != null
        ? visualizationData.getColor(size, Number(color), layerIndex)
        : undefined;

    parts.push(
      getDrawPart({
        layer,
        directionLayer,
        animation: animationLayer,
        assetsData: assetsData,
        color: colorLayer,
        getAssetName: (frame) => getAssetName(char, frame),
        layerIndex,
      })
    );
  }

  return {
    parts,
  };
}

/**
 * Builds a draw part for a single furniture layer, including asset selection and animation handling.
 * @param params All parameters required to build the draw part.
 * @returns The draw part for the given layer.
 * @category Furniture
 */
function getDrawPart({
  layerIndex,
  layer,
  animation,
  directionLayer,
  assetsData,
  color,
  getAssetName,
}: {
  layerIndex: number;
  layer: FurnitureLayer | undefined;
  animation: FurnitureAnimationLayer | undefined;
  directionLayer: FurnitureDirectionLayer | undefined;
  assetsData: IFurnitureAssetsData;
  color?: string;
  getAssetName: (frame: number) => string;
}): FurniDrawPart {
  const z = directionLayer?.z ?? layer?.z ?? 0;
  const x = directionLayer?.x ?? 0;
  const y = directionLayer?.y ?? 0;

  const baseAsset = assetsData.getAsset(getAssetName(0));

  let assets: FurnitureAsset[] | undefined = undefined;
  if (animation != null) {
    const repeat = 1;

    assets = animation.frames
      .flatMap((frameNumber) => new Array<number>(repeat).fill(frameNumber))
      .map(
        (frameNumber): FurnitureAsset => {
          const asset = assetsData.getAsset(getAssetName(frameNumber));

          if (asset == null)
            return { x: 0, y: 0, flipH: false, name: "unknown", valid: true };

          return {
            ...asset,
            x: asset.x + (asset.flipH ? x : -x),
            y: asset.y - y,
          };
        }
      );
  }

  if ((assets == null || assets.length === 0) && baseAsset != null) {
    assets = [baseAsset];
  }

  if (assets == null) {
    assets = [];
  }

  return {
    mask: false,
    shadow: false,
    frameRepeat: animation?.frameRepeat ?? 1,
    layer,
    z,
    tint: color,
    assets,
    loopCount: animation?.loopCount,
    layerIndex,
  };
}
