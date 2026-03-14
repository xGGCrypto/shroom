import {
  ShroomColor,
  ShroomContainer,
  ShroomMatrix,
  ShroomPoint,
  ShroomTexture,
  ShroomTilingSprite,
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
    if (this._tileHeight == null) {
      return;
    }
    this.removeChildren();

    const createSprite = (
      matrix: ShroomMatrix,
      tint: number,
      width: number,
      height: number
    ) => {
      const sprite = new ShroomTilingSprite(
        this._texture ?? ShroomTexture.WHITE,
        width,
        height
      );
      sprite.tilePosition.set(this._tilePositions.x, this._tilePositions.y);
      sprite.transform.setFromMatrix(matrix);
      sprite.tint = new ShroomColor(tint).toNumber();
      return sprite;
    };

    // Top face
    const top = createSprite(
      getFloorMatrix(0, 0),
      this._roomPartData?.tileTopColor ?? 0xffffff,
      32,
      32
    );
    this.addChild(top as any);

    if (this._showBorders.showLeftBorder) {
      const left = createSprite(
        getLeftMatrix(0, 0, { width: 32, height: this.tileHeight }),
        this._roomPartData?.tileLeftColor ?? 0xcccccc,
        32,
        this.tileHeight
      );
      this.addChild(left as any);
    }

    if (this._showBorders.showRightBorder) {
      const right = createSprite(
        getRightMatrix(0, 0, { width: 32, height: this.tileHeight }),
        this._roomPartData?.tileRightColor ?? 0x999999,
        32,
        this.tileHeight
      );
      this.addChild(right as any);
    }
  }
}
