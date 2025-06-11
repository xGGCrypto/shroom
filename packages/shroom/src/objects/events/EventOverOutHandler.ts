import { HitSpriteEventMap } from "../hitdetection/HitSprite";
import { EventEmitter } from "./EventEmitter";
import { IEventManagerEvent } from "./interfaces/IEventManagerEvent";

type EventOverOutCallback = (event: IEventManagerEvent) => void;

/**
 * Handles mouse over and out events for event emitters, managing callbacks and state.
 * Tracks which emitters are currently hovered and triggers onOver/onOut as needed.
 */
export class EventOverOutHandler {
  private _eventEmitters: Map<
    EventEmitter<HitSpriteEventMap>,
    RegisteredOverOutHandler
  > = new Map();
  private _overElements: Set<EventEmitter<HitSpriteEventMap>> = new Set();
  private _hover = false;
  private _onOverCallback: EventOverOutCallback | undefined;
  private _onOutCallback: EventOverOutCallback | undefined;
  private _timeout: any;
  private _targetChanged = false;

  /**
   * Gets the callback for mouse over events.
   */
  public get onOver() {
    return this._onOverCallback;
  }

  /**
   * Sets the callback for mouse over events.
   */
  public set onOver(value) {
    this._onOverCallback = value;
  }

  /**
   * Gets the callback for mouse out events.
   */
  public get onOut() {
    return this._onOutCallback;
  }

  /**
   * Sets the callback for mouse out events.
   */
  public set onOut(value) {
    this._onOutCallback = value;
  }

  /**
   * Registers an event emitter for over/out handling.
   * @param emitter - The event emitter to register.
   */
  register(emitter: EventEmitter<HitSpriteEventMap>) {
    if (this._eventEmitters.has(emitter)) return;

    this._eventEmitters.set(
      emitter,
      new RegisteredOverOutHandler(
        emitter,
        this._onOver,
        this._onOut,
        this._onTargetChanged
      )
    );
  }

  /**
   * Removes an event emitter from over/out handling.
   * @param emitter - The event emitter to remove.
   */
  remove(emitter: EventEmitter<HitSpriteEventMap>) {
    const handler = this._eventEmitters.get(emitter);
    if (handler == null) return;

    this._eventEmitters.delete(emitter);
    this._overElements.delete(emitter);

    handler.destroy();
  }

  private _onOver = (
    emitter: EventEmitter<HitSpriteEventMap>,
    event: IEventManagerEvent
  ) => {
    this._overElements.add(emitter);
    this._update(event);
  };

  private _onOut = (
    emitter: EventEmitter<HitSpriteEventMap>,
    event: IEventManagerEvent
  ) => {
    this._overElements.delete(emitter);
    this._update(event);
  };

  private _onTargetChanged = (
    emitter: EventEmitter<HitSpriteEventMap>,
    event: IEventManagerEvent
  ) => {
    this._overElements.delete(emitter);
    this._targetChanged = true;
    this._update(event);
  };

  private _update(event: IEventManagerEvent) {
    if (this._overElements.size > 0 && !this._hover) {
      this._hover = true;

      if (!this._targetChanged) {
        this.onOver && this.onOver(event);
      }

      this._targetChanged = false;
    }

    if (this._overElements.size < 1 && this._hover) {
      this._hover = false;
      if (!this._targetChanged) {
        this.onOut && this.onOut(event);
      }
    }
  }
}

/**
 * Internal class for managing event listeners for a single emitter.
 */
class RegisteredOverOutHandler {
  constructor(
    private emitter: EventEmitter<HitSpriteEventMap>,
    private onOver: (
      emitter: EventEmitter<HitSpriteEventMap>,
      event: IEventManagerEvent
    ) => void,
    private onOut: (
      emitter: EventEmitter<HitSpriteEventMap>,
      event: IEventManagerEvent
    ) => void,
    private onTargetChanged: (
      emitter: EventEmitter<HitSpriteEventMap>,
      event: IEventManagerEvent
    ) => void
  ) {
    emitter.addEventListener("pointerout", this._handlePointerOut);
    emitter.addEventListener("pointerover", this._handlePointerOver);
    emitter.addEventListener(
      "pointertargetchanged",
      this._handlePointerTargetChanged
    );
  }

  /**
   * Cleans up all event listeners for this handler.
   */
  destroy() {
    this.emitter.removeEventListener("pointerout", this._handlePointerOut);
    this.emitter.removeEventListener("pointerover", this._handlePointerOver);
    this.emitter.removeEventListener(
      "pointertargetchanged",
      this._handlePointerTargetChanged
    );
  }

  private _handlePointerOut = (event: IEventManagerEvent) => {
    this.onOut(this.emitter, event);
  };

  private _handlePointerOver = (event: IEventManagerEvent) => {
    this.onOver(this.emitter, event);
  };

  private _handlePointerTargetChanged = (event: IEventManagerEvent) => {
    this.onTargetChanged(this.emitter, event);
  };
}
