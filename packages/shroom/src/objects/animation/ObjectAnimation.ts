import { IAnimationTicker } from "../../interfaces/IAnimationTicker";
import { RoomPosition } from "../../types/RoomPosition";

type FinishCurrentCallback = () => void;

type CancelTicker = () => void;

/**
 * ObjectAnimation animates an object from one RoomPosition to another over a set duration.
 * Handles queuing, cancellation, and destruction, and calls user-provided callbacks for animation events.
 * @template T Additional data passed to callbacks.
 */
export class ObjectAnimation<T> {
  private _current: RoomPosition | undefined;
  private _diff: RoomPosition | undefined;
  private _start = 0;
  private _enqueued: {
    currentPosition: RoomPosition;
    newPosition: RoomPosition;
    data: T;
  }[] = [];
  private _nextPosition: RoomPosition | undefined;
  private _finishCurrent: FinishCurrentCallback | undefined;
  private _destroyed = false;
  private _cancelTicker: CancelTicker | undefined;

  constructor(
    private _animationTicker: IAnimationTicker,
    private _callbacks: {
      onUpdatePosition: (position: RoomPosition, data: T) => void;
      onStart: (data: T) => void;
      onStop: (data: T) => void;
    },
    private _duration: number = 500
  ) {}

  /**
   * Clears the animation queue and returns the next position (if any).
   */
  clear() {
    this._enqueued = [];
    return this._nextPosition;
  }

  /**
   * Destroys this animation, cancelling any ongoing animation and unsubscribing from the ticker.
   */
  destroy() {
    this._destroyed = true;
    if (this._cancelTicker != null) {
      this._cancelTicker();
    }
  }

  /**
   * Starts animating from currentPos to newPos, with the given data.
   * If an animation is in progress, it is finished and the new animation starts.
   * @param currentPos The starting RoomPosition.
   * @param newPos The target RoomPosition.
   * @param data Additional data for callbacks.
   */
  move(
    currentPos: { roomX: number; roomY: number; roomZ: number },
    newPos: { roomX: number; roomY: number; roomZ: number },
    data: T
  ) {
    if (this._finishCurrent != null) {
      this._finishCurrent();
      this._finishCurrent = undefined;
    }

    this._callbacks.onStart(data);

    this._current = currentPos;
    this._diff = {
      roomX: newPos.roomX - currentPos.roomX,
      roomY: newPos.roomY - currentPos.roomY,
      roomZ: newPos.roomZ - currentPos.roomZ,
    };

    this._nextPosition = newPos;
    this._start = performance.now();

    const handleFinish = () => {
      this._diff = undefined;
      this._current = undefined;

      const next = this._enqueued.shift();
      if (next != null) {
        this.move(next.currentPosition, next.newPosition, next.data);
      } else {
        this._callbacks.onStop(data);
      }

      cancel();
    };
    this._finishCurrent = handleFinish;

    this._callbacks.onUpdatePosition(
      {
        roomX: this._current.roomX,
        roomY: this._current.roomY,
        roomZ: this._current.roomZ,
      },
      data
    );

    const cancel = this._animationTicker.subscribe(() => {
      if (this._destroyed) return;
      const timeDiff = performance.now() - this._start;

      let factor = timeDiff / this._duration;
      const current = this._current;
      const diff = this._diff;

      if (factor > 1) {
        factor = 1;
      }

      if (current != null && diff != null) {
        this._callbacks.onUpdatePosition(
          {
            roomX: current.roomX + diff.roomX * factor,
            roomY: current.roomY + diff.roomY * factor,
            roomZ: current.roomZ + diff.roomZ * factor,
          },
          data
        );
      }

      if (factor >= 1) {
        handleFinish();
        return;
      }
    });

    this._cancelTicker = cancel;
  }
}
