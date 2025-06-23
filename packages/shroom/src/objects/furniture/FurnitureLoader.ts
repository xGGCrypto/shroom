import { LegacyAssetBundle } from "../../assets/LegacyAssetBundle";
import { ShroomAssetBundle } from "../../assets/ShroomAssetBundle";
import { IFurnitureData } from "../../interfaces/IFurnitureData";
import {
  FurnitureFetch,
  IFurnitureLoader,
} from "../../interfaces/IFurnitureLoader";
import { IFurnitureAssetBundle } from "./IFurnitureAssetBundle";
import { JsonFurnitureAssetBundle } from "./JsonFurnitureAssetBundle";
import { loadFurni, LoadFurniResult } from "./util/loadFurni";
import { XmlFurnitureAssetBundle } from "./XmlFurnitureAssetBundle";

/**
 * FurnitureLoader is responsible for loading and caching furniture assets and data.
 * It supports both legacy XML and modern JSON asset bundles, and provides async loading with optional artificial delay for testing.
 *
 * @category Furniture
 */
export class FurnitureLoader implements IFurnitureLoader {
  /** Cache for loaded furniture, keyed by type string (with color if present). */
  private _furnitureCache: Map<string, Promise<LoadFurniResult>> = new Map();
  /** Optional artificial delay (in ms) for simulating slow loads. */
  private _artificalDelay: number | undefined;
  /** Cache for asset bundles, keyed by type_revision. */
  private _assetBundles: Map<string, Promise<IFurnitureAssetBundle>> = new Map();

  /**
   * @param _options Loader options, including furniture data and asset bundle fetcher.
   */
  constructor(private _options: Options) {}

  /**
   * Gets the artificial delay (in ms) for loading furniture.
   */
  public get delay() {
    return this._artificalDelay;
  }

  /**
   * Sets the artificial delay (in ms) for loading furniture.
   */
  public set delay(value) {
    this._artificalDelay = value;
  }

  /**
   * Creates a FurnitureLoader for legacy XML-based assets.
   * @param furnitureData The furniture data source.
   * @param resourcePath Optional resource path prefix.
   */
  static create(furnitureData: IFurnitureData, resourcePath = "") {
    return new FurnitureLoader({
      furnitureData,
      getAssetBundle: async (type, revision) => {
        const bundle = new LegacyAssetBundle(
          `${resourcePath}/hof_furni/${normalizePath(revision, type)}`
        );
        return new XmlFurnitureAssetBundle(type, bundle);
      },
    });
  }

  /**
   * Creates a FurnitureLoader for JSON-based assets (modern format).
   * @param furnitureData The furniture data source.
   * @param resourcePath Optional resource path prefix.
   */
  static createForJson(furnitureData: IFurnitureData, resourcePath = "") {
    return new FurnitureLoader({
      furnitureData,
      getAssetBundle: async (type, revision) => {
        const bundle = await ShroomAssetBundle.fromUrl(
          `${resourcePath}/hof_furni/${normalizePath(revision, type)}.shroom`
        );
        return new JsonFurnitureAssetBundle(bundle);
      },
    });
  }

  /**
   * Loads a furniture asset and its data, using the provided fetch info.
   * @param fetch The fetch info (by id or type).
   * @returns A promise resolving to the loaded furniture result.
   * @throws If the type cannot be determined or asset loading fails.
   */
  async loadFurni(fetch: FurnitureFetch): Promise<LoadFurniResult> {
    if (this.delay != null) {
      await new Promise((resolve) => setTimeout(resolve, this.delay));
    }

    let typeWithColor: string;

    if (fetch.kind === "id") {
      const type = await this._options.furnitureData.getTypeById(
        fetch.id,
        fetch.placementType
      );
      if (type == null)
        throw new Error("Couldn't determine type for furniture.");

      typeWithColor = type;
    } else {
      typeWithColor = fetch.type;
    }

    const typeSplitted = typeWithColor.split("*");
    const type = typeSplitted[0];

    const revision = await this._options.furnitureData.getRevisionForType(
      typeWithColor
    );

    let furniture = this._furnitureCache.get(typeWithColor);
    if (furniture != null) {
      return furniture;
    }

    furniture = loadFurni(
      typeWithColor,
      await this._getAssetBundle(type, revision)
    );
    this._furnitureCache.set(type, furniture);

    return furniture;
  }

  /**
   * Loads or retrieves an asset bundle for a given type and revision.
   * @param type The furniture type.
   * @param revision The revision number (optional).
   * @returns A promise resolving to the asset bundle.
   */
  private _getAssetBundle(type: string, revision?: number) {
    const key = `${type}_${revision}`;
    const current = this._assetBundles.get(key);
    if (current != null) return current;

    const bundle = this._options.getAssetBundle(type, revision);
    this._assetBundles.set(key, bundle);

    return bundle;
  }
}


/**
 * Options for FurnitureLoader construction.
 * @category Furniture
 */
interface Options {
  /** The furniture data source. */
  furnitureData: IFurnitureData;
  /** Asset bundle fetcher for a given type and revision. */
  getAssetBundle: (
    type: string,
    revision?: number
  ) => Promise<IFurnitureAssetBundle>;
}


/**
 * Normalizes the asset path for a given revision and type.
 * @param revision The revision number (optional).
 * @param type The furniture type.
 * @returns The normalized path string.
 */
const normalizePath = (revision: number | undefined, type: string) => {
  if (revision == null) return type;
  return `${revision}/${type}`;
};
