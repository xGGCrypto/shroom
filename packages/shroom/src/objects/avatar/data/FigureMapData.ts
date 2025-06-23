import { AvatarData } from "./AvatarData";
import { IFigureMapData } from "./interfaces/IFigureMapData";
import { getRequiredAttribute } from "./xmlUtils";

function _getLibraryForPartKey(id: string, type: string) {
  return `${id}_${type}`;
}

export class FigureMapData extends AvatarData implements IFigureMapData {
  private _libraryForPartMap = new Map<string, string>();
  private _allLibraries: string[] = [];

  constructor(xml: string) {
    super(xml);
    this._cacheData();
  }

  static async fromUrl(url: string) {
    const response = await fetch(url);
    const text = await response.text();

    return new FigureMapData(text);
  }

  getLibraryOfPart(id: string, type: string): string | undefined {
    const typeProcessed = type === "hrb" ? "hr" : type;

    return this._libraryForPartMap.get(
      _getLibraryForPartKey(id, typeProcessed)
    );
  }

  getLibraries(): string[] {
    return this._allLibraries;
  }

  private _cacheData() {
    const allLibraries = this.querySelectorAll(`lib`);

    allLibraries.forEach((element) => {
      const libraryId = getRequiredAttribute(element, "id");
      this._allLibraries.push(libraryId);

      const parts = Array.from(element.querySelectorAll("part"));
      parts.forEach((part) => {
        const partId = getRequiredAttribute(part, "id");
        const partType = getRequiredAttribute(part, "type");
        this._libraryForPartMap.set(
          _getLibraryForPartKey(partId, partType),
          libraryId
        );
      });
    });
  }
}
