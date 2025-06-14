import { Layer } from "./parseLayers";
import { VisualizationXmlVisualization } from "./VisualizationXml";

/**
 * Parses direction data from a VisualizationXmlVisualization and populates the callback with each direction found.
 * @param visualization The XML visualization object
 * @param set Callback to receive each direction number and its layer map
 * @returns An object containing the list of valid directions
 * @category FurnitureVisualization
 */
export function parseDirections(
  visualization: VisualizationXmlVisualization,
  set: (direction: number, layerMap: Map<string, Layer>) => void
): { validDirections: number[] } {
  const directions = visualization.directions[0].direction;
  const validDirections: number[] = [];
  for (const direction of directions) {
    const layerMap = new Map<string, Layer>();
    const directionNumber = Number(direction["$"]?.id);
    if (isNaN(directionNumber)) continue;
    const directionLayers = direction.layer || [];
    validDirections.push(directionNumber);
    for (const layer of directionLayers) {
      const layerData = layer["$"];
      if (!layerData?.id) continue;
      layerMap.set(layerData.id, {
        zIndex: layerData.z != null ? Number(layerData.z) : undefined,
        tag: undefined,
        ink: undefined,
        alpha: undefined,
        ignoreMouse: undefined,
      });
    }
    set(directionNumber, layerMap);
  }
  return {
    validDirections,
  };
}
