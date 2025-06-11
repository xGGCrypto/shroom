/**
 * A generic event emitter for managing event listeners and triggering events.
 * @template TMap - The event map type.
 */
/**
 * A generic event emitter for managing event listeners and triggering events.
 *
 * This class allows you to register, remove, and trigger event listeners for custom event maps.
 * It is type-safe and supports any event map interface.
 *
 * @template TMap - The event map type, mapping event names to payload types.
 */
export class EventEmitter<TMap extends BaseTypeMap<unknown>> {
  private _map = new Map<string, Set<EventCallback<any, TMap>>>();

  /**
   * Adds an event listener for a specific event name.
   * @param name - The event name.
   * @param callback - The callback to invoke when the event is triggered.
   */
  /**
   * Adds an event listener for a specific event name.
   *
   * @param name - The event name.
   * @param callback - The callback to invoke when the event is triggered.
   */
  addEventListener<K extends keyof TMap>(
    name: K,
    callback: EventCallback<K, TMap>
  ): void {
    const key = name.toString();
    let currentEventCallbackSet = this._map.get(key);
    if (!currentEventCallbackSet) {
      currentEventCallbackSet = new Set<EventCallback<K, TMap>>();
      this._map.set(key, currentEventCallbackSet);
    }
    currentEventCallbackSet.add(callback);
  }

  /**
   * Removes an event listener for a specific event name.
   * @param name - The event name.
   * @param callback - The callback to remove.
   */
  /**
   * Removes an event listener for a specific event name.
   *
   * @param name - The event name.
   * @param callback - The callback to remove.
   */
  removeEventListener<K extends keyof TMap>(
    name: K,
    callback: EventCallback<K, TMap>
  ): void {
    const key = name.toString();
    const currentEventCallbackSet = this._map.get(key);
    if (currentEventCallbackSet) {
      currentEventCallbackSet.delete(callback);
      // Clean up empty sets to avoid memory leaks
      if (currentEventCallbackSet.size === 0) {
        this._map.delete(key);
      }
    }
  }

  /**
   * Triggers an event, calling all registered listeners for the event name.
   * @param name - The event name.
   * @param value - The event payload.
   */
  /**
   * Triggers an event, calling all registered listeners for the event name.
   *
   * @param name - The event name.
   * @param value - The event payload.
   */
  trigger<K extends keyof TMap>(name: K, value: TMap[K]): void {
    const key = name.toString();
    const currentEventCallbackSet = this._map.get(key);
    if (currentEventCallbackSet) {
      // Copy to array to avoid issues if listeners are removed during iteration
      Array.from(currentEventCallbackSet).forEach((callback) => callback(value));
    }
  }
}


/**
 * A callback type for event listeners.
 */
type EventCallback<K extends keyof TMap, TMap extends BaseTypeMap<unknown>> = (
  event: TMap[K]
) => void;

window.addEventListener;


/**
 * A base type map for event payloads.
 */
type BaseTypeMap<T> = {
  [k in keyof T]: unknown;
};
