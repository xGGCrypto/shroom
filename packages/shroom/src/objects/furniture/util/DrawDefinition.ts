import { FurnitureAsset } from "../data/interfaces/IFurnitureAssetsData";
import { FurnitureLayer } from "../data/interfaces/IFurnitureVisualizationData";

/**
 * Represents the base properties for a furniture draw part.
 * Used for rendering a single layer or part of a furniture item.
 * @category Furniture
 */
export type BaseFurniDrawPart = {
  /** The index of the layer in the visualization. */
  layerIndex: number;
  /** The Z offset for this part, if any. */
  z?: number;
  /** Whether this part is a shadow. */
  shadow: boolean;
  /** How many times to repeat the frame. */
  frameRepeat: number;
  /** The visualization layer definition, if available. */
  layer: FurnitureLayer | undefined;
  /** Optional tint color for this part. */
  tint?: string;
  /** Whether this part is a mask. */
  mask?: boolean;
  /** Number of animation loops, if animated. */
  loopCount?: number;
};

/**
 * Represents a drawable part of a furniture item, including its assets and base properties.
 * @category Furniture
 */
export type FurniDrawPart = {
  /** The assets to use for this part (e.g., images, sprites). */
  assets: FurnitureAsset[];
} & BaseFurniDrawPart;

/**
 * The complete draw definition for a furniture item, including all parts to render.
 * @category Furniture
 */
export interface FurniDrawDefinition {
  /** The list of drawable parts for this furniture item. */
  parts: FurniDrawPart[];
}
