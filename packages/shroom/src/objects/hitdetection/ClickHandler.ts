import { IEventManagerEvent } from "../events/interfaces/IEventManagerEvent";
import { HitEventHandler } from "./HitSprite";

/**
 * ClickHandler manages click, double-click, and pointer events for interactive hit sprites.
 * It provides debouncing for double-clicks and exposes event handler properties for integration with the event system.
 *
 * @category HitDetection
 */
export class ClickHandler {
  private _doubleClickInfo?: {
    initialEvent: IEventManagerEvent;
    timeout: number;
  };

  private _map = new Map<string, boolean>();

  private _onClick: HitEventHandler | undefined;
  private _onDoubleClick: HitEventHandler | undefined;
  private _onPointerDown: HitEventHandler | undefined;
  private _onPointerUp: HitEventHandler | undefined;

  /**
   * Handler for single click events.
   */
  public get onClick() {
    return this._onClick;
  }
  public set onClick(value) {
    this._onClick = value;
  }

  /**
   * Handler for double click events.
   */
  public get onDoubleClick() {
    return this._onDoubleClick;
  }
  public set onDoubleClick(value) {
    this._onDoubleClick = value;
  }

  /**
   * Handler for pointer down events.
   */
  public get onPointerDown() {
    return this._onPointerDown;
  }
  public set onPointerDown(value) {
    this._onPointerDown = value;
  }

  /**
   * Handler for pointer up events.
   */
  public get onPointerUp() {
    return this._onPointerUp;
  }
  public set onPointerUp(value) {
    this._onPointerUp = value;
  }

  /**
   * Handles a click event, triggering single or double click handlers as appropriate.
   * @param event The event object.
   */
  handleClick(event: IEventManagerEvent) {
    if (this._doubleClickInfo == null) {
      this.onClick && this.onClick(event);
      if (this.onDoubleClick != null) {
        this._startDoubleClick(event);
      }
    } else {
      event.stopPropagation();
      this._performDoubleClick(event);
    }
  }

  /**
   * Handles a pointer down event.
   * @param event The event object.
   */
  handlePointerDown(event: IEventManagerEvent) {
    this.onPointerDown && this.onPointerDown(event);
  }

  /**
   * Handles a pointer up event.
   * @param event The event object.
   */
  handlePointerUp(event: IEventManagerEvent) {
    this.onPointerUp && this.onPointerUp(event);
  }

  /**
   * Internal: Performs a double click event and resets the double click state.
   * @param event The event object.
   */
  private _performDoubleClick(event: IEventManagerEvent) {
    if (this._doubleClickInfo == null) return;
    this.onDoubleClick && this.onDoubleClick(this._doubleClickInfo.initialEvent);
    setTimeout(() => {
      this._resetDoubleClick();
    });
  }

  /**
   * Internal: Resets the double click state and clears any pending timeouts.
   */
  private _resetDoubleClick() {
    if (this._doubleClickInfo == null) return;
    clearTimeout(this._doubleClickInfo.timeout);
    this._doubleClickInfo = undefined;
  }

  /**
   * Internal: Starts the double click timer and stores the initial event.
   * @param event The event object.
   */
  private _startDoubleClick(event: IEventManagerEvent) {
    this._doubleClickInfo = {
      initialEvent: event,
      timeout: window.setTimeout(() => this._resetDoubleClick(), 350),
    };
  }
}
