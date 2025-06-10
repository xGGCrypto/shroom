import { ParsedLook } from "./parseLookString";
import { AvatarAction } from "../enum/AvatarAction";
import { IAvatarEffectData } from "../data/interfaces/IAvatarEffectData";
import { AvatarFigurePartType } from "../enum/AvatarFigurePartType";
import { AvatarDrawDefinition } from "../structure/AvatarDrawDefinition";
import { AvatarDependencies } from "../types";

export const basePartSet = new Set<AvatarFigurePartType>([
  AvatarFigurePartType.LeftHand,
  AvatarFigurePartType.RightHand,
  AvatarFigurePartType.Body,
  AvatarFigurePartType.Head,
]);

/**
 * Computes and returns a definition of how the avatar should be drawn, including all parts and effects.
 * Ensures the default action is always included for consistent rendering.
 *
 * @param options - Look options including parsed look, actions, direction, etc.
 * @param deps - External figure data, draw order, and offsets.
 * @returns The AvatarDrawDefinition instance for rendering, or undefined if not applicable.
 */
export function getAvatarDrawDefinition(
  options: Options,
  deps: AvatarDependencies
): AvatarDrawDefinition | undefined {
  // Always include the default action for consistent rendering
  const actions = new Set(options.actions).add(AvatarAction.Default);
  return new AvatarDrawDefinition(
    {
      actions,
      direction: options.direction,
      frame: 0,
      look: options.parsedLook,
      item: options.item,
      headDirection: options.headDirection,
      effect: options.effect,
    },
    deps
  );
}

interface Options {
  parsedLook: ParsedLook;
  actions: Set<string>;
  direction: number;
  headDirection?: number;
  frame: number;
  item?: string | number;
  effect?: IAvatarEffectData;
}
