import { Room, RoomCamera } from "@tetreum/shroom";
import { TestRenderer } from "../../TestRenderer";

export const renderHiddenWalls: TestRenderer = ({ shroom, application }) => {
  const room = Room.create(shroom, {
    tilemap: `
        xxxxxxxxxxxx
        xxxxxxxxxxxx
        xxxxxxxxxxxx
        xxxxxxxxxxxx
        xxxxxxxxxxxx
        xxxxx000000x
        xxxxx000000x
        xxxx0000000x
        xxxxx000000x
        xxxxx000000x
        xxxxx000000x
        xxxxxxxxxxxx
        xxxxxxxxxxxx
        xxxxxxxxxxxx
        xxxxxxxxxxxx
        xxxxxxxxxxxx
        `,
  });

  room.hideWalls = true;
  room.x = application.screen.width / 2 - room.roomWidth / 2;
  room.y = application.screen.height / 2 - room.roomHeight / 2;
  const camera = RoomCamera.forScreen(room);
  application.stage.addChild(camera);
};
