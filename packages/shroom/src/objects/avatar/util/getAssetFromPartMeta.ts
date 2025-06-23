import { IAvatarOffsetsData } from "../data/interfaces/IAvatarOffsetsData";


/**
 * Retrieves the asset metadata for a given part, applying offsets and flip state.
 * Returns undefined if offsets are not found.
 * Throws if computed offsets are invalid.
 *
 * @param assetPartDefinition - The asset part definition string.
 * @param assetInfoFrame - Object containing flip state, swap state, and asset ID.
 * @param offsetsData - The offsets data source.
 * @param offsetsInput - Object with custom offsetX and offsetY values.
 * @returns The asset metadata object for rendering, or undefined if not found.
 */
export function getAssetFromPartMeta(
  assetPartDefinition: string,
  assetInfoFrame: { flipped: boolean; swapped: boolean; asset: string },
  offsetsData: IAvatarOffsetsData,
  offsetsInput: { offsetX: number; offsetY: number }
) {
  const offsets = offsetsData.getOffsets(assetInfoFrame.asset);
  if (!offsets) return;

  const { x: offsetsX, y: offsetsY } = applyOffsets({
    offsets,
    customOffsets: offsetsInput,
    flipped: assetInfoFrame.flipped,
    lay: assetPartDefinition === "lay",
  });

  if (!Number.isFinite(offsetsX)) throw new Error("Invalid x offset");
  if (!Number.isFinite(offsetsY)) throw new Error("Invalid y offset");

  return {
    fileId: assetInfoFrame.asset,
    library: "",
    mirror: assetInfoFrame.flipped,
    x: offsetsX,
    y: offsetsY,
  };
}


/**
 * Computes the x and y offsets for a part, considering custom offsets, flip state, and lay mode.
 * @param params - Object containing offsets, customOffsets, flipped, and lay.
 * @returns The computed x and y offsets for rendering.
 */
export function applyOffsets({
  offsets,
  customOffsets: { offsetX, offsetY },
  flipped,
  lay,
}: {
  flipped: boolean;
  offsets: { offsetX: number; offsetY: number };
  customOffsets: { offsetX: number; offsetY: number };
  lay: boolean;
}): { x: number; y: number } {
  // Calculate Y offset
  let offsetsY = -offsets.offsetY + offsetY + 16;

  // Calculate X offset
  let offsetsX = flipped
    ? 64 + offsets.offsetX - offsetX
    : -offsets.offsetX - offsetX;

  // Adjust for lay mode
  if (lay) {
    offsetsX += flipped ? -52 : 52;
  }

  return {
    x: offsetsX,
    y: offsetsY,
  };
}
