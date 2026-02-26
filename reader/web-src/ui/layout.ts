import { BRAND_SUB_IDLE, DEFAULT_HINT_TEXT } from "../constants";
import { els, syncTopbarHeight } from "../dom/elements";
import { state } from "../state/store";

let topbarRepaginateHandler: (() => void) | null = null;
let topbarRepaginateTimer: ReturnType<typeof setTimeout> | null = null;

export function registerTopbarRepaginateHandler(handler: () => void): void {
  topbarRepaginateHandler = handler;
}

export function applyTopbarVisibility(): void {
  const hidden = !!state.chapter && !state.topVisible;
  document.body.classList.toggle("topbarHidden", hidden);
  const pageMetaAction = state.chapter && state.topVisible ? "隐藏顶部菜单" : "显示顶部菜单";
  els.pageMeta.title = pageMetaAction;
  els.pageMeta.setAttribute("aria-label", pageMetaAction);
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
    // Topbar/main layout uses transition; re-run after animation to lock final page height.
    if (topbarRepaginateTimer) {
      clearTimeout(topbarRepaginateTimer);
      topbarRepaginateTimer = null;
    }
    topbarRepaginateTimer = setTimeout(() => {
      topbarRepaginateTimer = null;
      if (!state.chapter) return;
      if (state.topVisible !== next) return;
      topbarRepaginateHandler?.();
    }, 260);
  }
}

export function applyPanelVisibility(): void {
  const showSearch = !!state.searchPanelOpen;
  const hasBook = !!state.book;
  const showIntro = hasBook && !!state.introPanelOpen;

  els.searchCard.hidden = !showSearch;
  els.introCard.hidden = !showIntro;

  els.toggleSearchPanel.classList.toggle("isActive", showSearch);
  els.toggleSearchPanel.textContent = showSearch ? "收起搜索" : "搜索";

  els.toggleIntroPanel.disabled = !hasBook;
  els.toggleIntroPanel.classList.toggle("isActive", showIntro);
  els.toggleIntroPanel.textContent = showIntro ? "收起介绍" : "介绍";
}

export function setSearchPanelOpen(open: boolean): void {
  const next = !!open;
  if (state.searchPanelOpen === next) return;
  state.searchPanelOpen = next;
  applyPanelVisibility();
  if (state.chapter) {
    topbarRepaginateHandler?.();
  }
}

export function setIntroPanelOpen(open: boolean): void {
  const next = !!open;
  if (state.introPanelOpen === next) return;
  state.introPanelOpen = next;
  applyPanelVisibility();
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

function isSearchLoading(): boolean {
  return !!state.searchInFlight || (state.isLoading && state.loadingKind === "search");
}

export function getSearchCooldownLeftSec(now = Date.now()): number {
  const until = Number(state.searchCooldownUntil) || 0;
  if (!until) return 0;
  return Math.max(0, Math.ceil((until - now) / 1000));
}

export function getSearchStatusText(defaultText: string): string {
  if (isSearchLoading()) return "正在搜索，请稍候...";
  const cooldownLeft = getSearchCooldownLeftSec();
  if (cooldownLeft > 0) return `搜索冷却中，还需 ${cooldownLeft} 秒`;
  return defaultText;
}

export function refreshSearchControls(): void {
  const cooldownLeft = getSearchCooldownLeftSec();
  els.searchInput.disabled = !!state.isLoading;
  els.searchSubmit.disabled = !!state.isLoading || cooldownLeft > 0;

  if (isSearchLoading()) {
    els.searchSubmit.textContent = "搜索中...";
  } else if (cooldownLeft > 0) {
    els.searchSubmit.textContent = `${cooldownLeft}秒后可搜`;
  } else {
    els.searchSubmit.textContent = "搜索";
  }
}

export function setLoading(isLoading: boolean, label = "", kind = ""): void {
  state.isLoading = isLoading;
  state.loadingKind = isLoading ? String(kind || "") : "";
  els.urlInput.disabled = isLoading;
  els.toggleSearchPanel.disabled = isLoading;
  els.toggleIntroPanel.disabled = isLoading || !state.book;
  refreshSearchControls();
  els.brandSub.textContent = isLoading ? label || "Loading..." : BRAND_SUB_IDLE;
  const showChapterOverlay = isLoading && state.loadingKind === "chapter";
  els.loadingOverlay.hidden = !showChapterOverlay;
  if (showChapterOverlay) {
    els.loadingLabel.textContent = label || "加载中...";
  }
}
