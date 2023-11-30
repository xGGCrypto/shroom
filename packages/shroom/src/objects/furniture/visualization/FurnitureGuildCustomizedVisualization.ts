import { getIntFromHex } from "../../../util/getIntFromHex";
import {
  IFurnitureVisualizationLayer,
  IFurnitureVisualizationView,
} from "../IFurnitureVisualizationView";
import { FurniDrawPart } from "../util/DrawDefinition";
import { AnimatedFurnitureVisualization } from "./AnimatedFurnitureVisualization";
import { FurnitureVisualization } from "./FurnitureVisualization";

export class FurnitureGuildCustomizedVisualization extends FurnitureVisualization {
  private static readonly PRIMARY_COLOR_TAG = "COLOR1";
  private static readonly SECONDARY_COLOR_TAG = "COLOR2";

  private _base: AnimatedFurnitureVisualization = new AnimatedFurnitureVisualization();

  private _primaryColor: string | undefined;
  private _secondaryColor: string | undefined;

  private _refreshModifier = false;

  constructor(
    options: { primaryColor?: string; secondaryColor?: string } = {}
  ) {
    super();

    this.primaryColor = this._normalizeColor(options.primaryColor);
    this.secondaryColor = this._normalizeColor(options.secondaryColor);
  }

  public get primaryColor() {
    return this._primaryColor;
  }

  public set primaryColor(value) {
    this._primaryColor = value;
    this._refreshModifier = true;
  }

  public get secondaryColor() {
    return this._secondaryColor;
  }

  public set secondaryColor(value) {
    this._secondaryColor = value;
    this._refreshModifier = true;
  }

  isAnimated(): boolean {
    return true;
  }

  update(): void {
    this._base.update();
  }

  setView(view: IFurnitureVisualizationView) {
    super.setView(view);
    this._base.setView(view);
  }

  destroy(): void {
    this._base.destroy();
  }

  updateFrame(frame: number): void {
    if (this._refreshModifier) {
      this._refreshModifier = false;
      this._updateModifier();
    }

    this._base.updateFrame(frame);
  }

  updateDirection(direction: number): void {
    this._base.updateDirection(direction);
  }

  updateAnimation(animation: string): void {
    this._base.updateAnimation(animation);
  }

  private _updateModifier() {
    this._base.modifier = (part) => {
      return this._modifyPart(part);
    };
  }

  private _normalizeColor(color?: string) {
    if (color == null || color.length === 0) {
      return undefined;
    }

    if (color[0] === "#") {
      return color.slice(1);
    }

    return color;
  }

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
