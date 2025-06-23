import { MaskNode } from "../../interfaces/IRoomVisualization";
import { IFurnitureRoomVisualization } from "./BaseFurniture";
import { ShroomContainer } from "../../pixi-proxy";
/**
 * FurnitureRoomVisualization provides a minimal implementation of IFurnitureRoomVisualization for furniture objects.
 * It wraps a ShroomContainer and provides a stub addMask method for compatibility with room visualization APIs.
 *
 * @category Furniture
 */
export class FurnitureRoomVisualization implements IFurnitureRoomVisualization {
  /**
   * Creates a new FurnitureRoomVisualization.
   * @param _container The container to use for visualization.
   */
  constructor(private _container: ShroomContainer) {}

  /**
   * Gets the container used for visualization.
   */
  public get container() {
    return this._container;
  }

  /**
   * Creates a FurnitureRoomVisualization from an existing container.
   * @param container The container to wrap.
   * @returns A new FurnitureRoomVisualization instance.
   */
  static fromContainer(container: ShroomContainer) {
    return new FurnitureRoomVisualization(container);
  }

  /**
   * Adds a mask to the visualization. This stub implementation returns a dummy MaskNode.
   * @returns A MaskNode with no-op update and remove methods.
   */
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
