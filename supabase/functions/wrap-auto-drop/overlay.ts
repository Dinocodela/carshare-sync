/**
 * Title-card overlay for wrap reels.
 *
 * Renders an elegant, centred typographic lockup (Playfair Display for the
 * title, Inter for the supporting lines) as a transparent PNG that gets
 * composited onto the 1080x1920 hero frame used as the reel's first frame.
 *
 * Everything is laid out inside a hard safe area so text never touches the
 * left/right edges or the Instagram UI zones at the top and bottom.
 */
import { initWasm, Resvg } from "https://esm.sh/@resvg/resvg-wasm@2.6.2";

const WASM_URL = "https://esm.sh/@resvg/resvg-wasm@2.6.2/index_bg.wasm";
const SERIF_URL =
  "https://raw.githubusercontent.com/google/fonts/main/ofl/playfairdisplay/PlayfairDisplay%5Bwght%5D.ttf";
const SANS_URL =
  "https://raw.githubusercontent.com/google/fonts/main/ofl/inter/Inter%5Bopsz,wght%5D.ttf";

export const CANVAS_W = 1080;
export const CANVAS_H = 1920;
/** Horizontal safe margin — nothing is ever drawn outside this. */
const SAFE_X = 120;
const SAFE_W = CANVAS_W - SAFE_X * 2; // 840px of usable width

let wasmReady: Promise<void> | null = null;
let fonts: Uint8Array[] | null = null;

async function ready() {
  if (!wasmReady) {
    wasmReady = (async () => {
      const wasm = await fetch(WASM_URL);
      await initWasm(await wasm.arrayBuffer());
    })();
  }
  await wasmReady;
  if (!fonts) {
    const [serif, sans] = await Promise.all([
      fetch(SERIF_URL).then((r) => r.arrayBuffer()),
      fetch(SANS_URL).then((r) => r.arrayBuffer()),
    ]);
    fonts = [new Uint8Array(serif), new Uint8Array(sans)];
  }
}

const escapeXml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Greedy word wrap using an average-glyph-width estimate, then a hard font-size
 * clamp so even a single long word fits inside the safe width.
 */
function wrap(text: string, fontSize: number, ratio: number, maxWidth: number) {
  const perChar = fontSize * ratio;
  const maxChars = Math.max(6, Math.floor(maxWidth / perChar));
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (next.length <= maxChars) line = next;
    else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  const longest = lines.reduce((m, l) => Math.max(m, l.length), 1);
  // shrink if a single unbreakable word still overflows
  const scale = Math.min(1, maxChars / longest);
  return { lines, fontSize: Math.round(fontSize * scale) };
}

export interface TitleCard {
  /** Small caps line above the title, e.g. "MODEL Y · FREE DIGITAL WRAP". */
  kicker: string;
  /** The wrap name. */
  title: string;
  /** One short supporting line, e.g. the model + call to action. */
  subtitle: string;
}

/** Transparent 1080x1920 PNG with the centred title lockup. */
export async function renderTitleOverlay(card: TitleCard): Promise<Uint8Array> {
  await ready();

  const kicker = escapeXml(card.kicker.toUpperCase());
  const title = wrap(card.title, 132, 0.5, SAFE_W);
  const subtitle = wrap(card.subtitle, 40, 0.52, SAFE_W);

  const cx = CANVAS_W / 2;
  const titleLead = Math.round(title.fontSize * 1.06);
  const subLead = Math.round(subtitle.fontSize * 1.4);

  // Block is anchored in the lower third, above the Instagram caption zone.
  const blockH =
    46 + 34 + title.lines.length * titleLead + 40 + subtitle.lines.length * subLead;
  let y = CANVAS_H - 420 - blockH + 46;

  const parts: string[] = [];
  parts.push(
    `<text x="${cx}" y="${y}" text-anchor="middle" font-family="Inter" font-size="30" ` +
      `letter-spacing="9" fill="#F7F2E9" fill-opacity="0.85">${kicker}</text>`,
  );
  y += 34;
  for (const line of title.lines) {
    y += titleLead;
    parts.push(
      `<text x="${cx}" y="${y}" text-anchor="middle" font-family="Playfair Display" ` +
        `font-size="${title.fontSize}" fill="#FFFDF9">${escapeXml(line)}</text>`,
    );
  }
  y += 40;
  parts.push(
    `<rect x="${cx - 70}" y="${y - 20}" width="140" height="2" fill="#C6A15B" fill-opacity="0.9"/>`,
  );
  for (const line of subtitle.lines) {
    y += subLead;
    parts.push(
      `<text x="${cx}" y="${y}" text-anchor="middle" font-family="Inter" ` +
        `font-size="${subtitle.fontSize}" letter-spacing="1.5" fill="#F7F2E9" ` +
        `fill-opacity="0.92">${escapeXml(line)}</text>`,
    );
  }

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${CANVAS_W}" height="${CANVAS_H}" ` +
    `viewBox="0 0 ${CANVAS_W} ${CANVAS_H}">` +
    `<defs><linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0.45" stop-color="#0E3D3A" stop-opacity="0"/>` +
    `<stop offset="0.72" stop-color="#0B1A19" stop-opacity="0.55"/>` +
    `<stop offset="1" stop-color="#0B1A19" stop-opacity="0.85"/>` +
    `</linearGradient></defs>` +
    `<rect width="${CANVAS_W}" height="${CANVAS_H}" fill="url(#scrim)"/>` +
    parts.join("") +
    `</svg>`;

  const resvg = new Resvg(svg, {
    background: "rgba(0,0,0,0)",
    fitTo: { mode: "width", value: CANVAS_W },
    font: { fontBuffers: fonts!, defaultFontFamily: "Inter", loadSystemFonts: false },
  });
  return resvg.render().asPng();
}
