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
 * Sprite that combines multiple mask sprites into a single mask for landscape rendering.
 *
 * This is important for correctly displaying window furniture with landscapes.
 * Windows usually provide a black mask image. This mask image is used
 * to only display the landscape in the area of the mask image.
 *
 * Since there can be multiple windows, and because of that multiple masks,
 * we need a sprite which is able to combine multiple sprites into a single sprite.
 *
 * This Sprite renders its sub-sprites through `ShroomRenderTexture`
 * into a single texture, and uses that as a texture for itself.
 */
export class RoomLandscapeMaskSprite extends ShroomSprite {
  /** The set of sprites that make up the mask. */
  private _sprites: Set<ShroomSprite> = new Set();
  /** The width of the room in pixels. */
  private _roomWidth: number;
  /** The height of the room in pixels. */
  private _roomHeight: number;
  /** The renderer used to render the mask. */
  private _renderer: ShroomRenderer;
  /** The bounds of the room. */
  private _roomBounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };

  /**
   * Creates a new RoomLandscapeMaskSprite.
   * @param roomBounds The bounds of the room.
   * @param renderer The renderer to use for mask rendering.
   */
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

  /**
   * Adds a sprite to the mask and updates the combined texture.
   * @param element The sprite to add.
   */
  addSprite(element: ShroomSprite) {
    this._sprites.add(element);
    this._updateTexture();
  }

  /**
   * Updates a sprite in the mask (re-renders the mask if present).
   * @param element The sprite to update.
   */
  updateSprite(element: ShroomSprite) {
    if (!this._sprites.has(element)) return;
    this._updateTexture();
  }

  /**
   * Removes a sprite from the mask and updates the combined texture.
   * @param element The sprite to remove.
   */
  removeSprite(element: ShroomSprite) {
    this._sprites.delete(element);
    this._updateTexture();
  }

  /**
   * Updates the combined mask texture from all sprites.
   * Applies a negative filter to each mask sprite (Pixi.js requires white for masking).
   * @private
   */
  private _updateTexture() {
    const texture = ShroomRenderTexture.create({
      width: this._roomWidth * 2,
      height: this._roomHeight,
    });

    const container = new ShroomContainer();
    this._sprites.forEach((sprite) => {
      // We apply a negative filter to the mask sprite, because the mask assets
      // of the furniture are usually completely black. `pixi.js` requires white
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
