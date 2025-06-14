import { WallLeft, WallProps } from "./WallLeft";

/**
 * Represents the right wall part in the room model visualization.
 * Inherits from WallLeft and mirrors the wall horizontally.
 */
export class WallRight extends WallLeft {
  /**
   * Creates a new WallRight.
   * @param props The wall properties (border, hit area, callbacks, etc).
   */
  constructor(props: WallProps) {
    super(props);
  }

  /**
   * Updates the right wall's display objects and hit area.
   * Mirrors the wall and swaps colors for correct rendering.
   */
  _update() {
    this._offsets = { x: this._wallWidth, y: 0 };
    this.scale.x = -1;

    const left = this._wallLeftColor;
    this._wallLeftColor = this._wallRightColor;
    this._wallRightColor = left;

    super._update();
  }
}
