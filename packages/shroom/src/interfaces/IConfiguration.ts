import { ShroomTexture } from "../pixi-proxy";
/**
 * Interface for configuration options for the room and rendering.
 */
export interface IConfiguration {
  /** Placeholder texture for missing assets. */
  placeholder?: ShroomTexture;
  /** Tile color configuration. */
  tileColor?: { floorColor?: string; leftFade?: number; rightFade?: number };
  /** Duration for avatar movement animations (ms). */
  avatarMovementDuration?: number;
  /** Duration for furniture movement animations (ms). */
  furnitureMovementDuration?: number;
}
