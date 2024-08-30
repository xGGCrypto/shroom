import {
  RoomCamera,
  Avatar,
  Pathfinding,
  parseTileMapString,
  FurnitureData,
  FloorFurniture,
  RoomPosition,
  Shroom,
} from "@xggcrypto/shroom";
import { createShroom } from "./createShroom";
import { RoomCreator } from "./createRoom";
import {
  DiceBehavior,
  FurniInfoBehavior,
  MultiStateBehavior,
} from "./behaviors";

import { action } from "@storybook/addon-actions";

export const roomModels = {
  ModelA: [
    "xxxxxxxxxxx",
    "x0000000000",
    "x0000000000",
    "x0000000000",
    "x0000000000",
  ],
  ModelB: [
    "xxxxxxxxxxx",
    "x0000000000",
    "00000000000",
    "x0000000000",
    "x0000000000",
  ],
  ModelC: [
    "xxxxxxxxxxxxxx",
    "x0000000000000",
    "x0000000000000",
    "00000000000000",
    "x0000000000000",
    "x0000000000000",
    "x0000000000000",
  ],
  ModelD: [
    "xxxxxxxxxxx",
    "x0000000000",
    "x0000000000",
    "x0000000000",
    "x0000000000",
    "00000000000",
    "x0000000000",
    "x0000000000",
    "x0000000000",
    "x0000000000",
  ],
  ModelE: [
    "xxxxxxxxxxx",
    "x0000000000",
    "x0000000000",
    "x0000000000",
    "x0000000000",
    "x0000000000",
    "x0000000000",
    "00000000000",
    "x0000000000",
    "x0000000000",
  ],
};

export function ShroomComponent(args: { [key: string]: any }) {
  return createShroom(({ application, shroom }) => {
    action("args")(args);
    let resourcePath = args.customResourcesEnabled
      ? args.customResourcesLink
      : process.env.resourcePath || "https://psociety.github.io/shroom-static";

    if (args.customResourcesEnabled) {
      shroom = Shroom.create({
        resourcePath,
        application,
      });
    }

    const tilemap = RoomCreator.parseTilemapArr(
      args.roomModel ?? roomModels.ModelA
    );

    const customTile = { enabled: true, default: args.floorTile ?? "tile2" };
    const customWall = args.wallTile
      ? { enabled: true, default: args.wallTile }
      : { enabled: false };

    const room = RoomCreator.createRoom(shroom, application, tilemap, {
      centerRoom: true,
      customTile,
      customWall,
    });

    Object.assign(room, {
      wallColor: args.wallColor,
      wallDepth: args.wallDepth,
      wallHeight: args.wallHeight,
      hideWalls: args.hideWalls,
      floorColor: args.floorColor,
      hideFloor: args.hideFloor,
      hideTileCursor: args.hideTileCursor,
    });

    if (args.avatarEnabled) {
      shroom.dependencies.furnitureData ||= FurnitureData.create(resourcePath);

      const PathFinder = new Pathfinding(
        room,
        parseTileMapString(tilemap),
        shroom.dependencies?.furnitureData as FurnitureData
      );

      const door = PathFinder.door ?? { roomX: 1, roomY: 1, roomZ: 0 };
      action("door")(door);

      const avatar = new Avatar({
        ...door,
        look:
          args.avatarLook ??
          "hd-180-1.hr-115-61.ha-1012-110.ch-255-66.lg-280-110.sh-305-62",
        direction: door.roomY > 0 ? 2 : 4,
      });

      room.addRoomObject(avatar);

      var avatarMoveQueue: {
        roomX: number;
        roomY: number;
        roomZ: number;
        direction?: number;
      }[] = [];

      room.onTileClick = async (position) => {
        avatar.clearMovement();

        try {
          avatarMoveQueue = await PathFinder.findPath(
            { roomX: avatar.roomX, roomY: avatar.roomY, roomZ: avatar.roomZ },
            position
          );
        } catch (err) {
          console.error(err);
        }
      };

      setInterval(() => {
        const next = avatarMoveQueue.shift();
        if (next)
          avatar.walk(next.roomX, next.roomY, next.roomZ, {
            direction: next.direction,
          });
      }, 500);
    }

    args.floorFurni?.forEach((furni: RoomFloorFurni) => {
      const furniture = new FloorFurniture({
        ...furni,
        animation: furni.animation ?? "0",
      });

      furniture.extradata.then(({ logic, visualization }) => {
        new FurniInfoBehavior(shroom.dependencies.furnitureData!).setParent(
          furniture
        );
        action(`${furniture.type}_extradata_logic`)(logic);
        action(`${furniture.type}_extradata_visualization`)(visualization);

        switch (logic) {
          case "furniture_dice":
            new DiceBehavior().setParent(furniture);
            break;

          case "furniture_multistate":
            new MultiStateBehavior(shroom).setParent(furniture);
            break;
        }

        new FurniInfoBehavior(shroom.dependencies.furnitureData!).setParent(
          furniture
        ); //
      });

      room.addRoomObject(furniture);
    });

    application.stage.addChild(
      args.roomCamera ? RoomCamera.forScreen(room) : room
    );
  });
}

interface RoomFloorFurni extends RoomPosition {
  type: string;
  id?: string | number;
  direction: number;
  animation?: string;
}
