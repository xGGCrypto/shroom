/**
 * Interface for accessing avatar part sets data, including active part sets and part info.
 */
export interface IAvatarPartSetsData {
  /**
   * Returns the set of active part set types for a given part set ID.
   * @param id The part set identifier.
   */
  getActivePartSet(id: string): Set<string>;
  /**
   * Returns info about a part set, such as removed or flipped set types, if present.
   * @param id The part set identifier.
   */
  getPartInfo(
    id: string
  ): { removeSetType?: string; flippedSetType?: string } | undefined;
}
