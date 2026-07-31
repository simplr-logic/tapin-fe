import type { Area } from "react-easy-crop";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Renders just the cropped region (react-easy-crop gives us the source-pixel
// rect via onCropComplete) onto a canvas sized to match, then reads it back
// out as a Blob — the standard recipe for turning a crop selection into an
// uploadable file.
export async function getCroppedImageBlob(
  imageSrc: string,
  crop: Area,
  mimeType: string
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = crop.width;
  canvas.height = crop.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");

  ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to encode cropped image"))),
      mimeType,
      0.92
    );
  });
}
