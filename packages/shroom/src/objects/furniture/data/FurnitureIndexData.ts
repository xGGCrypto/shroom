import { FurnitureIndexJson } from "./FurnitureIndexJson";

/**
 * Parses and provides access to furniture index data (logic/visualization) from XML.
 */
export class FurnitureIndexData {
  private _visualization: string | undefined;
  private _logic: string | undefined;

  /**
   * Gets the visualization string, if present.
   */
  public get visualization() {
    return this._visualization;
  }

  /**
   * Gets the logic string, if present.
   */
  public get logic() {
    return this._logic;
  }

  /**
   * Constructs a FurnitureIndexData instance from XML.
   * @param xml - The XML string containing index data.
   */
  constructor(xml: string) {
    const document = new DOMParser().parseFromString(xml, "text/xml");
    const object = document.querySelector("object");

    this._visualization = object?.getAttribute("visualization") ?? undefined;
    this._logic = object?.getAttribute("logic") ?? undefined;
  }

  /**
   * Loads and parses furniture index data from a URL.
   * @param url - The URL to fetch the XML from.
   * @returns A promise resolving to a FurnitureIndexData instance.
   */
  static async fromUrl(url: string) {
    const response = await fetch(url);
    const text = await response.text();
    return new FurnitureIndexData(text);
  }

  /**
   * Converts the index data to a JSON object.
   * @returns A FurnitureIndexJson object.
   */
  toJson(): FurnitureIndexJson {
    return this.toObject();
  }

  /**
   * Converts the index data to a plain object.
   * @returns An object with visualization and logic fields.
   */
  toObject() {
    return { visualization: this.visualization, logic: this.logic };
  }

  /**
   * Checks if both logic and visualization are present.
   * @returns True if both are present, false otherwise.
   */
  hasLogicAndVisualization(): boolean {
    return !!(this._logic && this._visualization);
  }
}
