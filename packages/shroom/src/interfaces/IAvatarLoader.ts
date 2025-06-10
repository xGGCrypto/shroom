import { AvatarDrawDefinition } from "../objects/avatar/structure/AvatarDrawDefinition";
import { LookOptions } from "../objects/avatar/util/createLookServer";
import { HitTexture } from "../objects/hitdetection/HitTexture";
/**
 * Interface for loading avatar draw definitions and textures.
 */
export interface IAvatarLoader {
  /**
   * Gets the draw definition and texture access for an avatar look.
   * @param options Look options, may include initial flag.
   */
  getAvatarDrawDefinition(
    options: LookOptions & { initial?: boolean }
  ): Promise<AvatarLoaderResult>;
}

/**
 * Result of loading an avatar, including texture and draw definition access.
 */
export type AvatarLoaderResult = {
  getTexture(id: string): HitTexture;
  getDrawDefinition(options: LookOptions): AvatarDrawDefinition;
};
