import { ShroomPoint } from "../../../pixi-proxy";

export function getTilePosition(roomX: number, roomY: number) {
  const xEven = roomX % 2 === 0;
  const yEven = roomY % 2 === 0;

  return new ShroomPoint(xEven ? 0 : 32, yEven ? 32 : 0);
}
