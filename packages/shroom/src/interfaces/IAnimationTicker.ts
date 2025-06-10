/**
 * Interface for animation ticker, providing frame updates.
 */
export interface IAnimationTicker {
  /**
   * Subscribe to animation frame updates.
   * @param cb Callback with frame and accurateFrame.
   * @returns Unsubscribe function.
   */
  subscribe(cb: (frame: number, accurateFrame: number) => void): () => void;
  /** Gets the current frame number. */
  current(): number;
}
