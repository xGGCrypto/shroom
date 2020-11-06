import { RoomObject } from "../../RoomObject";
import * as PIXI from "pixi.js";
import { AvatarLoaderResult } from "../../IAvatarLoader";
import { AvatarDrawPart, PrimaryAction } from "./util/getAvatarDrawDefinition";
import { getZOrder } from "../../util/getZOrder";
import { avatarFrames } from "./util/avatarFrames";
import { LookOptions } from "./util/createLookServer";

interface Options {
  look: LookOptions;
  position: { x: number; y: number };
  zIndex: number;
}

export class AvatarSprites extends RoomObject {
  private container: PIXI.Container | undefined;
  private avatarLoaderResult: AvatarLoaderResult | undefined;
  private currentFrame: number = 0;
  private mirrored: boolean = true;
  private frame: number = 0;

  private lookOptions: LookOptions;

  private x: number = 0;
  private y: number = 0;

  constructor(private options: Options) {
    super();

    this.x = this.options.position.x;
    this.y = this.options.position.y;
    this.lookOptions = options.look;
  }

  setLook(options: LookOptions) {
    this.lookOptions = options;
    this.updateSprites();
  }

  setPosition(x: number, y: number) {
    let offset = 0;

    if (this.mirrored) {
      offset += 64;
    }

    this.x = x + offset;
    this.y = y;
    this.updatePosition();
  }

  private updatePosition() {
    if (this.container == null) return;

    this.container.x = this.x;
    this.container.y = this.y + 16;
  }

  setCurrentFrame(globalFrame: number) {
    this.frame = globalFrame;
    this.updateSprites();
  }

  private updateSprites() {
    if (this.avatarLoaderResult == null) return;

    const { zIndex } = this.options;

    this.container?.destroy();

    this.container = new PIXI.Container();

    this.container.zIndex = zIndex;

    const definition = this.avatarLoaderResult.getDrawDefinition(
      this.lookOptions
    );

    this.mirrored = definition.mirrorHorizontal;
    this.updatePosition();

    this.container.scale = new PIXI.Point(
      definition.mirrorHorizontal ? -1 : 1,
      1
    );

    definition.parts.forEach((part) => {
      const asset = this.createAsset(part);
      if (asset == null) return;

      this.container?.addChild(asset);
    });

    this.visualization.addContainerChild(this.container);
  }

  private createAsset(part: AvatarDrawPart) {
    if (this.avatarLoaderResult == null)
      throw new Error(
        "Cant create asset when avatar loader result not present"
      );
    const texture = this.avatarLoaderResult.getTexture(part.fileId);

    if (texture == null) return;

    const sprite = new PIXI.Sprite();
    sprite.texture = texture;

    sprite.x = part.x;
    sprite.y = part.y;

    if (part.color != null && part.mode === "colored") {
      sprite.tint = parseInt(part.color.slice(1), 16);
    }

    return sprite;
  }

  private fetchLook(look: string) {
    this.avatarLoader.getAvatarDrawDefinition(look).then((result) => {
      this.avatarLoaderResult = result;
      this.updateSprites();
    });

    this.updateSprites();
  }

  registered(): void {
    this.fetchLook(this.lookOptions.look);
  }

  destroy(): void {
    this.container?.destroy();
  }
}
