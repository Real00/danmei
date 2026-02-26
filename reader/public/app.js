/* global DOMParser */

const els = {
  urlForm: document.getElementById("urlForm"),
  urlInput: document.getElementById("urlInput"),
  brandSub: document.getElementById("brandSub"),
  hideTopbar: document.getElementById("hideTopbar"),

  drawer: document.getElementById("drawer"),
  scrim: document.getElementById("scrim"),
  toggleChapters: document.getElementById("toggleChapters"),
  closeDrawer: document.getElementById("closeDrawer"),
  openChapters: document.getElementById("openChapters"),
  chapterSearch: document.getElementById("chapterSearch"),
  chapterList: document.getElementById("chapterList"),
  drawerTitle: document.getElementById("drawerTitle"),

  introCard: document.getElementById("introCard"),
  bookTitle: document.getElementById("bookTitle"),
  bookMeta: document.getElementById("bookMeta"),
  bookIntro: document.getElementById("bookIntro"),
  readFirst: document.getElementById("readFirst"),
  toggleIntro: document.getElementById("toggleIntro"),

  pageCard: document.getElementById("pageCard"),
  chapterTitle: document.getElementById("chapterTitle"),
  pageMeta: document.getElementById("pageMeta"),
  pageBody: document.getElementById("pageBody"),
  pageFooter: document.getElementById("pageFooter"),
  pageText: document.getElementById("pageText"),
  loadingOverlay: document.getElementById("loadingOverlay"),
  loadingLabel: document.getElementById("loadingLabel"),
  progress: document.getElementById("progress"),
  hint: document.getElementById("hint"),

  tapLeft: document.getElementById("tapLeft"),
  tapRight: document.getElementById("tapRight"),
  measure: document.getElementById("measure"),

  fontMinus: document.getElementById("fontMinus"),
  fontPlus: document.getElementById("fontPlus"),
  weightMinus: document.getElementById("weightMinus"),
  weightPlus: document.getElementById("weightPlus"),
  reflow: document.getElementById("reflow"),
  sheetScrim: document.getElementById("sheetScrim"),
  fontSheet: document.getElementById("fontSheet"),
  fontMinusSheet: document.getElementById("fontMinusSheet"),
  fontPlusSheet: document.getElementById("fontPlusSheet"),
  weightMinusSheet: document.getElementById("weightMinusSheet"),
  weightPlusSheet: document.getElementById("weightPlusSheet"),
  reflowSheet: document.getElementById("reflowSheet"),
  closeFontSheet: document.getElementById("closeFontSheet"),
};

function syncTopbarHeight() {
  const topbar = document.querySelector(".topbar");
  if (!topbar) return;
  const h = Math.max(56, Math.min(140, topbar.offsetHeight || 74));
  document.documentElement.style.setProperty("--top", `${h}px`);
}

syncTopbarHeight();

const DEFAULT_FONT_PX = 18;
const DEFAULT_FONT_WEIGHT = 500;
const MIN_FONT_WEIGHT = 300;
const MAX_FONT_WEIGHT = 900;
const FONT_WEIGHT_STEP = 100;
const READER_STATE_KEY = "danmei_reader_state_v1";
const READER_STATE_VERSION = 1;

let readerStateCache = null;

function createEmptyReaderState() {
  return { version: READER_STATE_VERSION, books: {} };
}

function isPlainObject(v) {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

function clamp01(n) {
  return Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));
}

function normalizeUrl(url) {
  const u = String(url || "").trim();
  if (!u) return "";
  try {
    const parsed = new URL(u);
    parsed.hash = "";
    if (parsed.pathname.length > 1) parsed.pathname = parsed.pathname.replace(/\/+$/, "");
    return parsed.toString();
  } catch {
    return u;
  }
}

function resolveBookKey(opts = {}) {
  return normalizeUrl(opts.bookUrl || opts.chapterBookUrl || opts.inputUrl || "");
}

function readReaderState() {
  if (readerStateCache) return readerStateCache;
  try {
    const raw = localStorage.getItem(READER_STATE_KEY);
    if (!raw) {
      readerStateCache = createEmptyReaderState();
      return readerStateCache;
    }
    const parsed = JSON.parse(raw);
    if (!isPlainObject(parsed) || !isPlainObject(parsed.books)) throw new Error("Invalid reader state");
    readerStateCache = { version: READER_STATE_VERSION, books: parsed.books };
  } catch {
    readerStateCache = createEmptyReaderState();
  }
  return readerStateCache;
}

function writeReaderState() {
  try {
    localStorage.setItem(READER_STATE_KEY, JSON.stringify(readReaderState()));
  } catch {
    // Ignore quota / privacy mode write failures.
  }
}

function readBookScopedState(bookKey) {
  if (!bookKey) return null;
  const stateObj = readReaderState();
  const val = stateObj.books[bookKey];
  return isPlainObject(val) ? val : null;
}

function patchBookScopedState(bookKey, partial) {
  if (!bookKey || !isPlainObject(partial)) return;
  const stateObj = readReaderState();
  const prev = readBookScopedState(bookKey) || {};
  stateObj.books[bookKey] = { ...prev, ...partial };
  writeReaderState();
}

function getStoredFontPx(bookKey) {
  const bookState = readBookScopedState(bookKey);
  const n = Number(bookState?.fontPx);
  return Number.isFinite(n) ? n : null;
}

function getStoredFontWeight(bookKey) {
  const bookState = readBookScopedState(bookKey);
  const n = Number(bookState?.fontWeight);
  return Number.isFinite(n) ? n : null;
}

function getStoredProgress(bookKey) {
  const bookState = readBookScopedState(bookKey);
  if (!isPlainObject(bookState?.progress)) return null;
  const chapterUrl = normalizeUrl(bookState.progress.chapterUrl);
  if (!chapterUrl) return null;
  return {
    chapterUrl,
    ratio: clamp01(Number(bookState.progress.ratio)),
    updatedAt: Number(bookState.progress.updatedAt) || Date.now(),
  };
}

function findChapterUrlByNormalized(chapters, normalizedChapterUrl) {
  const target = normalizeUrl(normalizedChapterUrl);
  if (!target) return null;
  const hit = (chapters || []).find((c) => normalizeUrl(c.url) === target);
  return hit?.url || null;
}

const state = {
  book: null,
  chapters: [],
  chapterIdx: -1,
  chapter: null,
  pages: [],
  pageIdx: 0,
  fontPx: DEFAULT_FONT_PX,
  fontWeight: DEFAULT_FONT_WEIGHT,
  lastUrl: localStorage.getItem("danmei_lastUrl") || "",
  isLoading: false,
  loadingKind: "",
  topVisible: true,
  fontSheetOpen: false,
  repaginateToken: 0,
  currentBookKey: "",
  pendingRestore: null,
};

const BRAND_SUB_IDLE = "可传入 dmxs.org URL（#u=...），或在上方输入书籍链接";
const EMPTY_CHAPTER_TITLE = "未加载内容";
const EMPTY_GUIDE_PARAGRAPHS = [
  "请在上方输入 dmxs.org 书籍 URL 后点击 Open。",
  "也可以通过地址栏 #u=... 传入 URL，页面会自动打开。",
];

function isMobileViewport() {
  return window.matchMedia("(max-width: 980px)").matches;
}

function applyTopbarVisibility() {
  const hidden = !!state.chapter && !state.topVisible;
  document.body.classList.toggle("topbarHidden", hidden);
  if (!hidden) syncTopbarHeight();
}

async function repaginateCurrentChapter(opts = {}) {
  if (!state.chapter) return;
  const token = ++state.repaginateToken;
  const preserveProgress = opts.preserveProgress !== false;
  const shouldWait = opts.waitForLayout !== false;

  let oldRatio = 0;
  if (preserveProgress) {
    const oldTotal = Math.max(1, state.pages.length || 1);
    oldRatio = state.pageIdx / Math.max(1, oldTotal - 1);
  }

  if (shouldWait) await waitForLayoutStable();
  if (token !== state.repaginateToken) return;
  if (!state.chapter) return;

  state.pages = paginate(state.chapter.paragraphs || []);
  if (token !== state.repaginateToken) return;

  const total = Math.max(1, state.pages.length || 1);
  if (preserveProgress) {
    state.pageIdx = Math.max(0, Math.min(total - 1, Math.round(oldRatio * Math.max(1, total - 1))));
  } else {
    state.pageIdx = Math.max(0, Math.min(state.pageIdx, total - 1));
  }
  renderPage();
  saveProgressForCurrentBook();
}

async function repaginateForViewportModeSwitch() {
  if (!state.chapter) return;
  try {
    await repaginateCurrentChapter({ preserveProgress: true, waitForLayout: true });
  } catch {
    // Ignore reflow errors during rapid mode switches.
  }
}

function setTopbarVisible(visible, opts = {}) {
  const next = !!visible;
  if (state.topVisible === next) return;
  state.topVisible = next;
  applyTopbarVisibility();
  if (opts.skipRepaginate) return;
  if (state.chapter) {
    void repaginateForViewportModeSwitch();
  }
}

function setFontSheetOpen(open) {
  const next = !!open;
  if (state.fontSheetOpen === next) return;
  state.fontSheetOpen = next;
  els.fontSheet.classList.toggle("open", next);
  els.fontSheet.setAttribute("aria-hidden", next ? "false" : "true");
  els.sheetScrim.hidden = !next;
  document.body.classList.toggle("fontSheetOpen", next);
}

function isTopTap(clientY, rect) {
  const y = clientY - rect.top;
  const topZoneH = Math.max(56, Math.min(120, rect.height * 0.18));
  return y >= 0 && y <= topZoneH;
}

function setFontPx(px) {
  const target = Number.isFinite(Number(px)) ? Number(px) : DEFAULT_FONT_PX;
  const clamped = Math.max(14, Math.min(26, target));
  state.fontPx = clamped;
  document.documentElement.style.setProperty("--page-font", `${clamped}px`);
  if (state.currentBookKey) {
    patchBookScopedState(state.currentBookKey, { fontPx: clamped });
  }
}

function setFontWeight(weight) {
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

function applyScopedFontForCurrentBook() {
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
}

function saveProgressForCurrentBook() {
  if (!state.currentBookKey || !state.chapter?.url) return;
  const chapterUrl = normalizeUrl(state.chapter.url);
  if (!chapterUrl) return;
  const totalPages = Math.max(1, state.pages.length || 1);
  const ratio = totalPages > 1 ? clamp01(state.pageIdx / (totalPages - 1)) : 0;
  patchBookScopedState(state.currentBookKey, {
    progress: {
      chapterUrl,
      ratio,
      updatedAt: Date.now(),
    },
  });
}

setFontPx(state.fontPx);
setFontWeight(state.fontWeight);

function showDrawer(open) {
  const isMobile = window.matchMedia("(max-width: 980px)").matches;
  if (open) setFontSheetOpen(false);
  els.drawer.classList.toggle("open", open);
  // Desktop: drawer sits in layout, no need for a blocking scrim.
  // Mobile: drawer overlays content; scrim helps close and prevents accidental taps.
  els.scrim.hidden = !(open && isMobile);
  els.drawer.setAttribute("aria-hidden", open ? "false" : "true");
}

function setIntroCompact(compact) {
  els.introCard.classList.toggle("compact", !!compact);
}

function escapeHtml(s) {
  return (s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function htmlToParagraphs(html) {
  // Keep basic formatting while avoiding arbitrary scripts/styles.
  const doc = new DOMParser().parseFromString(`<div>${html || ""}</div>`, "text/html");
  const root = doc.body.firstElementChild;
  if (!root) return [];
  const ps = Array.from(root.querySelectorAll("p"));
  if (ps.length) {
    return ps
      .map((p) => p.textContent?.trim() || "")
      .filter(Boolean);
  }
  const t = root.textContent || "";
  return t
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
}

async function apiGet(path, params) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params || {})) {
    if (v == null) continue;
    qs.set(k, String(v));
  }
  const res = await fetch(`${path}?${qs.toString()}`, { headers: { Accept: "application/json" } });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.ok) {
    throw new Error(json.error || `Request failed: ${res.status}`);
  }
  return json;
}

function setLoading(isLoading, label, kind = "") {
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

function renderEmptyState() {
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
  els.brandSub.textContent = BRAND_SUB_IDLE;
  els.introCard.hidden = true;
  els.drawerTitle.textContent = "章节";
  els.chapterSearch.value = "";
  renderChapters("");

  els.chapterTitle.textContent = EMPTY_CHAPTER_TITLE;
  els.pageMeta.textContent = "";
  els.pageText.innerHTML = EMPTY_GUIDE_PARAGRAPHS.map((t) => `<p>${escapeHtml(t)}</p>`).join("");
  els.progress.textContent = "";
  els.loadingOverlay.hidden = true;
}

function renderChapters(filter = "") {
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

function pickFirstChapterUrl(book) {
  if (book.readNowUrl) return book.readNowUrl;
  if (book.chapters && book.chapters.length) return book.chapters[0].url;
  return null;
}

function setHash(url) {
  const u = url ? encodeURIComponent(url) : "";
  history.replaceState(null, "", u ? `#u=${u}` : "#");
}

function getHashUrl() {
  const m = location.hash.match(/u=([^&]+)/);
  if (!m) return null;
  try {
    return decodeURIComponent(m[1]);
  } catch {
    return null;
  }
}

function chunkLong(text) {
  const t = (text || "").trim();
  if (t.length <= 360) return [t];

  const parts = [];
  let start = 0;
  while (start < t.length) {
    let end = Math.min(t.length, start + 360);
    const slice = t.slice(start, end);
    const cut =
      Math.max(
        slice.lastIndexOf("。"),
        slice.lastIndexOf("！"),
        slice.lastIndexOf("？"),
        slice.lastIndexOf("；"),
        slice.lastIndexOf("，")
      ) + 1;
    if (cut > 40) end = start + cut;
    parts.push(t.slice(start, end).trim());
    start = end;
  }
  return parts.filter(Boolean);
}

function paginate(paragraphs) {
  const pageTextEl = els.pageText;
  const measure = els.measure;
  const style = getComputedStyle(pageTextEl);

  const rect = pageTextEl.getBoundingClientRect();
  const width = Math.floor(rect.width || pageTextEl.clientWidth || pageTextEl.offsetWidth || 0);
  const height = Math.floor(rect.height || pageTextEl.clientHeight || pageTextEl.offsetHeight || 0);

  // Mirror the actual reading style and box size.
  measure.style.width = `${Math.max(1, width)}px`;
  measure.style.padding = style.padding;
  measure.style.fontSize = style.fontSize;
  measure.style.fontWeight = style.fontWeight;
  measure.style.lineHeight = style.lineHeight;
  measure.style.letterSpacing = style.letterSpacing;
  const availableH = Math.max(120, height);

  const flat = [];
  for (const p of paragraphs || []) {
    for (const c of chunkLong(p)) flat.push(c);
  }

  const pages = [];
  let cur = [];

  function renderCandidate(candidate) {
    measure.innerHTML = candidate.map((t) => `<p>${escapeHtml(t)}</p>`).join("");
    return measure.scrollHeight;
  }

  function splitChunkAtBoundary(text) {
    const t = String(text || "").trim();
    if (t.length < 2) return [t, ""];

    const mid = Math.floor(t.length / 2);
    const separators = "。！？；，、,.!?;:： \n\t";
    let cut = -1;
    const limit = Math.min(120, t.length - 2);

    for (let d = 0; d <= limit; d += 1) {
      const right = mid + d;
      if (right > 0 && right < t.length - 1 && separators.includes(t[right])) {
        cut = right + 1;
        break;
      }
      const left = mid - d;
      if (left > 0 && left < t.length - 1 && separators.includes(t[left])) {
        cut = left + 1;
        break;
      }
    }

    if (cut <= 0 || cut >= t.length) cut = mid;
    let a = t.slice(0, cut).trim();
    let b = t.slice(cut).trim();
    if (!a || !b) {
      const hard = Math.floor(t.length / 2);
      a = t.slice(0, hard).trim();
      b = t.slice(hard).trim();
    }
    return [a, b];
  }

  function splitChunkToFit(text, depth = 0) {
    const t = String(text || "").trim();
    if (!t) return [];
    if (renderCandidate([t]) <= availableH) return [t];
    if (t.length <= 1 || depth >= 14) return [t];

    const [a, b] = splitChunkAtBoundary(t);
    if (!a || !b || a === t || b === t) return [t];
    return splitChunkToFit(a, depth + 1).concat(splitChunkToFit(b, depth + 1));
  }

  for (const p of flat) {
    const pieces = splitChunkToFit(p);
    for (const piece of pieces) {
      const next = cur.concat([piece]);
      if (renderCandidate(next) <= availableH) {
        cur = next;
        continue;
      }
      if (cur.length) pages.push(cur);

      if (renderCandidate([piece]) <= availableH) {
        cur = [piece];
      } else {
        // Extremely small viewport fallback: keep progress instead of dropping content.
        pages.push([piece]);
        cur = [];
      }
    }
  }
  if (cur.length) pages.push(cur);
  return pages.length ? pages : [[]];
}

function renderPage() {
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

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

async function waitForLayoutStable() {
  // Two frames helps when DOM changes (intro compact, header text) affect heights.
  await nextFrame();
  await nextFrame();
}

async function loadBook(url) {
  setLoading(true, "Fetching book...", "book");
  try {
    const book = await apiGet("/api/book", { url });
    const bookKey = resolveBookKey({ bookUrl: book.url, inputUrl: url });
    state.book = book;
    state.currentBookKey = bookKey;
    state.chapters = book.chapters || [];
    state.chapterIdx = -1;
    state.chapter = null;
    state.pendingRestore = null;
    state.repaginateToken += 1;
    state.pages = [];
    state.pageIdx = 0;
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
      const restoredChapterUrl = findChapterUrlByNormalized(state.chapters, storedProgress.chapterUrl);
      if (restoredChapterUrl) {
        state.pendingRestore = storedProgress;
        initialChapterUrl = restoredChapterUrl;
      }
    }
    els.readFirst.disabled = !first;
    els.readFirst.onclick = () => first && loadChapter(first, { openDrawer: false, fromBook: true });
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

function renderBookCard(book) {
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

function findChapterIndexByUrl(url) {
  const u = String(url || "");
  return state.chapters.findIndex((c) => c.url === u);
}

async function loadChapter(url, opts = {}) {
  if (!url) return;
  if (!opts.skipLoading) setLoading(true, "Fetching chapter...", "chapter");
  try {
    const chapter = await apiGet("/api/chapter", { url });
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
      (!state.book || !state.chapters.length || (chapterBookKey && currentBookKey && chapterBookKey !== currentBookKey));
    if (shouldBackfillBook) {
      try {
        const book = await apiGet("/api/book", { url: chapter.bookUrl });
        state.book = book;
        state.currentBookKey = resolveBookKey({
          bookUrl: state.book?.url,
          chapterBookUrl: chapter.bookUrl,
          inputUrl: url,
        });
        applyScopedFontForCurrentBook();
        state.chapters = book.chapters || [];
        renderBookCard(book);
        renderChapters(els.chapterSearch.value);
      } catch {
        // Ignore; reader still works with prev/next.
      }
    }

    state.chapterIdx = findChapterIndexByUrl(chapter.url);
    if (state.chapterIdx >= 0) renderChapters(els.chapterSearch.value);

    if (state.book) els.introCard.hidden = false;
    els.chapterTitle.textContent = chapter.title || "Chapter";
    const metaBits = [];
    if (chapter.bookUrl && state.book?.title) metaBits.push(state.book.title);
    if (chapter.chapterIndex && chapter.chapterTotal) {
      metaBits.push(`${chapter.chapterIndex}/${chapter.chapterTotal}`);
    }
    els.pageMeta.textContent = metaBits.join("  ·  ");

    await waitForLayoutStable();
    state.pages = paginate(chapter.paragraphs || []);
    state.pageIdx = 0;
    const normalizedChapterUrl = normalizeUrl(chapter.url);
    if (state.pendingRestore) {
      if (state.pendingRestore.chapterUrl === normalizedChapterUrl) {
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

async function openUrl(url) {
  const u = String(url || "").trim();
  if (!u) return;
  if (u.includes("/view/")) return loadChapter(u, { openDrawer: false });
  return loadBook(u);
}

function goNext() {
  if (state.isLoading) return;
  if (state.pageIdx < (state.pages.length - 1)) {
    state.pageIdx += 1;
    renderPage();
    saveProgressForCurrentBook();
    return;
  }
  if (state.chapter?.nextUrl) {
    loadChapter(state.chapter.nextUrl, { openDrawer: false });
  }
}

function goPrev() {
  if (state.isLoading) return;
  if (state.pageIdx > 0) {
    state.pageIdx -= 1;
    renderPage();
    saveProgressForCurrentBook();
    return;
  }
  if (state.chapter?.prevUrl) {
    loadChapter(state.chapter.prevUrl, { openDrawer: false });
  }
}

function adjustFont(delta) {
  setFontPx(state.fontPx + delta);
  if (!state.chapter) return;
  void repaginateCurrentChapter({ preserveProgress: true, waitForLayout: true });
}

function adjustFontWeight(delta) {
  setFontWeight(state.fontWeight + delta * FONT_WEIGHT_STEP);
  if (!state.chapter) return;
  void repaginateCurrentChapter({ preserveProgress: true, waitForLayout: true });
}

function reflowCurrentChapter() {
  if (!state.chapter) return;
  void repaginateCurrentChapter({ preserveProgress: true, waitForLayout: true });
}

function openFontSheet() {
  if (!state.chapter) return;
  showDrawer(false);
  setFontSheetOpen(true);
}

let touch = null;
function onTouchStart(e) {
  const t = e.touches?.[0];
  if (!t) return;
  touch = { x: t.clientX, y: t.clientY, time: Date.now() };
}

function onTouchEnd(e) {
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
  openUrl(els.urlInput.value);
});

els.hideTopbar.addEventListener("click", () => {
  setFontSheetOpen(false);
  setTopbarVisible(false);
});

els.toggleChapters.addEventListener("click", () => showDrawer(!els.drawer.classList.contains("open")));
els.closeDrawer.addEventListener("click", () => showDrawer(false));
els.scrim.addEventListener("click", () => showDrawer(false));

els.pageFooter.addEventListener("click", openFontSheet);
els.pageFooter.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  e.preventDefault();
  openFontSheet();
});
els.sheetScrim.addEventListener("click", () => setFontSheetOpen(false));
els.closeFontSheet.addEventListener("click", () => setFontSheetOpen(false));

els.chapterSearch.addEventListener("input", () => renderChapters(els.chapterSearch.value));
els.chapterList.addEventListener("click", (e) => {
  const item = e.target.closest(".chapterItem");
  if (!item) return;
  const idx = Number(item.getAttribute("data-idx"));
  const chap = state.chapters[idx];
  if (!chap) return;
  loadChapter(chap.url, { openDrawer: false, fromBook: true });
});

els.pageBody.addEventListener("click", (e) => {
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

window.addEventListener("keydown", (e) => {
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
els.reflow.addEventListener("click", reflowCurrentChapter);
els.fontMinusSheet.addEventListener("click", () => adjustFont(-1));
els.fontPlusSheet.addEventListener("click", () => adjustFont(1));
els.weightMinusSheet.addEventListener("click", () => adjustFontWeight(-1));
els.weightPlusSheet.addEventListener("click", () => adjustFontWeight(1));
els.reflowSheet.addEventListener("click", reflowCurrentChapter);

els.toggleIntro.addEventListener("click", () => {
  const compact = els.introCard.classList.contains("compact");
  setIntroCompact(!compact);
});

window.addEventListener("resize", () => {
  applyTopbarVisibility();
  // If drawer is open, re-evaluate whether scrim should be shown (mobile only).
  if (els.drawer.classList.contains("open")) showDrawer(true);
  if (!state.chapter) return;
  // Debounce via microtask-ish delay.
  clearTimeout(window.__danmeiResizeT);
  window.__danmeiResizeT = setTimeout(() => {
    void repaginateCurrentChapter({ preserveProgress: true, waitForLayout: true });
  }, 180);
});

window.addEventListener("beforeunload", () => {
  saveProgressForCurrentBook();
});

// Initial state: prefer hash, then last URL; otherwise show an input hint.
const initial = getHashUrl() || state.lastUrl || "";
els.urlInput.value = initial;
if (initial) {
  openUrl(initial);
} else {
  renderEmptyState();
}
showDrawer(false);
