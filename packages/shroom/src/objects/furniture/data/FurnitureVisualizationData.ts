import { XmlData } from "../../../data/XmlData";
import { notNullOrUndefined } from "../../../util/notNullOrUndefined";
import {
  FurnitureAnimationsJson,
  FurnitureColorsJson,
  FurnitureDirectionsJson,
  FurnitureLayersJson,
  FurnitureVisualizationJson,
} from "./FurnitureVisualizationJson";
import {
  FurnitureAnimationLayer,
  FurnitureDirectionLayer,
  IFurnitureVisualizationData,
  FurnitureLayer,
  FurnitureAnimation,
} from "./interfaces/IFurnitureVisualizationData";

/**
 * Parses and provides access to furniture visualization data from XML.
 * Implements IFurnitureVisualizationData for layer, direction, animation, and color lookup.
 */
/**
 * Parses and provides access to furniture visualization data from XML.
 * Implements IFurnitureVisualizationData for layer, direction, animation, and color lookup.
 *
 * This class is robust to missing or malformed XML, and throws descriptive errors for invalid queries.
 */
export class FurnitureVisualizationData
  extends XmlData
  implements IFurnitureVisualizationData {
  /**
   * Constructs a FurnitureVisualizationData instance from XML.
   * @param xml - The XML string containing visualization data.
   */
  /**
   * Constructs a FurnitureVisualizationData instance from XML.
   * @param xml - The XML string containing visualization data.
   * @throws Error if the XML is malformed or missing required elements.
   */
  constructor(xml: string) {
    super(xml);
  }

  /**
   * Loads and parses furniture visualization data from a URL.
   * @param url - The URL to fetch the XML from.
   * @returns A promise resolving to a FurnitureVisualizationData instance.
   */
  /**
   * Loads and parses furniture visualization data from a URL.
   * @param url - The URL to fetch the XML from.
   * @returns A promise resolving to a FurnitureVisualizationData instance.
   */
  static async fromUrl(url: string) {
    const response = await fetch(url);
    const text = await response.text();
    return new FurnitureVisualizationData(text);
  }

  /**
   * Gets the number of frames in an animation sequence, not counting repeats.
   * @param size - The visualization size.
   * @param animationId - The animation id.
   * @returns The frame count, or undefined if not found.
   */
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
    const frameSequences = this.querySelectorAll(
      `visualization[size="${size}"] animation[id="${animationId}"] frameSequence`
    );

    let count: number | undefined;
    frameSequences.forEach((element) => {
      const value = element.children.length;
      if (count == null || value > count) {
        count = value;
      }
    });
    return count;
  }

  /**
   * Gets the transition animation for a given size and transition target.
   * @param size - The visualization size.
   * @param transitionTo - The target animation id.
   * @returns The transition FurnitureAnimation, or undefined if not found.
   */
  /**
   * Gets the transition animation for a given size and transition target.
   * @param size - The visualization size.
   * @param transitionTo - The target animation id.
   * @returns The transition FurnitureAnimation, or undefined if not found.
   */
  getTransitionForAnimation(
    size: number,
    transitionTo: number
  ): FurnitureAnimation | undefined {
    const animation = this.querySelector(
      `visualization[size="${size}"] animations animation[transitionTo="${transitionTo}"]`
    );
    const animationId = Number(animation?.getAttribute("id") ?? undefined);
    if (isNaN(animationId)) {
      return;
    }
    return {
      id: animationId,
      transitionTo,
    };
  }

  /**
   * Gets the animation definition for a given size and animation id.
   * @param size - The visualization size.
   * @param animationId - The animation id.
   * @returns The FurnitureAnimation, or undefined if not found.
   */
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
    const animation = this.querySelector(
      `visualization[size="${size}"] animations animation[id="${animationId}"]`
    );
    if (animation == null) return;
    const transitionAnimationId = Number(
      animation?.getAttribute("transitionTo") ?? undefined
    );
    return {
      id: animationId,
      transitionTo: isNaN(transitionAnimationId)
        ? undefined
        : transitionAnimationId,
    };
  }

  /**
   * Gets the color value for a given size, color id, and layer id.
   * @param size - The visualization size.
   * @param colorId - The color id.
   * @param layerId - The layer id.
   * @returns The color string, or undefined if not found.
   */
  /**
   * Gets the color value for a given size, color id, and layer id.
   * @param size - The visualization size.
   * @param colorId - The color id.
   * @param layerId - The layer id.
   * @returns The color string, or undefined if not found.
   */
  getColor(size: number, colorId: number, layerId: number): string | undefined {
    const colorElement = this.querySelector(
      `visualization[size="${size}"] colors color[id="${colorId}"] colorLayer[id="${layerId}"]`
    );
    return colorElement?.getAttribute("color") ?? undefined;
  }

  /**
   * Gets the number of frames in an animation sequence, including repeats.
   * @param size - The visualization size.
   * @param animationId - The animation id.
   * @returns The frame count, or undefined if not found.
   */
  getFrameCount(size: number, animationId: number): number | undefined {
    const frameSequences = this.querySelectorAll(
      `visualization[size="${size}"] animation[id="${animationId}"] frameSequence`
    );

    let count: number | undefined;
    frameSequences.forEach((element) => {
      const parent = element.parentElement;
      const multiplier = Number(parent?.getAttribute("frameRepeat") ?? "1");

      const value = element.children.length * multiplier;

      if (count == null || value > count) {
        count = value;
      }
    });

    return count;
  }

  /**
   * Gets all animation IDs for a given size.
   * @param size - The visualization size.
   * @returns An array of animation IDs.
   */
  getAnimationIds(size: number): number[] {
    const animations = this.querySelectorAll(
      `visualization[size="${size}"] animations animation`
    );

    return animations
      .map((element) => element.getAttribute("id"))
      .filter(notNullOrUndefined)
      .map((id) => Number(id));
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
    const animationLayer = this.querySelector(
      `visualization[size="${size}"] animations animation[id="${animationId}"] animationLayer[id="${id}"]`
    );

    if (animationLayer == null) return;
    const frameRepeat = Number(
      animationLayer.getAttribute("frameRepeat") ?? undefined
    );
    const loopCount = Number(
      animationLayer.getAttribute("loopCount") ?? undefined
    );

    const frames = Array.from(
      animationLayer.querySelectorAll(`frameSequence frame`)
    );

    return {
      id: animationId,
      frames: frames.map((element) =>
        Number(element.getAttribute("id") ?? undefined)
      ),
      frameRepeat: isNaN(frameRepeat) ? undefined : frameRepeat,
      loopCount: isNaN(loopCount) ? undefined : loopCount,
    };
  }

  /**
   * Gets all valid direction IDs for a given size.
   * @param size - The visualization size.
   * @returns An array of direction numbers.
   */
  getDirections(size: number): number[] {
    const directions = this.querySelectorAll(
      `visualization[size="${size}"] directions direction`
    );

    return directions.map((element) => {
      const id = element.getAttribute("id") ?? undefined;

      return Number(id);
    });
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
    const directionLayer = this.querySelector(
      `visualization[size="${size}"] directions direction[id="${direction}"] layer[id="${layerId}"]`
    );

    if (directionLayer == null) return;
    const z = this._getNumberFromAttributeValue(
      directionLayer.getAttribute("z")
    );
    const x = this._getNumberFromAttributeValue(
      directionLayer.getAttribute("x")
    );
    const y = this._getNumberFromAttributeValue(
      directionLayer.getAttribute("y")
    );

    return {
      z: z,
      x: x,
      y: y,
    };
  }

  /**
   * Gets the number of layers for a given size.
   * @param size - The visualization size.
   * @returns The number of layers.
   * @throws Error if the visualization for the given size does not exist.
   */
  getLayerCount(size: number): number {
    const visualization = this.querySelector(`visualization[size="${size}"]`);
    if (visualization == null) throw new Error(`FurnitureVisualizationData: No visualization for size ${size}`);
    return Number(visualization.getAttribute("layerCount") ?? undefined);
  }

  /**
   * Gets a specific layer for a given size and layer id.
   * @param size - The visualization size.
   * @param layerId - The layer id.
   * @returns The FurnitureLayer, or undefined if not found.
   */
  getLayer(size: number, layerId: number): FurnitureLayer | undefined {
    const layerElement = this.querySelector(
      `visualization[size="${size}"] layers layer[id="${layerId}"]`
    );

    if (layerElement == null) return;

    const id = layerElement.getAttribute("id") ?? undefined;
    const z = layerElement.getAttribute("z") ?? undefined;
    const tag = layerElement.getAttribute("tag") ?? undefined;
    const alpha = layerElement.getAttribute("alpha") ?? undefined;
    const ink = layerElement.getAttribute("ink") ?? undefined;
    const ignoreMouse = layerElement.getAttribute("ignoreMouse") ?? undefined;

    const idNumber = Number(id);
    const zNumber = Number(z);
    const alphaNumber = Number(alpha);

    if (isNaN(idNumber)) throw new Error("Invalid layer id");

    return {
      id: idNumber,
      z: isNaN(zNumber) ? 0 : zNumber,
      alpha: isNaN(alphaNumber) ? undefined : alphaNumber,
      tag: tag ?? undefined,
      ink: ink ?? undefined,
      ignoreMouse: ignoreMouse != null ? ignoreMouse === "1" : undefined,
    };
  }

  /**
   * Converts the visualization data to a JSON object for a default size (64).
   * @returns A FurnitureVisualizationJson object.
   */
  toJson(): FurnitureVisualizationJson {
    return {
      ...this._getJsonForSize(64),
    };
  }

  /**
   * Helper to convert an array to a map keyed by a string property.
   * @param arr - The array to convert.
   * @param getKey - Function to get the key for each value.
   * @returns An object mapping keys to values.
   * @private
   */
  private _toJsonMap<T>(
    arr: T[],
    getKey: (value: T) => string | null
  ): { [key: string]: T | undefined } {
    const map: any = {};
    arr.forEach((value) => {
      const key = getKey(value);
      if (key != null) {
        map[key] = value;
      }
    });
    return map;
  }

  /**
   * Helper to extract all animation data for a given size as JSON.
   * @param size - The visualization size.
   * @returns A FurnitureAnimationsJson object.
   * @private
   */
  private _getJsonAnimations(size: number): FurnitureAnimationsJson {
    const arr = Array.from(
      this.document.querySelectorAll(
        `visualization[size="${size}"] animations animation`
      )
    )
      .map((element) => {
        const layers = Array.from(element.querySelectorAll(`animationLayer`))
          .map((element): FurnitureAnimationLayer | undefined => {
            const id = this._getNumberFromAttributeValue(
              element.getAttribute("id")
            );

            const frames = Array.from(
              element.querySelectorAll(`frame` as string)
            )
              .map((element) => element.getAttribute("id"))
              .filter(notNullOrUndefined)
              .map((id) => Number(id));

            const frameRepeat = this._getNumberFromAttributeValue(
              element.getAttribute("frameRepeat")
            );
            const loopCount = this._getNumberFromAttributeValue(
              element.getAttribute("loopCount")
            );
            const random =
              this._getNumberFromAttributeValue(
                element.getAttribute("random")
              ) === 1;

            if (id == null) return;

            return {
              id,
              frames,
              frameRepeat,
              loopCount,
              random,
            };
          })
          .filter(notNullOrUndefined);

        const animationId = this._getNumberFromAttributeValue(
          element.getAttribute("id")
        );

        const transitionTo = this._getNumberFromAttributeValue(
          element.getAttribute("transitionTo")
        );

        if (animationId == null) return null;

        return {
          id: animationId,
          layers: this._toJsonMap(layers, (layer) => layer.id.toString()),
          transitionTo,
        };
      })
      .filter(notNullOrUndefined);

    return this._toJsonMap(arr, (element) => element.id.toString());
  }

  /**
   * Helper to extract all color data for a given size as JSON.
   * @param size - The visualization size.
   * @returns A FurnitureColorsJson object.
   * @private
   */
  private _getJsonColors(size: number): FurnitureColorsJson {
    const arr = Array.from(
      this.document.querySelectorAll(
        `visualization[size="${size}"] colors color`
      )
    ).map((element) => {
      const colorId = element.getAttribute("id");
      const colorLayers = Array.from(
        element.querySelectorAll("colorLayer")
      ).map((element) => {
        const layerId = element.getAttribute("id");
        const color = element.getAttribute("color");

        if (color == null) throw new Error("Invalid color");

        return {
          id: layerId,
          color,
        };
      });

      return {
        id: colorId,
        layers: this._toJsonMap(colorLayers, (layer) => layer.id),
      };
    });

    return this._toJsonMap(arr, (value) => value.id);
  }

  /**
   * Helper to extract all direction data for a given size as JSON.
   * @param size - The visualization size.
   * @returns A FurnitureDirectionsJson object.
   * @private
   */
  private _getDirections(size: number): FurnitureDirectionsJson {
    const arr = Array.from(
      this.document.querySelectorAll(
        `visualization[size="${size}"] directions direction`
      )
    ).map((element) => {
      const id = element.getAttribute("id");
      const layers = Array.from(element.querySelectorAll("layer")).map(
        (element) => {
          const id = element.getAttribute("id");
          const x = this._getNumberFromAttributeValue(
            element.getAttribute("x")
          );
          const y = this._getNumberFromAttributeValue(
            element.getAttribute("y")
          );
          const z = this._getNumberFromAttributeValue(
            element.getAttribute("z")
          );

          return {
            id,
            x,
            y,
            z,
          };
        }
      );

      return {
        id,
        layers: this._toJsonMap(layers, (layer) => layer.id),
      };
    });

    return this._toJsonMap(arr, (direction) => direction.id);
  }

  /**
   * Helper to extract all layer data for a given size as JSON.
   * @param size - The visualization size.
   * @returns A FurnitureLayersJson object.
   * @private
   */
  private _getLayers(size: number): FurnitureLayersJson {
    const arr = Array.from(
      this.document.querySelectorAll(
        `visualization[size="${size}"] layers layer`
      )
    ).map(
      (element): FurnitureLayer => {
        const id = this._getNumberFromAttributeValue(
          element.getAttribute("id")
        );
        const ink = element.getAttribute("ink") ?? undefined;
        const alpha = this._getNumberFromAttributeValue(
          element.getAttribute("alpha")
        );
        const z = this._getNumberFromAttributeValue(element.getAttribute("z"));
        const ignoreMouse =
          this._getNumberFromAttributeValue(
            element.getAttribute("ignoreMouse")
          ) === 1;
        const tag = element.getAttribute("tag") ?? undefined;

        if (id == null) throw new Error("Invalid id");

        return {
          id,
          z: z ?? 0,
          alpha,
          ignoreMouse,
          ink,
          tag,
        };
      }
    );

    return this._toJsonMap(arr, (layer) => layer.id.toString());
  }

  /**
   * Helper to extract all visualization data for a given size as JSON.
   * @param size - The visualization size.
   * @returns A FurnitureVisualizationJson object.
   * @private
   */
  private _getJsonForSize(size: number): FurnitureVisualizationJson {
    return {
      [size.toString()]: {
        layerCount: this.getLayerCount(size),
        animations: this._getJsonAnimations(size),
        colors: this._getJsonColors(size),
        directions: this._getDirections(size),
        layers: this._getLayers(size),
      },
    };
  }

  /**
   * Helper to safely parse a number from an attribute value.
   * @param value - The attribute value.
   * @returns The parsed number, or undefined if invalid.
   * @private
   */
  private _getNumberFromAttributeValue(value: string | null): number | undefined {
    if (value == null) return undefined;
    const numberValue = Number(value);
    if (isNaN(numberValue)) return undefined;
    return numberValue;
  }
}
