/**
 * Client-side wrap compositor.
 *
 * Tesla Paint Shop wraps are UV textures: artwork must be exactly the template's
 * pixel size and only the template's UV islands are visible on the car. We scale
 * incoming art to the template size, mask it to the UV islands, and emit both the
 * upload-ready PNG and a catalog preview JPG.
 */

import { getTemplate, templateMaskUrl, templateImageUrl } from "@/lib/wrapTemplates";

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not load image: ${src}`));
    img.src = src;
  });

const toBlob = (canvas: HTMLCanvasElement, type: string, quality?: number) =>
  new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Canvas export failed"))),
      type,
      quality
    )
  );

/** Draws `img` to fill w×h without distortion (center-crop). */
function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number
) {
  const scale = Math.max(w / img.width, h / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
}

export interface ComposedWrap {
  /** Tesla-ready UV texture at the template's exact size. */
  png: Blob;
  /** 3:2 catalog preview. */
  preview: Blob;
  pngDataUrl: string;
  previewDataUrl: string;
  width: number;
  height: number;
}

export async function composeWrap(
  artSrc: string,
  templateKey: string
): Promise<ComposedWrap> {
  const template = getTemplate(templateKey);
  const { width, height } = template;

  const [art, mask] = await Promise.all([
    loadImage(artSrc),
    loadImage(templateMaskUrl(templateKey)),
  ]);

  // 1. Masked UV texture (the actual download).
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  drawCover(ctx, art, width, height);
  ctx.globalCompositeOperation = "destination-in";
  ctx.drawImage(mask, 0, 0, width, height);
  ctx.globalCompositeOperation = "source-over";

  const png = await toBlob(canvas, "image/png");
  const pngDataUrl = canvas.toDataURL("image/png");

  // 2. Catalog preview: texture over the template guide art, on a warm backdrop.
  const pw = 900;
  const ph = 600;
  const pcanvas = document.createElement("canvas");
  pcanvas.width = pw;
  pcanvas.height = ph;
  const pctx = pcanvas.getContext("2d")!;
  pctx.fillStyle = "#F7F2E9";
  pctx.fillRect(0, 0, pw, ph);

  const scale = Math.min(pw / width, ph / height) * 0.92;
  const dw = width * scale;
  const dh = height * scale;
  const dx = (pw - dw) / 2;
  const dy = (ph - dh) / 2;
  pctx.drawImage(canvas, dx, dy, dw, dh);

  try {
    const guide = await loadImage(templateImageUrl(templateKey));
    pctx.globalAlpha = 0.35;
    pctx.drawImage(guide, dx, dy, dw, dh);
    pctx.globalAlpha = 1;
  } catch {
    // Guide art is decorative only.
  }

  const preview = await toBlob(pcanvas, "image/jpeg", 0.86);
  const previewDataUrl = pcanvas.toDataURL("image/jpeg", 0.86);

  return { png, preview, pngDataUrl, previewDataUrl, width, height };
}

export const formatBytes = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`;

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
