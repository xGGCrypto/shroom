import * as PIXI from "pixi.js";

import { DummyRoom } from "./DummyRoom";

const view = document.querySelector("#root") as HTMLCanvasElement | undefined;
const container = document.querySelector("#container") as
  | HTMLDivElement
  | undefined;
if (view == null || container == null) throw new Error("Invalid view");

const application = new PIXI.Application({
  view,
  background: new PIXI.Color(0x000000).toArray(),
  antialias: false,
  resolution: window.devicePixelRatio,
  autoDensity: true,
  width: window.innerWidth,
  height: window.innerHeight,
});
(globalThis as any).__PIXI_APP__ = application;

PIXI.BaseTexture.defaultOptions.scaleMode = PIXI.SCALE_MODES.NEAREST;

new DummyRoom(application);
