import { IRoomPart } from "../objects/room/parts/IRoomPart";
import { RoomLandscapeMaskSprite } from "../objects/room/RoomLandscapeMaskSprite";
import { ShroomContainer, ShroomSprite } from "../pixi-proxy";

/**
 * Interface for room visualization containers and operations.
 */
export interface IRoomVisualization {
  /** Main container for the room. */
  container: ShroomContainer;
  /** Container for objects behind the wall. */
  behindWallContainer: ShroomContainer;
  /** Container for landscape elements. */
  landscapeContainer: ShroomContainer;
  /** Container for floor elements. */
  floorContainer: ShroomContainer;
  /** Container for wall elements. */
  wallContainer: ShroomContainer;
  /** Adds a room part to the visualization. */
  addPart(part: IRoomPart): PartNode;
  /** Adds a mask sprite to the visualization. */
  addMask(id: string, element: ShroomSprite): MaskNode;
}

/**
 * Represents a mask node in the room visualization.
 */
export type MaskNode = {
  sprite: ShroomSprite;
  update: () => void;
  remove: () => void;
};

/**
 * Represents a part node in the room visualization.
 */
export type PartNode = {
  remove: () => void;
};

/**
 * Metadata for room visualization.
 */
export type RoomVisualizationMeta = {
  masks: Map<string, RoomLandscapeMaskSprite>;
  wallHeight: number;
  wallHeightWithZ: number;
};
