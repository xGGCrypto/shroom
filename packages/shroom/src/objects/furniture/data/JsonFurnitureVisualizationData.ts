import { FurnitureVisualizationJson } from "./FurnitureVisualizationJson";
import {
  FurnitureAnimation,
  FurnitureAnimationLayer,
  FurnitureDirectionLayer,
  FurnitureLayer,
  IFurnitureVisualizationData,
} from "./interfaces/IFurnitureVisualizationData";
import { notNullOrUndefined } from "../../../util/notNullOrUndefined";

/**
 * Provides access to furniture visualization data from a JSON object.
 * Implements IFurnitureVisualizationData for layer, direction, animation, and color lookup.
 */
export class JsonFurnitureVisualizationData
  implements IFurnitureVisualizationData {
  /**
   * Constructs a JsonFurnitureVisualizationData instance from a FurnitureVisualizationJson object.
   * @param _furniture - The JSON object containing visualization data.
   */
  constructor(private _furniture: FurnitureVisualizationJson) {}

  /**
   * Gets the number of layers for a given size.
   * @param size - The visualization size.
   * @returns The number of layers.
   */
  getLayerCount(size: number): number {
    return this._getVisualization(size).layerCount;
  }

  /**
   * Gets a specific layer for a given size and layer id.
   * @param size - The visualization size.
   * @param layerId - The layer id.
   * @returns The FurnitureLayer, or undefined if not found.
   */
  getLayer(size: number, layerId: number): FurnitureLayer | undefined {
    return this._getVisualization(size).layers[layerId.toString()];
  }

  /**
   * Gets all valid direction ids for a given size.
   * @param size - The visualization size.
   * @returns An array of direction numbers.
   */
  getDirections(size: number): number[] {
    return Object.keys(
      this._getVisualization(size).directions
    ).map((direction) => Number(direction));
  }

  /**
   * Gets a specific direction layer for a given size, direction, and layer id.
   * @param size - The visualization size.
   * @param direction - The direction id.
   * @param layerId - The layer id.
   * @returns The FurnitureDirectionLayer, or undefined if not found.
   */
  getDirectionLayer(
    size: number,
    direction: number,
    layerId: number
  ): FurnitureDirectionLayer | undefined {
    return this._getVisualization(size).directions[direction.toString()]
      ?.layers[layerId.toString()];
  }

  /**
   * Gets a specific animation layer for a given size, animation id, and layer id.
   * @param size - The visualization size.
   * @param animationId - The animation id.
   * @param id - The layer id.
   * @returns The FurnitureAnimationLayer, or undefined if not found.
   */
  getAnimationLayer(
    size: number,
    animationId: number,
    id: number
  ): FurnitureAnimationLayer | undefined {
    return this._getVisualization(size).animations[animationId.toString()]
      ?.layers[id.toString()];
  }

  /**
   * Gets the number of frames in an animation sequence, not counting repeats.
   * @param size - The visualization size.
   * @param animationId - The animation id.
   * @returns The frame count, or undefined if not found.
   */
  getFrameCountWithoutRepeat(
    size: number,
    animationId: number
  ): number | undefined {
    let count = 1;
    Object.values(
      this._getVisualization(size).animations[animationId.toString()] ?? {}
    ).forEach((layers) => {
      Object.values(layers ?? {}).forEach((layer) => {
        const frameCount = layer?.frames.length ?? 0;
        const value = frameCount;
        if (value > count) {
          count = value;
        }
      });
    });
    return count;
  }

  /**
   * Gets the number of frames in an animation sequence, including repeats.
   * @param size - The visualization size.
   * @param animationId - The animation id.
   * @returns The frame count, or undefined if not found.
   */
  getFrameCount(size: number, animationId: number): number | undefined {
    let count = 1;
    Object.values(
      this._getVisualization(size).animations[animationId.toString()] ?? {}
    ).forEach((layers) => {
      Object.values(layers ?? {}).forEach((layer) => {
        const frameCount = layer?.frames.length ?? 0;
        const multiplier = layer?.frameRepeat ?? 1;
        const value = frameCount * multiplier;
        if (value > count) {
          count = value;
        }
      });
    });
    return count;
  }

  /**
   * Gets the color value for a given size, color id, and layer id.
   * @param size - The visualization size.
   * @param colorId - The color id.
   * @param layerId - The layer id.
   * @returns The color string, or undefined if not found.
   */
  getColor(size: number, colorId: number, layerId: number): string | undefined {
    return this._getVisualization(size).colors[colorId.toString()]?.layers[
      layerId.toString()
    ]?.color;
  }

  /**
   * Gets the animation definition for a given size and animation id.
   * @param size - The visualization size.
   * @param animationId - The animation id.
   * @returns The FurnitureAnimation, or undefined if not found.
   */
  getAnimation(
    size: number,
    animationId: number
  ): FurnitureAnimation | undefined {
    const animation = this._getVisualization(size).animations[
      animationId.toString()
    ];

    if (animation != null) {
      return {
        transitionTo: animation.transitionTo,
        id: animationId,
      };
    }
  }

  getAnimationIds(size: number) {
    const animation = this._getVisualization(size).animations;
    // TODO: Get all animation ids
    return Object.keys(animation)
      .filter(notNullOrUndefined)
      .map((id) => Number(id));
  }

  getTransitionForAnimation(
    size: number,
    transitionTo: number
  ): FurnitureAnimation | undefined {
    const animations = Object.entries(this._getVisualization(size).animations);

    const animationTransitionTo = animations.find(
      ([id, animation]) => animation?.transitionTo === transitionTo
    );

    if (animationTransitionTo != null) {
      const animationId = Number(animationTransitionTo[0]);

      return {
        id: animationId,
        transitionTo,
      };
    }
  }

  private _getVisualization(size: number) {
    const visualization = this._furniture[size.toString()];

    if (visualization == null) {
      throw new Error("Invalid visualization");
    }

    return visualization;
  }
}
