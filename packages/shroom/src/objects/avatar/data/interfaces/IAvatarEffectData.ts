/**
 * Interface for accessing avatar effect data, including animation frames, body parts, effect parts, and sprite information.
 */
export interface IAvatarEffectData {
  /**
   * Returns the total number of animation frames in the effect.
   */
  getFrameCount(): number;
  /**
   * Returns all body parts for a given frame.
   * @param frame The frame index.
   */
  getFrameBodyParts(frame: number): AvatarEffectFrameBodypart[];
  /**
   * Returns a specific body part for a given body part ID and frame.
   * @param bodyPartId The body part identifier.
   * @param frame The frame index.
   */
  getFrameBodyPart(bodyPartId: string, frame: number): AvatarEffectFrameBodypart | undefined;
  /**
   * Returns a body part by its base for a given body part ID and frame.
   * @param bodyPartId The body part identifier.
   * @param frame The frame index.
   */
  getFrameBodyPartByBase(bodyPartId: string, frame: number): AvatarEffectFrameBodypart | undefined;
  /**
   * Returns all effect parts for a given frame.
   * @param frame The frame index.
   */
  getFrameEffectParts(frame: number): AvatarEffectFrameFXPart[];
  /**
   * Returns a specific effect part for a given ID and frame.
   * @param id The effect part identifier.
   * @param frame The frame index.
   */
  getFrameEffectPart(id: string, frame: number): AvatarEffectFrameFXPart | undefined;
  /**
   * Returns all effect sprites.
   */
  getSprites(): AvatarEffectSprite[];
  /**
   * Returns sprite direction data for a given sprite ID and direction.
   * @param id The sprite identifier.
   * @param direction The direction index.
   */
  getSpriteDirection(id: string, direction: number): AvatarEffectSpriteDirection | undefined;
  /**
   * Returns the effect's direction data, if present.
   */
  getDirection(): AvatarEffectDirection | undefined;
  /**
   * Returns all additional effect FX additions.
   */
  getAddtions(): AvatarEffectFXAddition[];
}

/**
 * Represents an additional FX element in an avatar effect.
 */
export interface AvatarEffectFXAddition {
  /** The unique identifier for the FX addition. */
  id: string;
  /** The alignment of the FX addition, if any. */
  align?: string;
  /** The base value for the FX addition, if any. */
  base?: string;
}

/**
 * Represents a single FX part in an avatar effect frame.
 */
export interface AvatarEffectFrameFXPart {
  /** The unique identifier for the FX part. */
  id: string;
  /** The action associated with this FX part, if any. */
  action?: string;
  /** The frame index for this FX part, if any. */
  frame?: number;
  /** The X offset for this FX part, if any. */
  dx?: number;
  /** The Y offset for this FX part, if any. */
  dy?: number;
  /** The direction delta for this FX part, if any. */
  dd?: number;
}

/**
 * Represents a body part in an avatar effect frame.
 */
export interface AvatarEffectFrameBodypart {
  /** The unique identifier for the body part. */
  id: string;
  /** The action associated with this body part, if any. */
  action?: string;
  /** The frame index for this body part, if any. */
  frame?: number;
  /** The X offset for this body part, if any. */
  dx?: number;
  /** The Y offset for this body part, if any. */
  dy?: number;
  /** The direction delta for this body part, if any. */
  dd?: number;
}

/**
 * Represents a sprite in an avatar effect.
 */
export interface AvatarEffectSprite {
  /** The unique identifier for the sprite. */
  id: string;
  /** The ink value for the sprite, if any. */
  ink?: number;
  /** The member name for the sprite, if any. */
  member?: string;
  /** The static Y offset for the sprite, if any. */
  staticY?: number;
  /** Whether the sprite supports multiple directions. */
  directions: boolean;
}

/**
 * Represents direction data for a sprite in an avatar effect.
 */
export interface AvatarEffectSpriteDirection {
  /** The direction index. */
  id: number;
  /** The Z offset for this direction, if any. */
  dz?: number;
  /** The X offset for this direction, if any. */
  dx?: number;
  /** The Y offset for this direction, if any. */
  dy?: number;
}

/**
 * Represents the direction offset for an avatar effect.
 */
export interface AvatarEffectDirection {
  /** The direction offset value. */
  offset: number;
}
