import { FurnitureSprite } from "../FurnitureSprite";
import { IFurnitureVisualizationView } from "../IFurnitureVisualizationView";
import { FurnitureVisualization } from "./FurnitureVisualization";

/**
 * StaticFurnitureVisualization provides a simple, non-animated visualization for furniture objects.
 * Handles direction and animation changes, but does not animate frames.
 *
 * @category FurnitureVisualization
 */
export class StaticFurnitureVisualization extends FurnitureVisualization {
  private _sprites: FurnitureSprite[] = [];
  private _refreshFurniture = false;
  private _currentDirection: number | undefined;
  private _animationId: string | undefined;

  /**
   * Sets the view for this visualization and updates the display.
   * @param view The visualization view
   */
  setView(view: IFurnitureVisualizationView): void {
    super.setView(view);
    this._update();
  }

  /**
   * Updates the direction for rendering.
   * @param direction The new direction
   */
  updateDirection(direction: number): void {
    if (this._currentDirection === direction) return;
    this._currentDirection = direction;
    this._update();
  }

  /**
   * Updates the animation id for rendering.
   * @param animation The new animation id
   */
  updateAnimation(animation: string): void {
    if (this._animationId === animation) return;
    this._animationId = animation;
    this._update();
  }

  /**
   * Updates the frame, refreshing the display if needed.
   */
  updateFrame(): void {
    if (!this.mounted) return;
    if (this._refreshFurniture) {
      this._refreshFurniture = false;
      this._update();
    }
  }

  /**
   * Updates the visualization display.
   */
  update() {
    this._update();
  }

  /**
   * Destroys the visualization and cleans up resources.
   */
  destroy(): void {
    // Do nothing
  }

  /**
   * Internal update logic for display and layers.
   */
  private _update() {
    if (this._currentDirection == null) return;
    this.view.setDisplayAnimation(this._animationId);
    this.view.setDisplayDirection(this._currentDirection);
    this.view.updateDisplay();
    this.view.getLayers().forEach((layer) => layer.setCurrentFrameIndex(0));
  }
}

/**
 * @deprecated Use `StaticFurnitureVisualization` instead.
 */
export const BasicFurnitureVisualization = StaticFurnitureVisualization;
