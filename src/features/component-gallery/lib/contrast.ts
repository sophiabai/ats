// ---------------------------------------------------------------------------
// WCAG contrast, computed from whatever the browser actually painted.
//
// Everything here reads resolved values off the DOM rather than parsing the
// theme, so the numbers stay honest when tokens change.
//
// Colours are resolved through a 1x1 canvas rather than by parsing the
// computed string: this theme is authored in oklch, and getComputedStyle
// returns `oklch(...)` verbatim, which a naive rgb() parser cannot read.
// Painting the colour and sampling the pixel works for any colour space the
// browser can render.
// ---------------------------------------------------------------------------

export type Rgb = [number, number, number];

let ctx: CanvasRenderingContext2D | null | undefined;

function getCtx(): CanvasRenderingContext2D | null {
  if (ctx !== undefined) return ctx;
  if (typeof document === "undefined") {
    ctx = null;
    return ctx;
  }
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  ctx = canvas.getContext("2d", { willReadFrequently: true });
  return ctx;
}

/** Paints a CSS colour and samples it. Returns null if the browser can't parse it. */
export function toRgb(color: string): Rgb | null {
  const c = getCtx();
  if (!c || !color) return null;

  // Paint twice against opposite backstops: if the colour is unparseable,
  // fillStyle keeps its previous value and the two samples disagree.
  const sample = (backstop: string): Rgb => {
    c.fillStyle = backstop;
    c.fillStyle = color;
    c.clearRect(0, 0, 1, 1);
    c.fillRect(0, 0, 1, 1);
    const d = c.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2]];
  };

  const a = sample("#000000");
  const b = sample("#ffffff");
  if (a[0] !== b[0] || a[1] !== b[1] || a[2] !== b[2]) return null;
  return a;
}

/** Resolves a CSS value (including `var(--token)`) as painted in the document. */
export function resolveColor(value: string): Rgb | null {
  if (typeof document === "undefined") return null;
  const probe = document.createElement("span");
  probe.style.color = value;
  probe.style.position = "absolute";
  probe.style.opacity = "0";
  probe.style.pointerEvents = "none";
  document.body.appendChild(probe);
  const computed = getComputedStyle(probe).color;
  document.body.removeChild(probe);
  return toRgb(computed);
}

function channelLuminance(c: number): number {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance([r, g, b]: Rgb): number {
  return (
    0.2126 * channelLuminance(r) +
    0.7152 * channelLuminance(g) +
    0.0722 * channelLuminance(b)
  );
}

export function contrastRatio(fg: Rgb, bg: Rgb): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

/** Flattens a translucent foreground over its background. */
export function blend(fg: Rgb, bg: Rgb, alpha: number): Rgb {
  return [
    fg[0] * alpha + bg[0] * (1 - alpha),
    fg[1] * alpha + bg[1] * (1 - alpha),
    fg[2] * alpha + bg[2] * (1 - alpha),
  ];
}

export type ContrastGrade = "AAA" | "AA" | "fails" | "exempt";

/**
 * Grades against the normal-text thresholds (4.5 AA, 7 AAA).
 * `exempt` is for text that is decorative or disabled, where WCAG does not apply.
 */
export function gradeContrast(ratio: number, exempt = false): ContrastGrade {
  if (exempt) return "exempt";
  if (ratio >= 7) return "AAA";
  if (ratio >= 4.5) return "AA";
  return "fails";
}
