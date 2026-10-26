// Shrinks a phone photo before upload: the API takes at most 5 MB (docs/api-contract.md), phone photos are often 3-8 MB,
// and 1600px is plenty for reading ingredients. Runs in the browser; the photo never leaves memory except for the scan call.
export const MAX_SIDE = 1600;
export const MAX_BYTES = 5 * 1024 * 1024;

export function fitSize(width: number, height: number, max = MAX_SIDE): { width: number; height: number } {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

const toJpeg = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));

export async function shrinkPhoto(file: Blob): Promise<Blob> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    // The browser can't decode it (e.g. some HEIC): send as is if it fits, otherwise let the scan report an error.
    if (file.size <= MAX_BYTES) return file;
    throw new Error("photo too large and not decodable");
  }
  const { width, height } = fitSize(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();
  for (const quality of [0.85, 0.7, 0.5]) {
    const blob = await toJpeg(canvas, quality);
    if (blob && blob.size <= MAX_BYTES) return blob;
  }
  throw new Error("could not shrink photo under the limit");
}
