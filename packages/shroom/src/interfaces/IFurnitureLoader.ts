import { LoadFurniResult } from "../objects/furniture/util/loadFurni";
import { FurnitureId } from "./IFurnitureData";
/**
 * Interface for loading furniture assets and data.
 */
export interface IFurnitureLoader {
  /** Loads furniture data by type or id. */
  loadFurni(type: FurnitureFetch): Promise<LoadFurniResult>;
}

/**
 * Type describing how to fetch furniture: by id or by type.
 */
export type FurnitureFetch =
  | { kind: "id"; id: FurnitureId; placementType: "wall" | "floor" }
  | { kind: "type"; type: string };
