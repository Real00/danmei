import { BRIGHTNESS_STEP, FONT_WEIGHT_STEP, SEARCH_COOLDOWN_MS } from "../constants";
import { paginate } from "../domain/pagination";
import { els } from "../dom/elements";
import { apiGet } from "../services/api";
import {
  findChapterUrlByProgress,
  getStoredProgress,
  isProgressForChapter,
  normalizeUrl,
  resolveBookKey,
} from "../services/storage";
import {
  applyScopedFontForCurrentBook,
  saveProgressForCurrentBook,
  setBrightness,
  setFontPx,
  setFontWeight,
} from "../state/preferences";
import { state } from "../state/store";
import { downloadTextFile, sanitizeFilename } from "../utils/text";
import {
  getSearchCooldownLeftSec,
  setExportButtonsDisabled,
  setFontSheetOpen,
  setIntroCompact,
  setIntroPanelOpen,
  setLoading,
  setTopbarVisible,
  showDrawer,
  showHint,
} from "../ui/layout";
import { renderBookCard, renderChapters, renderPage, renderSearchResults } from "../ui/render";
import { findChapterIndexByUrl, pickFirstChapterUrl, setHash } from "./navigation";
import {
  forceReflowCurrentChapter,
  repaginateCurrentChapter,
  waitForLayoutStable,
} from "./reflow";

export async function loadBook(url: string): Promise<void> {
  setLoading(true, "Fetching book...", "book");
  try {
    const book = await apiGet<Record<string, any>>("/api/book", { url });
    const bookKey = resolveBookKey({ bookUrl: book.url, inputUrl: url });
    state.book = book;
    state.currentBookKey = bookKey;
    state.chapters = book.chapters || [];
    setExportButtonsDisabled(!state.chapters.length);
    state.chapterIdx = -1;
    state.chapter = null;
    state.pendingRestore = null;
    state.repaginateToken += 1;
    state.pages = [];
    state.pageIdx = 0;
    setIntroPanelOpen(false);
    applyScopedFontForCurrentBook();
    setTopbarVisible(true, { skipRepaginate: true });
    setFontSheetOpen(false);

    renderBookCard(book);
    setIntroCompact(false);

    renderChapters(els.chapterSearch.value);

    const first = pickFirstChapterUrl(book);
    const storedProgress = getStoredProgress(bookKey);
    let initialChapterUrl = first;
    if (storedProgress) {
      const restoredChapterUrl = findChapterUrlByProgress(state.chapters, storedProgress);
      if (restoredChapterUrl) {
        state.pendingRestore = storedProgress;
        initialChapterUrl = restoredChapterUrl;
      }
    }
    els.readFirst.disabled = !first;
    els.readFirst.onclick = () => first && void loadChapter(first, { openDrawer: false, fromBook: true });
    els.openChapters.onclick = () => showDrawer(true);

    localStorage.setItem("danmei_lastUrl", url);
    setHash(url);

    // Auto-open saved chapter if available; otherwise Chapter 1.
    if (initialChapterUrl) {
      setLoading(true, "Fetching chapter...", "chapter");
      await loadChapter(initialChapterUrl, {
        openDrawer: false,
        fromBook: true,
        compactIntro: true,
        skipLoading: true,
      });
    }
  } finally {
    setLoading(false);
  }
}

export async function loadChapter(
  url: string,
  opts: {
    skipLoading?: boolean;
    openDrawer?: boolean;
    fromBook?: boolean;
    compactIntro?: boolean;
    tryProgressRestore?: boolean;
    fromProgressRestore?: boolean;
  } = {}
): Promise<void> {
  if (!url) return;
  if (!opts.skipLoading) setLoading(true, "Fetching chapter...", "chapter");
  try {
    const chapter = await apiGet<Record<string, any>>("/api/chapter", { url });
    state.chapter = chapter;
    state.currentBookKey = resolveBookKey({
      bookUrl: chapter.bookUrl || state.book?.url,
      chapterBookUrl: state.book?.url,
      inputUrl: url,
    });
    applyScopedFontForCurrentBook();
    state.repaginateToken += 1;
    setFontSheetOpen(false);

    // If user pasted a chapter URL directly, backfill book/chapter list.
    const chapterBookKey = resolveBookKey({ bookUrl: chapter.bookUrl });
    const currentBookKey = resolveBookKey({ bookUrl: state.book?.url });
    const shouldBackfillBook =
      !!chapter.bookUrl &&
      (!state.book ||
        !state.chapters.length ||
        (chapterBookKey && currentBookKey && chapterBookKey !== currentBookKey));
    if (shouldBackfillBook) {
      try {
        const book = await apiGet<Record<string, any>>("/api/book", { url: chapter.bookUrl });
        state.book = book;
        state.currentBookKey = resolveBookKey({
          bookUrl: state.book?.url,
          chapterBookUrl: chapter.bookUrl,
          inputUrl: url,
        });
        setIntroPanelOpen(false);
        applyScopedFontForCurrentBook();
        state.chapters = book.chapters || [];
        setExportButtonsDisabled(!state.chapters.length);
        renderBookCard(book);
        renderChapters(els.chapterSearch.value);
      } catch {
        // Ignore; reader still works with prev/next.
      }
    }

    state.chapterIdx = findChapterIndexByUrl(chapter.url);
    if (state.chapterIdx >= 0) renderChapters(els.chapterSearch.value);

    // Direct chapter URL open: after backfilling book list, try restoring saved progress.
    const shouldTryProgressRestore = opts.tryProgressRestore === true && !opts.fromProgressRestore;
    if (shouldTryProgressRestore && state.currentBookKey) {
      const storedProgress = getStoredProgress(state.currentBookKey);
      if (storedProgress) {
        const targetChapterUrl = findChapterUrlByProgress(state.chapters, storedProgress);
        const currentChapterUrl = normalizeUrl(chapter.url);
        if (targetChapterUrl && normalizeUrl(targetChapterUrl) !== currentChapterUrl) {
          state.pendingRestore = storedProgress;
          await loadChapter(targetChapterUrl, {
            openDrawer: false,
            compactIntro: opts.compactIntro,
            skipLoading: true,
            fromProgressRestore: true,
            tryProgressRestore: false,
          });
          return;
        }
        if (isProgressForChapter(storedProgress, chapter.url, state.chapterIdx)) {
          state.pendingRestore = storedProgress;
        }
      }
    }

    const title = String(state.book?.title || "").trim() || chapter.title || "未命名小说";
    els.chapterTitle.textContent = title;
    els.chapterTitle.title = title;
    els.pageMeta.textContent = "更多设置";
    els.pageMeta.title = "显示顶部菜单";

    await waitForLayoutStable();
    state.pages = paginate(chapter.paragraphs || [], els.pageText, els.measure);
    state.pageIdx = 0;
    if (state.pendingRestore) {
      if (isProgressForChapter(state.pendingRestore, chapter.url, state.chapterIdx)) {
        const totalPages = Math.max(1, state.pages.length || 1);
        const page = Math.round(state.pendingRestore.ratio * Math.max(0, totalPages - 1));
        state.pageIdx = Math.max(0, Math.min(totalPages - 1, page));
      }
      state.pendingRestore = null;
    }
    renderPage();
    saveProgressForCurrentBook();

    if (opts.openDrawer === false) showDrawer(false);
    if (opts.compactIntro) setIntroCompact(true);
    localStorage.setItem("danmei_lastUrl", state.book?.url || chapter.bookUrl || url);
    setHash(state.book?.url || chapter.bookUrl || url);
  } finally {
    if (!opts.skipLoading) setLoading(false);
  }
}

export async function exportBookToTxt(): Promise<void> {
  if (state.isLoading) return;
  const chapters = state.chapters || [];
  if (!chapters.length) {
    alert("当前没有可导出的章节。");
    return;
  }

  const bookTitle = String(state.book?.title || "danmei").trim() || "danmei";
  const fileName = `${sanitizeFilename(bookTitle)}.txt`;
  const blocks: string[] = [];
  const total = chapters.length;

  setExportButtonsDisabled(true);
  setLoading(true, `导出TXT中 0/${total}...`, "export");
  try {
    for (let i = 0; i < total; i += 1) {
      const chapterMeta = chapters[i];
      const chapter = await apiGet<Record<string, any>>("/api/chapter", { url: chapterMeta.url });
      const paragraphs = Array.isArray(chapter.paragraphs)
        ? chapter.paragraphs.map((p) => String(p || "").trim()).filter(Boolean)
        : [];
      const body = paragraphs.join("\r\n\r\n");
      const separator = `\u3010===== 章节 ${i + 1}/${total} =====\u3011`;

      blocks.push(separator);
      if (body) blocks.push(body);
      else blocks.push("（本章无正文）");

      setLoading(true, `导出TXT中 ${i + 1}/${total}...`, "export");
    }

    const header = [
      `书名：${bookTitle}`,
      state.book?.author ? `作者：${state.book.author}` : "",
      `章节总数：${total}`,
      "分隔标记：每章以【===== 章节 i/total =====】开头",
      `导出时间：${new Date().toLocaleString()}`,
    ]
      .filter(Boolean)
      .join("\r\n");
    const content = [header, "", blocks.join("\r\n\r\n")].join("\r\n");
    downloadTextFile(fileName, content);
    showHint(`已导出 ${total} 章`, { autoResetMs: 2200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err || "未知错误");
    alert(`导出失败：${msg}`);
  } finally {
    setLoading(false);
    setExportButtonsDisabled(!state.chapters.length);
  }
}

function clearSearchCooldownTimer(): void {
  if (!state.searchCooldownTimer) return;
  clearInterval(state.searchCooldownTimer);
  state.searchCooldownTimer = null;
}

function startSearchCooldown(durationMs: number): void {
  clearSearchCooldownTimer();
  const duration = Math.max(0, Number(durationMs) || 0);
  if (!duration) {
    state.searchCooldownUntil = 0;
    renderSearchResults();
    return;
  }

  state.searchCooldownUntil = Date.now() + duration;
  const tick = () => {
    const left = getSearchCooldownLeftSec();
    if (left <= 0) {
      state.searchCooldownUntil = 0;
      clearSearchCooldownTimer();
      renderSearchResults();
      return;
    }
    renderSearchResults();
  };

  tick();
  state.searchCooldownTimer = setInterval(tick, 1000);
}

export async function searchBooks(keyword: string): Promise<void> {
  const q = String(keyword || "").trim();
  state.searchKeyword = q;
  if (!q) {
    state.searchResults = [];
    renderSearchResults();
    showHint("请输入搜索关键词", { autoResetMs: 1600 });
    return;
  }

  const cooldownLeft = getSearchCooldownLeftSec();
  if (cooldownLeft > 0) {
    renderSearchResults();
    showHint(`搜索冷却中，请 ${cooldownLeft} 秒后再试`, { autoResetMs: 1600 });
    return;
  }

  state.searchInFlight = true;
  setLoading(true, "Searching books...", "search");
  renderSearchResults();
  try {
    const payload = await apiGet<Record<string, any>>("/api/search", { q });
    state.searchKeyword = String(payload.keyword || q).trim();
    state.searchResults = Array.isArray(payload.results)
      ? payload.results
          .map((item) => ({
            title: String(item?.title || "").trim(),
            url: String(item?.url || "").trim(),
          }))
          .filter((item) => item.title && item.url)
      : [];
    renderSearchResults();
    if (!state.searchResults.length) {
      showHint("未找到相关书籍", { autoResetMs: 1800 });
    }
  } catch (err) {
    state.searchResults = [];
    renderSearchResults();
    const msg = err instanceof Error ? err.message : String(err || "未知错误");
    showHint(`搜索失败：${msg}`, { autoResetMs: 2600 });
  } finally {
    state.searchInFlight = false;
    setLoading(false);
    startSearchCooldown(SEARCH_COOLDOWN_MS);
  }
}

export async function openUrl(url: string): Promise<void> {
  const u = String(url || "").trim();
  if (!u) return;
  if (u.includes("/view/")) return loadChapter(u, { openDrawer: false, tryProgressRestore: true });
  return loadBook(u);
}

export function goNext(): void {
  if (state.isLoading) return;
  if (state.pageIdx < state.pages.length - 1) {
    state.pageIdx += 1;
    renderPage();
    saveProgressForCurrentBook();
    return;
  }
  if (state.chapter?.nextUrl) {
    void loadChapter(state.chapter.nextUrl, { openDrawer: false });
  }
}

export function goPrev(): void {
  if (state.isLoading) return;
  if (state.pageIdx > 0) {
    state.pageIdx -= 1;
    renderPage();
    saveProgressForCurrentBook();
    return;
  }
  if (state.chapter?.prevUrl) {
    void loadChapter(state.chapter.prevUrl, { openDrawer: false });
  }
}

export function adjustFont(delta: number): void {
  setFontPx(state.fontPx + delta);
  if (!state.chapter) return;
  void forceReflowCurrentChapter({ preserveProgress: true, waitForLayout: true, showHint: false });
}

export function adjustFontWeight(delta: number): void {
  setFontWeight(state.fontWeight + delta * FONT_WEIGHT_STEP);
  if (!state.chapter) return;
  void forceReflowCurrentChapter({ preserveProgress: true, waitForLayout: true, showHint: false });
}

export function adjustBrightness(delta: number): void {
  setBrightness(state.brightness + delta * BRIGHTNESS_STEP);
  showHint(`亮度 ${Math.round(state.brightness * 100)}%`, { autoResetMs: 1200 });
}

export function reflowCurrentChapter(): void {
  if (!state.chapter) return;
  void forceReflowCurrentChapter({ preserveProgress: true, waitForLayout: true, showHint: true });
}

export function openFontSheet(): void {
  if (!state.chapter) return;
  showDrawer(false);
  setFontSheetOpen(true);
}

export { repaginateCurrentChapter };
