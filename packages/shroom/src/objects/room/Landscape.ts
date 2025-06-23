import {
  ShroomContainer,
  ShroomTexture,
  ShroomSprite,
  ShroomGraphics,
  ShroomTilingSprite,
  ShroomMatrix,
  ShroomPoint,
} from "../../pixi-proxy";
import { PartNode } from "../../interfaces/IRoomVisualization";
import { ParsedTileType } from "../../util/parseTileMap";
import { RoomObject } from "../RoomObject";
import { IRoomPart } from "./parts/IRoomPart";
import { RoomPartData } from "./parts/RoomPartData";
import { getMaskId } from "./util/getMaskId";

/**
 * Metadata describing a contiguous wall segment in the landscape.
 */
interface WallCollectionMeta {
  /** The type of wall: row or column. */
  type: "rowWall" | "colWall";
  /** The starting index of the wall segment. */
  start: number;
  /** The ending index of the wall segment. */
  end: number;
  /** The level (row or column) of the wall segment. */
  level: number;
}

/**
 * Function type for unsubscribing from an event or resource.
 */
type Unsubscribe = () => void;

/**
 * Room landscape part responsible for rendering landscape walls and textures.
 * Handles left/right wall textures, color overlays, and wall masking.
 * Implements the IRoomPart interface for integration with the room visualization system.
 */
export class Landscape extends RoomObject implements IRoomPart {
  /** The container holding all landscape wall graphics. */
  private _container: ShroomContainer | undefined;
  /** The resolved left wall texture. */
  private _leftTexture: ShroomTexture | undefined;
  /** The resolved right wall texture. */
  private _rightTexture: ShroomTexture | undefined;
  /** The wall height (unused, for future extension). */
  private _wallHeight = 0;
  /** The wall height including Z offset. */
  private _wallHeightWithZ = 0;

  /** The left wall texture or promise thereof. */
  private _leftTexturePromise:
    | ShroomTexture
    | Promise<ShroomTexture>
    | undefined;
  /** The right wall texture or promise thereof. */
  private _rightTexturePromise:
    | ShroomTexture
    | Promise<ShroomTexture>
    | undefined;

  /** Map of mask IDs to mask sprites. */
  private _masks: Map<string, ShroomSprite> = new Map();
  /** The color overlay for the landscape. */
  private _color: string | undefined;
  /** Unsubscribe function for any event/resource. */
  private _unsubscribe: Unsubscribe | undefined = undefined;

  /** The node representing this part in the visualization. */
  private _partNode: PartNode | undefined;

  constructor() {
    super();
  }

  /**
   * Gets the current color overlay for the landscape.
   */
  public get color() {
    return this._color;
  }

  /**
   * Sets the color overlay for the landscape and updates the graphics.
   */
  public set color(value) {
    this._color = value;
    this._updateLandscapeImages();
  }

  /**
   * Gets the left wall texture or promise.
   */
  public get leftTexture() {
    return this._leftTexturePromise;
  }

  /**
   * Sets the left wall texture (or promise) and updates the graphics when loaded.
   */
  public set leftTexture(value) {
    this._leftTexturePromise = value;
    Promise.resolve(this._leftTexturePromise).then((value) => {
      this._leftTexture = value;
      this._updateLandscapeImages();
    });
  }

  /**
   * Gets the right wall texture or promise.
   */
  public get rightTexture() {
    return this._rightTexturePromise;
  }

  /**
   * Sets the right wall texture (or promise) and updates the graphics when loaded.
   */
  public set rightTexture(value) {
    this._rightTexturePromise = value;
    Promise.resolve(this._rightTexturePromise).then((value) => {
      this._rightTexture = value;
      this._updateLandscapeImages();
    });
  }

  /**
   * Updates the landscape part with new data (masks, wall height, etc).
   * @param data The new part data.
   */
  update(data: RoomPartData): void {
    if (!data || typeof data !== 'object') {
      console.warn('Landscape.update: Invalid data provided.');
      return;
    }
    this._masks = data.masks;
    this._wallHeightWithZ = data.wallHeight;
    this._updateLandscapeImages();
  }

  /**
   * Cleans up resources and removes this part from the visualization.
   */
  destroyed(): void {
    if (this._unsubscribe) {
      this._unsubscribe();
      this._unsubscribe = undefined;
    }
    if (this._container) {
      this._container.destroy();
      this._container = undefined;
    }
    if (this._partNode) {
      this._partNode.remove();
      this._partNode = undefined;
    }
  }

  /**
   * Registers this part with the room visualization and updates graphics.
   */
  registered(): void {
    if (!this.roomVisualization) {
      console.warn('Landscape.registered: No roomVisualization available.');
      return;
    }
    this._partNode = this.roomVisualization.addPart(this);
    this._updateLandscapeImages();
  }

  /**
   * Creates a default mask (empty graphics) for walls with no mask.
   */
  private _createDefaultMask() {
    return new ShroomGraphics();
  }

  /**
   * Gets the mask sprite for a given wall direction and position, or a default if missing.
   * @param direction The wall direction (2=row, 4=col).
   * @param roomX The X position in the room.
   * @param roomY The Y position in the room.
   */
  private _getMask(direction: number, roomX: number, roomY: number) {
    const maskId = getMaskId(direction, roomX, roomY);

    if (maskId != null) {
      const mask = this._masks.get(maskId);

      if (mask != null) return mask;
    }

    return this._createDefaultMask();
  }

  /**
   * Rebuilds the landscape wall graphics and textures based on current state.
   * Handles color overlays, textures, and wall masks for both left and right walls.
   */
  private _updateLandscapeImages() {
    if (!this.mounted) return;
    if (!this.tilemap || !this.roomVisualization || !this.geometry) {
      console.warn('Landscape._updateLandscapeImages: Missing dependencies.');
      return;
    }

    const meta = getWallCollectionMeta(this.tilemap.getParsedTileTypes());
    if (this._container) {
      this._container.destroy();
      this._container = undefined;
    }
    const container = new ShroomContainer();

    let offsetRow = 0;
    let offsetCol = 0;

    meta.forEach((meta) => {
      const width = Math.abs(meta.end - meta.start) * 32;
      const wall = new ShroomContainer();
      let colored: ShroomTilingSprite;
      try {
        colored = new ShroomTilingSprite(
          ShroomTexture.WHITE,
          width,
          this._wallHeightWithZ
        );
      } catch (err) {
        console.warn('Landscape: Failed to create colored tiling sprite', err);
        return;
      }

      if (this.color != null) {
        try {
          colored.tint = parseInt(this.color.slice(1), 16);
        } catch (err) {
          colored.tint = 0xffffff;
          console.warn('Landscape: Invalid color format', this.color);
        }
      } else {
        colored.tint = 0xffffff;
      }
      colored.y = -this._wallHeightWithZ;
      wall.addChild(colored);

      if (meta.type === "rowWall") {
        const maskLevel = this.landscapeContainer.getMaskLevel(meta.level, 0);
        const mask = this._getMask(2, maskLevel.roomX, 0);
        wall.mask = mask;
        const position = this.geometry.getPosition(
          meta.level + 1,
          meta.start,
          0
        );
        wall.transform.setFromMatrix(new ShroomMatrix(1, -0.5, 0, 1));
        wall.x = position.x;
        wall.y = position.y + 16;
        if (this._leftTexture != null) {
          try {
            const graphics = new ShroomTilingSprite(
              this._leftTexture,
              width,
              this._leftTexture.height
            );
            graphics.tilePosition = new ShroomPoint(offsetRow, 0);
            graphics.texture = this._leftTexture;
            graphics.x = 0;
            graphics.y = -this._leftTexture.height;
            wall.addChild(graphics);
          } catch (err) {
            console.warn('Landscape: Failed to create left wall tiling sprite', err);
          }
        }
        offsetRow += width;
      } else if (meta.type === "colWall") {
        const maskLevel = this.landscapeContainer.getMaskLevel(0, meta.level);
        const mask = this._getMask(4, 0, maskLevel.roomY);
        wall.mask = mask;
        const position = this.geometry.getPosition(
          meta.start + 1,
          meta.level + 1,
          0
        );
        wall.transform.setFromMatrix(new ShroomMatrix(1, 0.5, 0, 1));
        wall.x = position.x + 32;
        wall.y = position.y;
        if (this._rightTexture != null) {
          try {
            const graphics = new ShroomTilingSprite(
              this._rightTexture,
              width,
              this._rightTexture.height
            );
            graphics.texture = this._rightTexture;
            graphics.x = 0;
            graphics.y = -this._rightTexture.height;
            graphics.tilePosition = new ShroomPoint(offsetCol, 0);
            wall.addChild(graphics);
          } catch (err) {
            console.warn('Landscape: Failed to create right wall tiling sprite', err);
          }
        }
        offsetCol += width;
      }
      container.addChild(wall);
    });

    this._container = container;
    this.roomVisualization.landscapeContainer.addChild(container);
  }
}

/**
 * Gets the tile at the given coordinates from a parsed tile map.
 * @param parsedTileMap The parsed tile map.
 * @param x The X coordinate.
 * @param y The Y coordinate.
 */
const getTile = (parsedTileMap: ParsedTileType[][], x: number, y: number) => {
  const row = parsedTileMap[y];
  if (row == null) return;

  return row[x];
};

/**
 * Extracts contiguous wall segments (row/col) from a parsed tile map for landscape rendering.
 * @param parsedTileMap The parsed tile map.
 * @returns Array of wall segment metadata.
 */
function getWallCollectionMeta(parsedTileMap: ParsedTileType[][]) {
  const { x: startX, y: startY } = getStartingWall(parsedTileMap);

  let x = startX;
  let y = startY;
  let done = false;
  let meta: WallCollectionMeta | undefined = undefined;
  const arr: WallCollectionMeta[] = [];

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const currentWall = getTile(parsedTileMap, x, y);

    const topWallPosition = { x, y: y - 1 };
    const rightWallPosition = { x: x + 1, y };

    const topWall = getTile(
      parsedTileMap,
      topWallPosition.x,
      topWallPosition.y
    );
    const rightWall = getTile(
      parsedTileMap,
      rightWallPosition.x,
      rightWallPosition.y
    );

    if (
      currentWall == null ||
      (currentWall.type !== "wall" && currentWall.type !== "door")
    )
      break;

    const updateMeta = (newMeta: WallCollectionMeta) => {
      if (meta == null) {
        meta = newMeta;
        return;
      }

      if (meta != null && meta.type !== newMeta.type) {
        arr.push(meta);
        meta = newMeta;
        return;
      }

      meta = {
        ...meta,
        level: newMeta.level,
        end: newMeta.end,
      };
    };

    if (currentWall.type === "wall") {
      switch (currentWall.kind) {
        case "rowWall":
        case "innerCorner":
          updateMeta({ type: "rowWall", start: y, end: y - 1, level: x });
          break;

        case "colWall":
        case "outerCorner":
          updateMeta({
            type: "colWall",
            start: x,
            end: x + (done ? 0 : 1),
            level: y,
          });
          break;
      }
    } else if (currentWall.type === "door") {
      updateMeta({ type: "rowWall", start: y, end: y - 1, level: x });
    }

    if (done) {
      if (meta != null) {
        arr.push(meta);
      }
      break;
    }

    if (
      topWall != null &&
      (topWall.type === "wall" || topWall.type === "door")
    ) {
      x = topWallPosition.x;
      y = topWallPosition.y;
    } else if (rightWall != null && rightWall.type === "wall") {
      x = rightWallPosition.x;
      y = rightWallPosition.y;
    } else {
      done = true;
    }
  }

  return arr;
}

/**
 * Finds the starting wall tile in a parsed tile map for wall traversal.
 * @param parsedTileMap The parsed tile map.
 * @returns The {x, y} coordinates of the starting wall tile.
 */
function getStartingWall(parsedTileMap: ParsedTileType[][]) {
  const startY = parsedTileMap.length - 1;
  let y = startY;
  let x = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const current = getTile(parsedTileMap, x, y);

    if (current != null && current.type === "wall") {
      return { x, y };
    } else {
      y--;
      if (y < 0) {
        y = startY;
        x++;
      }
    }
  }
}
