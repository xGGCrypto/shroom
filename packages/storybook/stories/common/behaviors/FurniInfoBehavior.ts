import {
  IFurnitureBehavior,
  IFurniture,
  IFurnitureData,
} from "@xggcrypto/shroom";

import { action } from "@storybook/addon-actions";

export class FurniInfoBehavior implements IFurnitureBehavior {
  private parent: IFurniture | undefined;

  constructor(private furnitureData: IFurnitureData) {}

  setParent(furniture: IFurniture): void {
    this.parent = furniture;
    this.parent.onClick = async (e) => {
      const info = await this.furnitureData.getInfoForFurniture(furniture);

      action("onClick")(e, info);
    };
  }
}
