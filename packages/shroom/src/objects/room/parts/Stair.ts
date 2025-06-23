import {
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
  tileHeight: number;
  direction: 0 | 2;
  texture?: ShroomTexture;
}

/**
 * Represents a stair part in the room model visualization.
 * Handles rendering and updating of stair graphics for different directions.
 */
export class Stair extends ShroomContainer implements IRoomPart {
  private _texture: ShroomTexture | undefined;

  private _tileHeight = 0;
  private _tileLeftColor = 0;
  private _tileRightColor = 0;
  private _tileTopColor = 0;

  /**
   * Creates a new Stair.
   * @param _props The stair properties (height, direction, texture).
   */
  constructor(private _props: Props) {
    super();

    this._tileHeight = _props.tileHeight;

    this.updateSprites();
  }

  /**
   * Updates the stair with new room part data.
   * @param data The new room part data.
   */
  update(data: RoomPartData): void {
    this._tileHeight = data.tileHeight;
    this._tileLeftColor = data.tileLeftColor;
    this._tileRightColor = data.tileRightColor;
    this._tileTopColor = data.tileTopColor;
    this._texture = data.tileTexture;

    this.updateSprites();
  }

  /**
   * Updates the sprites for the stair based on the current direction and state.
   */
  updateSprites() {
    this.removeChildren();

    const { direction } = this._props;

    for (let i = 0; i < 4; i++) {
      if (direction === 0) {
        this.addChild(...this._createStairBoxDirection0(3 - i));
      } else if (direction === 2) {
        this.addChild(...this._createStairBoxDirection2(3 - i));
      }
    }
  }

  /**
   * Creates the display objects for a stair step in direction 0 (up).
   * @param index The stair step index (0 = closest to viewer).
   * @returns An array of display objects for this stair step.
   */
  _createStairBoxDirection0(index: number) {
    const baseX = +stairBase * index;
    const baseY = -stairBase * index * 1.5;
    const texture = this._texture;

    function createSprite(
      matrix: ShroomMatrix,
      tint: number,
      tilePosition: ShroomPoint
    ) {
      const tile = new ShroomTilingSprite(texture ?? ShroomTexture.WHITE);
      tile.tilePosition = tilePosition;
      tile.transform.setFromMatrix(matrix);

      tile.tint = tint;

      return tile;
    }

    const tile = createSprite(
      getFloorMatrix(baseX, baseY),
      this._tileTopColor,
      new ShroomPoint(0, 0)
    );
    tile.width = 32;
    tile.height = 8;

    const borderLeft = createSprite(
      getLeftMatrix(baseX, baseY, { width: 32, height: this._tileHeight }),
      this._tileLeftColor,
      new ShroomPoint(0, 0)
    );
    borderLeft.width = 32;
    borderLeft.height = this._tileHeight;

    const borderRight = createSprite(
      getRightMatrix(baseX, baseY, { width: 8, height: this._tileHeight }),
      this._tileRightColor,
      new ShroomPoint(0, 0)
    );

    borderRight.width = 8;
    borderRight.height = this._tileHeight;

    return [borderLeft, borderRight, tile];
  }

  /**
   * Creates the display objects for a stair step in direction 2 (left).
   * @param index The stair step index (0 = closest to viewer).
   * @returns An array of display objects for this stair step.
   */
  _createStairBoxDirection2(index: number) {
    const baseX = -stairBase * index;
    const baseY = -stairBase * index * 1.5;
    const texture = this._texture;

    function createSprite(matrix: ShroomMatrix, tint: number) {
      const tile = new ShroomTilingSprite(texture ?? ShroomTexture.WHITE);
      tile.tilePosition = new ShroomPoint(0, 0);
      tile.transform.setFromMatrix(matrix);

      tile.tint = tint;

      return tile;
    }

    const tile = createSprite(
      getFloorMatrix(baseX + 32 - stairBase, baseY + stairBase * 1.5),
      this._tileTopColor
    );
    tile.width = stairBase;
    tile.height = 32;

    const borderLeft = createSprite(
      getLeftMatrix(baseX + 32 - stairBase, baseY + stairBase * 1.5, {
        width: stairBase,
        height: this._tileHeight,
      }),
      this._tileLeftColor
    );
    borderLeft.width = stairBase;
    borderLeft.height = this._tileHeight;

    const borderRight = createSprite(
      getRightMatrix(baseX, baseY, { width: 32, height: this._tileHeight }),
      this._tileRightColor
    );

    borderRight.width = 32;
    borderRight.height = this._tileHeight;

    return [borderLeft, borderRight, tile];
  }

  /**
   * Destroys the stair and cleans up resources.
   */
  destroy() {
    super.destroy();
    this.removeChildren();
  }
}

const stairBase = 8;
