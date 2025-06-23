import { IFurniture } from "../objects/furniture/IFurniture";
import { furnitureDataTransformers } from "../util/furnitureDataTransformers";
/**
 * Interface for accessing furniture data and metadata.
 */
export interface IFurnitureData {
  /** Gets the revision number for a furniture type. */
  getRevisionForType(type: string): Promise<number | undefined>;
  /** Gets the info for a furniture type. */
  getInfo(type: string): Promise<FurnitureInfo | undefined>;
  /** Gets the type string for a furniture id and placement type. */
  getTypeById(
    id: FurnitureId,
    type: "wall" | "floor"
  ): Promise<string | undefined>;
  /** Gets the info for a furniture instance. */
  getInfoForFurniture(
    furniture: IFurniture
  ): Promise<FurnitureInfo | undefined>;
  /** Gets all furniture infos as [type, info] pairs. */
  getInfos(): Promise<[string, FurnitureInfo][]>;
}

/**
 * Type for furniture id (string or number).
 */
export type FurnitureId = string | number;

/**
 * Type for furniture info, based on data transformers.
 */
export type FurnitureInfo = {
  [key in keyof typeof furnitureDataTransformers]: ReturnType<
    typeof furnitureDataTransformers[key]
  >;
};
