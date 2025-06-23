import {
  ShroomContainer,
  ShroomTexture,
  ShroomDisplayObject,
  ShroomMatrix,
  ShroomTilingSprite,
  ShroomPoint,
} from "../../../pixi-proxy";

import { getFloorMatrix, getLeftMatrix, getRightMatrix } from "../matrixes";
import { IRoomPart } from "./IRoomPart";
import { RoomPartData } from "./RoomPartData";

/**
 * Represents a stair corner part in the room model visualization.
 * Handles rendering and updating of stair corner graphics for different corner types.
 */
export class StairCorner extends ShroomContainer implements IRoomPart {
  private _container: ShroomContainer | undefined;
  private _texture: ShroomTexture | undefined;

  private _tileHeight = 0;
  private _tileLeftColor = 0;
  private _tileRightColor = 0;
  private _tileTopColor = 0;

  /**
   * Creates a new StairCorner.
   * @param _props The type of the stair corner: 'front', 'left', or 'right'.
   */
  constructor(private _props: { type: "front" | "left" | "right" }) {
    super();

    this.sortableChildren = true;
  }

  /**
   * Updates the stair corner with new room part data.
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
   * Updates the sprites for the stair corner based on the current type and state.
   */
  updateSprites() {
    this.removeChildren();

    const { type } = this._props;

    for (let i = 0; i < 4; i++) {
      if (type === "front") {
        this.addChild(...this._createStairBoxFront(3 - i));
      } else if (type === "left") {
        this.addChild(...this._createStairBoxLeft(3 - i));
      } else if (type === "right") {
        this.addChild(...this._createStairBoxRight(3 - i));
      }
    }
  }

  /**
   * Destroys any container or resources used by the stair corner.
   */
  destroySprites() {
    this._container?.destroy();
  }

  /**
   * Destroys the stair corner and cleans up resources.
   */
  destroy() {
    super.destroy();
    this.destroySprites();
  }

  /**
   * Creates the display objects for the 'front' stair corner at a given index.
   * @param index The stair step index (0 = closest to viewer).
   * @returns An array of display objects for this stair step.
   */
  private _createStairBoxFront(index: number): ShroomDisplayObject[] {
    const baseXLeft = +stairBase * index;
    const baseYLeft = -stairBase * index * 1.5;

    const baseXRight = 0;
    const baseYRight = -stairBase * index * 2;

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

    const tileLeft = createSprite(
      getFloorMatrix(baseXLeft, baseYLeft),
      this._tileTopColor,
      new ShroomPoint()
    );

    tileLeft.width = 32 - 8 * index;
    tileLeft.height = 8;

    const tileRight = createSprite(
      getFloorMatrix(baseXRight + 32 - stairBase, baseYRight + stairBase * 1.5),
      this._tileTopColor,
      new ShroomPoint(0, 0)
    );

    tileRight.width = stairBase;
    tileRight.height = 32 - 8 * index;

    const borderLeft = createSprite(
      getLeftMatrix(baseXLeft - 8 * index, baseYLeft - 8 * index * 0.5, {
        width: 32,
        height: this._tileHeight,
      }),
      this._tileLeftColor,
      new ShroomPoint(0, 0)
    );
    borderLeft.width = 32 - 8 * index;
    borderLeft.height = this._tileHeight;

    const borderRight = createSprite(
      getRightMatrix(baseXRight - stairBase * index, -stairBase * index * 1.5, {
        width: 32,
        height: this._tileHeight,
      }),
      this._tileRightColor,
      new ShroomPoint(0, 0)
    );

    borderRight.width = 32 - 8 * index;
    borderRight.height = this._tileHeight;

    return [borderLeft, borderRight, tileLeft, tileRight];
  }

  /**
   * Creates the display objects for the 'left' stair corner at a given index.
   * @param index The stair step index (0 = closest to viewer).
   * @returns An array of display objects for this stair step.
   */
  private _createStairBoxLeft(index: number) {
    const baseX = -stairBase * index;
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

    const tileRight = createSprite(
      getFloorMatrix(baseX + 32 - stairBase, baseY + stairBase * 1.5),
      this._tileTopColor,
      new ShroomPoint(0, 0)
    );

    tileRight.width = stairBase;
    tileRight.height = 32 - 8 * index;
    tileRight.zIndex = 2;

    const borderRight = createSprite(
      getRightMatrix(baseX - stairBase * index, -stairBase * index, {
        width: 32,
        height: this._tileHeight,
      }),
      this._tileRightColor,
      new ShroomPoint(0, 0)
    );

    borderRight.width = 32 - 8 * index;
    borderRight.height = this._tileHeight;
    borderRight.zIndex = 1;

    if (index == 0) {
      const cornerOne = createSprite(
        getFloorMatrix(baseX + 40, -4),
        this._tileTopColor,
        new ShroomPoint(0, 0)
      );

      cornerOne.width = 8;
      cornerOne.height = 8;
      cornerOne.zIndex = 0;

      const cornerTwo = createSprite(
        getFloorMatrix(baseX + 24, -12),
        this._tileTopColor,
        new ShroomPoint(0, 0)
      );
      cornerTwo.width = 8;
      cornerTwo.height = 8;
      cornerTwo.zIndex = 0;

      return [tileRight, borderRight, cornerOne, cornerTwo];
    } else {
      return [tileRight, borderRight];
    }
  }

  /**
   * Creates the display objects for the 'right' stair corner at a given index.
   * @param index The stair step index (0 = closest to viewer).
   * @returns An array of display objects for this stair step.
   */
  private _createStairBoxRight(index: number) {
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
      getFloorMatrix(baseX + 8 * index, baseY + 8 * index * 0.5),
      this._tileTopColor,
      new ShroomPoint(0, 0)
    );

    tile.width = 32 - 8 * index;
    tile.height = 8;
    tile.zIndex = 2;

    const borderLeft = createSprite(
      getLeftMatrix(baseX, baseY, { width: 32, height: this._tileHeight }),
      this._tileLeftColor,
      new ShroomPoint(0, 0)
    );
    borderLeft.width = 32 - 8 * index;
    borderLeft.height = this._tileHeight;
    borderLeft.zIndex = 1;

    if (index == 0) {
      const cornerOne = createSprite(
        getFloorMatrix(baseX + 8, -4),
        this._tileTopColor,
        new ShroomPoint(0, 0)
      );

      cornerOne.width = 8;
      cornerOne.height = 8;
      cornerOne.zIndex = 0;

      const cornerTwo = createSprite(
        getFloorMatrix(baseX + 24, -12),
        this._tileTopColor,
        new ShroomPoint(0, 0)
      );
      cornerTwo.width = 8;
      cornerTwo.height = 8;
      cornerTwo.zIndex = 0;

      return [tile, borderLeft, cornerOne, cornerTwo];
    } else {
      return [tile, borderLeft];
    }
  }
}

const stairBase = 8;
