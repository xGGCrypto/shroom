import {
  ShroomColorMatrixFilter,
  ShroomSprite,
  ShroomRenderer,
  ShroomRenderTexture,
  ShroomContainer,
} from "../../pixi-proxy";
// import { Room } from "./Room";

const negativeFilter = new ShroomColorMatrixFilter();
negativeFilter.negative(false);

/**
 * This class enables us to create a mask which
 * consists of multiple different sprites.
 *
 * This is important for correctly displaying
 * window furniture with landscapes.
 *
 * Windows usually provide a black mask image. This mask image is used
 * to only display the landscape in the area of the mask image.
 *
 * Since there can be multiple windows, and because of that multiple masks,
 * we need a sprite which is able to combine multiple sprites into a single
 * sprite.
 *
 * This Sprite renders its sub-sprites through `ShroomRenderTexture`
 * into a single texture, and uses that as a texture for itself.
 */
export class RoomLandscapeMaskSprite extends ShroomSprite {
  private _sprites: Set<ShroomSprite> = new Set();
  private _roomWidth: number;
  private _roomHeight: number;
  private _renderer: ShroomRenderer;
  private _roomBounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };

  constructor({
    roomBounds,
    renderer,
  }: {
    roomBounds: { minX: number; minY: number; maxX: number; maxY: number };
    renderer: ShroomRenderer;
  }) {
    super();
    this._roomBounds = roomBounds;
    this._roomWidth = roomBounds.maxX - roomBounds.minX;
    this._roomHeight = roomBounds.maxY - roomBounds.minY;
    this._renderer = renderer;
  }

  addSprite(element: ShroomSprite) {
    this._sprites.add(element);
    this._updateTexture();
  }

  updateSprite(element: ShroomSprite) {
    if (!this._sprites.has(element)) return;

    this._updateTexture();
  }

  removeSprite(element: ShroomSprite) {
    this._sprites.delete(element);
    this._updateTexture();
  }

  private _updateTexture() {
    const texture = ShroomRenderTexture.create({
      width: this._roomWidth * 2,
      height: this._roomHeight,
    });

    const container = new ShroomContainer();
    this._sprites.forEach((sprite) => {
      // We apply a negative filter to the mask sprite, because the mask assets
      // of the furniture are usually completly black. `pixi.js` requires white
      // images to mask an image.
      sprite.filters = [negativeFilter];
      container.addChild(sprite);
    });

    container.y = -this._roomBounds.minY;
    this.y = this._roomBounds.minY;

    container.x = -this._roomBounds.minX;
    this.x = this._roomBounds.minX;

    this._renderer.render(container, texture);

    this.texture = texture;
  }
}
