import { AvatarAction } from "../enum/AvatarAction";
import { AvatarFigurePartType } from "../enum/AvatarFigurePartType";
import { IAvatarActionsData } from "../data/interfaces/IAvatarActionsData";
import {
  AvatarEffectFrameBodypart,
  AvatarEffectFrameFXPart,
  AvatarEffectFXAddition,
  IAvatarEffectData,
} from "../data/interfaces/IAvatarEffectData";
import { IAvatarOffsetsData } from "../data/interfaces/IAvatarOffsetsData";
import { IAvatarPartSetsData } from "../data/interfaces/IAvatarPartSetsData";
import { applyOffsets } from "../util/getAssetFromPartMeta";
import { getAvatarDirection } from "../util/getAvatarDirection";
import { CustomPartFrame } from "./AvatarPart";
import { IAvatarDrawablePart } from "./interface/IAvatarDrawablePart";
import { getEffectSprite } from "../util/getEffectSprite";
import { AvatarAsset, AvatarDrawPart } from "../types";

/**
 * Handles the addition of avatar effect parts (bodypart or fx) to an avatar, including direction, offsets, and asset lookup.
 * Used for rendering additional effect layers on avatars.
 */
export class AvatarAdditionPart implements IAvatarDrawablePart {
  private _direction: number | undefined;
  private _directionOffset = 0;
  private _mode: "fx" | "bodypart" | undefined;
  private _customFrames: AdditionCustomFramePart[] = [];
  private _offsets: Map<number, AvatarEffectFrameFXPart> = new Map();

  constructor(
    private _addition: AvatarEffectFXAddition,
    private _actionsData: IAvatarActionsData,
    private _offsetsData: IAvatarOffsetsData,
    private _partSetsData: IAvatarPartSetsData
  ) {}

  /**
   * Returns the avatar direction, applying any direction offset.
   * @param offset Additional offset to apply to the direction.
   */
  getDirection(offset = 0) {
    if (this._direction == null) return;

    return getAvatarDirection(this._direction + this._directionOffset + offset);
  }

  /**
   * Returns the draw definition for this effect part, or undefined if no assets are available.
   */
  getDrawDefinition(): AvatarDrawPart | undefined {
    const assets: AvatarAsset[] = [];

    this._customFrames.forEach((customFrame, index) => {
      const action = customFrame.action;
      if (action == null) throw new Error("Invalid action");

      const direction = this.getDirection(customFrame.dd);
      if (direction == null) return;

      const asset = this._getAsset(
        direction,
        customFrame.frame,
        index,
        customFrame
      );

      if (asset != null) {
        assets.push(asset);
      }
    });

    if (assets.length === 0) return;

    return {
      kind: "EFFECT_DRAW_PART",
      addition: false,
      assets: assets.flatMap((asset) => [asset, asset]),
      z: 0,
    };
  }

  /**
   * Sets the current effect frame, updating custom frames for either bodypart or fx mode.
   * @param effect The effect data.
   * @param frame The frame index.
   */
  setEffectFrame(effect: IAvatarEffectData, frame: number): void {
    const bodyPart =
      this._addition.base != null
        ? effect.getFrameBodyPartByBase(this._addition.base, frame)
        : undefined;

    const fx = effect.getFrameEffectPart(this._addition.id, frame);

    if (bodyPart != null) {
      this._handleBodyPart(effect, frame, bodyPart);
    } else if (fx != null) {
      this._handleFxPart(effect, frame, fx);
    }
  }

  /**
   * Sets the direction for this effect part.
   * @param direction The direction index.
   */
  setDirection(direction: number): void {
    this._direction = direction;
  }

  /**
   * Sets the direction offset for this effect part.
   * @param offset The direction offset.
   */
  setDirectionOffset(offset: number): void {
    this._directionOffset = offset;
  }

  /**
   * Sets custom avatar offsets for a given frame.
   * @param avatarFrame The FX part offsets.
   * @param frame The frame index.
   */
  setAvatarOffsets(avatarFrame: AvatarEffectFrameFXPart, frame: number) {
    this._offsets.set(frame, avatarFrame);
  }

  /**
   * Looks up the asset for the given direction, frame, and custom frame data.
   * @param direction The direction index.
   * @param frame The frame index.
   * @param frameIndex The index of the custom frame.
   * @param customFrame The custom frame data.
   */
  private _getAsset(
    direction: number,
    frame: number,
    frameIndex: number,
    customFrame: AdditionCustomFramePart
  ) {
    const partType = this._addition.id as AvatarFigurePartType;
    const partInfo = this._partSetsData.getPartInfo(partType);

    const base = customFrame.base ?? this._addition.base;
    const member =
      base != null
        ? `${customFrame.action.assetpartdefinition}_${this._addition.id}_${base}`
        : `${customFrame.action.assetpartdefinition}_${this._addition.id}_1`;

    if (member != null) {
      const { id, offsets, flip } = getEffectSprite(
        member,
        direction,
        frame,
        this._offsetsData,
        true,
        this._mode === "fx"
      );

      if (offsets == null) {
        return;
      }

      const avatarOffsets = this._offsets.get(frameIndex);

      const { x, y } = applyOffsets({
        offsets: {
          offsetX: offsets.offsetX,
          offsetY: offsets.offsetY,
        },
        customOffsets: {
          offsetX: (customFrame.dx ?? 0) + (avatarOffsets?.dx ?? 0),
          offsetY: (customFrame.dy ?? 0) + (avatarOffsets?.dy ?? 0),
        },
        lay: false,
        flipped: flip,
      });

      return {
        fileId: id,
        library: "",
        mirror: flip,
        x,
        y,
      };
    }
  }

  /**
   * Sets the mode for this part ("fx" or "bodypart"). Throws if mode is changed after being set.
   * @param mode The mode to set.
   */
  private _setMode(mode: "fx" | "bodypart") {
    if (this._mode != null && this._mode !== mode) {
      throw new Error("Can't change mode once it is set.");
    }

    this._mode = mode;
  }

  /**
   * Handles the addition of a body part effect frame.
   * @param effect The effect data.
   * @param frame The frame index.
   * @param bodyPart The body part frame data.
   */
  private _handleBodyPart(
    effect: IAvatarEffectData,
    frame: number,
    bodyPart: AvatarEffectFrameBodypart
  ) {
    this._setMode("bodypart");

    const action = this._actionsData.getAction(bodyPart.action as AvatarAction);
    if (action == null) throw new Error("Invalid action " + bodyPart.action);

    this._customFrames.push({
      action,
      frame: bodyPart.frame ?? 0,
      dd: bodyPart.dd,
      dx: bodyPart.dx,
      dy: bodyPart.dy,
    });
  }

  /**
   * Handles the addition of an FX part effect frame.
   * @param effect The effect data.
   * @param frame The frame index.
   * @param fx The FX part frame data.
   */
  private _handleFxPart(
    effect: IAvatarEffectData,
    frame: number,
    fx: AvatarEffectFrameFXPart
  ) {
    this._setMode("fx");

    const action = this._actionsData.getAction(fx.action as AvatarAction);
    if (action == null) throw new Error("Invalid action " + fx.action);

    this._customFrames.push({
      action,
      frame: fx.frame ?? 0,
      dd: fx.dd,
      dx: fx.dx,
      dy: fx.dy,
    });
  }
}

export interface AdditionCustomFramePart extends CustomPartFrame {
  base?: string;
}
