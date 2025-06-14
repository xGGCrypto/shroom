/**
 * Loads an image from a URL and returns the HTMLImageElement.
 * @param imageUrl The image URL.
 * @returns The loaded HTMLImageElement.
 */
export async function loadImageFromUrl(imageUrl: string): Promise<HTMLImageElement> {
  if (!imageUrl) throw new Error("No imageUrl provided to loadImageFromUrl");
  const image = new Image();
  image.src = imageUrl;
  await new Promise<{ width: number; height: number }>((resolve, reject) => {
    image.onload = () => {
      resolve({ width: image.width, height: image.height });
    };
    image.onerror = (value) => reject(new Error("Failed to load image: " + imageUrl));
  });
  return image;
}
