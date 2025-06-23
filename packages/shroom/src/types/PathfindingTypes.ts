/**
 * Types and interfaces shared by Pathfinding and related room modules.
 * Centralizes common grid, step, and furniture-tile types for robust type safety.
 */
import type { RoomPosition } from "./RoomPosition";
import type { FurnitureInfo } from "../interfaces/IFurnitureData";
import type { FloorFurniture } from "../objects/furniture/FloorFurniture";

/**
 * Represents a single step in a pathfinding result.
 */
export interface PathStep extends RoomPosition {
  /** Direction to move from previous step to this step (0-7, or undefined for first step). */
  direction: number | undefined;
}

/**
 * Represents a single entry in the furniture grid for a tile.
 */
export interface FurniGridEntry {
  roomObject: FloorFurniture;
  info: FurnitureInfo;
}

/**
 * 2D grid of numbers (used for navigation mesh).
 */
export type Grid2D = number[][];

/**
 * 3D grid of furniture entries for each tile (y, x, [entries]).
 */
export type FurniGrid = FurniGridEntry[][][];
