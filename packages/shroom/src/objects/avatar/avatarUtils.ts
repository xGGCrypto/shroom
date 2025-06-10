// Utility functions for avatar logic
import { AvatarAction } from "./enum/AvatarAction";
import { LookOptions } from "./util/createLookServer";

/**
 * Calculates the combined actions for an avatar based on waving and walking state.
 */
export function getCombinedActions(actions: Set<AvatarAction>, waving: boolean, walking: boolean): Set<AvatarAction> {
  const combined = new Set(actions);
  if (walking) combined.add(AvatarAction.Move);
  if (waving) combined.add(AvatarAction.Wave);
  if (combined.has(AvatarAction.Lay) && walking) combined.delete(AvatarAction.Lay);
  return combined;
}

/**
 * Returns a placeholder look options object.
 */
export function getPlaceholderLookOptions(direction: number): LookOptions {
  return {
    actions: new Set(),
    direction,
    headDirection: direction,
    look: "hd-99999-99999",
    effect: undefined,
    initial: false,
    item: undefined,
  };
}

/**
 * Returns the z-index for an avatar at a given position and look options.
 */
export function getAvatarZIndex(roomX: number, roomY: number, roomZ: number, lookOptions: LookOptions): number {
  // getZOrder must be imported from util/getZOrder in the file that uses this
  let zOffset = 1;
  if (lookOptions.actions.has(AvatarAction.Lay)) {
    zOffset += 2000;
  }
  // getZOrder should be called in the context of the main file
  return zOffset;
}
