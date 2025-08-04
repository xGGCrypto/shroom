export type CacheEntry<T> = {
  key: string;
  value: T;
};

export function withTimeout<T>(
  promise: Promise<T>,
  ms = 30000,
  errorMsg = "Request timed out"
): Promise<T> {
  let timeout: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeout = setTimeout(() => reject(new Error(errorMsg)), ms);
  });
  return Promise.race([
    promise.finally(() => clearTimeout(timeout)),
    timeoutPromise,
  ]);
}
