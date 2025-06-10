import { AvatarAction } from "../../enum/AvatarAction";

/**
 * Interface for accessing avatar actions data, including action definitions and hand item mappings.
 */
export interface IAvatarActionsData {
  /**
   * Returns the action info for a given action ID, if present.
   * @param id The action identifier.
   */
  getAction(id: AvatarAction): AvatarActionInfo | undefined;
  /**
   * Returns all available action definitions.
   */
  getActions(): AvatarActionInfo[];
  /**
   * Returns the hand item ID for a given action and parameter, if present.
   * @param actionId The action identifier.
   * @param id The parameter identifier.
   */
  getHandItemId(actionId: string, id: string): number | undefined;
}

/**
 * Represents information about a single avatar action.
 */
export interface AvatarActionInfo {
  /** The action identifier. */
  id: string;
  /** The state string for the action. */
  state: string;
  /** The precedence value for the action. */
  precedence: number;
  /** The geometry type for the action. */
  geometrytype: string;
  /** The active part set for the action, or null if not set. */
  activepartset: string | null;
  /** The asset part definition for the action. */
  assetpartdefinition: string;
  /** List of actions prevented by this action. */
  prevents: string[];
  /** Whether this action is an animation. */
  animation: boolean;
  /** Whether this action is a main action. */
  main: boolean;
  /** Whether this action is the default. */
  isdefault: boolean;
}
