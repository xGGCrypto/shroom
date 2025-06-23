import { VisualizationXmlVisualization } from "./VisualizationXml";

/**
 * Represents a parsed layer from the visualization XML.
 * @category FurnitureVisualization
 */
export type Layer = {
  /** Z-index for rendering order. */
  zIndex: number | undefined;
  /** Optional tag for the layer. */
  tag: string | undefined;
  /** Optional ink/blend mode for the layer. */
  ink: string | undefined;
  /** Optional alpha value for the layer. */
  alpha: number | undefined;
  /** Optional ignoreMouse flag for the layer. */
  ignoreMouse: string | undefined;
};

/**
 * Parses layer data from a VisualizationXmlVisualization and populates the callback with each layer found.
 * @param visualization The XML visualization object
 * @param set Callback to receive each layer id and its parsed data
 * @category FurnitureVisualization
 */
export function parseLayers(
  visualization: VisualizationXmlVisualization,
  set: (id: string, layer: Layer) => void
): void {
  if (!visualization.layers) return;
  const layers = visualization.layers[0].layer;
  if (!layers) return;
  for (const layer of layers) {
    const layerData = layer["$"];
    if (!layerData?.id) continue;
    set(layerData.id, {
      zIndex: layerData.z != null ? Number(layerData.z) : 0,
      tag: layerData.tag,
      ink: layerData.ink,
      alpha: layerData.alpha != null ? Number(layerData.alpha) : undefined,
      ignoreMouse: layerData.ignoreMouse,
    });
  }
}
