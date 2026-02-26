import { syncTopbarHeight, els } from "./dom/elements";
import {
  adjustBrightness,
  adjustFont,
  adjustFontWeight,
  exportBookToTxt,
  goNext,
  goPrev,
  loadChapter,
  openFontSheet,
  openUrl,
  repaginateCurrentChapter,
  reflowCurrentChapter,
} from "./reader/actions";
import { getHashUrl } from "./reader/navigation";
import { repaginateForViewportModeSwitch } from "./reader/reflow";
import { ensureReadableWeightFont, saveProgressForCurrentBook, setBrightness, setFontPx, setFontWeight } from "./state/preferences";
import { state } from "./state/store";
import {
  applyTopbarVisibility,
  isTopTap,
  registerTopbarRepaginateHandler,
  setFontSheetOpen,
  setTopbarVisible,
  showDrawer,
} from "./ui/layout";
import { renderChapters, renderEmptyState } from "./ui/render";

syncTopbarHeight();
setFontPx(state.fontPx);
setFontWeight(state.fontWeight);
setBrightness(state.brightness);
ensureReadableWeightFont();
registerTopbarRepaginateHandler(() => {
  void repaginateForViewportModeSwitch();
});

let touch: { x: number; y: number; time: number } | null = null;
function onTouchStart(e: TouchEvent): void {
  const t = e.touches?.[0];
  if (!t) return;
  touch = { x: t.clientX, y: t.clientY, time: Date.now() };
}

function onTouchEnd(e: TouchEvent): void {
  if (!touch) return;
  const t = e.changedTouches?.[0];
  if (!t) return;
  const dx = t.clientX - touch.x;
  const dy = t.clientY - touch.y;
  const dt = Date.now() - touch.time;
  touch = null;

  // Horizontal swipe
  if (dt < 800 && Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) {
    if (dx < 0) goNext();
    else goPrev();
  }
}

els.urlForm.addEventListener("submit", (e) => {
  e.preventDefault();
  void openUrl(els.urlInput.value);
});

els.hideTopbar.addEventListener("click", () => {
  setFontSheetOpen(false);
  setTopbarVisible(false);
});

els.toggleChapters.addEventListener("click", () => showDrawer(!els.drawer.classList.contains("open")));
els.closeDrawer.addEventListener("click", () => showDrawer(false));
els.scrim.addEventListener("click", () => showDrawer(false));

els.pageFooter.addEventListener("click", openFontSheet);
els.pageFooter.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  e.preventDefault();
  openFontSheet();
});
els.sheetScrim.addEventListener("click", () => setFontSheetOpen(false));
els.closeFontSheet.addEventListener("click", () => setFontSheetOpen(false));

els.chapterSearch.addEventListener("input", () => renderChapters(els.chapterSearch.value));
els.chapterList.addEventListener("click", (e: MouseEvent) => {
  if (state.isLoading) return;
  const target = e.target as HTMLElement | null;
  const item = target?.closest(".chapterItem") as HTMLElement | null;
  if (!item) return;
  const idx = Number(item.getAttribute("data-idx"));
  const chap = state.chapters[idx];
  if (!chap) return;
  void loadChapter(chap.url, { openDrawer: false, fromBook: true });
});

els.exportTxt.addEventListener("click", () => {
  void exportBookToTxt();
});
els.exportTxtTop?.addEventListener("click", () => {
  void exportBookToTxt();
});

els.pageBody.addEventListener("click", (e: MouseEvent) => {
  if (state.isLoading) return;
  if (state.fontSheetOpen) {
    setFontSheetOpen(false);
    return;
  }
  // Ignore clicks that come from text selection.
  const sel = window.getSelection?.();
  if (sel && String(sel).trim()) return;

  const rect = els.pageBody.getBoundingClientRect();
  if (state.chapter && !state.topVisible && isTopTap(e.clientY, rect)) {
    setTopbarVisible(true);
    return;
  }
  const x = e.clientX - rect.left;
  const leftEdge = rect.width * 0.35;
  const rightEdge = rect.width * 0.65;
  if (x < leftEdge) goPrev();
  else if (x > rightEdge) goNext();
});

els.pageText.addEventListener("touchstart", onTouchStart, { passive: true });
els.pageText.addEventListener("touchend", onTouchEnd, { passive: true });

window.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key === "Escape" && state.fontSheetOpen) {
    setFontSheetOpen(false);
    return;
  }
  if (e.key === "ArrowRight") goNext();
  if (e.key === "ArrowLeft") goPrev();
  if (e.key === "Escape") showDrawer(false);
});

els.fontMinus.addEventListener("click", () => adjustFont(-1));
els.fontPlus.addEventListener("click", () => adjustFont(1));
els.weightMinus.addEventListener("click", () => adjustFontWeight(-1));
els.weightPlus.addEventListener("click", () => adjustFontWeight(1));
els.brightnessMinus.addEventListener("click", () => adjustBrightness(-1));
els.brightnessPlus.addEventListener("click", () => adjustBrightness(1));
els.reflow.addEventListener("click", reflowCurrentChapter);
els.fontMinusSheet.addEventListener("click", () => adjustFont(-1));
els.fontPlusSheet.addEventListener("click", () => adjustFont(1));
els.weightMinusSheet.addEventListener("click", () => adjustFontWeight(-1));
els.weightPlusSheet.addEventListener("click", () => adjustFontWeight(1));
els.brightnessMinusSheet.addEventListener("click", () => adjustBrightness(-1));
els.brightnessPlusSheet.addEventListener("click", () => adjustBrightness(1));
els.reflowSheet.addEventListener("click", reflowCurrentChapter);

els.toggleIntro.addEventListener("click", () => {
  const compact = els.introCard.classList.contains("compact");
  els.introCard.classList.toggle("compact", !compact);
});

window.addEventListener("resize", () => {
  applyTopbarVisibility();
  // If drawer is open, re-evaluate whether scrim should be shown (mobile only).
  if (els.drawer.classList.contains("open")) showDrawer(true);
  if (!state.chapter) return;
  // Debounce via microtask-ish delay.
  clearTimeout((window as any).__danmeiResizeT);
  (window as any).__danmeiResizeT = setTimeout(() => {
    void repaginateCurrentChapter({ preserveProgress: true, waitForLayout: true });
  }, 180);
});

window.addEventListener("beforeunload", () => {
  saveProgressForCurrentBook();
});

window.addEventListener("pagehide", () => {
  saveProgressForCurrentBook();
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    saveProgressForCurrentBook();
  }
});

// Initial state: prefer hash, then last URL; otherwise show an input hint.
const initial = getHashUrl() || state.lastUrl || "";
els.urlInput.value = initial;
if (initial) {
  void openUrl(initial);
} else {
  renderEmptyState();
}
showDrawer(false);
