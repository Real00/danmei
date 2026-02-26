import { DEFAULT_HINT_TEXT, EMPTY_CHAPTER_TITLE, EMPTY_GUIDE_PARAGRAPHS } from "../constants";
import { els } from "../dom/elements";
import { escapeHtml, htmlToParagraphs } from "../utils/text";
import { state } from "../state/store";
import {
  applyPanelVisibility,
  applyTopbarVisibility,
  getSearchStatusText,
  refreshSearchControls,
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
  state.introPanelOpen = false;
  state.searchKeyword = "";
  state.searchResults = [];
  state.currentBookKey = "";
  state.pendingRestore = null;
  state.repaginateToken += 1;
  state.pages = [];
  state.pageIdx = 0;

  setTopbarVisible(true, { skipRepaginate: true });
  setFontSheetOpen(false);
  setExportButtonsDisabled(true);
  els.drawerTitle.textContent = "章节";
  els.chapterSearch.value = "";
  renderChapters("");

  els.chapterTitle.textContent = EMPTY_CHAPTER_TITLE;
  els.chapterTitle.title = EMPTY_CHAPTER_TITLE;
  els.pageMeta.textContent = "更多设置";
  els.pageMeta.title = "显示顶部菜单";
  els.pageText.innerHTML = EMPTY_GUIDE_PARAGRAPHS.map((t) => `<p>${escapeHtml(t)}</p>`).join("");
  showHint(DEFAULT_HINT_TEXT);
  els.progress.textContent = "";
  els.loadingOverlay.hidden = true;
  applyPanelVisibility();
  renderSearchResults();
}

export function renderSearchResults(): void {
  const keyword = String(state.searchKeyword || "").trim();
  const items = Array.isArray(state.searchResults) ? state.searchResults : [];
  let statusText = "";

  if (!keyword) {
    statusText = "输入关键词后点击搜索，选择结果即可打开。";
  } else if (!items.length) {
    statusText = `未找到“${keyword}”相关结果。`;
  } else {
    statusText = `“${keyword}”找到 ${items.length} 条结果，点击即可打开。`;
  }
  els.searchStatus.textContent = getSearchStatusText(statusText);

  els.searchList.innerHTML = items
    .map((item, idx) => {
      const title = escapeHtml(String(item?.title || "未命名书籍"));
      const url = escapeHtml(String(item?.url || ""));
      return `<button class="searchItem" type="button" data-idx="${idx}">
        <div class="searchItemTitle">${title}</div>
        <div class="searchItemUrl">${url}</div>
      </button>`;
    })
    .join("");
  refreshSearchControls();
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
  const bookTitle = String(book.title || "").trim();
  els.chapterTitle.textContent = bookTitle || EMPTY_CHAPTER_TITLE;
  els.chapterTitle.title = bookTitle || EMPTY_CHAPTER_TITLE;
  els.pageMeta.textContent = "更多设置";
  els.pageMeta.title = "显示顶部菜单";
  els.bookTitle.textContent = book.title || "Untitled";
  els.drawerTitle.textContent = book.title ? `章节: ${book.title}` : "章节";
  els.bookMeta.textContent = [book.author ? `作者: ${book.author}` : "", book.dateText || ""]
    .filter(Boolean)
    .join("  ·  ");

  const introPs = htmlToParagraphs(book.introHtml || "");
  els.bookIntro.innerHTML = introPs.map((t) => `<p>${escapeHtml(t)}</p>`).join("");
  applyPanelVisibility();
}

export function renderPage(): void {
  const pages = state.pages || [];
  const idx = Math.max(0, Math.min(state.pageIdx, pages.length - 1));
  state.pageIdx = idx;

  const lines = pages[idx] || [];
  els.pageText.innerHTML = lines.map((t) => `<p>${escapeHtml(t)}</p>`).join("");
  els.pageText.scrollTop = 0;

  const chapterCurrent =
    Number(state.chapter?.chapterIndex) > 0
      ? Number(state.chapter?.chapterIndex)
      : state.chapterIdx >= 0
        ? state.chapterIdx + 1
        : null;
  const chapterTotal =
    Number(state.chapter?.chapterTotal) > 0
      ? Number(state.chapter?.chapterTotal)
      : Array.isArray(state.chapters) && state.chapters.length
        ? state.chapters.length
        : null;
  const totalPages = pages.length || 1;
  if (chapterCurrent && chapterTotal) {
    els.progress.textContent = `第${chapterCurrent}/${chapterTotal}章 ${idx + 1}/${totalPages}页`;
  } else if (chapterCurrent) {
    els.progress.textContent = `第${chapterCurrent}章 ${idx + 1}/${totalPages}页`;
  } else {
    els.progress.textContent = `${idx + 1}/${totalPages}页`;
  }
  els.loadingOverlay.hidden = true;
  applyTopbarVisibility();
}
