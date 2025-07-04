import { IFurnitureBehavior, HitEvent, IFurniture } from "@xggcrypto/shroom";
import { action } from "@storybook/addon-actions";

interface DiceState {
  state: "rolling" | "value" | "closed";
  value: number;
}

enum DiceAnimation {
  Rolling = "-1",
  Closed = "0",
}

export class DiceBehavior implements IFurnitureBehavior {
  private state: DiceState = { state: "closed", value: 1 };
  private furniture: IFurniture | undefined;
  private timeout: number | undefined;

  constructor() {}

  private _startRoll() {
    this.state = { ...this.state, state: "rolling" };
    this._updateState(); // Start Rolling Animation

    this.timeout = window.setTimeout(() => {
      this._setValue(Math.floor(Math.random() * 6) + 1); // Set Random Value to the Dice
    }, 500);
  }

  private _setValue(value: number) {
    this.state = { ...this.state, state: "value", value };
    this._updateState();
  }

  private _open() {
    this.state = { ...this.state, state: "value" };
    this._updateState();
  }

  private _close() {
    this.state = { ...this.state, state: "closed" };
    this._updateState();
  }

  private _updateState() {
    const furniture = this.furniture;
    if (furniture == null) return;

    switch (this.state.state) {
      case "value":
        furniture.animation = this.state.value.toString();
        break;

      case "rolling":
        furniture.animation = DiceAnimation.Rolling;
        break;

      case "closed":
        furniture.animation = DiceAnimation.Closed;
        break;
    }

    action("dice")(this.state);
  }

  private _handleActivate() {
    if (this.state.state === "value") {
      this._startRoll();
    } else if (this.state.state === "closed") {
      this._open();
    }
  }

  private _handleDeactivate() {
    if (this.state.state === "value") {
      this._close();
    } else if (this.state.state === "rolling") {
      this._close();
    } else if (this.state.state === "closed") {
      this._open();
    }
  }

  private _handleClick(event: HitEvent) {
    event.stopPropagation();

    switch (event.tag) {
      case "activate":
        if (this.furniture?.type! == "edice") this._startRoll(); // If it's an edice, start rolling
        else this._handleActivate(); // If it's not an edice, open the dice
        break;
      case "deactivate":
        this._handleDeactivate();
        break;
    }
  }

  setParent(furniture: IFurniture): void {
    this.furniture = furniture;

    furniture.onDoubleClick = (event) => {
      this._handleClick(event);
    };

    this._updateState();
  }

  remove(): void {
    throw new Error("Method not implemented.");
  }
}
