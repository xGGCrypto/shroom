import {
  ShroomContainer,
  ShroomGraphics,
  ShroomMatrix,
  ShroomPoint,
  ShroomTexture,
} from "../../../pixi-proxy";

import { getFloorMatrix, getLeftMatrix, getRightMatrix } from "../matrixes";
import { IRoomPart } from "./IRoomPart";
import { RoomPartData } from "./RoomPartData";

interface Props {
  edge?: boolean;
  tileHeight: number;
  color: string;
  texture?: ShroomTexture;
  door?: boolean;
  showBorders: {
    showLeftBorder: boolean;
    showRightBorder: boolean;
  };
}

/**
 * Represents a tile part in the room model visualization.
 * Handles rendering and updating of tile graphics, including borders and textures.
 */
export class Tile extends ShroomContainer implements IRoomPart {
  private _texture: ShroomTexture | undefined;
  private _color: string | undefined;

  private _tileHeight: number;
  private _roomPartData: RoomPartData | undefined;
  private _tilePositions: ShroomPoint = new ShroomPoint(0, 0);
  private _showBorders: {
    showLeftBorder: boolean;
    showRightBorder: boolean;
  } = { showLeftBorder: true, showRightBorder: true };

  /**
   * Gets the color of the tile.
   */
  get color() {
    return this._color;
  }

  /**
   * Sets the color of the tile and updates the sprites.
   */
  set color(value) {
    this._color = value;
    this._updateSprites();
  }

  /**
   * Gets the tile positions (for advanced use).
   */
  public get tilePositions() {
    return this._tilePositions;
  }

  /**
   * Sets the tile positions and updates the sprites.
   */
  public set tilePositions(value) {
    this._tilePositions = value;
    this._updateSprites();
  }

  /**
   * Gets the tile height.
   */
  public get tileHeight() {
    return this._tileHeight;
  }

  /**
   * Sets the tile height and updates the sprites.
   */
  public set tileHeight(value) {
    this._tileHeight = value;
    this._updateSprites();
  }

  /**
   * Creates a new Tile.
   * @param props The tile properties (height, color, texture, borders, etc).
   */
  constructor(private props: Props) {
    super();

    this._texture = props.texture;
    this._color = props.color;
    this._tileHeight = props.tileHeight;
    this._showBorders = props.showBorders;

    this._updateSprites();
  }

  /**
   * Updates the tile with new room part data.
   * @param data The new room part data.
   */
  update(data: RoomPartData): void {
    this.tileHeight = data.tileHeight;
    this._roomPartData = data;
    this._texture = data.tileTexture;
    this._updateSprites();
  }

  /**
   * Updates the tile's sprites based on the current state and properties.
   * Defensive: checks for required data before rendering.
   */
  private _updateSprites() {
    if (this._tileHeight == null || this._color == null) {
      // Defensive: do not render if required properties are missing
      return;
    }
    this.removeChildren();
    const tileMatrix = getFloorMatrix(0, 0);

    const top = new ShroomGraphics()
      .beginTextureFill({
        texture: this._texture ?? ShroomTexture.WHITE,
        color: this._roomPartData?.tileTopColor ?? 0,
        matrix: new ShroomMatrix(1, 0.5, 1, -0.5, 0, 0),
      })
      .moveTo(0, 0)
      .lineTo(32, -16)
      .lineTo(64, 0)
      .lineTo(32, 16)
      .lineTo(0, 0)
      .endFill();

    top.position.set(tileMatrix.tx, tileMatrix.ty);
    this.addChild(top);

    if (this._showBorders.showLeftBorder) {
      const borderLeftMatrix = getLeftMatrix(0, 0, {
        width: 32,
        height: this.tileHeight,
      });

      const left: ShroomGraphics = new ShroomGraphics()
        .beginTextureFill({
          texture: this._texture ?? ShroomTexture.WHITE,
          color: this._roomPartData?.tileLeftColor ?? 0,
          matrix: borderLeftMatrix,
        })
        .moveTo(0, 0)
        .lineTo(0, this.tileHeight)
        .lineTo(32, 16 + this.tileHeight)
        .lineTo(32, 16)
        .endFill();
      left.position.set(0, 16);
      this.addChild(left);
    }

    if (this._showBorders.showRightBorder) {
      const borderRightMatrix = getRightMatrix(0, 0, {
        width: 32,
        height: this.tileHeight,
      });
      const right: ShroomGraphics = new ShroomGraphics()
        .beginTextureFill({
          texture: this._texture ?? ShroomTexture.WHITE,
          color: this._roomPartData?.tileRightColor ?? 0,
          matrix: borderRightMatrix,
        })
        .moveTo(32, 16)
        .lineTo(32, 16 + this.tileHeight)
        .lineTo(64, this.tileHeight)
        .lineTo(64, 0)
        .lineTo(32, 16)
        .endFill();

      right.position.set(0, 16);
      this.addChild(right);
    }
  }
}
