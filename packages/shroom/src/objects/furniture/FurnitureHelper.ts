import { ShroomContainer } from "../../pixi-proxy";
import { Shroom } from "../Shroom";
import { BaseFurniture } from "./BaseFurniture";
import { IFurnitureExtended } from "./IFurniture";


/**
 * Helper utilities for working with furniture objects, including preview image extraction and option generation.
 */
export class FurnitureHelper {
  /**
   * Generates a preview image for a furniture item by rendering it in a temporary container.
   * @param furniId - The furniture type or id to preview.
   * @param shroom - The Shroom application instance.
   * @returns A promise that resolves to an HTMLImageElement of the rendered furniture.
   */
  public static getFurniPreview(furniId: string, shroom: Shroom): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const container = new ShroomContainer();
      let resolved = false;

      try {
        BaseFurniture.fromShroom(shroom, container, {
          animation: "0",
          direction: 2,
          type: { type: furniId, kind: "type" },
          onLoad: () => {
            try {
              const image = shroom.dependencies.application.renderer.plugins.extract.image(container);
              image.onload = () => {
                if (!resolved) {
                  resolved = true;
                  resolve(image);
                  container.destroy();
                }
              };
              // Fallback: resolve if image is already loaded
              if (image.complete && !resolved) {
                resolved = true;
                resolve(image);
                container.destroy();
              }
            } catch (err) {
              if (!resolved) {
                resolved = true;
                container.destroy();
                reject(err);
              }
            }
          },
        });
      } catch (err) {
        if (!resolved) {
          resolved = true;
          container.destroy();
          reject(err);
        }
      }
    });
  }

  /**
   * Gathers display and action options for a furniture item, including preview image and metadata.
   * @param furni - The furniture instance to describe.
   * @param shroom - The Shroom application instance.
   * @returns A promise resolving to FurniOptions, or undefined if unavailable.
   */
  public static async getFurniOptions(furni: IFurnitureExtended, shroom: Shroom): Promise<FurniOptions | undefined> {
    if (!furni.type) return undefined;
    const info = await shroom.dependencies.furnitureData?.getInfo(furni.type);
    if (!info) return undefined;

    let image: string;
    try {
      image = (await this.getFurniPreview(furni.type, shroom)).src;
    } catch (err) {
      // fallback: use a placeholder or empty string if preview fails
      image = "";
    }

    // Await validDirections for possible future use (not used here, but could be for UI)
    await furni.validDirections;

    return {
      name: info?.name,
      type: furni.type,
      description: info?.description,
      image,
      move: (callback) => {
        // Optionally, could implement move logic here
        if (typeof callback === "function") callback();
      },
      rotate: () => {
        // Await rotate in case it returns a promise
        const result = furni.rotate();
        if (result instanceof Promise) {
          result.catch(() => {/* ignore errors for UI */});
        }
      },
      pickup: (callback) => {
        // Optionally, could implement pickup logic here
        if (typeof callback === "function") callback();
      },
    };
  }
}

/**
 * Options and actions available for a furniture item, suitable for UI menus or toolbars.
 */
export interface FurniOptions {
  /** Display name of the furniture. */
  name?: string;
  /** Type identifier of the furniture. */
  type: string;
  /** Description of the furniture. */
  description?: string;
  /** Preview image URL or data URI. */
  image: string;
  /** Move action callback. */
  move: (callback: () => void) => void;
  /** Rotate action callback. */
  rotate: () => void;
  /** Pickup action callback. */
  pickup: (callback: () => void) => void;
}