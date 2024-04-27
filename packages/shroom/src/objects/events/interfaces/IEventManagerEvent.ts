import { ShroomInteractionEvent } from "../../../pixi-proxy";
import { EventGroupIdentifier } from "./IEventGroup";

export interface IEventManagerEvent {
  tag?: string;
  mouseEvent: MouseEvent | TouchEvent | PointerEvent;
  interactionEvent: ShroomInteractionEvent;
  stopPropagation(): void;
  skip(...identifiers: EventGroupIdentifierParam[]): void;
  skipExcept(...identifiers: EventGroupIdentifierParam[]): void;
}

export type EventGroupIdentifierParam =
  | EventGroupIdentifierParam[]
  | EventGroupIdentifier;
