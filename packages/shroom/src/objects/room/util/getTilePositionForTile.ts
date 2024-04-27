import { getTilePosition } from "./getTilePosition";
import { ShroomPoint } from "../../../pixi-proxy";
export function getTilePositionForTile(roomX: number, roomY: number) {
  return {
    top: getTilePosition(roomX, roomY),
    left: getTilePosition(roomX, roomY + 1),
    right: getTilePosition(roomX + 1, roomY),
  };
}

export interface TilePositionForTile {
  left: ShroomPoint;
  right: ShroomPoint;
  top: ShroomPoint;
}
