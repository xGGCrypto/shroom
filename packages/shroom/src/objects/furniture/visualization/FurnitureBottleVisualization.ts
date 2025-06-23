import { IFurnitureVisualizationView } from "../IFurnitureVisualizationView";
import { AnimatedFurnitureVisualization } from "./AnimatedFurnitureVisualization";
import { FurnitureVisualization } from "./FurnitureVisualization";

/**
 * FurnitureBottleVisualization provides custom animation logic for bottle furniture objects.
 * Handles rolling and state transitions using an internal animation queue.
 *
 * @category FurnitureVisualization
 */
export class FurnitureBottleVisualization extends FurnitureVisualization {
  private static readonly ANIMATION_ID_OFFSET_SLOW1 = 20;
  private static readonly ANIMATION_ID_OFFSET_SLOW2 = 9;
  private static readonly ANIMATION_ID_ROLL = -1;

  /** Internal animated visualization for handling frame logic. */
  private _base: AnimatedFurnitureVisualization = new AnimatedFurnitureVisualization();
  /** Queue of animation states to play. */
  private _stateQueue: number[] = [];
  /** Whether the bottle is currently rolling. */
  private _running = false;

  /**
   * Returns true if this visualization is animated.
   */
  isAnimated(): boolean {
    return true;
  }

  /**
   * Destroys the visualization and cleans up resources.
   */
  destroy(): void {
    this._base.destroy();
  }

  /**
   * Updates the visualization display.
   */
  update(): void {
    this._base.update();
  }

  /**
   * Sets the view for this visualization and its internal base.
   * @param view The visualization view
   */
  setView(view: IFurnitureVisualizationView) {
    super.setView(view);
    this._base.setView(view);
  }

  /**
   * Updates the animation frame, handling state transitions and rolling logic.
   * @param frame The current frame number
   */
  updateFrame(frame: number): void {
    if (
      this._stateQueue.length > 0 &&
      this._base.isLastFramePlayedForLayer(0)
    ) {
      const nextAnimation = this._stateQueue.shift();
      if (nextAnimation != null) {
        this._base.setCurrentAnimation(nextAnimation);
      }
    }
    this._base.updateFrame(frame);
  }

  /**
   * Updates the direction for rendering.
   * @param direction The new direction
   */
  updateDirection(direction: number): void {
    this._base.updateDirection(direction);
  }

  /**
   * Updates the animation id, handling rolling and state transitions.
   * @param animation The new animation id
   */
  updateAnimation(animation: string): void {
    if (
      animation === FurnitureBottleVisualization.ANIMATION_ID_ROLL.toString()
    ) {
      if (!this._running) {
        this._running = true;
        this._stateQueue.push(FurnitureBottleVisualization.ANIMATION_ID_ROLL);
        return;
      }
    }
    const animationNumber = Number(animation);
    // Animation between 0 and 7 is the final value of the bottle. This directly translates to its direction.
    if (animationNumber >= 0 && animationNumber <= 7) {
      if (this._running) {
        this._running = false;
        this._stateQueue.push(
          FurnitureBottleVisualization.ANIMATION_ID_OFFSET_SLOW1
        );
        this._stateQueue.push(
          FurnitureBottleVisualization.ANIMATION_ID_OFFSET_SLOW2 +
            animationNumber
        );
        this._stateQueue.push(animationNumber);
        return;
      }
      this._base.updateAnimation(animation);
    }
  }
}
