import { IAvatarOffsetsData } from "../data/interfaces/IAvatarOffsetsData";
import { getBasicFlippedMetaData } from "./getFlippedMetaData";
import { getSpriteId } from "../structure/AvatarEffectPart";


/**
 * Retrieves the effect sprite metadata for a given member, direction, and frame.
 * Handles flipped and directionless sprites efficiently.
 *
 * @param member - The sprite member identifier.
 * @param direction - The direction index.
 * @param frame - The frame index.
 * @param offsetsData - The offsets data for the effect.
 * @param hasDirection - Whether the sprite supports multiple directions.
 * @param handleFlipped - Whether to handle flipped directions if offsets are missing.
 * @returns The effect sprite metadata including id, offsets, and flip state.
 */
export function getEffectSprite(
  member: string,
  direction: number,
  frame: number,
  offsetsData: IAvatarOffsetsData,
  hasDirection: boolean,
  handleFlipped: boolean
): { id: string; offsets: any; flip: boolean } {
  // Try the direct direction first
  let id = getSpriteId(member, direction, frame);
  let offsets = offsetsData.getOffsets(id);
  let flip = false;

  // If flipped handling is enabled and no offsets found, try the flipped direction
  if (handleFlipped && !offsets) {
    const flippedMeta = getBasicFlippedMetaData(direction);
    id = getSpriteId(member, flippedMeta.direction, frame);
    offsets = offsetsData.getOffsets(id);
    flip = flippedMeta.flip;
  }

  // If the sprite does not support directions, always use direction 0
  if (!hasDirection) {
    const id0 = getSpriteId(member, 0, frame);
    if (!offsets) {
      offsets = offsetsData.getOffsets(id0);
      id = id0;
    }
  }

  return { id, offsets, flip };
}
