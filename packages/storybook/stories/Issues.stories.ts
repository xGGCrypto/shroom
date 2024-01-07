import * as PIXI from "pixi.js";
import { Avatar, FloorFurniture, RoomCamera } from "@xggcrypto/shroom";
import { action } from "@storybook/addon-actions";
import { createShroom } from "./common/createShroom";
import { RoomCreator } from "./common/createRoom";

export default {
  title: "Issues",
};

export function Issue28() {
  return createShroom(({ application, shroom }) => {
    const tilemap = RoomCreator.parseTilemapArr([
      "xxxxxxxxxxxx",
      "xxxx00000000",
      "xxxx00000000",
      "xxxx00000000",
      "xxxx00000000",
      "xxx000000000",
      "xxxx00000000",
      "xxxx00000000",
      "xxxx00000000",
      "xxxx00000000",
      "xxxx00000000",
      "xxxx00000000",
      "xxxx00000000",
      "xxxx00000000",
      "xxxxxxxxxxxx",
      "xxxxxxxxxxxx",
    ]);

    const room = RoomCreator.createRoom(shroom, application, tilemap, {
      centerRoom: true,
    });

    const avatar = new Avatar({
      look: "hd-180-1.hr-100-61.ch-210-66.lg-280-110.sh-305-62",
      direction: 2,
      roomX: 3,
      roomY: 5,
      roomZ: 0,
    });

    room.onTileClick = action("Position");

    room.addRoomObject(avatar);

    application.stage.addChild(room);
  });
}

export function Issue31() {
  return createShroom(({ application, shroom }) => {
    const tilemap = RoomCreator.parseTilemapArr([
      "xxxxxxxxxxxx",
      "xxxx00000000",
      "xxxx00000000",
      "xxxx00000000",
      "xxxx00000000",
      "xxx000000000",
      "xxxx00000000",
      "xxxx00000000",
      "xxxx00000000",
      "xxxx00000000",
      "xxxx00000000",
      "xxxx00000000",
      "xxxx00000000",
      "xxxx00000000",
      "xxxxxxxxxxxx",
      "xxxxxxxxxxxx",
    ]);

    const room = RoomCreator.createRoom(shroom, application, tilemap, {
      centerRoom: true,
    });

    const avatar = new Avatar({
      look: "hd-180-1.hr-100-61.ch-210-66.lg-280-110.sh-305-62",
      direction: 2,
      roomX: 3,
      roomY: 5,
      roomZ: 0,
    });

    const furniture1 = new FloorFurniture({
      type: "plant_pineapple",
      direction: 0,
      roomX: 4,
      roomY: 1,
      roomZ: 0,
    });
    const furniture2 = new FloorFurniture({
      type: "plant_pineapple",
      direction: 0,
      roomX: 4,
      roomY: 1,
      roomZ: 0.5,
    });
    const furniture3 = new FloorFurniture({
      type: "plant_pineapple",
      direction: 0,
      roomX: 4,
      roomY: 1,
      roomZ: 1,
    });

    const furniture4 = new FloorFurniture({
      id: 160,
      direction: 0,
      roomX: 5,
      roomY: 1,
      roomZ: 0,
    });
    const furniture5 = new FloorFurniture({
      type: "plant_pineapple",
      direction: 0,
      roomX: 5,
      roomY: 1,
      roomZ: 0.5,
    });
    const furniture6 = new FloorFurniture({
      id: 160,
      direction: 0,
      roomX: 5,
      roomY: 1,
      roomZ: 1,
    });

    room.onTileClick = action("Position");

    room.addRoomObject(avatar);
    room.addRoomObject(furniture3);
    room.addRoomObject(furniture1);
    room.addRoomObject(furniture2);
    room.addRoomObject(furniture4);
    room.addRoomObject(furniture5);
    room.addRoomObject(furniture6);

    application.stage.addChild(room);
  });
}

export function Issue38() {
  return createShroom(({ application, shroom }) => {
    const tilemap = RoomCreator.parseTilemapArr([
      "xxxxxxxxxxxx",
      "xxxxx000xxxx",
      "xxxxx000xxxx",
      "x00000000000",
      "x00000000000",
      "x00000000000",
      "xxxxx000xxxx",
      "xxxxx000xxxx",
      "xxxxxxxxxxxx",
    ]);

    const room = RoomCreator.createRoom(shroom, application, tilemap, {
      centerRoom: true,
    });

    const avatar = new Avatar({
      look: "hd-180-1.hr-100-61.ch-210-66.lg-280-110.sh-305-62",
      direction: 2,
      roomX: 3,
      roomY: 5,
      roomZ: 0,
    });

    room.onTileClick = action("Position");

    room.addRoomObject(avatar);

    application.stage.addChild(room);
  });
}

export function IssueWithAvatarEventsNotHandled() {
  return createShroom(({ application, shroom }) => {
    const tilemap = RoomCreator.parseTilemapArr([
      "xxxxxxxxxxxx",
      "xxxxx000xxxx",
      "xxxxx000xxxx",
      "x00000000000",
      "x00000000000",
      "x00000000000",
      "xxxxx000xxxx",
      "xxxxx000xxxx",
      "xxxxxxxxxxxx",
    ]);

    const room = RoomCreator.createRoom(shroom, application, tilemap, {
      centerRoom: true,
    });

    const avatar = new Avatar({
      look: "hd-180-1.hr-100-61.ch-210-66.lg-280-110.sh-305-62",
      direction: 2,
      roomX: 3,
      roomY: 5,
      roomZ: 0,
    });

    const furniture = new FloorFurniture({
      type: "edicehc",
      direction: 0,
      roomX: 4,
      roomY: 5,
      roomZ: 0,
    });

    avatar.onClick = (event) => {
      event.stopPropagation();

      action("Avatar Clicked")(event);
    };

    avatar.onDoubleClick = (event) => {
      event.stopPropagation();

      action("Avatar Double Clicked")(event);
    };

    furniture.onClick = (event) => {
      event.stopPropagation();

      furniture.animation = "-1";

      setTimeout(() => {
        furniture.animation = "0";
      }, 3500);

      action("Furniture Clicked")(event);
    };

    avatar.onPointerDown = action("Avatar Pointer Down");
    avatar.onPointerUp = action("Avatar Pointer Up");

    furniture.onPointerDown = action("Furniture Pointer Down");
    furniture.onPointerUp = action("Furniture Pointer Up");

    room.onTileClick = action("Position");

    room.addRoomObject(furniture);
    room.addRoomObject(avatar);

    application.stage.addChild(room);
  });
}

export function IssueWithItemNotRenderingProperly() {
  return createShroom(({ application, shroom }) => {
    const tilemap = RoomCreator.parseTilemapArr([
      "xxxxx",
      "x0000",
      "x0000",
      "x0000",
      "x0000",
    ]);

    const room = RoomCreator.createRoom(shroom, application, tilemap, {
      centerRoom: true,
    });

    const furniture = new FloorFurniture({
      type: "hc21_2",
      direction: 0,
      roomX: 1,
      roomY: 1,
      roomZ: 0,
    });

    room.onTileClick = action("Position");

    room.addRoomObject(furniture);

    application.stage.addChild(room);
  });
}

export function Issue56() {
  return createShroom(({ application, shroom, container: storyContainer }) => {
    const tilemap = RoomCreator.parseTilemapArr([
      "xxxxxxxxxxxx",
      "xxxxx000xxxx",
      "xxxxx000xxxx",
      "x00000000000",
      "x00000000000",
      "x00000000000",
      "xxxxx000xxxx",
      "xxxxx000xxxx",
      "xxxxxxxxxxxx",
    ]);

    const room = RoomCreator.createRoom(shroom, application, tilemap, {
      centerRoom: true,
    });

    const container = RoomCamera.forScreen(room);
    application.stage.addChild(container);

    const window = new PIXI.Graphics();

    window.beginFill(0xffffff);
    window.drawRect(0, 0, 200, 400);
    window.endFill();
    window.interactive = true;

    application.stage.addChild(window);

    const child = document.createElement("div");
    child.style.width = "200px";
    child.style.height = "64px";
    child.style.backgroundColor = "#ffffff";
    child.style.position = "absolute";
    child.style.left = "200px";
    child.style.top = "50px";

    storyContainer.appendChild(child);
  });
}

export function IssueZOrder() {
  return createShroom(({ application, shroom }) => {
    const tilemap = RoomCreator.parseTilemapArr([
      "xxxxxx",
      "x00000",
      "x00000",
      "x00000",
      "x00000",
      "x00000",
    ]);

    const room = RoomCreator.createRoom(shroom, application, tilemap, {
      centerRoom: true,
    });

    const furniture = new FloorFurniture({
      roomX: 1,
      roomY: 2,
      roomZ: 0,
      direction: 2,
      type: "throne",
    });

    const avatar = new Avatar({
      look: "hd-180-1.hr-100-61.ch-210-66.lg-280-110.sh-305-62",
      direction: 2,
      roomX: 1,
      roomY: 2,
      roomZ: 0,
    });

    room.addRoomObject(furniture);
    room.addRoomObject(avatar);

    setTimeout(() => {
      console.log(room.children.map((child) => [child, child.zIndex]));
    }, 500);

    application.stage.addChild(room);
  });
}
