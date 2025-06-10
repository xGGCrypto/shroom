import { AvatarAnimationFrame } from "../data/interfaces/IAvatarAnimationData";
import { IAvatarOffsetsData } from "../data/interfaces/IAvatarOffsetsData";
import { AvatarActionInfo } from "../data/interfaces/IAvatarActionsData";
import { DIRECTION_IS_FLIPPED, getFlippedMetaData } from "./getFlippedMetaData";
import { AvatarFigurePartType } from "../enum/AvatarFigurePartType";
import { getAssetFromPartMeta } from "./getAssetFromPartMeta";


/**
 * Retrieves the asset for a given animation frame and part configuration, with optimized logic.
 * @param params - The options describing the frame, part, and animation context.
 * @returns The asset object or undefined if not found.
 */
export function getAssetForFrame(params: {
  animationFrame?: AvatarAnimationFrame;
  actionData: AvatarActionInfo;
  partTypeFlipped?: AvatarFigurePartType;
  partType: AvatarFigurePartType;
  direction: number;
  partId: string;
  offsetsData: IAvatarOffsetsData;
  offsetX?: number;
  offsetY?: number;
}) {
  const {
    animationFrame,
    actionData,
    partTypeFlipped,
    partType,
    direction,
    partId,
    offsetsData,
    offsetX = 0,
    offsetY = 0,
  } = params;

  // Determine asset part definition and frame number efficiently
  let assetPartDefinition = animationFrame?.assetpartdefinition && animationFrame.assetpartdefinition !== ""
    ? animationFrame.assetpartdefinition
    : actionData.assetpartdefinition;
  const frameNumber = animationFrame?.number ?? 0;

  const flippedMeta = getFlippedMetaData({
    assetPartDefinition,
    flippedPartType: partTypeFlipped,
    direction,
    partType,
  });

  // Try both the specific and fallback asset IDs in a single array iteration
  const assetIds = [
    generateAssetName(assetPartDefinition, flippedMeta.partType, partId, flippedMeta.direction, frameNumber),
    generateAssetName("std", flippedMeta.partType, partId, flippedMeta.direction, 0),
  ];

  const avatarFlipped = DIRECTION_IS_FLIPPED[direction];

  for (const assetId of assetIds) {
    const offset = offsetsData.getOffsets(assetId);
    if (!offset) continue;

    let flipH = flippedMeta.flip;
    if (avatarFlipped) flipH = !flipH;

    const asset = getAssetFromPartMeta(
      assetPartDefinition,
      { flipped: flipH, swapped: false, asset: assetId },
      offsetsData,
      { offsetX, offsetY }
    );
    if (asset) return asset;
  }
}


/**
 * Generates the asset name string for a given part and frame.
 * @param assetPartDef - The asset part definition string.
 * @param partType - The part type string.
 * @param partId - The part ID string.
 * @param direction - The direction index.
 * @param frame - The frame index.
 * @returns The generated asset name string.
 */
function generateAssetName(
  assetPartDef: string,
  partType: string,
  partId: string,
  direction: number,
  frame: number
): string {
  return `h_${assetPartDef}_${partType}_${partId}_${direction}_${frame}`;
}
