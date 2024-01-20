import type { Meta } from "@storybook/react";
import {
  RoomCamera,
  Avatar,
  Pathfinding,
  parseTileMapString,
  FurnitureData,
  FloorFurniture,
  RoomPosition,
} from "@xggcrypto/shroom";
import { createShroom } from "./common/createShroom";
import { RoomCreator } from "./common/createRoom";

import { action } from "@storybook/addon-actions";

const roomModels = Object.freeze({
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
    "xxxxxx0xxxx",
    "x0000000000",
    "x0000000000",
    "x0000000000",
    "x0000000000",
    "x0000000000",
    "x0000000000",
    "x0000000000",
    "x0000000000",
    "x0000000000",
  ],
});

function ShroomComponent(args: { [key: string]: any }) {
  return createShroom(({ application, shroom }) => {
    action("args")(args);
    const tilemap = RoomCreator.parseTilemapArr(
      args.roomModel ?? roomModels.ModelA
    );

    var customTile = { enabled: true, default: "tile2" } as any;
    var customWall = { enabled: false };

    if (args.floorTile) customTile.default = args.floorTile;
    if (args.wallTile)
      customWall = { enabled: true, default: args.wallTile } as any;

    const room = RoomCreator.createRoom(shroom, application, tilemap, {
      centerRoom: true,
      customTile,
      customWall,
    });

    if (args?.wallColor) room.wallColor = args.wallColor;
    if (args?.wallDepth) room.wallDepth = args.wallDepth;
    if (args?.wallHeight) room.wallHeight = args.wallHeight;
    if (args?.hideWalls) room.hideWalls = args.hideWalls;

    if (args?.floorColor) room.floorColor = args.floorColor;
    if (args?.hideFloor) room.hideFloor = args.hideFloor;
    if (args?.hideTileCursor) room.hideTileCursor = args.hideTileCursor;

    if (args?.avatarEnabled) {
      if (!shroom.dependencies.furnitureData) {
        shroom.dependencies.furnitureData = FurnitureData.create(
          process.env.resourcePath || "./resources"
        );
      }

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
          args?.avatarLook ??
          "hd-180-1.hr-115-61.ha-1012-110.ch-255-66.lg-280-110.sh-305-62",
        direction: (door.roomY > 0) ? 2 : 4,
      });

      var avatarMoveQueue: {
        roomX: number;
        roomY: number;
        roomZ: number;
        direction?: number;
      }[] = [];

      room.addRoomObject(avatar); // Add Avatar to Room

      const roomTick = setInterval(() => {
        const next = avatarMoveQueue[0];

        if (next != null) {
          avatar.walk(next.roomX, next.roomY, next.roomZ, {
            direction: next.direction,
          });

          avatarMoveQueue.shift();
        }
      }, 500);

      room.onTileClick = async (position) => {
        avatar.clearMovement();

        const avatarPos = {
          roomX: avatar.roomX,
          roomY: avatar.roomY,
          roomZ: avatar.roomZ,
        };

        if (!PathFinder) throw new Error("PathFinder not found.");
        const path = PathFinder.findPath(avatarPos, position)
          .then((path) => {
            avatarMoveQueue = path;
          })
          .catch((err) => {
            console.error(err);
          });
      };
    }

    if (args?.floorFurni && args?.floorFurni.length > 0) {
      args.floorFurni.forEach((furni: RoomFloorFurni) => {
        const furniture = new FloorFurniture({
          ...furni,
          animation: furni.animation ?? "0",
        });

        room.addRoomObject(furniture);
      });
    }

    application.stage.addChild(
      args.roomCamera ? RoomCamera.forScreen(room) : room
    );
  });
}

//////////////////////////////////////

const meta: Meta<typeof ShroomComponent> = {
  title: "Playground / General",
  component: ShroomComponent,
  argTypes: {
    // Colors
    wallColor: { control: "color" },
    floorColor: { control: "color" },

    // Tiles
    floorTile: { control: "select", options: ["tile1", "tile2"] },
    wallTile: { control: "select", options: ["tile1", "tile2"] },

    // Floor Options
    hideFloor: { control: "boolean" },
    hideTileCursor: { control: "boolean" },

    // Wall Options
    wallDepth: { control: "number" },
    wallHeight: { control: "number" },
    hideWalls: { control: "boolean" },

    // Room Options
    roomModel: {
      name: "Room Model",
      options: Object.keys(roomModels), // An array of serializable values
      mapping: roomModels,
      control: { type: "select" },
    },
    roomCamera: { control: "boolean" },

    // Avatar
    avatarEnabled: { control: "boolean" },
    avatarLook: { control: "string" },

    // Furniture
    floorFurni: { control: "object" },
  },

  args: {
    // Tiles
    floorTile: "tile1",

    // Floor Options
    hideFloor: false,
    hideTileCursor: false,

    // Wall Options
    wallDepth: 10,
    wallHeight: 128,
    hideWalls: false,

    // Room Options
    roomCamera: false,

    // Avatar
    avatarEnabled: true,

    // Furniture
    floorFurni: [
      { type: "club_sofa", roomX: 2, roomY: 1, roomZ: 0, direction: 4 },
      { type: "edice", roomX: 5, roomY: 1, roomZ: 0, direction: 4 },
    ],
  },
};

export default meta;

export const Primary = {};

//

interface RoomFloorFurni extends RoomPosition {
  type?: string;
  id?: string | number;
  direction: number;
  animation?: string;
}
