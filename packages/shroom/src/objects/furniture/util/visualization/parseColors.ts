import { VisualizationXmlVisualization } from "./VisualizationXml";

/**
 * Parses color data from a VisualizationXmlVisualization and populates the callback with each color found.
 * @param visualization The XML visualization object
 * @param set Callback to receive each color id and its layer-to-color map
 * @category FurnitureVisualization
 */
export function parseColors(
  visualization: VisualizationXmlVisualization,
  set: (id: string, colorLayersMap: Map<string, string>) => void
): void {
  const colors = visualization.colors && visualization.colors[0].color;
  if (!colors) return;

  for (const color of colors) {
    const id = color["$"]?.id;
    if (!id) continue;
    const colorLayersMap = new Map<string, string>();
    const colorLayers = color.colorLayer;
    for (const layer of colorLayers) {
      const layerId = layer["$"]?.id;
      const colorValue = layer["$"]?.color;
      if (layerId && colorValue) {
        colorLayersMap.set(layerId, colorValue);
      }
    }
    set(id, colorLayersMap);
  }
}
