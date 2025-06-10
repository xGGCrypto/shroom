import ByteBuffer from "bytebuffer";
import { IAssetBundle } from "./IAssetBundle";

type CacheEntry<T> = {
  key: string;
  value: T;
};

function withTimeout<T>(promise: Promise<T>, ms = 30000, errorMsg = 'Request timed out'): Promise<T> {
  let timeout: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeout = setTimeout(() => reject(new Error(errorMsg)), ms);
  });
  return Promise.race([
    promise.finally(() => clearTimeout(timeout)),
    timeoutPromise,
  ]);
}

export class ShroomAssetBundle implements IAssetBundle {
  public static readonly VERSION = 1;

  private _files: Map<string, ArrayBuffer | Buffer> = new Map();
  private _blobs: Map<string, Blob> = new Map();
  private _strings: Map<string, string> = new Map();
  private _cacheOrder: string[] = [];
  private _cacheLimit: number | undefined;

  constructor(
    files: { fileName: string; buffer: ArrayBuffer | Buffer }[] = [],
    cacheLimit?: number
  ) {
    files.forEach((file) => this._files.set(file.fileName, file.buffer));
    this._cacheLimit = cacheLimit;
  }

  public get files() {
    return Array.from(this._files.entries());
  }

  clearCache() {
    this._blobs.clear();
    this._strings.clear();
    this._cacheOrder = [];
  }

  private _evictIfNeeded(key: string) {
    if (this._cacheLimit && this._cacheOrder.length >= this._cacheLimit) {
      const oldest = this._cacheOrder.shift();
      if (oldest) {
        this._blobs.delete(oldest);
        this._strings.delete(oldest);
      }
    }
    this._cacheOrder.push(key);
  }

  static async fromUrl(url: string, timeoutMs = 30000) {
    const fetchPromise = fetch(url)
      .then(async (response) => {
        if (response.status >= 400)
          throw new Error(`Failed to load: ${url} - ${response.status}`);
        return response.arrayBuffer();
      })
      .catch((err) => {
        console.error(`[ShroomAssetBundle] Error fetching url '${url}':`, err);
        throw err;
      });
    const buffer = await withTimeout(fetchPromise, timeoutMs, `Fetching asset bundle '${url}' timed out`);
    return ShroomAssetBundle.fromBuffer(buffer);
  }

  static fromBuffer(buffer: ArrayBuffer | Buffer) {
    const byteBuffer = ByteBuffer.wrap(buffer);

    const readFile = () => {
      const fileNameLength = byteBuffer.readUint16();
      const fileName = byteBuffer.readString(fileNameLength);
      const fileLength = byteBuffer.readUint32();
      const buffer = byteBuffer.readBytes(fileLength);

      return {
        fileName,
        buffer: buffer.toArrayBuffer(),
      };
    };

    const version = byteBuffer.readByte();
    const fileCount = byteBuffer.readUint16();
    const files: { fileName: string; buffer: ArrayBuffer | Buffer }[] = [];

    for (let i = 0; i < fileCount; i++) {
      const file = readFile();
      files.push(file);
    }

    return new ShroomAssetBundle(files);
  }

  addFile(fileName: string, buffer: ArrayBuffer | Buffer) {
    this._files.set(fileName, buffer);
  }

  toBuffer(): Buffer {
    const byteBuffer = new ByteBuffer();
    byteBuffer.writeByte(ShroomAssetBundle.VERSION);
    byteBuffer.writeUint16(this._files.size);

    this._files.forEach((buffer, key) => {
      byteBuffer.writeUint16(key.length);
      byteBuffer.writeString(key);
      byteBuffer.writeUint32(buffer.byteLength);
      byteBuffer.append(buffer);
    });

    return byteBuffer.flip().toBuffer();
  }

  async getBlob(name: string): Promise<Blob> {
    const current = this._blobs.get(name);
    if (current != null) return current;

    const buffer = this._files.get(name);
    if (buffer == null) {
      const err = new Error(`[ShroomAssetBundle] Couldn't find blob '${name}'.`);
      console.error(err);
      throw err;
    }

    let blob: Blob;
    try {
      blob = new Blob([buffer]);
    } catch (err) {
      console.error(`[ShroomAssetBundle] Error creating Blob for '${name}':`, err);
      throw err;
    }
    this._blobs.set(name, blob);
    this._evictIfNeeded(name);
    return blob;
  }

  async getString(name: string): Promise<string> {
    const current = this._strings.get(name);
    if (current != null) return current;

    const buffer = this._files.get(name);
    if (buffer == null) {
      const err = new Error(`[ShroomAssetBundle] Couldn't find string '${name}'.`);
      console.error(err);
      throw err;
    }

    let string: string;
    try {
      const encoder = new TextDecoder();
      string = encoder.decode(buffer);
    } catch (err) {
      console.error(`[ShroomAssetBundle] Error decoding string for '${name}':`, err);
      throw new Error(`[ShroomAssetBundle] Failed to decode string for '${name}': ${err}`);
    }
    this._strings.set(name, string);
    this._evictIfNeeded(name);
    return string;
  }
}
