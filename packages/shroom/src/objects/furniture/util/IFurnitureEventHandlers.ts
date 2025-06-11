import { IEventManagerEvent } from "../../events/interfaces/IEventManagerEvent";

/**
 * Event handler callbacks for furniture interaction events.
 * All handlers are optional.
 * @category Furniture
 */
export interface IFurnitureEventHandlers {
  /** Called when the furniture is clicked. */
  onClick?: (event: IEventManagerEvent) => void;
  /** Called when the furniture is double-clicked. */
  onDoubleClick?: (event: IEventManagerEvent) => void;
  /** Called when a pointer is pressed down on the furniture. */
  onPointerDown?: (event: IEventManagerEvent) => void;
  /** Called when a pointer is released on the furniture. */
  onPointerUp?: (event: IEventManagerEvent) => void;
  /** Called when a pointer moves over the furniture. */
  onPointerOver?: (event: IEventManagerEvent) => void;
  /** Called when a pointer moves out of the furniture. */
  onPointerOut?: (event: IEventManagerEvent) => void;
}
