/**
 * Interface for accessing avatar manifest data, which provides asset and alias information for a manifest.
 */
export interface IAvatarManifestData {
  /**
   * Returns all asset entries in the manifest.
   */
  getAssets(): ManifestAsset[];
  /**
   * Returns all alias entries in the manifest.
   */
  getAliases(): ManifestAlias[];
  /**
   * Returns a specific asset entry by name, if present.
   * @param name The asset name.
   */
  getAssetByName(name: string): ManifestAsset | undefined;
}

/**
 * Represents a single asset entry in an avatar manifest.
 */
export interface ManifestAsset {
  /** The asset name. */
  name: string;
  /** The X offset for the asset. */
  x: number;
  /** The Y offset for the asset. */
  y: number;
  /** Whether the asset is flipped horizontally. */
  flipH: boolean;
  /** Whether the asset is flipped vertically. */
  flipV: boolean;
}

/**
 * Represents an alias entry in an avatar manifest.
 */
export interface ManifestAlias {
  /** The alias name. */
  name: string;
  /** The asset name this alias points to. */
  link: string;
  /** Whether the alias is flipped horizontally. */
  fliph: boolean;
  /** Whether the alias is flipped vertically. */
  flipv: boolean;
}
