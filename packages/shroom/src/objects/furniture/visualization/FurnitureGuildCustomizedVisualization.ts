import { getIntFromHex } from "../../../util/getIntFromHex";
import {
  IFurnitureVisualizationLayer,
  IFurnitureVisualizationView,
} from "../IFurnitureVisualizationView";
import { FurniDrawPart } from "../util/DrawDefinition";
import { AnimatedFurnitureVisualization } from "./AnimatedFurnitureVisualization";
import { FurnitureVisualization } from "./FurnitureVisualization";

/**
 * FurnitureGuildCustomizedVisualization provides custom color logic for guild furniture objects.
 * Allows primary and secondary color customization using tags and a modifier function.
 *
 * @category FurnitureVisualization
 */
export class FurnitureGuildCustomizedVisualization extends FurnitureVisualization {
  private static readonly PRIMARY_COLOR_TAG = "COLOR1";
  private static readonly SECONDARY_COLOR_TAG = "COLOR2";

  /** Internal animated visualization for handling frame logic. */
  private _base: AnimatedFurnitureVisualization = new AnimatedFurnitureVisualization();
  /** The current primary color (hex string, no #). */
  private _primaryColor: string | undefined;
  /** The current secondary color (hex string, no #). */
  private _secondaryColor: string | undefined;
  /** Whether the modifier needs to be refreshed. */
  private _refreshModifier = false;

  /**
   * Creates a new FurnitureGuildCustomizedVisualization.
   * @param options Optional primary and secondary color values
   */
  constructor(
    options: { primaryColor?: string; secondaryColor?: string } = {}
  ) {
    super();
    this.primaryColor = this._normalizeColor(options.primaryColor);
    this.secondaryColor = this._normalizeColor(options.secondaryColor);
  }

  /**
   * Gets or sets the primary color (hex string, no #).
   */
  public get primaryColor() {
    return this._primaryColor;
  }
  public set primaryColor(value) {
    this._primaryColor = value;
    this._refreshModifier = true;
  }

  /**
   * Gets or sets the secondary color (hex string, no #).
   */
  public get secondaryColor() {
    return this._secondaryColor;
  }
  public set secondaryColor(value) {
    this._secondaryColor = value;
    this._refreshModifier = true;
  }

  /**
   * Returns true if this visualization is animated.
   */
  isAnimated(): boolean {
    return true;
  }

  /**
   * Updates the visualization display.
   */
  update(): void {
    this._base.update();
  }

  /**
   * Sets the view for this visualization and its internal base.
   * @param view The visualization view
   */
  setView(view: IFurnitureVisualizationView) {
    super.setView(view);
    this._base.setView(view);
  }

  /**
   * Destroys the visualization and cleans up resources.
   */
  destroy(): void {
    this._base.destroy();
  }

  /**
   * Updates the animation frame, refreshing the modifier if needed.
   * @param frame The current frame number
   */
  updateFrame(frame: number): void {
    if (this._refreshModifier) {
      this._refreshModifier = false;
      this._updateModifier();
    }
    this._base.updateFrame(frame);
  }

  /**
   * Updates the direction for rendering.
   * @param direction The new direction
   */
  updateDirection(direction: number): void {
    this._base.updateDirection(direction);
  }

  /**
   * Updates the animation id for rendering.
   * @param animation The new animation id
   */
  updateAnimation(animation: string): void {
    this._base.updateAnimation(animation);
  }

  /**
   * Updates the modifier function for color customization.
   */
  private _updateModifier() {
    this._base.modifier = (part) => {
      return this._modifyPart(part);
    };
  }

  /**
   * Normalizes a color string to remove the # prefix, if present.
   * @param color The color string (with or without #)
   * @returns The normalized color string (no #)
   */
  private _normalizeColor(color?: string) {
    if (color == null || color.length === 0) {
      return undefined;
    }
    if (color[0] === "#") {
      return color.slice(1);
    }
    return color;
  }

  /**
   * Modifies a visualization part to apply primary/secondary color if tagged.
   * @param part The visualization layer part
   * @returns The modified part
   */
  private _modifyPart(
    part: IFurnitureVisualizationLayer
  ): IFurnitureVisualizationLayer {
    switch (part.tag) {
      case FurnitureGuildCustomizedVisualization.PRIMARY_COLOR_TAG:
        if (this._primaryColor != null) {
          part.setColor(getIntFromHex(this._primaryColor));
        }
        break;
      case FurnitureGuildCustomizedVisualization.SECONDARY_COLOR_TAG:
        if (this._secondaryColor != null) {
          part.setColor(getIntFromHex(this._secondaryColor));
        }
        break;
    }
    return part;
  }
}
