import {
  Avatar,
  Room,
  parseTileMapString,
  loadRoomTexture,
  FloorFurniture,
  FurnitureData,
  WallFurniture,
  Shroom,
  Pathfinding
} from "@tetreum/shroom";

import { MultiStateBehavior } from "./behaviors/MultiStateBehavior";
import { DiceBehavior } from "./behaviors/DiceBehavior";
import { FurniInfoBehavior } from "./behaviors/FurniInfoBehavior";

// import PathFinding from '../../dist/objects/room/Pathfinding';

export class DummyRoom {
  private room: Room;
  private ownAvatar: Avatar;
  private path: {
    roomX: number;
    roomY: number;
    roomZ: number;
    direction: number | undefined;
  }[] = [];
  private grid: number[][];

  private roomTick = setInterval(() => {
    if (this.path?.length > 0) { this.handleAvatarMove(); }
  }, 500);

  private PathFinder: Pathfinding | undefined;

  constructor(application: PIXI.Application) {
    const tilemap = parseTileMapString(`
        1111111111
        1111111111
        1111111111
        1111111111
        111111xx00
        111111xx00
        000000xx00
        0000000000
        0000000000
        0000000000
    `);

    this.grid = tilemap.map((row) =>
      row.map((type) => (type !== "x" ? Number(type) : -1))
    );

    const resourceLink = "./resources";
    const furnitureData = FurnitureData.create(resourceLink);

    const shroom = Shroom.create({
      application,
      resourcePath: resourceLink,
      furnitureData,
    });

    this.room = Room.create(shroom, { tilemap: tilemap, });
    this.PathFinder = new Pathfinding(
      this.room as any,
      tilemap,
      furnitureData as any
    );


    this.room.addRoomObject(
      new FloorFurniture({
        roomX: 0,
        roomY: 0,
        roomZ: 1,
        direction: 0,
        type: "edicehc",
        behaviors: [new DiceBehavior(), new FurniInfoBehavior(furnitureData)],
      })
    );

    this.room.addRoomObject(
      new FloorFurniture({
        roomX: 0,
        roomY: 0,
        roomZ: 1,
        direction: 0,
        type: "party_floor",
        animation: "0",
        behaviors: [new MultiStateBehavior({ initialState: 1, count: 10 })],
      })
    );

    this.room.addRoomObject(
      new FloorFurniture({
        roomX: 2,
        roomY: 0,
        roomZ: 1,
        direction: 0,
        type: "party_floor",
        animation: "1",
        behaviors: [new MultiStateBehavior({ initialState: 1, count: 10 })],
      })
    );

    this.room.addRoomObject(
      new FloorFurniture({
        roomX: 4,
        roomY: 0,
        roomZ: 1,
        direction: 0,
        type: "party_floor",
        animation: "1",
        behaviors: [new MultiStateBehavior({ initialState: 1, count: 10 })],
      })
    );

    this.room.addRoomObject(
      new FloorFurniture({
        roomX: 6,
        roomY: 0,
        roomZ: 1,
        direction: 6,
        type: "party_floor",
        animation: "1",
        behaviors: [new MultiStateBehavior({ initialState: 1, count: 10 })],
      })
    );

    this.room.addRoomObject(
      new FloorFurniture({
        roomX: 8,
        roomY: 0,
        roomZ: 1,
        direction: 0,
        type: "party_floor",
        animation: "1",
        behaviors: [new MultiStateBehavior({ initialState: 1, count: 10 })],
      })
    );

    this.room.addRoomObject(
      new FloorFurniture({
        roomX: 8,
        roomY: 2,
        roomZ: 1,
        direction: 0,
        type: "party_floor",
        animation: "1",
        behaviors: [new MultiStateBehavior({ initialState: 1, count: 10 })],
      })
    );

    this.room.addRoomObject(
      new FloorFurniture({
        roomX: 6,
        roomY: 2,
        roomZ: 1,
        direction: 0,
        type: "party_floor",
        animation: "1",
        behaviors: [],
      })
    );

    this.room.addRoomObject(
      new FloorFurniture({
        roomX: 0,
        roomY: 2,
        roomZ: 1,
        direction: 0,
        type: "party_floor",
        animation: "1",
        behaviors: [],
      })
    );

    this.room.addRoomObject(
      new FloorFurniture({
        roomX: 2,
        roomY: 2,
        roomZ: 1,
        direction: 0,
        type: "party_floor",
        animation: "1",
        behaviors: [],
      })
    );

    this.room.addRoomObject(
      new FloorFurniture({
        roomX: 4,
        roomY: 2,
        roomZ: 1,
        direction: 0,
        type: "party_floor",
        animation: "1",
        behaviors: [],
      })
    );

    this.room.addRoomObject(
      new FloorFurniture({
        roomX: 0,
        roomY: 4,
        roomZ: 1,
        direction: 0,
        type: "party_floor",
        animation: "1",
        behaviors: [],
      })
    );

    this.room.addRoomObject(
      new FloorFurniture({
        roomX: 2,
        roomY: 4,
        roomZ: 1,
        direction: 0,
        type: "party_floor",
        animation: "1",
        behaviors: [],
      })
    );

    this.room.addRoomObject(
      new FloorFurniture({
        roomX: 4,
        roomY: 4,
        roomZ: 1,
        direction: 0,
        type: "party_floor",
        animation: "1",
        behaviors: [],
      })
    );

    this.room.addRoomObject(
      new FloorFurniture({
        roomX: 0,
        roomY: 1,
        roomZ: 1,
        direction: 0,
        type: "throne",
        animation: "0",
        behaviors: [],
      })
    );

    this.room.addRoomObject(
      new FloorFurniture({
        roomX: 1,
        roomY: 0,
        roomZ: 1,
        direction: 2,
        type: "party_ravel",
        animation: "0",
        behaviors: [new MultiStateBehavior({ initialState: 0, count: 2 })],
      })
    );

    // this.room.addRoomObject(
    //   new WallFurniture({
    //     roomX: 0,
    //     roomY: 0,
    //     // roomZ: 1,
    //     direction: 2,
    //     type: "window_basic",
    //     animation: "0",
    //     // behaviors: [new FurniInfoBehavior(furnitureData)],
    //   })
    // );

    this.room.floorTexture = loadRoomTexture("./tile.png");

    this.room.onTileClick = async (position) => {
      this.ownAvatar.clearMovement();

      const origin = {
        roomX: this.ownAvatar.roomX,
        roomY: this.ownAvatar.roomY,
        roomZ: this.ownAvatar.roomZ
      };

      const path = await this.PathFinder?.findPath(origin, position);
      if (!path) return undefined;

      this.path = path;
    };

    this.ownAvatar = new Avatar({
      look: "hd-605-2.hr-3012-45.ch-645-109.lg-720-63.sh-725-92.wa-2001-62",
      direction: 2,
      roomX: 3,
      roomY: 0,
      roomZ: 1,
    });

    this.ownAvatar.onClick = (event) => { event.stopPropagation(); };

    this.room.addRoomObject(this.ownAvatar);

    this.room.x = application.screen.width / 2 - this.room.roomWidth / 2;
    this.room.y = application.screen.height / 2 - this.room.roomHeight / 2;

    application.stage.addChild(this.room);
  }

  private handleRoomTick() { }

  private handleAvatarMove() {
    if (!this.path) return;
    const next = this.path.shift();

    if (next != undefined) {
      this.avatarWalk(this.ownAvatar, next.roomX, next.roomY, next.roomZ, { direction: next.direction, });
    }

  }

  private avatarWalk(avatar: Avatar, roomX: number, roomY: number, roomZ: number, options: { direction?: number }) {
    avatar.walk(roomX, roomY, roomZ, options);
  }
}