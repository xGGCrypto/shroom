import {
  ShroomTilingSprite,
  ShroomTexture,
  ShroomInteractionEvent,
  ShroomInteractionManager,
  ShroomApplication,
} from "../../pixi-proxy";
import { EventManager } from "./EventManager";

export class EventManagerContainer {
  private _box: ShroomTilingSprite | undefined;

  constructor(
    private _application: ShroomApplication,
    private _eventManager: EventManager
  ) {
    this._updateRectangle();

    _application.ticker.add(this._updateRectangle);

    const interactionManager: ShroomInteractionManager = this._application
      .renderer.plugins.interaction;

    interactionManager.addListener(
      "pointermove",
      (event: ShroomInteractionEvent) => {
        const position = event.data.getLocalPosition(this._application.stage);

        this._eventManager.move(event, position.x, position.y);
      },
      true
    );

    interactionManager.addListener(
      "pointerup",
      (event: ShroomInteractionEvent) => {
        const position = event.data.getLocalPosition(this._application.stage);

        this._eventManager.pointerUp(event, position.x, position.y);
      },
      true
    );

    interactionManager.addListener(
      "pointerdown",
      (event: ShroomInteractionEvent) => {
        const position = event.data.getLocalPosition(this._application.stage);

        this._eventManager.pointerDown(event, position.x, position.y);
      },
      true
    );
  }

  destroy() {
    this._application.ticker.remove(this._updateRectangle);
  }

  private _updateRectangle = () => {
    //this._box?.destroy();

    const renderer = this._application.renderer;
    const width = renderer.width / renderer.resolution;
    const height = renderer.height / renderer.resolution;

    this._box = new ShroomTilingSprite(ShroomTexture.WHITE, width, height);
    this._box.alpha = 0.3;

    //this._application.stage.addChild(this._box);
  };
}
