import { AvatarFigurePartType } from "../enum/AvatarFigurePartType";

export const DIRECTION_IS_FLIPPED = [
  false,
  false,
  false,
  false,
  true,
  true,
  true,
  false,
];


/**
 * Determines the flipped metadata for a given avatar part, considering asset part definition, direction, and part type.
 * Returns the correct direction, flip state, and part type for rendering, and whether the part was swapped.
 *
 * @param params - Object containing assetPartDefinition, direction, partType, and optional flippedPartType.
 * @returns An object with direction, flip, partType, and swapped (if swapped part type is used).
 */
export function getFlippedMetaData({
  assetPartDefinition,
  direction,
  partType,
  flippedPartType,
}: {
  assetPartDefinition: string;
  partType: AvatarFigurePartType;
  flippedPartType?: AvatarFigurePartType;
  direction: number;
}): { direction: number; flip: boolean; partType: AvatarFigurePartType; swapped?: boolean } {
  const directionFlipped = DIRECTION_IS_FLIPPED[direction];
  if (!directionFlipped) return { direction, flip: false, partType, swapped: false };

  // Fast path for common flip cases
  if (
    (assetPartDefinition === "wav" && [AvatarFigurePartType.LeftHand, AvatarFigurePartType.LeftSleeve, AvatarFigurePartType.LeftCoatSleeve].includes(partType)) ||
    (assetPartDefinition === "drk" && [AvatarFigurePartType.RightHand, AvatarFigurePartType.RightSleeve, AvatarFigurePartType.RightCoatSleeve].includes(partType)) ||
    (assetPartDefinition === "blw" && partType === AvatarFigurePartType.RightHand) ||
    (assetPartDefinition === "sig" && partType === AvatarFigurePartType.LeftHand) ||
    (assetPartDefinition === "respect" && partType === AvatarFigurePartType.LeftHand) ||
    partType === AvatarFigurePartType.RightHandItem ||
    partType === AvatarFigurePartType.LeftHandItem ||
    partType === AvatarFigurePartType.ChestPrint
  ) {
    return { direction, flip: true, partType, swapped: false };
  }

  // Handle swapped part types
  const overrideDirection = getBasicFlippedMetaData(direction);
  if (flippedPartType != null && flippedPartType !== partType) {
    return {
      direction: overrideDirection.direction,
      flip: false,
      partType: flippedPartType,
      swapped: true,
    };
  }
  return { direction: overrideDirection.direction, flip: false, partType };
}


/**
 * Returns the basic flipped direction and flip state for a given direction.
 * Used for fallback or swapped part rendering.
 *
 * @param direction - The original direction index.
 * @returns An object with the possibly overridden direction and flip state.
 */
export function getBasicFlippedMetaData(direction: number): { direction: number; flip: boolean } {
  if (direction === 4) return { direction: 2, flip: true };
  if (direction === 5) return { direction: 1, flip: true };
  if (direction === 6) return { direction: 0, flip: true };
  return { direction, flip: false };
}


/**
 * Returns the flipped metadata for a part, considering swapped part types.
 * Used for fallback rendering when part types differ.
 *
 * @param direction - The original direction index.
 * @param params - Object with partType and optional flippedPartType.
 * @returns An object with direction, flip state, partType, and swapped flag if swapped.
 */
export function getPartFlippedMetaData(
  direction: number,
  {
    partType,
    flippedPartType,
  }: {
    partType?: AvatarFigurePartType;
    flippedPartType?: AvatarFigurePartType;
  }
): { direction: number; flip: boolean; partType?: AvatarFigurePartType; swapped?: boolean } {
  const overrideDirection = getBasicFlippedMetaData(direction);
  if (flippedPartType != null && flippedPartType !== partType) {
    return {
      direction: overrideDirection.direction,
      flip: false,
      partType: flippedPartType ?? partType,
      swapped: true,
    };
  }
  return { direction: overrideDirection.direction, flip: false, partType };
}
