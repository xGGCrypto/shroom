
import { Avatar, FloorFurniture, FurnitureData, Room } from "../../";
import { TileType } from "../../types/TileType";
import type { RoomPosition } from "../../types/RoomPosition";
import type { FurnitureInfo } from "../../interfaces/IFurnitureData";
import {
  PathStep,
  FurniGridEntry,
  Grid2D,
  FurniGrid,
} from "../../types/PathfindingTypes";

import * as EasyStar from "easystarjs";

/**
 * Pathfinding utility for a Room, supporting grid-based navigation and furniture collision.
 * Uses EasyStar.js for A* pathfinding and supports dynamic furniture updates.
 */
export class Pathfinding {
  /** The current navigation grid, including furniture. */
  /** The current navigation grid, including furniture. */
  public grid: Grid2D = [];
  /** The base grid (without furniture). */
  public baseGrid: Grid2D;
  /** The detected door position, if any. */
  public door?: RoomPosition;

  private readonly room: Room;
  private readonly furnitureData: FurnitureData;
  /** 3D array of furniture objects on each tile. */
  /** 3D array of furniture objects on each tile. */
  private furniGrid: FurniGrid = [];

  /**
   * Constructs a new Pathfinding instance for a room.
   * @param room The room instance.
   * @param tilemap The tile map for the room.
   * @param furnitureData The furniture data provider.
   */
  constructor(room: Room, tilemap: TileType[][], furnitureData: FurnitureData) {
    this.room = room;
    this.furnitureData = furnitureData;

    this.baseGrid = tilemap.map((row) =>
      row.map((type) => (type !== "x" ? Number(type) : -1))
    );

    this.calculateFurnisFilledSpace();
    this.locateDoor();
  }

  /**
   * Locates the door position in the base grid (first walkable tile on edge).
   */
  private locateDoor(): void {
    this.baseGrid.forEach((row, rowIndex) => {
      row.forEach((colVal, colIndex) => {
        if (colVal >= 0 && (colIndex === 0 || rowIndex === 0))
          this.door = {
            roomX: colIndex,
            roomY: rowIndex,
            roomZ: colVal,
          };
      });
    });
  }

  /**
   * Recalculates the navigation grid and furniture grid based on current room objects.
   * @returns Promise that resolves when calculation is complete.
   */
  public calculateFurnisFilledSpace(): Promise<void> {
    let grid: Grid2D = this.clone(this.baseGrid);
    let furniGrid: FurniGrid = this.resetFurniGrid();

    const processRoomObject = async (roomObject: any) => {
      if (!roomObject) return;
      if (roomObject instanceof Avatar) return; // ignore avatars
      if (roomObject.placementType === "wall") return; // ignore wall placements
      let info: FurnitureInfo | undefined;
      try {
        info = await this.furnitureData.getInfoForFurniture(roomObject);
      } catch (err) {
        console.warn('Pathfinding: Failed to get furniture info', err);
        return;
      }
      if (info && !info.canstandon) {
        this.calculateFilledSpace(roomObject, info, grid, furniGrid);
      }
    };

    // update navmesh at the end, so meanwhile the existing one can be used/its never empty
    return Promise.all(
      Array.from(this.room.roomObjects.values()).map(processRoomObject)
    ).then(() => {
      this.grid = grid;
      this.furniGrid = furniGrid;
    });
  }

  /**
   * Marks the grid and furniGrid as filled for a given furniture object.
   * @param roomObject The furniture object.
   * @param info The furniture info.
   * @param grid The grid to update.
   * @param furniGrid The furniture grid to update.
   */
  private calculateFilledSpace(
    roomObject: FloorFurniture,
    info: FurnitureInfo,
    grid: Grid2D,
    furniGrid: FurniGrid
  ): void {
    let dimensions = {
      x: 0,
      y: 0,
    };
    switch (info.defaultdir) {
      case 0: // up
      case 4: // down
        dimensions.x = info.xdim as number;
        dimensions.y = info.ydim as number;
        break;
      default:
        dimensions.x = info.ydim as number;
        dimensions.y = info.xdim as number;
        break;
    }

    switch (roomObject.direction) {
      case 0: // up
      case 4: // down
        for (let y = 0; y < dimensions.y; y++) {
          for (let x = 0; x < dimensions.x; x++) {
            this.addToGrid(
              roomObject.roomX + x,
              roomObject.roomY + y,
              roomObject,
              info,
              grid,
              furniGrid
            );
          }
        }
        break;
      default:
        for (let y = 0; y < dimensions.x; y++) {
          for (let x = 0; x < dimensions.y; x++) {
            this.addToGrid(
              roomObject.roomX + x,
              roomObject.roomY + y,
              roomObject,
              info,
              grid,
              furniGrid
            );
          }
        }
        break;
    }
  }

  /**
   * Resets the furniture grid to an empty state matching the base grid.
   */
  private resetFurniGrid(): FurniGrid {
    const furniGrid: FurniGrid = [];
    this.baseGrid.forEach((entries, y) => {
      furniGrid[y] = [];
      entries.forEach((_, x) => {
        furniGrid[y][x] = [];
      });
    });
    return furniGrid;
  }

  /**
   * Marks a tile as filled by a furniture object in both the grid and furniGrid.
   */
  private addToGrid(
    x: number,
    y: number,
    roomObject: FloorFurniture,
    info: FurnitureInfo,
    grid: Grid2D,
    furniGrid: FurniGrid
  ): void {
    if (grid[y] && typeof grid[y][x] !== 'undefined') {
      grid[y][x] = this.determineNegativeMesh(info);
      furniGrid[y][x].push({ roomObject, info });
    }
  }

  /**
   * Returns a negative mesh value for a furniture info (used for grid marking).
   */
  private determineNegativeMesh(info: FurnitureInfo): number {
    if (info.canlayon) return -2;
    if (info.cansiton) return -3;
    if (info.canstandon) return -4;
    return -1;
  }

  /**
   * Returns all furniture objects on a given tile.
   */
  getFurnisOnTile(position: RoomPosition): FurniGridEntry[] {
    if (!this.furniGrid[position.roomY] || !this.furniGrid[position.roomY][position.roomX]) return [];
    return this.furniGrid[position.roomY][position.roomX];
  }

  /**
   * Finds a path from origin to target using A* pathfinding.
   * @param origin The starting position.
   * @param target The target position.
   * @returns Promise resolving to an array of path steps (with direction).
   */
  public findPath(
    origin: RoomPosition,
    target: RoomPosition
    // enableDiagonals: boolean = false
  ): Promise<PathStep[]> {
    return new Promise((resolve) => {
      const easystar = new EasyStar.js();

      let grid = this.grid;
      if (!grid[target.roomY] || typeof grid[target.roomY][target.roomX] === 'undefined') {
        resolve([]);
        return;
      }
      // if the target position is a sofa or a bed, set it as navigable so a path can be traced
      if (grid[target.roomY][target.roomX] < -1) {
        grid = this.clone(grid);
        grid[target.roomY][target.roomX] = 0;
      }

      easystar.setGrid(grid);
      easystar.setAcceptableTiles([1, 0]);
      // if (enableDiagonals) easystar.enableDiagonals();

      easystar.findPath(
        origin.roomX,
        origin.roomY,
        target.roomX,
        target.roomY,
        (
          result: Array<{ x: number; y: number }>
        ) => {
          let currentPosition = {
            x: origin.roomX,
            y: origin.roomY,
          };

      const path: PathStep[] = [];

          if (!result) {
            resolve(path);
            return;
          }
          result.forEach((position, index) => {
            if (index === 0) return;

            const direction = this.getAvatarDirectionFromDiff(
              position.x - currentPosition.x,
              position.y - currentPosition.y
            );

            const tile = this.room.getTileAtPosition(position.x, position.y);

            if (tile != null) {
              const getHeight = () => {
                if (tile.type === "tile") return tile.z;
                if (tile.type === "stairs") return tile.z + 0.5;
                return 0;
              };

              path.push({
                roomX: position.x,
                roomY: position.y,
                roomZ: getHeight(),
                direction,
              });

              currentPosition = {
                x: position.x,
                y: position.y,
              };
            }
          });

          resolve(path);
        }
      );

      easystar.calculate();
    });
  }

  /**
   * Deep clones a grid (2D or 3D array).
   */
  private clone<T>(grid: T): T {
    return JSON.parse(JSON.stringify(grid));
  }

  /**
   * Gets the avatar direction constant from a tile difference.
   * @throws Error if the direction is invalid.
   */
  private getAvatarDirectionFromDiff(diffX: number, diffY: number): number {
    const signX = Math.sign(diffX) as -1 | 0 | 1;
    const signY = Math.sign(diffY) as -1 | 0 | 1;

    switch (signX) {
      case -1:
        switch (signY) {
          case -1:
            return 7;
          case 0:
            return 6;
          case 1:
            return 5;
        }
        break;
      case 0:
        switch (signY) {
          case -1:
            return 0;
          case 1:
            return 4;
        }
        break;
      case 1:
        switch (signY) {
          case -1:
            return 1;
          case 0:
            return 2;
          case 1:
            return 3;
        }
        break;
    }
    throw new Error(`Invalid direction set: [${diffX},${diffY}]`);
  }
}
