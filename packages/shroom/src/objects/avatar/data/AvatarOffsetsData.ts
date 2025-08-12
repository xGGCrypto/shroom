import { IAvatarOffsetsData } from "./interfaces/IAvatarOffsetsData";

export class AvatarOffsetsData implements IAvatarOffsetsData {
  constructor(private _json: any) {}

  static async fromUrl(url: string) {
    const response = await fetch(url);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const json = await response.json();

    return new AvatarOffsetsData(json);
  }

  getOffsets(
    fileName: string
  ): { offsetX: number; offsetY: number } | undefined {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    return this._json[fileName];
  }
}
