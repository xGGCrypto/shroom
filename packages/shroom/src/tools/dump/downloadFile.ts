import { promises as fs } from "fs";
import fetch, { Response } from "node-fetch";
import * as path from "path";

function makeAbsolute(url: string) {
  if (url.slice(0, 2) === "//") {
    return `http:${url}`;
  }

  return url;
}

/**
 * Fetches a URL with retry logic for network errors and 5xx responses.
 * @param url The URL to fetch.
 * @returns The fetch Response, or undefined if all retries fail.
 */
export async function fetchRetry(url: string) {
  let response: Response | undefined;
  let count = 0;

  do {
    try {
      response = await fetch(url);
    } catch (e) {
      // Ignore network error
    }

    await new Promise((resolve) => setTimeout(resolve, count * 5000));

    count++;
  } while ((response == null || response.status >= 500) && count < 20);

  return response;
}

/**
 * Downloads a file from a URL and saves it to disk, with retry and error handling.
 * @param params Download parameters (url, savePath).
 * @returns A DownloadFileResult indicating success or error type.
 */
export async function downloadFile({
  url,
  savePath,
}: DownloadRequest): Promise<DownloadFileResult> {
  url = makeAbsolute(url);
  const response = await fetchRetry(url);

  if (response == null) {
    return {
      type: "RETRY_FAILED",
    };
  }

  if (response.status >= 200 && response.status < 300) {
    try {

      await fs.mkdir(path.dirname(savePath), { recursive: true });
      const buffer = await response.buffer();
      // Defensive: Ensure buffer is not undefined/null
      if (!buffer) {
        return {
          type: "FAILED_TO_WRITE",
        };
      }
      // Cast buffer to Uint8Array for compatibility (via unknown)
      await fs.writeFile(savePath, buffer as unknown as Uint8Array);

      return {
        type: "SUCCESS",
        text: async () => buffer.toString("utf-8"),
      };
    } catch (e) {
      return {
        type: "FAILED_TO_WRITE",
      };
    }
  }

  return {
    type: "HTTP_ERROR",
    code: response.status,
  };
}

export type DownloadRequest = { url: string; savePath: string };

export type DownloadFileResult =
  | { type: "SUCCESS"; text: () => Promise<string> }
  | { type: "FAILED_TO_WRITE" }
  | { type: "HTTP_ERROR"; code: number }
  | { type: "RETRY_FAILED" };
