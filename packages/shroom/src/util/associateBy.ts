/**
 * Creates a Map from an array, using a key selector function.
 * @param arr The array of items.
 * @param getKey Function to extract the key from each item.
 * @returns A Map where each key is the result of getKey and the value is the item.
 */
export function associateBy<T>(arr: T[], getKey: (value: T) => string): Map<string, T> {
  const map = new Map<string, T>();
  for (const value of arr) {
    const key = getKey(value);
    if (key == null) {
      throw new Error("associateBy: getKey returned null or undefined");
    }
    map.set(key, value);
  }
  return map;
}
