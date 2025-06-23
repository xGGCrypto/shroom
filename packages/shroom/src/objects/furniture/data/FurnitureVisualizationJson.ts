import {
  FurnitureAnimationLayer,
  FurnitureDirectionLayer,
  FurnitureLayer,
} from "./interfaces/IFurnitureVisualizationData";

/**
 * JSON representation of all visualization data for a furniture item, keyed by size.
 */
export interface FurnitureVisualizationJson {
  [size: string]: {
    /** Number of layers for this size. */
    layerCount: number;
    /** Layer data for this size. */
    layers: FurnitureLayersJson;
    /** Direction data for this size. */
    directions: FurnitureDirectionsJson;
    /** Color data for this size. */
    colors: FurnitureColorsJson;
    /** Animation data for this size. */
    animations: FurnitureAnimationsJson;
  };
}

/**
 * JSON representation of all layers for a furniture visualization.
 */
export type FurnitureLayersJson = {
  [id: string]: FurnitureLayer | undefined;
};

/**
 * JSON representation of all directions for a furniture visualization.
 */
export type FurnitureDirectionsJson = {
  [id: string]:
    | {
        layers: {
          [id: string]: FurnitureDirectionLayer | undefined;
        };
      }
    | undefined;
};

/**
 * JSON representation of all colors for a furniture visualization.
 */
export type FurnitureColorsJson = {
  [id: string]:
    | {
        layers: {
          [id: string]: { color: string } | undefined;
        };
      }
    | undefined;
};

/**
 * JSON representation of all animations for a furniture visualization.
 */
export type FurnitureAnimationsJson = {
  [id: string]:
    | {
        layers: {
          [id: string]: FurnitureAnimationLayer | undefined;
        };
        transitionTo?: number;
      }
    | undefined;
};
