import { MaskNode } from "../../interfaces/IRoomVisualization";
import { IFurnitureRoomVisualization } from "./BaseFurniture";
import { ShroomContainer } from "../../pixi-proxy";
export class FurnitureRoomVisualization implements IFurnitureRoomVisualization {
  constructor(private _container: ShroomContainer) {}

  public get container() {
    return this._container;
  }

  static fromContainer(container: ShroomContainer) {
    return new FurnitureRoomVisualization(container);
  }

  addMask(): MaskNode {
    return {
      remove: () => {
        // Do nothing
      },
      update: () => {
        // Do nothing
      },
      sprite: null as any,
    };
  }
}
