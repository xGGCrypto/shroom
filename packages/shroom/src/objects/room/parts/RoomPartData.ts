import { ShroomTexture, ShroomSprite } from "../../../pixi-proxy";
export interface RoomPartData {
  wallHeight: number;
  borderWidth: number;
  tileHeight: number;
  wallLeftColor: number;
  wallRightColor: number;
  wallTopColor: number;
  wallTexture: ShroomTexture;
  tileLeftColor: number;
  tileRightColor: number;
  tileTopColor: number;
  tileTexture: ShroomTexture;
  masks: Map<string, ShroomSprite>;
}
