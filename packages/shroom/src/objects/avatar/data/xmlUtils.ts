/**
 * Utility functions for XML parsing and attribute extraction in avatar data classes.
 */

/**
 * Gets a string attribute from an element, throws if missing.
 */
export function getRequiredAttribute(element: Element, attr: string): string {
  const value = element.getAttribute(attr);
  if (value == null) throw new Error(`Missing required attribute '${attr}'`);
  return value;
}

/**
 * Gets a number attribute from an element, throws if missing or NaN.
 */
export function getRequiredNumberAttribute(element: Element, attr: string): number {
  const value = element.getAttribute(attr);
  if (value == null) throw new Error(`Missing required attribute '${attr}'`);
  const num = Number(value);
  if (isNaN(num)) throw new Error(`Attribute '${attr}' is not a valid number`);
  return num;
}

/**
 * Gets a string attribute from an element, returns undefined if missing.
 */
export function getOptionalAttribute(element: Element, attr: string): string | undefined {
  return element.getAttribute(attr) ?? undefined;
}

/**
 * Gets a number attribute from an element, returns undefined if missing or NaN.
 */
export function getOptionalNumberAttribute(element: Element, attr: string): number | undefined {
  const value = element.getAttribute(attr);
  if (value == null) return undefined;
  const num = Number(value);
  return isNaN(num) ? undefined : num;
}
