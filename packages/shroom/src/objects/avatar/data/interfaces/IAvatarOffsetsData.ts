/**
 * Interface for accessing avatar offsets data, which provides X/Y offsets for asset files.
 */
export interface IAvatarOffsetsData {
  /**
   * Returns the X/Y offsets for a given asset file name, if present.
   * @param fileName The asset file name.
   */
  getOffsets(
    fileName: string
  ): { offsetX: number; offsetY: number } | undefined;
}
