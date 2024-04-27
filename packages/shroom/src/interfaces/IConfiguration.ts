import { ShroomTexture } from "../pixi-proxy";
export interface IConfiguration {
  placeholder?: ShroomTexture;
  tileColor?: { floorColor?: string; leftFade?: number; rightFade?: number };
  avatarMovementDuration?: number;
  furnitureMovementDuration?: number;
}
