import { IFurnitureVisualizationData } from "../data/interfaces/IFurnitureVisualizationData";
import { FurnitureSprite } from "../FurnitureSprite";
import { IFurnitureVisualizationLayer } from "../IFurnitureVisualizationView";
import { FurniDrawDefinition, FurniDrawPart } from "../util/DrawDefinition";
import { FurnitureVisualization } from "./FurnitureVisualization";

type InProgressAnimation = { id: number; frameCount: number };

/**
 * AnimatedFurnitureVisualization provides animation logic for furniture objects with frame-based animations.
 * Handles animation queues, transitions, and frame updates for animated furniture.
 *
 * @category FurnitureVisualization
 */
export class AnimatedFurnitureVisualization extends FurnitureVisualization {
  /** Queue of animations to play, including transitions. */
  private _animationQueue: InProgressAnimation[] = [];
  /** The frame number at which the current animation queue started. */
  private _animationQueueStartFrame: number | undefined;
  /** The number of frames in the current animation. */
  private _animationFrameCount: number | undefined;
  /** The currently active animation id. */
  private _currentAnimationId: number | undefined;
  /** The current draw definition for the furniture. */
  private _furnitureDrawDefintion: FurniDrawDefinition | undefined;
  /** The set of sprites currently in use. */
  private _sprites: Set<FurnitureSprite> = new Set();
  /** Whether to disable animation transitions. */
  private _disableTransitions = false;
  /** The current frame number. */
  private _frame = 0;
  /** Optional override for the animation id. */
  private _overrideAnimation: number | undefined;
  /** Optional modifier function for customizing layers. */
  private _modifier?: (part: IFurnitureVisualizationLayer) => IFurnitureVisualizationLayer;
  /** The current direction for rendering. */
  private _currentDirection: number | undefined;
  /** The target animation id as a string. */
  private _currentTargetAnimationId: string | undefined;
  /** Number of times the animation has changed. */
  private _changeAnimationCount = 0;
  /** Map of layer index to whether the last frame was played. */
  private _lastFramePlayedMap: Map<number, boolean> = new Map();
  /** Whether the furniture needs to be refreshed. */
  private _refreshFurniture = false;

  /**
   * Creates a new AnimatedFurnitureVisualization.
   */
  constructor() {
    super();
    this._refreshFurniture = true;
  }

  /**
   * Gets or sets the current animation id, optionally overridden.
   */
  public get animationId() {
    if (this._overrideAnimation != null) {
      return this._overrideAnimation;
    }
    return this._currentAnimationId;
  }
  public set animationId(value) {
    this._overrideAnimation = value;
    this._refreshFurniture = true;
  }

  /**
   * Gets or sets the modifier function for customizing layers.
   */
  public get modifier() {
    return this._modifier;
  }
  public set modifier(value) {
    this._modifier = value;
    this._updateFurniture();
  }

  /**
   * Sets the current animation, updating the animation queue and transitions.
   * @param newAnimation The new animation id to play
   */
  setCurrentAnimation(newAnimation: number) {
    this._animationQueueStartFrame = undefined;
    // Skip the transitions of the initial animation change.
    this._animationQueue = this._getAnimationList(
      this.view.getVisualizationData(),
      newAnimation
    );
    this._disableTransitions = this._changeAnimationCount === 0;
    this._changeAnimationCount++;
    this._update();
  }

  /**
   * Updates the animation state based on the given animation id.
   * @param animation The animation id as a string
   */
  updateAnimation(animation: string): void {
    this._updateAnimation(this._currentTargetAnimationId, animation);
  }

  /**
   * Updates the direction for rendering.
   * @param direction The new direction
   */
  updateDirection(direction: number): void {
    if (this._currentDirection === direction) return;
    this._currentDirection = direction;
    this._updateFurniture();
  }

  /**
   * Returns true if the last frame was played for the given layer index.
   * @param layerIndex The layer index
   */
  isLastFramePlayedForLayer(layerIndex: number) {
    return this._lastFramePlayedMap.get(layerIndex) ?? false;
  }

  /**
   * Destroys the visualization and cleans up resources.
   */
  destroy(): void {
    // Do nothing
  }

  /**
   * Updates the visualization, refreshing the view and layers.
   */
  update() {
    if (this._currentDirection == null) return;
    this.view.setDisplayDirection(this._currentDirection);
    this.view.updateDisplay();
    this._update();
  }

  /**
   * Updates the animation frame and handles animation queue progression.
   * @param frame The current frame number
   */
  updateFrame(frame: number): void {
    if (this._refreshFurniture) {
      this._refreshFurniture = false;
      this._updateFurniture();
    }

    if (this._animationQueueStartFrame == null) {
      this._animationQueueStartFrame = frame;
    }

    if (this._animationQueue.length > 0) {
      const progress = this._getCurrentProgress(frame);

      let frameCounter = 0;
      let animationId: number | undefined;
      let animationFrameCount: number | undefined;

      for (let i = 0; i < this._animationQueue.length; i++) {
        const animation = this._animationQueue[i];

        frameCounter += animation.frameCount;

        if (progress < frameCounter) {
          animationId = animation.id;
          animationFrameCount = animation.frameCount;
          break;
        }
      }

      if (
        animationId == null ||
        animationFrameCount == null ||
        this._disableTransitions
      ) {
        const animation = this._animationQueue[this._animationQueue.length - 1];
        animationId = animation.id;
        animationFrameCount = animation.frameCount;
      }

      this._setAnimation(animationId);

      this._animationFrameCount = animationFrameCount;
      this._frame = progress;
    }

    this._update(true);
  }

  isAnimated() {
    return true;
  }

  private _getCurrentProgress(frame: number) {
    if (this._animationQueueStartFrame == null) {
      return 0;
    }

    return frame - this._animationQueueStartFrame;
  }

  private _setAnimation(animation: number) {
    if (this._currentAnimationId === animation) return;

    this._currentAnimationId = animation;
    this._updateFurniture();
  }

  private _updateLayers() {
    if (this.modifier != null) {
      const modifier = this.modifier;
      this.view.getLayers().forEach((layer) => modifier(layer));
    }
  }

  private _updateFurniture() {
    if (!this.mounted) return;

    this.view.setDisplayDirection(this._currentDirection ?? 0);
    this.view.setDisplayAnimation(this.animationId?.toString());
    this.view.updateDisplay();

    this._updateLayers();
    this._update();
  }

  private _update(skipLayerUpdate = false) {
    const frameCount = this._animationFrameCount ?? 1;

    this.view.getLayers().forEach((part) => {
      if (this.modifier != null) {
        part = this.modifier(part);
      }

      const frameProgress = this._frame % frameCount;

      let frameIndex = Math.floor(frameProgress / part.frameRepeat);
      const assetCount = part.assetCount - 1;

      if (frameIndex > assetCount) {
        frameIndex = assetCount;
      }

      if (frameProgress === frameCount - 1) {
        this._lastFramePlayedMap.set(part.layerIndex, true);
      } else {
        this._lastFramePlayedMap.set(part.layerIndex, false);
      }

      part.setCurrentFrameIndex(frameIndex);
    });
  }

  private _getAnimationList(
    data: IFurnitureVisualizationData,
    target: number
  ): InProgressAnimation[] {
    const animations: InProgressAnimation[] = [];

    const handleAnimation = (id: number) => {
      const transition = data.getTransitionForAnimation(64, id);

      if (transition != null) {
        handleAnimation(transition.id);
      }

      const animation = data.getAnimation(64, id);
      const frameCount = data.getFrameCount(64, id) ?? 1;

      if (animation != null) {
        animations.push({ id: animation.id, frameCount });
      }
    };

    handleAnimation(target);

    if (animations.length === 0) {
      return [{ id: 0, frameCount: 1 }];
    }

    return animations;
  }

  private _updateAnimation(
    oldAnimation: string | undefined,
    newAnimation: string | undefined
  ) {
    this._currentTargetAnimationId = newAnimation;
    if (newAnimation == null) {
      this.setCurrentAnimation(0);
    } else if (oldAnimation == newAnimation) {
      // Do nothing
    } else if (oldAnimation != newAnimation) {
      this.setCurrentAnimation(Number(newAnimation));
    }
  }
}

const getAssetsCount = (part: FurniDrawPart) => {
  if (part.assets == null) return 1;

  return part.assets.length;
};
