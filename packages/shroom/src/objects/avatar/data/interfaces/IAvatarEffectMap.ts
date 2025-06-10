/**
 * Interface for accessing avatar effect map data, which maps effect IDs to effect metadata.
 */
export interface IAvatarEffectMap {
  /**
   * Returns effect metadata for a given effect ID, if present.
   * @param id The effect identifier.
   */
  getEffectInfo(id: string): AvatarEffect | undefined;
  /**
   * Returns all available effect metadata entries.
   */
  getEffects(): AvatarEffect[];
}

/**
 * Represents metadata for a single avatar effect.
 */
export interface AvatarEffect {
  /** The unique identifier for the effect. */
  id: string;
  /** The library name or identifier for the effect. */
  lib: string;
  /** The type/category of the effect. */
  type: string;
}
