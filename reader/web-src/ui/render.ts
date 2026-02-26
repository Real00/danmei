import { DEFAULT_HINT_TEXT, EMPTY_CHAPTER_TITLE, EMPTY_GUIDE_PARAGRAPHS } from "../constants";
import { els } from "../dom/elements";
import { escapeHtml, htmlToParagraphs } from "../utils/text";
import { state } from "../state/store";
import {
  applyTopbarVisibility,
  setExportButtonsDisabled,
  setFontSheetOpen,
  setTopbarVisible,
  showHint,
} from "./layout";

export function renderEmptyState(): void {
  state.book = null;
  state.chapters = [];
  state.chapterIdx = -1;
  state.chapter = null;
  state.currentBookKey = "";
  state.pendingRestore = null;
  state.repaginateToken += 1;
  state.pages = [];
  state.pageIdx = 0;

  setTopbarVisible(true, { skipRepaginate: true });
  setFontSheetOpen(false);
  els.introCard.hidden = true;
  setExportButtonsDisabled(true);
  els.drawerTitle.textContent = "章节";
  els.chapterSearch.value = "";
  renderChapters("");

  els.chapterTitle.textContent = EMPTY_CHAPTER_TITLE;
  els.pageMeta.textContent = "";
  els.pageText.innerHTML = EMPTY_GUIDE_PARAGRAPHS.map((t) => `<p>${escapeHtml(t)}</p>`).join("");
  showHint(DEFAULT_HINT_TEXT);
  els.progress.textContent = "";
  els.loadingOverlay.hidden = true;
}

export function renderChapters(filter = ""): void {
  const needle = (filter || "").trim().toLowerCase();
  const items = state.chapters
    .map((c, i) => ({ ...c, i }))
    .filter((c) => {
      if (!needle) return true;
      return (c.name || "").toLowerCase().includes(needle) || String(c.i + 1).includes(needle);
    });

  els.chapterList.innerHTML = items
    .map((c) => {
      const active = c.i === state.chapterIdx ? "active" : "";
      return `<div class="chapterItem ${active}" data-idx="${c.i}">
        <div class="chapterIdx">${c.i + 1}</div>
        <div class="chapterName">${escapeHtml(c.name)}</div>
      </div>`;
    })
    .join("");
}

export function renderBookCard(book: { title?: string; author?: string; dateText?: string; introHtml?: string }): void {
  if (!book) return;
  els.introCard.hidden = false;
  els.bookTitle.textContent = book.title || "Untitled";
  els.drawerTitle.textContent = book.title ? `章节: ${book.title}` : "章节";
  els.bookMeta.textContent = [book.author ? `作者: ${book.author}` : "", book.dateText || ""]
    .filter(Boolean)
    .join("  ·  ");

  const introPs = htmlToParagraphs(book.introHtml || "");
  els.bookIntro.innerHTML = introPs.map((t) => `<p>${escapeHtml(t)}</p>`).join("");
}

export function renderPage(): void {
  const pages = state.pages || [];
  const idx = Math.max(0, Math.min(state.pageIdx, pages.length - 1));
  state.pageIdx = idx;

  const lines = pages[idx] || [];
  els.pageText.innerHTML = lines.map((t) => `<p>${escapeHtml(t)}</p>`).join("");
  els.pageText.scrollTop = 0;

  const chapterLabel = state.chapterIdx >= 0 ? `Chapter ${state.chapterIdx + 1}` : "";
  const totalPages = pages.length || 1;
  els.progress.textContent = `${chapterLabel}  ${idx + 1}/${totalPages}`;
  els.loadingOverlay.hidden = true;
  applyTopbarVisibility();
}
