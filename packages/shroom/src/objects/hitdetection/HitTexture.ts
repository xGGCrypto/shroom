import { ShroomSpritesheet, ShroomTexture } from "../../pixi-proxy";
import { applyTextureProperties } from "../../util/applyTextureProperties";
import { loadImageFromBlob } from "../../util/loadImageFromBlob";
import { HitSprite } from "./HitSprite";

/**
 * HitTexture wraps a PIXI texture and provides hitmap-based pixel-perfect hit detection.
 * It supports construction from spritesheets, blobs, or URLs, and caches hitmaps for efficiency.
 *
 * @category HitDetection
 */
export class HitTexture {
  /** The underlying PIXI texture. */
  private _texture: ShroomTexture;
  /** Cached hitmap for pixel-perfect hit detection. */
  private _cachedHitmap: Uint32Array | undefined;

  /**
   * Gets the underlying PIXI texture.
   */
  public get texture() {
    return this._texture;
  }

  /**
   * Constructs a HitTexture from a PIXI texture.
   * @param texture The PIXI texture to wrap.
   */
  constructor(texture: ShroomTexture) {
    this._texture = texture;
    applyTextureProperties(this._texture);
  }

  /**
   * Creates a HitTexture from a spritesheet and frame name.
   * @param spritesheet The spritesheet containing the texture.
   * @param name The frame name in the spritesheet.
   * @returns A promise resolving to the HitTexture.
   * @throws If the texture is not found in the spritesheet.
   */
  static async fromSpriteSheet(spritesheet: ShroomSpritesheet, name: string) {
    const texture = spritesheet.textures[name];
    if (!texture) throw new Error(`Texture '${name}' not found in spritesheet.`);
    return new HitTexture(texture);
  }

  /**
   * Creates a HitTexture from a Blob (image file).
   * @param blob The image blob.
   * @returns A promise resolving to the HitTexture.
   * @throws If the blob cannot be loaded as an image.
   */
  static async fromBlob(blob: Blob) {
    const url = await loadImageFromBlob(blob);
    return HitTexture.fromUrl(url);
  }

  /**
   * Creates a HitTexture from an image URL.
   * @param imageUrl The URL of the image.
   * @returns A promise resolving to the HitTexture.
   * @throws If the image cannot be loaded.
   */
  static async fromUrl(imageUrl: string) {
    const image = new Image();

    // We set the crossOrigin here so the image element
    // can fetch and display images hosted on another origin.
    // Thanks to @danielsolartech for reporting.

    // TODO: Add option to configure this somewhere?
    image.crossOrigin = "anonymous";
    image.src = imageUrl;

    await new Promise<{ width: number; height: number }>((resolve, reject) => {
      image.onload = () => resolve({ width: image.width, height: image.height });
      image.onerror = (value) => reject(new Error("Failed to load image for HitTexture."));
    });

    const texture = ShroomTexture.from(image);
    return new HitTexture(texture);
  }

  /**
   * Returns the cached hitmap for this texture, generating it if necessary.
   * @returns The hitmap as a Uint32Array.
   */
  public getHitMap() {
    return this._getHitMap();
  }

  hits(
    x: number,
    y: number,
    transform: { x: number; y: number },
    options: { mirrorHorizonally?: boolean } = { mirrorHorizonally: false }
  ) {
    if (options.mirrorHorizonally) {
      x = -(x - transform.x);
    } else {
      x = x - transform.x;
    }
    y = y - transform.y;

    const baseTexture = this._texture.baseTexture;
    const hitmap = this._getHitMap();

    const dx = Math.round(this._texture.orig.x + x * baseTexture.resolution);
    const dy = Math.round(this._texture.orig.y + y * baseTexture.resolution);
    const ind = dx + dy * baseTexture.realWidth;
    const ind1 = ind % 32;
    const ind2 = (ind / 32) | 0;
    return (hitmap[ind2] & (1 << ind1)) !== 0;
  }

  private _getHitMap() {
    if (this._cachedHitmap == null) {
      this._cachedHitmap = generateHitMap(
        (this._texture.baseTexture.resource as any).source
      );
    }

    return this._cachedHitmap ?? new Uint8ClampedArray();
  }
}

function generateHitMap(image: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const context = canvas.getContext("2d");

  if (context == null) throw new Error("Invalid context 2d");

  const threshold = 25;

  const w = canvas.width;
  const h = canvas.height;
  context.drawImage(image, 0, 0);

  const imageData = context.getImageData(0, 0, w, h);

  const hitmap = new Uint32Array(Math.ceil((w * h) / 32));
  for (let i = 0; i < w * h; i++) {
    const ind1 = i % 32;
    const ind2 = (i / 32) | 0;
    if (imageData.data[i * 4 + 3] >= threshold) {
      hitmap[ind2] = hitmap[ind2] | (1 << ind1);
    }
  }

  return hitmap;
}
