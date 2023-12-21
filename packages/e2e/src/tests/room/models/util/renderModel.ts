import { Room, RoomCamera } from "@tetreum/shroom";
import { TestRenderer } from "../../../../TestRenderer";

export function renderModel(tilemap: string): TestRenderer {
  return ({ shroom, application }) => {
    const room = Room.create(shroom, {
      tilemap: tilemap,
    });
    
    room.x = application.screen.width / 2 - room.roomWidth / 2;
    room.y = application.screen.height / 2 - room.roomHeight / 2;

    const camera = RoomCamera.forScreen(room);
    application.stage.addChild(camera);
  };
}
