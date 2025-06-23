import { AvatarActionInfo } from "../data/interfaces/IAvatarActionsData";


/**
 * Determines the draw order type for avatar parts based on active actions and item state.
 * Returns one of: "std", "lh-up", or "rh-up".
 *
 * @param activeActions - The list of active action info objects.
 * @param options - Additional options such as item presence.
 * @returns The draw order type string (e.g., "std", "lh-up", "rh-up").
 */
export function getDrawOrderForActions(
  activeActions: AvatarActionInfo[],
  options: { hasItem: boolean }
): "std" | "lh-up" | "rh-up" {
  // Use a Set to efficiently track all active part sets
  const activePartSets = new Set(
    activeActions
      .map((info) => info.activepartset)
      .filter((set): set is string => set != null)
  );
  if (options.hasItem) activePartSets.add("itemRight");

  if (activePartSets.has("handLeft")) return "lh-up";
  if (activePartSets.has("handRightAndHead") || activePartSets.has("handRight")) return "rh-up";
  return "std";
}
