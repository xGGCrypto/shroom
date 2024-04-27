import { IRoomPart } from "../objects/room/parts/IRoomPart";
import { RoomLandscapeMaskSprite } from "../objects/room/RoomLandscapeMaskSprite";
import { ShroomContainer, ShroomSprite } from "../pixi-proxy";
export interface IRoomVisualization {
  container: ShroomContainer;
  behindWallContainer: ShroomContainer;
  landscapeContainer: ShroomContainer;
  floorContainer: ShroomContainer;
  wallContainer: ShroomContainer;

  addPart(part: IRoomPart): PartNode;
  addMask(id: string, element: ShroomSprite): MaskNode;
}

export type MaskNode = {
  sprite: ShroomSprite;
  update: () => void;
  remove: () => void;
};

export type PartNode = {
  remove: () => void;
};

export type RoomVisualizationMeta = {
  masks: Map<string, RoomLandscapeMaskSprite>;
  wallHeight: number;
  wallHeightWithZ: number;
};
