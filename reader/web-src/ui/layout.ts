import { BRAND_SUB_IDLE, DEFAULT_HINT_TEXT } from "../constants";
import { els, syncTopbarHeight } from "../dom/elements";
import { state } from "../state/store";

let topbarRepaginateHandler: (() => void) | null = null;

export function registerTopbarRepaginateHandler(handler: () => void): void {
  topbarRepaginateHandler = handler;
}

export function applyTopbarVisibility(): void {
  const hidden = !!state.chapter && !state.topVisible;
  document.body.classList.toggle("topbarHidden", hidden);
  if (!hidden) syncTopbarHeight();
}

export function setTopbarVisible(visible: boolean, opts: { skipRepaginate?: boolean } = {}): void {
  const next = !!visible;
  if (state.topVisible === next) return;
  state.topVisible = next;
  applyTopbarVisibility();
  if (opts.skipRepaginate) return;
  if (state.chapter) {
    topbarRepaginateHandler?.();
  }
}

export function setFontSheetOpen(open: boolean): void {
  const next = !!open;
  if (state.fontSheetOpen === next) return;
  state.fontSheetOpen = next;
  els.fontSheet.classList.toggle("open", next);
  els.fontSheet.setAttribute("aria-hidden", next ? "false" : "true");
  els.sheetScrim.hidden = !next;
  document.body.classList.toggle("fontSheetOpen", next);
}

export function showDrawer(open: boolean): void {
  const isMobile = window.matchMedia("(max-width: 980px)").matches;
  if (open) setFontSheetOpen(false);
  els.drawer.classList.toggle("open", open);
  // Desktop: drawer sits in layout, no need for a blocking scrim.
  // Mobile: drawer overlays content; scrim helps close and prevents accidental taps.
  els.scrim.hidden = !(open && isMobile);
  els.drawer.setAttribute("aria-hidden", open ? "false" : "true");
}

export function setIntroCompact(compact: boolean): void {
  els.introCard.classList.toggle("compact", !!compact);
}

export function setExportButtonsDisabled(disabled: boolean): void {
  const next = !!disabled;
  if (els.exportTxtTop) els.exportTxtTop.disabled = next;
  if (els.exportTxt) els.exportTxt.disabled = next;
}

export function isTopTap(clientY: number, rect: DOMRect): boolean {
  const y = clientY - rect.top;
  const topZoneH = Math.max(56, Math.min(120, rect.height * 0.18));
  return y >= 0 && y <= topZoneH;
}

export function showHint(text: string, opts: { autoResetMs?: number } = {}): void {
  const nextText = String(text || "").trim() || DEFAULT_HINT_TEXT;
  els.hint.textContent = nextText;
  if (state.hintTimer) {
    clearTimeout(state.hintTimer);
    state.hintTimer = null;
  }
  const autoResetMs = Number(opts.autoResetMs) || 0;
  if (autoResetMs > 0) {
    state.hintTimer = setTimeout(() => {
      state.hintTimer = null;
      els.hint.textContent = DEFAULT_HINT_TEXT;
    }, autoResetMs);
  }
}

export function setLoading(isLoading: boolean, label = "", kind = ""): void {
  state.isLoading = isLoading;
  state.loadingKind = isLoading ? String(kind || "") : "";
  els.urlInput.disabled = isLoading;
  els.brandSub.textContent = isLoading ? label || "Loading..." : BRAND_SUB_IDLE;
  const showChapterOverlay = isLoading && state.loadingKind === "chapter";
  els.loadingOverlay.hidden = !showChapterOverlay;
  if (showChapterOverlay) {
    els.loadingLabel.textContent = label || "加载中...";
  }
}
