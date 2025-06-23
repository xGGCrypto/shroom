import { ShroomBaseTexture, ShroomSpritesheet } from "../../pixi-proxy";

import { IAssetBundle } from "../../assets/IAssetBundle";
import { loadImageFromBlob } from "../../util/loadImageFromBlob";
import { loadImageFromUrl } from "../../util/loadImageFromUrl";
import { HitTexture } from "../hitdetection/HitTexture";
import { FurnitureJson } from "./data/FurnitureJson";
import { IFurnitureAssetsData } from "./data/interfaces/IFurnitureAssetsData";
import { IFurnitureIndexData } from "./data/interfaces/IFurnitureIndexData";
import { IFurnitureVisualizationData } from "./data/interfaces/IFurnitureVisualizationData";
import { JsonFurnitureAssetsData } from "./data/JsonFurnitureAssetsData";
import { JsonFurnitureVisualizationData } from "./data/JsonFurnitureVisualizationData";
import { IFurnitureAssetBundle } from "./IFurnitureAssetBundle";

/**
 * JsonFurnitureAssetBundle loads and provides access to furniture assets, visualization data, and textures from a modern JSON-based asset bundle.
 * It implements the IFurnitureAssetBundle interface and is used by the furniture loader system for modern (non-XML) furniture formats.
 *
 * @category Furniture
 */
export class JsonFurnitureAssetBundle implements IFurnitureAssetBundle {
  /**
   * Internal promise resolving to all loaded data (assets, visualization, index, spritesheet).
   */
  private _data: Promise<{
    assets: IFurnitureAssetsData;
    visualization: IFurnitureVisualizationData;
    index: IFurnitureIndexData;
    spritesheet: ShroomSpritesheet;
  }>;

  /**
   * Constructs a new JsonFurnitureAssetBundle.
   * @param _assetBundle The underlying asset bundle containing the JSON and spritesheet files.
   */
  constructor(private _assetBundle: IAssetBundle) {
    this._data = this._load();
  }

  /**
   * Retrieves the assets data for the furniture item.
   * @returns A promise resolving to the assets data.
   * @throws If loading or parsing the assets data fails.
   */
  async getAssets(): Promise<IFurnitureAssetsData> {
    const { assets } = await this._data;
    return assets;
  }

  /**
   * Retrieves the visualization data for the furniture item.
   * @returns A promise resolving to the visualization data.
   * @throws If loading or parsing the visualization data fails.
   */
  async getVisualization(): Promise<IFurnitureVisualizationData> {
    const { visualization } = await this._data;
    return visualization;
  }

  /**
   * Retrieves a texture by name for the furniture item.
   * @param name The name of the texture to retrieve.
   * @returns A promise resolving to the hit texture.
   * @throws If the texture cannot be found or loaded.
   */
  async getTexture(name: string): Promise<HitTexture> {
    const { spritesheet } = await this._data;
    return HitTexture.fromSpriteSheet(spritesheet, name);
  }

  /**
   * Retrieves the index data for the furniture item.
   * @returns A promise resolving to the index data.
   * @throws If loading or parsing the index data fails.
   */
  async getIndex(): Promise<IFurnitureIndexData> {
    const { index } = await this._data;
    return index;
  }

  /**
   * Loads and parses all required data from the asset bundle (JSON and spritesheet).
   * @returns A promise resolving to the loaded data object.
   * @throws If any file is missing or cannot be parsed.
   */
  private async _load() {
    // Load and parse the main JSON index file
    let json: FurnitureJson;
    try {
      json = JSON.parse(await this._assetBundle.getString("index.json"));
    } catch (e) {
      throw new Error("Failed to load or parse index.json for furniture asset bundle: " + (e instanceof Error ? e.message : String(e)));
    }

    // Load the spritesheet image and create a PIXI base texture
    let blob: Blob;
    try {
      blob = await this._assetBundle.getBlob("spritesheet.png");
    } catch (e) {
      throw new Error("Failed to load spritesheet.png for furniture asset bundle: " + (e instanceof Error ? e.message : String(e)));
    }
    const imageUrl = await loadImageFromBlob(blob);
    const baseTextureImage = await loadImageFromUrl(imageUrl);
    const baseTexture = ShroomBaseTexture.from(baseTextureImage);
    const spritesheet = new ShroomSpritesheet(baseTexture, json.spritesheet);

    // Parse the spritesheet (async)
    await new Promise<void>((resolve) => {
      spritesheet.parse(() => {
        resolve();
      });
    });

    return {
      assets: new JsonFurnitureAssetsData(json.assets),
      visualization: new JsonFurnitureVisualizationData(json.visualization),
      index: json.index,
      spritesheet,
    };
  }
}
