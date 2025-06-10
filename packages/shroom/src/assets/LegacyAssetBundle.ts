import { IAssetBundle } from "./IAssetBundle";

type CacheEntry<T> = {
  key: string;
  value: Promise<T>;
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

export class LegacyAssetBundle implements IAssetBundle {
  private _blobs: Map<string, Promise<Blob>> = new Map();
  private _strings: Map<string, Promise<string>> = new Map();
  private _cacheOrder: string[] = [];
  private _cacheLimit: number | undefined;

  constructor(private _folderUrl: string, cacheLimit?: number) {
    this._cacheLimit = cacheLimit;
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

  async getBlob(name: string, timeoutMs = 30000): Promise<Blob> {
    const current = this._blobs.get(name);
    if (current != null) return current;

    const imageUrl = `${this._folderUrl}/${name}`;
    const fetchPromise = fetch(imageUrl)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch blob: ${imageUrl} - ${response.status}`);
        }
        return response.blob();
      })
      .catch((err) => {
        console.error(`[LegacyAssetBundle] Error fetching blob '${name}':`, err);
        throw err;
      });
    const blob = withTimeout(fetchPromise, timeoutMs, `Fetching blob '${name}' timed out`);
    this._blobs.set(name, blob);
    this._evictIfNeeded(name);
    return blob;
  }

  async getString(name: string, timeoutMs = 30000): Promise<string> {
    const current = this._strings.get(name);
    if (current != null) return current;

    const imageUrl = `${this._folderUrl}/${name}`;
    const fetchPromise = fetch(imageUrl)
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch string: ${imageUrl} - ${response.status}`);
        }
        return response.text();
      })
      .catch((err) => {
        console.error(`[LegacyAssetBundle] Error fetching string '${name}':`, err);
        throw err;
      });
    const string = withTimeout(fetchPromise, timeoutMs, `Fetching string '${name}' timed out`);
    this._strings.set(name, string);
    this._evictIfNeeded(name);
    return string;
  }
}
