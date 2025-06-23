import { BaseFurniture } from "./BaseFurniture";
import { IFurnitureVisualizationView } from "./IFurnitureVisualizationView";

/**
 * Interface for a furniture visualization controller.
 * Handles updating, animating, and destroying the visualization.
 * @category Furniture
 */
export interface IFurnitureVisualization {
  /**
   * Returns true if the visualization is animated for the given animation id.
   * @param animation Optional animation id
   */
  isAnimated(animation?: string): boolean;
  /**
   * Sets the view for the visualization.
   * @param view The visualization view to use
   */
  setView(view: IFurnitureVisualizationView): void;
  /**
   * Updates the visualization for the given frame.
   * @param frame The frame number
   */
  updateFrame(frame: number): void;
  /**
   * Updates the visualization for the given direction.
   * @param direction The direction value
   */
  updateDirection(direction: number): void;
  /**
   * Updates the visualization for the given animation id.
   * @param animation The animation id (or undefined)
   */
  updateAnimation(animation: string | undefined): void;
  /**
   * Updates the visualization for the given furniture object.
   * @param furniture The furniture object
   */
  update(furniture: BaseFurniture): void;
  /**
   * Destroys the visualization and releases resources.
   */
  destroy(): void;
}
