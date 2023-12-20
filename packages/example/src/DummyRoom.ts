import {
  Avatar,
  Room,
  parseTileMapString,
  loadRoomTexture,
  FloorFurniture,
  FurnitureData,
  WallFurniture,
  Shroom,
  Pathfinding,
  RoomCamera,
} from "@tetreum/shroom";

import {
  DiceBehavior,
  FurniInfoBehavior,
  MultiStateBehavior,
} from "./behaviors";

export class DummyRoom {
  private room: Room;
  private ownAvatar: Avatar;
  private path: {
    roomX: number;
    roomY: number;
    roomZ: number;
    direction: number | undefined;
  }[] = [];
  private pathfinder?: Pathfinding;
  private grid: number[][];

  private roomTick = setInterval(() => {
    const next = this.path[0];

    if (next != null) {
      this.ownAvatar.walk(next.roomX, next.roomY, next.roomZ, {
        direction: next.direction,
      });

      this.path.shift();
    }
  }, 500);

  constructor(application: PIXI.Application) {
    const tilemap = parseTileMapString(`
        xxxxxxxxxxx
        x1111111111
        x1111111111
        x1111111111
        11111111111
        x1111111111
        x1111111111
        x0000000000
        x0000000000
        x0000000000
        x0000000000
    `);

    this.grid = tilemap.map((row) =>
      row.map((type) => (type !== "x" ? Number(type) : -1))
    );

    const resourcePath = process.env.resourcePath ?? "./resources";
    const furnitureData = FurnitureData.create(resourcePath);

    const shroom = Shroom.create({
      application,
      resourcePath: resourcePath,
      furnitureData,
    });

    this.room = Room.create(shroom, {
      tilemap: tilemap,
    });

    this.pathfinder = new Pathfinding(this.room, tilemap, furnitureData);

    const partyFloor = [
      { roomX: 1, roomY: 1, roomZ: 1 },
      { roomX: 3, roomY: 1, roomZ: 1 },
      { roomX: 5, roomY: 1, roomZ: 1 },
      { roomX: 7, roomY: 1, roomZ: 1 },
      { roomX: 9, roomY: 1, roomZ: 1 },
      //
      { roomX: 1, roomY: 3, roomZ: 1 },
      { roomX: 3, roomY: 3, roomZ: 1 },
      { roomX: 5, roomY: 3, roomZ: 1 },
      { roomX: 7, roomY: 3, roomZ: 1 },
      { roomX: 9, roomY: 3, roomZ: 1 },
      //
      { roomX: 1, roomY: 5, roomZ: 1 },
      { roomX: 3, roomY: 5, roomZ: 1 },
      { roomX: 5, roomY: 5, roomZ: 1 },
      { roomX: 7, roomY: 5, roomZ: 1 },
      { roomX: 9, roomY: 5, roomZ: 1 },
    ];

    partyFloor.forEach((pos) => {
      this.room.addRoomObject(
        new FloorFurniture({
          roomX: pos.roomX,
          roomY: pos.roomY,
          roomZ: pos.roomZ,
          direction: 0,
          type: "party_floor",
          animation: "0",
          behaviors: [new MultiStateBehavior({ initialState: 1, count: 10 })],
        })
      );
    });

    this.room.addRoomObject(
      new FloorFurniture({
        roomX: 1,
        roomY: 1,
        roomZ: 1,
        direction: 0,
        type: "edicehc",
        behaviors: [new DiceBehavior(), new FurniInfoBehavior(furnitureData)],
      })
    );

    this.room.addRoomObject(
      new FloorFurniture({
        roomX: 1,
        roomY: 2,
        roomZ: 1,
        direction: 0,
        type: "throne",
        animation: "0",
        behaviors: [],
      })
    );

    // this.room.addRoomObject(
    //   new FloorFurniture({
    //     roomX: 1,
    //     roomY: 1,
    //     roomZ: 1,
    //     direction: 2,
    //     type: "party_ravel",
    //     animation: "0",
    //     behaviors: [new MultiStateBehavior({ initialState: 0, count: 2 })],
    //   })
    // );

    this.room.addRoomObject(
      new WallFurniture({
        roomX: 1,
        roomY: 9,
        direction: 2,
        type: "window_basic",
        animation: "0",
        offsetX: 0,
        offsetY: 10,
      })
    );

    this.room.floorTexture = loadRoomTexture("./assets/tile.png");

    this.room.onTileClick = async (position) => {
      this.ownAvatar.clearMovement();

      const avatarPos = {
        roomX: this.ownAvatar.roomX,
        roomY: this.ownAvatar.roomY,
        roomZ: this.ownAvatar.roomZ,
      };

      if (!this.pathfinder) throw new Error("PathFinder not found.");
      const path = await this.pathfinder?.findPath(avatarPos, position);
      this.path = path;
    };

    this.ownAvatar = new Avatar({
      look: "hd-605-2.hr-3012-45.ch-645-109.lg-720-63.sh-725-92.wa-2001-62",
      direction: 2,
      roomX: 3,
      roomY: 1,
      roomZ: 1,
    });

    this.ownAvatar.onClick = (event) => {
      event.stopPropagation();
      this.ownAvatar.waving = true;
      setTimeout(() => {
        this.ownAvatar.waving = false;
      }, 300);
    };

    this.room.addRoomObject(this.ownAvatar);

    this.room.x = application.screen.width / 2 - this.room.roomWidth / 2;
    this.room.y = application.screen.height / 2 - this.room.roomHeight / 2;

    application.stage.addChild(RoomCamera.forScreen(this.room));
  }

  private handleRoomTick() {}
}
