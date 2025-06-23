import {
  FurnitureId,
  FurnitureInfo,
  IFurnitureData,
} from "../../interfaces/IFurnitureData";
import { parseStringPromise } from "xml2js";
import { formatFurnitureData } from "../../util/furnitureDataTransformers";
import { IFurniture } from "./IFurniture";

type FurnitureMap = {
  [key: string]: FurnitureInfo | undefined;
};

type IdToTypeMap = {
  [key: string]: string | undefined;
};

/**
 * Furniture data manager for loading, parsing, and querying furniture metadata.
 * Implements IFurnitureData for use throughout the application.
 * @category Furniture
 */
export class FurnitureData implements IFurnitureData {
  private _data: Promise<{
    typeToInfo: FurnitureMap;
    floorIdToType: IdToTypeMap;
    wallIdToType: IdToTypeMap;
  }>;

  /**
   * Constructs a new FurnitureData instance.
   * @param _getFurniData Function returning a promise for the raw furniture data XML string.
   */
  constructor(private _getFurniData: () => Promise<string>) {
    this._data = this._prepareData();
  }

  /**
   * Creates a FurnitureData instance that loads from a resource path.
   * @param resourcePath Path to the furniture data XML file.
   */
  static create(resourcePath = "") {
    return new FurnitureData(async () =>
      fetch(`${resourcePath}/furnidata.xml`).then((response) => response.text())
    );
  }

  /**
   * Gets the revision number for a furniture type, if available.
   * @param type The furniture type string.
   */
  async getRevisionForType(type: string): Promise<number | undefined> {
    const info = await this.getInfo(type);
    return info?.revision;
  }

  /**
   * Gets the info object for a furniture type.
   * @param type The furniture type string.
   */
  async getInfo(type: string): Promise<FurnitureInfo | undefined> {
    const data = await this._data;
    return data.typeToInfo[type];
  }

  /**
   * Gets the type string for a furniture id and placement type.
   * @param id The furniture id.
   * @param placementType 'wall' or 'floor'.
   */
  async getTypeById(
    id: FurnitureId,
    placementType: "wall" | "floor"
  ): Promise<string | undefined> {
    const data = await this._data;
    const type =
      placementType != "floor" ? data.floorIdToType[id] : data.wallIdToType[id];
    if (type == null) return;
    return type;
  }

  /**
   * Gets the info object for a furniture instance (by id or type).
   * @param furniture The furniture instance.
   */
  async getInfoForFurniture(furniture: IFurniture) {
    if (furniture.id != null) {
      const type = await this.getTypeById(
        furniture.id,
        furniture.placementType
      );
      if (type != null) {
        return this.getInfo(type);
      }
    }
    if (furniture.type != null) {
      return this.getInfo(furniture.type);
    }
  }

  /**
   * Gets all furniture info entries as [type, info] pairs.
   */
  async getInfos(): Promise<[string, FurnitureInfo][]> {
    const data = await this._data;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return Object.entries(data.typeToInfo).map(([key, info]) => [key, info!]);
  }

  /**
   * Loads and parses the raw furniture data XML into lookup maps.
   * @internal
   */
  private async _prepareData() {
    const furniDataString = await this._getFurniData();
    const parsed = await parseStringPromise(furniDataString);
    const typeToInfo: FurnitureMap = {};
    const floorIdToType: IdToTypeMap = {};
    const wallIdToType: IdToTypeMap = {};
    const register = (data: any[], furnitureType: "floor" | "wall") => {
      data.forEach((element) => {
        const type = element.$.classname;
        const id = element.$.id;
        typeToInfo[type] = formatFurnitureData(element);
        if (furnitureType === "floor") {
          if (floorIdToType[id] != null)
            throw new Error(`Floor furniture with id ${id} already exists`);
          floorIdToType[id] = type;
        } else if (furnitureType === "wall") {
          if (wallIdToType[id] != null)
            throw new Error(`Wall furniture with id ${id} already exists`);
          wallIdToType[id] = type;
        }
      });
    };
    register(parsed.furnidata.roomitemtypes[0].furnitype, "wall");
    register(parsed.furnidata.wallitemtypes[0].furnitype, "floor");
    return { typeToInfo, floorIdToType, wallIdToType };
  }
}
