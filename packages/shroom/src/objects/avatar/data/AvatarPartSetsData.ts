import { AvatarData } from "./AvatarData";
import { IAvatarPartSetsData } from "./interfaces/IAvatarPartSetsData";
import { partsetsXml } from "./static/partsets.xml";
import { getOptionalAttribute, getRequiredAttribute } from "./xmlUtils";

export class AvatarPartSetsData
  extends AvatarData
  implements IAvatarPartSetsData {
  constructor(xml: string) {
    super(xml);
  }

  static async fromUrl(url: string) {
    const response = await fetch(url);
    const text = await response.text();

    return new AvatarPartSetsData(text);
  }

  static default() {
    return new AvatarPartSetsData(atob(partsetsXml));
  }

  getPartInfo(
    id: string
  ):
    | {
        removeSetType?: string | undefined;
        flippedSetType?: string | undefined;
      }
    | undefined {
    const element = this.querySelector(`partSet part[set-type="${id}"]`);
    if (element == null) return;
    return {
      flippedSetType: getOptionalAttribute(element, "flipped-set-type"),
      removeSetType: getOptionalAttribute(element, "remove-set-type"),
    };
  }

  getActivePartSet(id: string) {
    const partSet = this.querySelectorAll(
      `activePartSet[id="${id}"] activePart`
    );

    return new Set(
      partSet.map((value) => getRequiredAttribute(value, "set-type"))
    );
  }
}
