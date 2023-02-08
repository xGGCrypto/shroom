import * as PIXI from "pixi.js";

import {
  Room,
  Avatar,
  FloorFurniture,
  RoomCamera,
  Shroom,
  loadRoomTexture,
} from "@tetreum/shroom";

import { DummyRoom } from "./DummyRoom";

const view = document.querySelector("#root") as HTMLCanvasElement | undefined;
const container = document.querySelector("#container") as
  | HTMLDivElement
  | undefined;
if (view == null || container == null) throw new Error("Invalid view");

const application = new PIXI.Application({
  view,
  antialias: false,
  resolution: window.devicePixelRatio,
  autoDensity: true,
  width: 1200,
  height: 900,
  backgroundColor: 0x000000,
});

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
const dummy = new DummyRoom(application);