// Event handler assignment utility for Avatar and BaseAvatar
import { BaseAvatar } from "./BaseAvatar";
import { HitEventHandler } from "../hitdetection/HitSprite";

export interface AvatarEventHandlers {
  onClick?: HitEventHandler;
  onDoubleClick?: HitEventHandler;
  onPointerDown?: HitEventHandler;
  onPointerUp?: HitEventHandler;
  onPointerOver?: HitEventHandler;
  onPointerOut?: HitEventHandler;
}

/**
 * Assigns event handlers to a BaseAvatar instance.
 */
export function assignAvatarEventHandlers(avatar: BaseAvatar, handlers: AvatarEventHandlers) {
  avatar.onClick = handlers.onClick;
  avatar.onDoubleClick = handlers.onDoubleClick;
  avatar.onPointerDown = handlers.onPointerDown;
  avatar.onPointerUp = handlers.onPointerUp;
  avatar.onPointerOver = handlers.onPointerOver;
  avatar.onPointerOut = handlers.onPointerOut;
}
