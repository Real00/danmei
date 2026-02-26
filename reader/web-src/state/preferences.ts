import {
  DEFAULT_BRIGHTNESS,
  DEFAULT_FONT_PX,
  DEFAULT_FONT_WEIGHT,
  FONT_WEIGHT_STEP,
  MAX_BRIGHTNESS,
  MAX_FONT_WEIGHT,
  MIN_BRIGHTNESS,
  MIN_FONT_WEIGHT,
  READER_FONT_STACK_DEFAULT,
  READER_FONT_STACK_FALLBACK,
  WEIGHT_PROBE_MIN_DELTA,
} from "../constants";
import {
  clamp01,
  getStoredBrightness,
  getStoredFontPx,
  getStoredFontWeight,
  normalizeChapterIndex,
  normalizeChapterPathKey,
  normalizeUrl,
  patchBookScopedState,
} from "../services/storage";
import { state } from "./store";

function detectWeightDelta(fontFamily: string): number {
  if (!fontFamily || !document.body) return 0;
  const probe = document.createElement("span");
  probe.textContent = "阅读字体粗细AaBb123456789";
  probe.style.position = "fixed";
  probe.style.left = "-9999px";
  probe.style.top = "0";
  probe.style.visibility = "hidden";
  probe.style.whiteSpace = "nowrap";
  probe.style.pointerEvents = "none";
  probe.style.fontFamily = fontFamily;
  probe.style.fontSize = `${state.fontPx}px`;
  probe.style.lineHeight = "1";
  probe.style.fontWeight = "400";
  document.body.appendChild(probe);
  const w400 = probe.getBoundingClientRect().width;
  probe.style.fontWeight = "700";
  const w700 = probe.getBoundingClientRect().width;
  probe.remove();
  return Math.abs(w700 - w400);
}

export function ensureReadableWeightFont(): void {
  const rootStyle = getComputedStyle(document.documentElement);
  const currentFamily =
    rootStyle.getPropertyValue("--reader-font-family").trim() || READER_FONT_STACK_DEFAULT;
  const currentDelta = detectWeightDelta(currentFamily);
  if (currentDelta >= WEIGHT_PROBE_MIN_DELTA) return;
  document.documentElement.style.setProperty("--reader-font-family", READER_FONT_STACK_FALLBACK);
}

export function setFontPx(px: number): void {
  const target = Number.isFinite(Number(px)) ? Number(px) : DEFAULT_FONT_PX;
  const clamped = Math.max(14, Math.min(26, target));
  state.fontPx = clamped;
  document.documentElement.style.setProperty("--page-font", `${clamped}px`);
  if (state.currentBookKey) {
    patchBookScopedState(state.currentBookKey, { fontPx: clamped });
  }
}

export function setFontWeight(weight: number): void {
  const target = Number.isFinite(Number(weight)) ? Number(weight) : DEFAULT_FONT_WEIGHT;
  const clamped = Math.max(
    MIN_FONT_WEIGHT,
    Math.min(MAX_FONT_WEIGHT, Math.round(target / FONT_WEIGHT_STEP) * FONT_WEIGHT_STEP)
  );
  state.fontWeight = clamped;
  document.documentElement.style.setProperty("--page-weight", String(clamped));
  if (state.currentBookKey) {
    patchBookScopedState(state.currentBookKey, { fontWeight: clamped });
  }
}

export function setBrightness(value: number): void {
  const target = Number.isFinite(Number(value)) ? Number(value) : DEFAULT_BRIGHTNESS;
  const clamped = Math.max(MIN_BRIGHTNESS, Math.min(MAX_BRIGHTNESS, Math.round(target * 100) / 100));
  state.brightness = clamped;
  document.documentElement.style.setProperty("--page-brightness", clamped.toFixed(2));
  if (state.currentBookKey) {
    patchBookScopedState(state.currentBookKey, { brightness: clamped });
  }
}

export function applyScopedFontForCurrentBook(): void {
  if (!state.currentBookKey) return;
  const savedFontPx = getStoredFontPx(state.currentBookKey);
  const nextFontPx = savedFontPx == null ? DEFAULT_FONT_PX : savedFontPx;
  const fontPx = Math.max(14, Math.min(26, nextFontPx));
  if (state.fontPx !== fontPx) {
    state.fontPx = fontPx;
    document.documentElement.style.setProperty("--page-font", `${fontPx}px`);
  }

  const savedWeight = getStoredFontWeight(state.currentBookKey);
  const nextWeight = savedWeight == null ? DEFAULT_FONT_WEIGHT : savedWeight;
  const weight = Math.max(
    MIN_FONT_WEIGHT,
    Math.min(MAX_FONT_WEIGHT, Math.round(nextWeight / FONT_WEIGHT_STEP) * FONT_WEIGHT_STEP)
  );
  if (state.fontWeight !== weight) {
    state.fontWeight = weight;
    document.documentElement.style.setProperty("--page-weight", String(weight));
  }

  const savedBrightness = getStoredBrightness(state.currentBookKey);
  const nextBrightness = savedBrightness == null ? DEFAULT_BRIGHTNESS : savedBrightness;
  const brightness = Math.max(
    MIN_BRIGHTNESS,
    Math.min(MAX_BRIGHTNESS, Math.round(Number(nextBrightness) * 100) / 100)
  );
  if (state.brightness !== brightness) {
    state.brightness = brightness;
    document.documentElement.style.setProperty("--page-brightness", brightness.toFixed(2));
  }
}

export function saveProgressForCurrentBook(): void {
  if (!state.currentBookKey || !state.chapter?.url) return;
  const chapterUrl = normalizeUrl(state.chapter.url);
  if (!chapterUrl) return;
  const totalPages = Math.max(1, state.pages.length || 1);
  const ratio = totalPages > 1 ? clamp01(state.pageIdx / (totalPages - 1)) : 0;
  const chapterIndex = normalizeChapterIndex(
    state.chapterIdx >= 0 ? state.chapterIdx + 1 : state.chapter?.chapterIndex
  );
  const chapterPathKey = normalizeChapterPathKey(chapterUrl);
  const bookUrlNormalized = normalizeUrl(state.book?.url || state.chapter?.bookUrl || state.currentBookKey);
  const progress: Record<string, unknown> = {
    chapterUrl,
    chapterPathKey,
    ratio,
    updatedAt: Date.now(),
  };
  if (chapterIndex != null) progress.chapterIndex = chapterIndex;
  if (bookUrlNormalized) progress.bookUrlNormalized = bookUrlNormalized;
  patchBookScopedState(state.currentBookKey, {
    progress,
  });
}
