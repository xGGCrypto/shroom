import * as PIXI from "pixi.js";
import { FloorFurniture } from "@xggcrypto/shroom";

import { createShroom } from "../common/createShroom";
import { RoomCreator } from "../common/createRoom";
export default {
  title: "Furniture / Issues",
};

export function DestroyFurnitureWhileMoving() {
  return createShroom(({ application, shroom }) => {
    const container = new PIXI.Container();
    application.stage.addChild(container);

    const tilemap = RoomCreator.parseTilemapArr([
      "xxxxxxxxxxx",
      "x0000000000",
      "x0000000000",
      "x0000000000",
      "x0000000000",
      "x0000000000",
      "x0000000000",
      "x0000000000",
      "x0000000000",
    ]);

    const room = RoomCreator.createRoom(shroom, application, tilemap, {
      centerRoom: true,
    });

    const furniture = new FloorFurniture({
      roomX: 1,
      roomY: 1,
      roomZ: 0,
      animation: "0",
      direction: 2,
      id: 8434,
    });

    room.addRoomObject(furniture);

    setTimeout(() => {
      furniture.move(3, 2, 0);
      furniture.destroy();
    }, 2000);

    application.stage.addChild(room);
  });
}
