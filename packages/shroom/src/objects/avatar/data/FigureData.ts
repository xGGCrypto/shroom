
import { notNullOrUndefined } from "../../../util/notNullOrUndefined";
import { AvatarData } from "./AvatarData";
import { FigureDataPart, IFigureData } from "./interfaces/IFigureData";
import { getRequiredAttribute, getOptionalAttribute } from "./xmlUtils";

const _getColorKey = (paletteId: string, colorId: string) => {
  return `${paletteId}_${colorId}`;
};

const _getPartsKey = (setType: string, id: string) => {
  return `${setType}_${id}`;
};

export class FigureData extends AvatarData implements IFigureData {
  private _parts: Map<string, FigureDataPart[]> = new Map();
  private _paletteIdForSetType = new Map<string, string>();
  private _colors = new Map<string, string>();
  private _hiddenLayers = new Map<string, string[]>();

  constructor(xml: string) {
    super(xml);

    this._cacheData();
  }

  static async fromUrl(url: string) {
    const response = await fetch(url);
    const text = await response.text();

    return new FigureData(text);
  }

  getColor(setType: string, colorId: string): string | undefined {
    const paletteId = this._paletteIdForSetType.get(setType);
    if (paletteId == null) return;

    return this._colors.get(_getColorKey(paletteId, colorId));
  }

  getParts(setType: string, id: string): FigureDataPart[] | undefined {
    return this._parts.get(_getPartsKey(setType, id));
  }

  getHiddenLayers(setType: string, id: string): string[] {
    return this._hiddenLayers.get(_getPartsKey(setType, id)) ?? [];
  }

  private _cacheData() {
    const setTypes = this.querySelectorAll("sets settype");
    const palettes = this.querySelectorAll("colors palette");

    palettes.forEach((palette) => {
      const paletteId = palette.getAttribute("id");
      if (paletteId == null) return;

      const colors = Array.from(palette.querySelectorAll("color"));
      colors.forEach((color) => {
        const colorId = color.getAttribute("id");

        if (colorId != null) {
          this._colors.set(_getColorKey(paletteId, colorId), color.innerHTML);
        }
      });
    });

    // Use xmlUtils for attribute extraction and error handling
    // Import at top: import { getRequiredAttribute, getOptionalAttribute } from "./xmlUtils";
    // (Assume import is present)
    const { getRequiredAttribute, getOptionalAttribute } = require("./xmlUtils");

    setTypes.forEach((element) => {
      const setType = getRequiredAttribute(element, "type");
      const paletteId = getOptionalAttribute(element, "paletteid");

      const sets = this.querySelectorAll("set");

      if (paletteId != null) {
        this._paletteIdForSetType.set(setType, paletteId);
      }

      sets.forEach((set) => {
        const setId = getRequiredAttribute(set, "id");

        const parts = Array.from(set.querySelectorAll("part"));
        const partArr: FigureDataPart[] = [];

        const hiddenLayers: string[] = [];
        set
          .querySelectorAll(`hiddenlayers layer`)
          .forEach((hiddenLayerElement) => {
            const partType = getOptionalAttribute(hiddenLayerElement, "parttype");
            if (partType != null) {
              hiddenLayers.push(partType);
            }
          });

        this._hiddenLayers.set(_getPartsKey(setType, setId), hiddenLayers);

        parts
          .map((part) => {
            const id = getRequiredAttribute(part, "id");
            const type = getRequiredAttribute(part, "type");
            const colorable = getOptionalAttribute(part, "colorable");
            let index = Number(getOptionalAttribute(part, "index"));

            if (isNaN(index)) {
              index = 0;
            }

            return {
              id,
              type,
              colorable: colorable === "1" ? true : false,
              index,
            };
          })
          .forEach((part) => {
            partArr.push(part);
          });

        this._parts.set(_getPartsKey(setType, setId), partArr);
      });
    });
  }
}
