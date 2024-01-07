import { FloorFurniture } from "@xggcrypto/shroom";
import { createShroom } from "../common/createShroom";
import { RoomCreator } from "../common/createRoom";

export function renderFurnitureExample(
  type: string,
  {
    animations = ["0"],
    spacing = 2,
    directions,
  }: {
    directions: number[];
    animations?: string[];
    spacing: number;
  },
  cb: (furniture: FloorFurniture) => void = () => {
    /* Do nothing */
  }
) {
  return createShroom(({ shroom, application }) => {
    const tilemap = RoomCreator.parseTilemapArr([
      "xxxxxxxxxxxxxxxx",
      "x000000000000000",
      "x000000000000000",
      "x000000000000000",
      "x000000000000000",
      "x000000000000000",
    ]);
    const room = RoomCreator.createRoom(shroom, application, tilemap, {
      centerRoom: true,
    });

    let y = 0;

    for (const animation of animations) {
      let x = 0;

      for (const direction of directions) {
        const furniture = new FloorFurniture({
          roomX: 1 + x * spacing,
          roomY: 1 + y * spacing,
          roomZ: 0,
          direction,
          type,
          animation: animation,
        });

        room.addRoomObject(furniture);
        cb(furniture);
        x++;
      }

      y++;
    }

    application.stage.addChild(room);
  });
}
