import {
  ShroomContainer,
  ShroomInteractionEvent,
  ShroomPoint,
  ShroomRectangle,
} from "../../pixi-proxy";
import { Room } from "./Room";

import TWEEN, { Tween } from "@tweenjs/tween.js";

export class RoomCamera extends ShroomContainer {
  /** Tracks if event listeners are attached. */
  private _listenersAttached = false;
  private _state: RoomCameraState = { type: "WAITING" };

  private _offsets: { x: number; y: number } = { x: 0, y: 0 };
  private _animatedOffsets: { x: number; y: number } = { x: 0, y: 0 };

  private _container: ShroomContainer;
  private _parentContainer: ShroomContainer;

  /** The current tween animation, if any. */
  private _tween: Tween<{ x: number; y: number }> | null = null;
  private _target: EventTarget;

  /**
   * Constructs a new RoomCamera.
   * @param _room The room to control.
   * @param _parentBounds Function returning the parent bounds rectangle.
   * @param _options Optional camera options (duration, event target).
   */
  constructor(
    private readonly _room: Room,
    private readonly _parentBounds: () => ShroomRectangle,
    private readonly _options?: RoomCameraOptions
  ) {
    super();

    const target = this._options?.target ?? window;
    this._target = target;

    this._parentContainer = new ShroomContainer();
    const bounds = this._parentBounds();
    if (!bounds || typeof bounds.width !== 'number' || typeof bounds.height !== 'number') {
      throw new Error('RoomCamera: _parentBounds() must return a valid ShroomRectangle');
    }
    this._parentContainer.hitArea = bounds;
    this._parentContainer.interactive = true;

    this._container = new ShroomContainer();
    this._container.addChild(this._room);
    this._parentContainer.addChild(this._container);

    this.addChild(this._parentContainer);

    // Activation of the camera is only triggered by a down event on the parent container.

    this._attachListeners();

    let last: number | undefined;
    this._room.application.ticker.add(() => {
      const now = performance.now();
      if (last == null) last = now;
      const delta = now - last;
      last = now;
      TWEEN.update(now);
    });
  }
  /**
   * Attaches all event listeners, ensuring no duplicates.
   */
  private _attachListeners() {
    if (this._listenersAttached) return;
    this._parentContainer.addListener("pointerdown", this._handlePointerDown);
    this._target.addEventListener("pointermove", this._handlePointerMove as any);
    this._target.addEventListener("pointerup", this._handlePointerUp as any);
    // No window unload listener; cleanup must be explicit via destroy().
    this._listenersAttached = true;
  }

  /**
   * Removes all event listeners.
   */
  private _detachListeners() {
    if (!this._listenersAttached) return;
    this._parentContainer.removeListener("pointerdown", this._handlePointerDown);
    this._target.removeEventListener("pointermove", this._handlePointerMove as any);
    this._target.removeEventListener("pointerup", this._handlePointerUp as any);
    // No window unload listener to remove.
    this._listenersAttached = false;
  }

  // No window unload handler needed; cleanup is explicit.

  static forScreen(room: Room, options?: RoomCameraOptions) {
    return new RoomCamera(room, () => room.application.screen, options);
  }

  /**
   * Cleans up event listeners and destroys the camera container.
   */
  destroy() {
    this._detachListeners();
    super.destroy();
  }
  
  /**
   * Returns the container that holds the room and is moved by the camera.
   */
  public get container(): ShroomContainer {
    return this._container;
  }

  private _handlePointerUp = (event: PointerEvent) => {
    if (this._state.type === "WAITING" || this._state.type === "ANIMATE_ZERO")
      return;

    if (this._state.pointerId !== event.pointerId) return;

    let animatingBack = false;

    if (this._state.type === "DRAGGING") {
      animatingBack = this._stopDragging(this._state);
    }

    if (!animatingBack) {
      this._resetDrag();
    }
  };

  private _handlePointerDown = (event: ShroomInteractionEvent) => {
    const position = event.data.getLocalPosition(this.parent);
    if (this._state.type === "WAITING") {
      this._enterWaitingForDistance(position, event.data.pointerId);
    } else if (this._state.type === "ANIMATE_ZERO") {
      this._changingDragWhileAnimating(position, event.data.pointerId);
    }
  };

  private _handlePointerMove = (event: PointerEvent) => {
    // Defensive: Ensure application and view are available
    if (!this._room || !this._room.application || !this._room.application.view) {
      console.warn("RoomCamera: Application or view not available.");
      return;
    }
    const box = this._room.application.view.getBoundingClientRect();
    const position = new ShroomPoint(
      event.clientX - box.x - this.parent.worldTransform.tx,
      event.clientY - box.y - this.parent.worldTransform.tx
    );

    switch (this._state.type) {
      case "WAIT_FOR_DISTANCE": {
        this._tryUpgradeWaitForDistance(this._state, position, event.pointerId);
        break;
      }

      case "DRAGGING": {
        this._updateDragging(this._state, position, event.pointerId);
        break;
      }
    }
  };

  private _updatePosition() {
    switch (this._state.type) {
      case "DRAGGING": {
        // When dragging, the current position consists of the current offset of the camera
        // and the drag difference.

        const diffX = this._state.currentX - this._state.startX;
        const diffY = this._state.currentY - this._state.startY;

        this._container.x = this._offsets.x + diffX;
        this._container.y = this._offsets.y + diffY;
        break;
      }

      case "ANIMATE_ZERO": {
        // When animating back to the zero point, we use the animatedOffsets of the camera.

        this._container.x = this._animatedOffsets.x;
        this._container.y = this._animatedOffsets.y;
        break;
      }

      default: {
        // Default behavior: Use the set offsets of the camera.

        this._container.x = this._offsets.x;
        this._container.y = this._offsets.y;
      }
    }
  }

  private _isOutOfBounds(offsets: { x: number; y: number }) {
    const roomX = this.parent.transform.position.x + this._room.x;
    const roomY = this.parent.transform.position.y + this._room.y;

    if (roomX + this._room.roomWidth + offsets.x <= 0) {
      // The room is out of bounds to the left side.
      return true;
    }

    if (roomX + offsets.x >= this._parentBounds().width) {
      // The room is out of bounds to the right side.
      return true;
    }

    if (roomY + this._room.roomHeight + offsets.y <= 0) {
      // The room is out of bounds to the top side.
      return true;
    }

    if (roomY + offsets.y >= this._parentBounds().height) {
      // The room is out of bounds to the botoom side.
      return true;
    }

    return false;
  }

  /**
   * Animates the camera back to the origin (0,0) if out of bounds.
   * @private
   */
  private _returnToZero(
    state: CameraDraggingState,
    current: { x: number; y: number }
  ) {
    this._state = {
      ...state,
      type: "ANIMATE_ZERO",
    };
    const duration = this._options?.duration ?? 500;

    this._animatedOffsets = current;
    this._offsets = { x: 0, y: 0 };

    const newPos = { ...this._animatedOffsets };

    const tween = new TWEEN.Tween(newPos)
      .to({ x: 0, y: 0 }, duration)
      .easing(TWEEN.Easing.Quadratic.Out)
      .onUpdate((value: { x: number; y: number }) => {
        this._animatedOffsets = newPos;
        // End animation when close to zero
        if (Math.abs(value.x) < 1 && Math.abs(value.y) < 1) {
          this._state = { type: "WAITING" };
        }
        this._updatePosition();
      })
      .start();

    this._tween = tween;
    this._updatePosition();
  }
  /**
   * Programmatically resets the camera to the origin (0,0).
   */
  public resetCamera() {
    this._offsets = { x: 0, y: 0 };
    this._animatedOffsets = { x: 0, y: 0 };
    this._state = { type: "WAITING" };
    this._updatePosition();
  }

  private _stopDragging(state: CameraDraggingState) {
    const diffX = state.currentX - state.startX;
    const diffY = state.currentY - state.startY;

    const currentOffsets = {
      x: this._offsets.x + diffX,
      y: this._offsets.y + diffY,
    };

    if (
      this._isOutOfBounds(currentOffsets) ||
      (state.skipBoundsCheck != null && state.skipBoundsCheck)
    ) {
      this._returnToZero(state, currentOffsets);
      return true;
    } else {
      this._offsets = currentOffsets;
    }

    return false;
  }

  private _resetDrag() {
    this._state = { type: "WAITING" };
    this._updatePosition();
  }

  /**
   * Handles switching from animation to drag if the user interacts during animation.
   * @private
   */
  private _changingDragWhileAnimating(
    position: ShroomPoint,
    pointerId: number
  ) {
    this._offsets = this._animatedOffsets;
    this._animatedOffsets = { x: 0, y: 0 };
    if (this._tween) {
      this._tween.stop();
      this._tween = null;
    }

    this._state = {
      currentX: position.x,
      currentY: position.y,
      startX: position.x,
      startY: position.y,
      pointerId: pointerId,
      type: "DRAGGING",
      skipBoundsCheck: true,
    };

    this._updatePosition();
  }

  private _enterWaitingForDistance(position: ShroomPoint, pointerId: number) {
    this._state = {
      type: "WAIT_FOR_DISTANCE",
      pointerId: pointerId,
      startX: position.x,
      startY: position.y,
    };
  }

  private _tryUpgradeWaitForDistance(
    state: CameraWaitForDistanceState,
    position: ShroomPoint,
    pointerId: number
  ) {
    if (state.pointerId !== pointerId) return;

    const distance = Math.sqrt(
      (position.x - state.startX) ** 2 + (position.y - state.startY) ** 2
    );

    // When the distance of the pointer travelled more than 10px, start dragging.
    if (distance >= 10) {
      this._state = {
        currentX: position.x,
        currentY: position.y,
        startX: position.x,
        startY: position.y,
        pointerId: pointerId,
        type: "DRAGGING",
      };
      this._updatePosition();
    }
  }

  private _updateDragging(
    state: CameraDraggingState,
    position: ShroomPoint,
    pointerId: number
  ) {
    if (state.pointerId !== pointerId) return;

    this._state = {
      ...state,
      currentX: position.x,
      currentY: position.y,
    };

    this._updatePosition();
  }
}

/**
 * State for when the camera is being dragged.
 */
type CameraDraggingState = {
  type: "DRAGGING";
  currentX: number;
  currentY: number;
  pointerId: number;
  startX: number;
  startY: number;
  skipBoundsCheck?: boolean;
};

/**
 * State for when the camera is animating back to zero.
 */
type CameraAnimateZeroState = {
  type: "ANIMATE_ZERO";
  currentX: number;
  currentY: number;
  startX: number;
  startY: number;
};

/**
 * State for when the camera is waiting for pointer movement to start dragging.
 */
type CameraWaitForDistanceState = {
  type: "WAIT_FOR_DISTANCE";
  startX: number;
  startY: number;
  pointerId: number;
};

/**
 * Union type for all possible camera states.
 */
type RoomCameraState =
  | { type: "WAITING" }
  | CameraWaitForDistanceState
  | CameraDraggingState
  | CameraAnimateZeroState;

/**
 * Options for configuring the RoomCamera.
 */
type RoomCameraOptions = { duration?: number; target?: EventTarget };
