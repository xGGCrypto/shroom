import {
  ShroomContainer,
  ShroomMatrix,
  ShroomTexture,
  ShroomTilingSprite,
} from "../../../pixi-proxy";

import { IRoomPart } from "./IRoomPart";
import { RoomPartData } from "./RoomPartData";

/**
 * Represents the outer corner wall part in the room model visualization.
 * Handles rendering and updating of the outer wall corner.
 */
export class WallOuterCorner extends ShroomContainer implements IRoomPart {
  private _borderWidth = 0;
  private _wallHeight = 0;
  private _roomZ = 0;
  private _wallTopColor = 0;

  /**
   * Creates a new WallOuterCorner.
   */
  constructor() {
    super();
  }

  /**
   * Gets the Z level of the wall corner (vertical offset in tiles).
   */
  public get roomZ() {
    return this._roomZ;
  }

  /**
   * Sets the Z level of the wall corner and updates the display.
   */
  public set roomZ(value) {
    this._roomZ = value;
    this._update();
  }

  /**
   * Gets the Y position for the wall corner's base (top of the wall in screen space).
   */
  public get wallY() {
    return -this._wallHeight;
  }

  /**
   * Updates the wall corner with new room part data.
   * @param data The new room part data.
   */
  update(data: RoomPartData): void {
    this._borderWidth = data.borderWidth;
    this._wallHeight = data.wallHeight;
    this._wallTopColor = data.wallTopColor;
    this._update();
  }

  /**
   * Creates the top border sprite for the wall corner.
   */
  private _createTopSprite() {
    const border = new ShroomTilingSprite(
      ShroomTexture.WHITE,
      this._borderWidth,
      this._borderWidth
    );
    border.transform.setFromMatrix(new ShroomMatrix(1, 0.5, 1, -0.5));
    border.tint = this._wallTopColor;
    border.x = -this._borderWidth;
    border.y =
      -this._wallHeight +
      this.roomZ * 32 -
      32 / 2 +
      this._borderWidth / 2 +
      (32 - this._borderWidth);
    return border;
  }

  /**
   * Updates the wall corner's display objects.
   * Defensive: ensures children are properly managed.
   */
  private _update() {
    // Defensive: ensure removeChildren and addChild exist
    if (typeof this.removeChildren === 'function') {
      this.removeChildren();
    }
    const top = this._createTopSprite();
    if (top && typeof this.addChild === 'function') {
      this.addChild(top);
    }
  }
}
