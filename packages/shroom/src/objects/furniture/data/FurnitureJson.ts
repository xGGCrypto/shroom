import { FurnitureAssetsJson } from "./FurnitureAssetsJson";
import { FurnitureIndexJson } from "./FurnitureIndexJson";
import { FurnitureVisualizationJson } from "./FurnitureVisualizationJson";

/**
 * JSON representation of a complete furniture item, including visualization, assets, index, and spritesheet.
 */
export interface FurnitureJson {
  /** Visualization data for the furniture. */
  visualization: FurnitureVisualizationJson;
  /** Asset data for the furniture. */
  assets: FurnitureAssetsJson;
  /** Index data for the furniture. */
  index: FurnitureIndexJson;
  /** Spritesheet data for the furniture (format may vary). */
  spritesheet: any;
}
