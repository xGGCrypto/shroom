/**
 * Represents the geometry of an avatar, including dimensions and offsets.
 */
export interface AvatarGeometry {
  /** The geometry identifier. */
  id: string;
  /** The width of the geometry. */
  width: number;
  /** The height of the geometry. */
  height: number;
  /** The X offset. */
  dx: number;
  /** The Y offset. */
  dy: number;
}

/**
 * Represents a body part in avatar geometry, including its Z position and items.
 */
export interface Bodypart {
  /** The body part identifier. */
  id: string;
  /** The Z position of the body part. */
  z: number;
  /** The items associated with this body part. */
  items: BodypartItem[];
}

/**
 * Represents an item within a body part, including its Z position and radius.
 */
export interface BodypartItem {
  /** The item identifier. */
  id: string;
  /** The Z position of the item. */
  z: number;
  /** The radius of the item. */
  radius: number;
}

/**
 * Interface for accessing avatar geometry data, including geometries, body parts, and items.
 */
export interface IAvatarGeometryData {
  /**
   * Returns the geometry data for a given geometry ID, if present.
   * @param geometry The geometry identifier.
   */
  getGeometry(geometry: string): AvatarGeometry | undefined;
  /**
   * Returns all body part IDs for a given avatar set.
   * @param avaterSet The avatar set identifier.
   */
  getBodyParts(avaterSet: string): string[];
  /**
   * Returns the body part data for a given geometry and body part ID, if present.
   * @param geometry The geometry identifier.
   * @param bodyPartId The body part identifier.
   */
  getBodyPart(geometry: string, bodyPartId: string): Bodypart | undefined;
  /**
   * Returns the item data for a given geometry, body part, and item ID, if present.
   * @param geometry The geometry identifier.
   * @param bodyPartId The body part identifier.
   * @param itemId The item identifier.
   */
  getBodyPartItem(
    geometry: string,
    bodyPartId: string,
    itemId: string
  ): BodypartItem | undefined;
}
