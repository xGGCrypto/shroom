import { IAnimationTicker } from "../../interfaces/IAnimationTicker";
import { ShroomApplication } from "../../pixi-proxy";
const ANIM_FPS = 24;
const TARGET_FPS = 60;

/**
 * AnimationTicker normalizes animation frame updates between a target FPS and animation FPS.
 * Allows subscription to frame updates and provides the current normalized frame.
 */
export class AnimationTicker implements IAnimationTicker {
  private _frame = 0;

  private _idCounter = 0;
  private _subscriptions = new Map<
    number,
    (frame: number, accurateFrame: number) => void
  >();

  /**
   * Creates a new AnimationTicker and attaches it to the application's ticker.
   * @param application The ShroomApplication instance.
   */
  constructor(application: ShroomApplication) {
    application.ticker.maxFPS = TARGET_FPS;
    application.ticker.minFPS = ANIM_FPS;
    application.ticker.add(() => this._increment());
  }

  /**
   * Factory method to create an AnimationTicker for a given application.
   * @param application The ShroomApplication instance.
   */
  static create(application: ShroomApplication) {
    return new AnimationTicker(application);
  }

  /**
   * Subscribe to animation frame updates.
   * @param cb Callback with normalized frame and accurate frame.
   * @returns Unsubscribe function.
   */
  subscribe(cb: (frame: number, accurateFrame: number) => void): () => void {
    const id = this._idCounter++;

    this._subscriptions.set(id, cb);
    return () => this._subscriptions.delete(id);
  }

  /**
   * Gets the current normalized animation frame (rounded).
   */
  current(): number {
    return this._getNormalizedFrame(this._frame).rounded;
  }

  /**
   * Normalizes a frame number to animation FPS.
   * @param frame The raw frame number.
   * @returns Object with rounded and pure (float) frame values.
   */
  private _getNormalizedFrame(frame: number) {
    const factor = ANIM_FPS / TARGET_FPS;
    const calculatedFrame = frame * factor;

    return { rounded: Math.floor(calculatedFrame), pure: calculatedFrame };
  }

  /**
   * Increments the frame and notifies all subscribers.
   */
  private _increment() {
    this._frame += 1;
    const data = this._getNormalizedFrame(this._frame);

    this._subscriptions.forEach((cb) => cb(data.rounded, data.pure));
  }
}
