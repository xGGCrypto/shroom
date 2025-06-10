import { notNullOrUndefined } from "../../../util/notNullOrUndefined";
import { AvatarAction } from "../enum/AvatarAction";
import {
  AvatarActionInfo,
  IAvatarActionsData,
} from "../data/interfaces/IAvatarActionsData";
import {
  AvatarEffectFrameFXPart,
  IAvatarEffectData,
} from "../data/interfaces/IAvatarEffectData";
import {
  Bodypart,
  IAvatarGeometryData,
} from "../data/interfaces/IAvatarGeometryData";
import { IAvatarPartSetsData } from "../data/interfaces/IAvatarPartSetsData";
import { AvatarAdditionPart } from "./AvatarAdditionPart";
import { AvatarPart } from "./AvatarPart";
import { IAvatarDrawablePart } from "./interface/IAvatarDrawablePart";

/**
 * A bodypart of the avatar. A bodypart manages multiple `AvatarPart` objects.
 */
export class AvatarBodyPart {
  private _additions: AvatarAdditionPart[] = [];

  constructor(
    private _bodyPart: Bodypart,
    private _parts: AvatarPart[],
    private _partSets: IAvatarPartSetsData,
    private _actions: IAvatarActionsData,
    private _geometry: IAvatarGeometryData
  ) {}

  public get z() {
  /**
   * Gets the z-index (depth) of this body part for draw ordering.
   */
    return this._bodyPart.z;
  }

  public get id() {
  /**
   * Gets the unique identifier for this body part.
   */
    return this._bodyPart.id;
  }

  public get parts() {
  /**
   * Gets the list of avatar parts managed by this body part.
   */
    return this._parts;
  }

  public addAddition(addition: AvatarAdditionPart) {
  /**
   * Adds an additional effect part (such as an FX addition) to this body part.
   * @param addition The addition part to add.
   */
    this._additions.push(addition);
  }

  public getSortedParts(geometry: string): IAvatarDrawablePart[] {
  /**
   * Returns the parts of this body part, sorted by their geometry radius, and includes any additions.
   * @param geometry The geometry type to use for sorting (e.g., "vertical").
   * @returns The sorted list of drawable parts for this body part.
   */
    const baseParts = this._parts
      .map((part) => {
        const item = this._geometry.getBodyPartItem(
          geometry,
          this._bodyPart.id,
          part.type
        );
        if (item == null) return;

        return { part, item };
      })
      .filter(notNullOrUndefined)
      .sort((a, b) => a.item.radius - b.item.radius)
      .map((bodyPartItem) => {
        return bodyPartItem.part;
      });

    return [...baseParts, ...this._additions];
  }

  public setActiveAction(action: AvatarActionInfo) {
  /**
   * Sets the active action for all parts in this body part, if the action's part set matches.
   * @param action The action to activate.
   */
    if (action.activepartset == null) return;
    const activePart = this._partSets.getActivePartSet(action.activepartset);

    this._parts.forEach((part) => {
      if (!activePart.has(part.type)) return;

      part.setActiveAction(action);
    });
  }

  public setDirection(direction: number) {
  /**
   * Sets the direction for all parts in this body part.
   * @param direction The direction index.
   */
    this._parts.forEach((part) => {
      part.setDirection(direction);
    });
  }

  public setDirectionOffset(offset: number) {
  /**
   * Sets the direction offset for all parts in this body part.
   * @param offset The direction offset.
   */
    this._parts.forEach((part) => {
      part.setDirectionOffset(offset);
    });
  }

  public setFrameRepeat(frameRepeat: number) {
  /**
   * Sets the frame repeat value for all parts in this body part.
   * @param frameRepeat The number of times to repeat each frame.
   */
    this._parts.forEach((part) => {
      part.setFrameRepeat(frameRepeat);
    });
  }

  public setEffectFrame(effect: IAvatarEffectData, frame: number) {
  /**
   * Sets the effect frame for all parts in this body part, if the effect applies to this body part.
   * @param effect The effect data.
   * @param frame The frame index.
   */
    const effectBodyPart = effect.getFrameBodyPart(this.id, frame);
    if (effectBodyPart == null) return;

    const action = this._actions.getAction(
      effectBodyPart.action as AvatarAction
    );

    this._parts.forEach((part) => {
      if (action != null) {
        part.addCustomFrame({
          action,
          frame: effectBodyPart.frame ?? 0,
          dd: effectBodyPart.dd,
          dx: effectBodyPart.dx,
          dy: effectBodyPart.dy,
        });
      }
    });
  }

  public setAvatarOffsets(avatarFrame: AvatarEffectFrameFXPart, frame: number) {
  /**
   * Sets avatar offsets for all parts and additions in this body part for a given frame.
   * @param avatarFrame The FX part offsets.
   * @param frame The frame index.
   */
    this._parts.forEach((part) => {
      part.setAvatarOffsets(avatarFrame, frame);
    });

    this._additions.forEach((addition) => {
      addition.setAvatarOffsets(avatarFrame, frame);
    });
  }
}
