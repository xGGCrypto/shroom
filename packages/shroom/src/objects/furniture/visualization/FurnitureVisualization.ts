import { IFurnitureVisualization } from "../IFurnitureVisualization";
import { IFurnitureVisualizationView } from "../IFurnitureVisualizationView";

/**
 * Abstract base class for all furniture visualizations.
 * Provides view management and common interface for all visualization types.
 *
 * @category FurnitureVisualization
 */
export abstract class FurnitureVisualization
  implements IFurnitureVisualization {
  /** The current visualization view. */
  protected _view: IFurnitureVisualizationView | undefined;
  /** The previous visualization view, if any. */
  protected _previousView: IFurnitureVisualizationView | undefined;

  /**
   * Gets the current view, or throws if not mounted.
   */
  protected get view() {
    if (this._view == null) throw new Error("No view mounted");
    return this._view;
  }

  /**
   * Gets the previous view, if any.
   */
  protected get previousView() {
    return this._previousView;
  }

  /**
   * Returns true if the visualization is currently mounted.
   */
  protected get mounted() {
    return this._view != null;
  }

  /**
   * Sets the view for this visualization.
   * @param view The visualization view
   */
  setView(view: IFurnitureVisualizationView): void {
    this._previousView = this._view;
    this._view = view;
  }

  /**
   * Returns true if this visualization is animated (default: false).
   * @param animation Optional animation id
   */
  isAnimated(animation = "0"): boolean {
    return false;
  }

  /**
   * Updates the visualization display.
   */
  abstract update(): void;
  /**
   * Destroys the visualization and cleans up resources.
   */
  abstract destroy(): void;
  /**
   * Updates the animation frame.
   * @param frame The current frame number
   */
  abstract updateFrame(frame: number): void;
  /**
   * Updates the direction for rendering.
   * @param direction The new direction
   */
  abstract updateDirection(direction: number): void;
  /**
   * Updates the animation id for rendering.
   * @param animation The new animation id
   */
  abstract updateAnimation(animation: string): void;
}
