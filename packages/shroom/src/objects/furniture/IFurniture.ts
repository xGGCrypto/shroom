import { FurnitureId } from "../../interfaces/IFurnitureData";
import { FurnitureExtraData } from "./FurnitureExtraData";
import { IFurnitureVisualization } from "./IFurnitureVisualization";
import { IFurnitureEventHandlers } from "./util/IFurnitureEventHandlers";

/**
 * Interface for a furniture object in the room, including position, type, and visualization.
 * Extends event handlers for interaction.
 * @category Furniture
 */
export interface IFurniture extends IFurnitureEventHandlers {
  /** The unique id of the furniture (if available). */
  id: FurnitureId | undefined;
  /** The type string of the furniture (if available). */
  type: string | undefined;
  /** X position in the room. */
  roomX: number;
  /** Y position in the room. */
  roomY: number;
  /** Z position in the room. */
  roomZ: number;
  /** Direction the furniture is facing. */
  direction: number;
  /** Current animation id (if any). */
  animation: string | undefined;
  /** Whether the furniture is highlighted. */
  highlight: boolean | undefined;
  /** Placement type: 'wall' or 'floor'. */
  placementType: "wall" | "floor";
  /** Alpha (opacity) value. */
  alpha: number;
  /** Extra data for the furniture (async). */
  extradata: Promise<FurnitureExtraData>;
  /** Valid directions for the furniture (async). */
  validDirections: Promise<number[]>;
  /** Visualization controller for the furniture. */
  visualization: IFurnitureVisualization;
}

/**
 * Extended furniture interface with a rotate method.
 * @category Furniture
 */
export interface IFurnitureExtended extends IFurniture {
  /** Rotates the furniture asynchronously. */
  rotate: () => Promise<void>;
}

/**
 * Interface for a furniture behavior, which can be attached to a furniture object.
 * @category Furniture
 */
export type IFurnitureBehavior<T extends IFurniture = IFurniture> = {
  /** Sets the parent furniture object for this behavior. */
  setParent(furniture: T): void;
};
