/**
 * Interface for accessing avatar animation data, including animation frames and frame counts.
 */
export interface IAvatarAnimationData {
  /**
   * Returns all animation frames for a given animation ID and type.
   * @param id The animation identifier.
   * @param type The animation type.
   */
  getAnimationFrames(id: string, type: string): AvatarAnimationFrame[];
  /**
   * Returns the total number of frames for a given animation ID.
   * @param id The animation identifier.
   */
  getAnimationFramesCount(id: string): number;
  /**
   * Returns a specific animation frame for a given animation ID, type, and frame index.
   * @param id The animation identifier.
   * @param type The animation type.
   * @param frame The frame index.
   */
  getAnimationFrame(
    id: string,
    type: string,
    frame: number
  ): AvatarAnimationFrame | undefined;
}

/**
 * Represents a single animation frame in avatar animation data.
 */
export type AvatarAnimationFrame = {
  /** The frame number. */
  number: number;
  /** The asset part definition for this frame. */
  assetpartdefinition: string;
  /** The number of times this frame repeats. */
  repeats: number;
};
