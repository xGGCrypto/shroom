import { FurnitureId } from "../../interfaces/IFurnitureData";

/**
 * Information for fetching a furniture item, by id or type.
 * @category Furniture
 */
export type FurnitureFetchInfo = {
  /** The unique id of the furniture (optional). */
  id?: FurnitureId;
  /** The type string of the furniture (optional). */
  type?: string;
};
