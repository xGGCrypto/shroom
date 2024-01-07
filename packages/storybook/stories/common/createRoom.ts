import { Shroom, Room, loadRoomTexture } from "@xggcrypto/shroom";
import {
  Application as PixiApplication,
  Texture as PixiTexture,
} from "pixi.js";

import tile2 from "../assets/tile2.png";
import tile1 from "../assets/tile.png";

interface RoomCreatorOptions {
  centerRoom: boolean;
  customTile?: CustomTextures;
  customWall?: CustomTextures;
}

interface CustomTextures {
  enabled: boolean; // Enable custom textures
  texture?: PixiTexture; // Image of the texture
  default?: "tile1" | "tile2";
}

export class RoomCreator {
  static createRoom(
    shroom: Shroom,
    application: PixiApplication,
    tilemap: string,
    options: RoomCreatorOptions = { centerRoom: true }
  ) {
    const { customTile, centerRoom, customWall } = options;
    if (!tilemap) throw new Error("tilemap is required");
    const room = Room.create(shroom, { tilemap });

    if (centerRoom) {
      room.x = application.screen.width / 2 - room.roomWidth / 2;
      room.y = application.screen.height / 2 - room.roomHeight / 2;
    }

    const tile = customTile?.default === "tile1" ? tile1 : tile2;
    // Load custom textures
    if (customTile?.enabled) {
      room.floorTexture = customTile.texture ?? loadRoomTexture(tile);
    }

    if (customWall?.enabled) {
      room.wallTexture = customWall.texture ?? loadRoomTexture(tile);
    }

    return room;
  }

  static parseTilemapArr(arr: string[]) {
    return arr.join("\n");
  }
}
