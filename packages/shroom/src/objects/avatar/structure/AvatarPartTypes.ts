import { AvatarFigurePartType } from "../enum/AvatarFigurePartType";

export const bodyPartTypes: Set<AvatarFigurePartType> = new Set([
  AvatarFigurePartType.Head,
  AvatarFigurePartType.Body,
  AvatarFigurePartType.LeftHand,
  AvatarFigurePartType.RightHand,
]);

export const headPartTypes: Set<AvatarFigurePartType> = new Set([
  AvatarFigurePartType.Head,
  AvatarFigurePartType.Face,
  AvatarFigurePartType.Eyes,
  AvatarFigurePartType.EyeAccessory,
  AvatarFigurePartType.Hair,
  AvatarFigurePartType.HairBig,
  AvatarFigurePartType.FaceAccessory,
  AvatarFigurePartType.HeadAccessory,
  AvatarFigurePartType.HeadAccessoryExtra,
]);
