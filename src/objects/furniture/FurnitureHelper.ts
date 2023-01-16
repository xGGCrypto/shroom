import * as PIXI from "pixi.js";
import { Shroom } from "../Shroom";
import { BaseFurniture } from "./BaseFurniture";

export default class FurnitureHelper {

    public static getFurniPreview (furniId: string, shroom: Shroom) : Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const container = new PIXI.Container();

            BaseFurniture.fromShroom(shroom, container, {
                animation: "0",
                direction: 2,
                type: { type: furniId, kind: "type" },
                onLoad: () => {
                    const image = shroom.dependencies.application.renderer.plugins.extract.image(container);
     
                    image.onload = () => {
                        resolve(image);
                        container.destroy();
                    }
                },
            });
        });
    }
}