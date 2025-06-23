/**
 * Loads an image from a Blob and returns a data URL.
 * @param blob The Blob to load from.
 * @returns The data URL as a string.
 */
export async function loadImageFromBlob(blob: Blob): Promise<string> {
  if (!blob) throw new Error("No blob provided to loadImageFromBlob");
  const reader = new FileReader();
  const url = await new Promise<string>((resolve, reject) => {
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      if (reader.result) {
        resolve(reader.result as string);
      } else {
        reject(new Error("Failed to read blob as data URL"));
      }
    };
    reader.onerror = () => reject(new Error("FileReader error while reading blob"));
  });
  return url;
}
