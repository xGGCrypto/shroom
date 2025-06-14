import { AnimationData, FramesData, parseAnimations } from "./parseAnimations";
import { parseColors } from "./parseColors";
import { parseDirections } from "./parseDirections";
import { Layer, parseLayers } from "./parseLayers";
import { VisualizationXml } from "./VisualizationXml";

/**
 * Represents a parsed visualization, including layers, directions, colors, and animations.
 * @category FurnitureVisualization
 */
export type Visualization = {
  /** List of valid directions for this visualization. */
  directions: number[];
  /** Number of layers in the visualization. */
  layerCount: number;
  /** Gets the color value for a given color id and layer. */
  getColor: (colorId: string, layer: string) => string | undefined;
  /** Gets the parsed layer data for a given layer id. */
  getLayer: (layerId: string) => Layer | undefined;
  /** Gets the animation frame data for a given animation and layer. */
  getAnimation: (
    animationId: string,
    layerId: string
  ) => FramesData | undefined;
  /** Gets the frame count for a given animation. */
  getFrameCount: (animationId: string) => number | undefined;
  /** Gets the direction layer override for a given direction and layer. */
  getDirectionLayerOverride: (
    direction: number,
    layerId: string
  ) => Layer | undefined;
  /** Gets all animation data objects. */
  getAnimationDatas(): { id: string; data: AnimationData }[];
};

/**
 * Parses a VisualizationXml object into a Visualization structure, including all layers, colors, directions, and animations.
 * @param xml The XML visualization object
 * @returns The parsed Visualization object
 * @throws If no visualization of size 64 is found
 * @category FurnitureVisualization
 */
export function parseVisualization(xml: VisualizationXml): Visualization {
  const visualizations =
    xml["visualizationData"]["graphics"][0]["visualization"];

  let parsedValidDirections: number[] = [];

  for (let i = 0; i < visualizations.length; i++) {
    const visualization = visualizations[i];
    if (visualization["$"]["size"] == "64") {
      const layerMap = new Map<string, Layer>();
      const colorMap = new Map<string, Map<string, string>>();
      const animationMap = new Map<string, AnimationData>();
      const directionMap = new Map<number, Map<string, Layer>>();

      const { validDirections } = parseDirections(
        visualization,
        (direction, layerMap) => directionMap.set(direction, layerMap)
      );
      parsedValidDirections = validDirections;

      parseAnimations(visualization, (id, data) => animationMap.set(id, data));
      parseColors(visualization, (id, colorLayersMap) =>
        colorMap.set(id, colorLayersMap)
      );
      parseLayers(visualization, (id, layer) => layerMap.set(id, layer));

      return {
        layerCount: Number(visualization["$"]["layerCount"]),
        getColor: (colorId, layer) => colorMap?.get(colorId)?.get(layer),
        getAnimation: (animationId, layerId) => {
          const frameInfo = animationMap
            .get(animationId)
            ?.layerToFrames?.get(layerId);
          return frameInfo;
        },
        getFrameCount: (animationId) =>
          animationMap.get(animationId)?.frameCount,
        getLayer: (layerId) => layerMap.get(layerId),
        getDirectionLayerOverride: (direction, layerId) =>
          directionMap.get(direction)?.get(layerId),
        getAnimationDatas: () =>
          Array.from(animationMap).map(([animationId, data]) => ({
            id: animationId,
            data,
          })),
        directions: parsedValidDirections,
      };
    }
  }
  throw new Error("No visualization found for size 64");
}
