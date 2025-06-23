import { AvatarAction } from "../enum/AvatarAction";
import {
  IAvatarActionsData,
  AvatarActionInfo,
} from "./interfaces/IAvatarActionsData";
import { actionsXml } from "./static/actions.xml";
import { getRequiredAttribute, getOptionalAttribute } from "./xmlUtils";

/**
 * Provides access to avatar action definitions and hand item mappings.
 * Parses XML action data and exposes lookup methods for actions and hand items.
 */
export class AvatarActionsData implements IAvatarActionsData {
  private _map = new Map<string, AvatarActionInfo>();
  private _handItems = new Map<string, number>();

  /**
   * Parses the given XML string and populates the action and hand item maps.
   * @param xml XML string containing action definitions.
   */
  constructor(xml: string) {
    const document = new DOMParser().parseFromString(xml, "text/xml");
    document.querySelectorAll(`action`).forEach((action) => {
      const actionId = getRequiredAttribute(action, "id");
      const info = getAvatarActionInfoFromElement(action);
      this._map.set(actionId, info);
      action.querySelectorAll(`param`).forEach((param) => {
        const paramId = getRequiredAttribute(param, "id");
        const value = Number(getOptionalAttribute(param, "value"));
        if (isNaN(value)) return;
        this._handItems.set(`${actionId}_${paramId}`, value);
      });
    });
  }

  /**
   * Loads action data from a URL and returns a new instance.
   * @param url URL to fetch XML from.
   */
  static async fromUrl(url: string) {
    const response = await fetch(url);
    const text = await response.text();
    return new AvatarActionsData(text);
  }

  /**
   * Returns a default instance using the built-in actions XML.
   */
  static default() {
    return new AvatarActionsData(atob(actionsXml));
  }

  /**
   * Returns the hand item ID for a given action and parameter, if present.
   * @param actionId Action identifier.
   * @param id Parameter identifier.
   */
  getHandItemId(actionId: string, id: string): number | undefined {
    return this._handItems.get(`${actionId}_${id}`);
  }

  /**
   * Returns all parsed action definitions.
   */
  getActions(): AvatarActionInfo[] {
    return Array.from(this._map.values());
  }

  /**
   * Returns the action info for a given action ID, if present.
   * @param id Action identifier.
   */
  getAction(id: AvatarAction): AvatarActionInfo | undefined {
    return this._map.get(id);
  }
}

/**
 * Extracts an AvatarActionInfo object from an XML element.
 * @param action XML element representing an action.
 */
function getAvatarActionInfoFromElement(action: Element) {
  const id = getRequiredAttribute(action, "id");
  const state = getRequiredAttribute(action, "state");
  const precedenceString = getRequiredAttribute(action, "precedence");
  const geometrytype = getRequiredAttribute(action, "geometrytype");
  // AvatarActionInfo expects string | null, not undefined
  const activepartset = getOptionalAttribute(action, "activepartset") ?? null;
  const assetpartdefinition = getRequiredAttribute(action, "assetpartdefinition");
  const preventsString = getOptionalAttribute(action, "prevents");
  const animation = getOptionalAttribute(action, "animation");
  const main = getOptionalAttribute(action, "main");
  const isdefault = getOptionalAttribute(action, "isdefault");

  const prevents = preventsString?.split(",") ?? [];
  const precedence = Number(precedenceString);
  if (isNaN(precedence)) throw new Error("Invalid precedence");
  return {
    id,
    state,
    precedence,
    geometrytype,
    activepartset,
    assetpartdefinition,
    prevents,
    animation: animation === "1",
    main: main === "1",
    isdefault: isdefault === "1",
  };
}
