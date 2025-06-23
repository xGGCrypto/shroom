import { HitSprite } from "../hitdetection/HitSprite";

/**
 * FurnitureSprite represents a single visual sprite for a furniture object, supporting base and offset positioning.
 * It extends HitSprite to provide hit detection and event support for interactive furniture layers.
 *
 * @category Furniture
 */
export class FurnitureSprite extends HitSprite {
  /** The base X position of the sprite (room coordinates). */
  private _baseX = 0;
  /** The base Y position of the sprite (room coordinates). */
  private _baseY = 0;
  /** The base Z-index of the sprite (for stacking order). */
  private _baseZIndex = 0;

  /** The X offset relative to the base position. */
  private _offsetX = 0;
  /** The Y offset relative to the base position. */
  private _offsetY = 0;
  /** The Z-index offset relative to the base Z-index. */
  private _offsetZIndex = 0;

  /** The asset name associated with this sprite, if any. */
  private _assetName: string | undefined;

  /**
   * Gets the X offset relative to the base position.
   */
  public get offsetX() {
    return this._offsetX;
  }

  /**
   * Sets the X offset and updates the sprite's position.
   */
  public set offsetX(value) {
    this._offsetX = value;
    this._update();
  }

  /**
   * Gets the Y offset relative to the base position.
   */
  public get offsetY() {
    return this._offsetY;
  }

  /**
   * Sets the Y offset and updates the sprite's position.
   */
  public set offsetY(value) {
    this._offsetY = value;
    this._update();
  }

  /**
   * Gets the Z-index offset relative to the base Z-index.
   */
  public get offsetZIndex() {
    return this._offsetZIndex;
  }

  /**
   * Sets the Z-index offset and updates the sprite's stacking order.
   */
  public set offsetZIndex(value) {
    this._offsetZIndex = value;
    this._update();
  }

  /**
   * Gets the base X position of the sprite.
   */
  public get baseX() {
    return this._baseX;
  }

  /**
   * Sets the base X position and updates the sprite's position.
   */
  public set baseX(value) {
    this._baseX = value;
    this._update();
  }

  /**
   * Gets the base Y position of the sprite.
   */
  public get baseY() {
    return this._baseY;
  }

  /**
   * Sets the base Y position and updates the sprite's position.
   */
  public set baseY(value) {
    this._baseY = value;
    this._update();
  }

  /**
   * Gets the base Z-index of the sprite.
   */
  public get baseZIndex() {
    return this._baseZIndex;
  }

  /**
   * Sets the base Z-index and updates the sprite's stacking order.
   */
  public set baseZIndex(value) {
    this._baseZIndex = value;
    this._update();
  }

  /**
   * Gets the asset name associated with this sprite, if any.
   */
  public get assetName() {
    return this._assetName;
  }

  /**
   * Sets the asset name associated with this sprite.
   */
  public set assetName(value) {
    this._assetName = value;
  }

  /**
   * Updates the sprite's position and stacking order based on base and offset values.
   * Called automatically when any relevant property changes.
   */
  private _update() {
    this.x = this.baseX + this.offsetX;
    this.y = this.baseY + this.offsetY;
    this.zIndex = this.baseZIndex + this.offsetZIndex;
  }
}
