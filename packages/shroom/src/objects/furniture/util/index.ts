
export {
  FurniDrawDefinition as DrawDefinition,
  FurniDrawPart as DrawPart,
} from "./DrawDefinition";
export * from "./visualization/parseVisualization";

/**
 * Returns the character label for a furniture layer index (0 = 'a', 1 = 'b', ...).
 * @param index The layer index (0-based)
 * @returns The character label for the layer
 * @category Furniture
 */
export function getCharFromLayerIndex(index: number): string {
  return String.fromCharCode(97 + index);
}
