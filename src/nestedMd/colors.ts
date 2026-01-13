import chroma from "chroma-js";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function tryChroma(value: string): chroma.Color | null {
  try {
    return chroma(value);
  } catch {
    return null;
  }
}

export function toDarkBgColor(value: string): string {
  const parsed = tryChroma(value);
  if (!parsed) return value;
  const opaque = parsed.alpha(1);
  const lum = opaque.luminance();
  const lch = opaque.lch();
  const c = lch[1];
  const h = lch[2];
  const hue = Number.isFinite(h) ? h : 210;
  const baseChroma = Number.isFinite(c) ? c : 0;
  const chromaAmount = Number.isFinite(h)
    ? clamp(Math.max(baseChroma, 20), 20, 52)
    : 0;
  const targetL = lum > 0.85 ? 26 : lum > 0.7 ? 24 : lum > 0.55 ? 22 : 20;
  const targetAlpha =
    lum > 0.85 ? 0.78 : lum > 0.7 ? 0.72 : lum > 0.55 ? 0.66 : 0.6;
  const alpha = clamp(parsed.alpha() * targetAlpha, 0, targetAlpha);
  return chroma.lch(targetL, chromaAmount, hue).alpha(alpha).css();
}

export function toDarkBorderColor(value: string): string {
  const parsed = tryChroma(value);
  if (!parsed) return value;
  const opaque = parsed.alpha(1);
  const lum = opaque.luminance();
  const lch = opaque.lch();
  const c = lch[1];
  const h = lch[2];
  const hue = Number.isFinite(h) ? h : 210;
  const baseChroma = Number.isFinite(c) ? c : 0;
  const chromaAmount = Number.isFinite(h)
    ? clamp(Math.max(baseChroma, 28), 28, 90)
    : 0;
  const targetL = lum > 0.7 ? 66 : lum > 0.45 ? 62 : 58;
  const targetAlpha = lum > 0.7 ? 0.82 : lum > 0.45 ? 0.76 : 0.7;
  const alpha = clamp(parsed.alpha() * targetAlpha, 0, targetAlpha);
  return chroma.lch(targetL, chromaAmount, hue).alpha(alpha).css();
}

export function toDarkTextColor(value: string): string {
  const parsed = tryChroma(value);
  if (!parsed) return value;

  const opaque = parsed.alpha(1);
  const lum = opaque.luminance();
  const c = opaque.lch()[1];
  const backdrop = "#0b1220";
  const baseText = chroma("#e2e8f0");
  if (lum < 0.25 && Number.isFinite(c) && c < 40) {
    return baseText.alpha(parsed.alpha()).css();
  }

  const luminanceCandidates = [0.78, 0.82, 0.86, 0.9, 0.94, 0.98];
  let best = opaque;
  for (const lum of luminanceCandidates) {
    const candidate = opaque.luminance(lum);
    best = candidate;
    if (chroma.contrast(candidate, backdrop) >= 4.5) break;
  }

  const chromaAmount = Number.isFinite(c) ? c : 0;
  const mixAmount = clamp((36 - chromaAmount) / 36, 0, 0.75);
  return chroma
    .mix(best, baseText, mixAmount, "rgb")
    .alpha(parsed.alpha())
    .css();
}
