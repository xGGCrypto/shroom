import { FurnitureFetch } from "../../../interfaces/IFurnitureLoader";
import { FurnitureFetchInfo } from "../FurnitureFetchInfo";




/**
 * Returns a FurnitureFetch object for loading furniture by id or type.
 * Throws if both or neither are provided.
 * @param data Furniture fetch info (id or type)
 * @param placementType 'wall' or 'floor'
 * @returns FurnitureFetch object
 * @throws If both or neither of id/type are provided
 * @category Furniture
 */
export function getFurnitureFetch(
  data: FurnitureFetchInfo,
  placementType: "wall" | "floor"
): FurnitureFetch {
  if (data.id != null && data.type != null) {
    throw new Error(
      "Both `id` and `type` specified. Please supply only one of the two."
    );
  }

  if (data.id != null) {
    return { kind: "id", id: data.id, placementType };
  }

  if (data.type != null) {
    return { kind: "type", type: data.type };
  }

  throw new Error("No `id` or `type` provided for the furniture.");
}
