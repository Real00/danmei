(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // web-src/dom/elements.ts
  function requiredElement(id) {
    const el = document.getElementById(id);
    if (!el) {
      throw new Error(`Missing required element: #${id}`);
    }
    return el;
  }
  function syncTopbarHeight() {
    const topbar = document.querySelector(".topbar");
    if (!topbar) return;
    const h = Math.max(56, topbar.offsetHeight || 74);
    document.documentElement.style.setProperty("--top", `${h}px`);
  }
  var els;
  var init_elements = __esm({
    "web-src/dom/elements.ts"() {
      els = {
        urlForm: requiredElement("urlForm"),
        urlInput: requiredElement("urlInput"),
        toggleSearchPanel: requiredElement("toggleSearchPanel"),
        toggleIntroPanel: requiredElement("toggleIntroPanel"),
        searchForm: requiredElement("searchForm"),
        searchInput: requiredElement("searchInput"),
        searchSubmit: requiredElement("searchSubmit"),
        searchStatus: requiredElement("searchStatus"),
        searchList: requiredElement("searchList"),
        brandSub: requiredElement("brandSub"),
        hideTopbar: requiredElement("hideTopbar"),
        drawer: requiredElement("drawer"),
        scrim: requiredElement("scrim"),
        toggleChapters: requiredElement("toggleChapters"),
        closeDrawer: requiredElement("closeDrawer"),
        openChapters: requiredElement("openChapters"),
        exportTxtTop: document.getElementById("exportTxtTop"),
        exportTxt: requiredElement("exportTxt"),
        chapterSearch: requiredElement("chapterSearch"),
        chapterList: requiredElement("chapterList"),
        drawerTitle: requiredElement("drawerTitle"),
        searchCard: requiredElement("searchCard"),
        introCard: requiredElement("introCard"),
        bookTitle: requiredElement("bookTitle"),
        bookMeta: requiredElement("bookMeta"),
        bookIntro: requiredElement("bookIntro"),
        readFirst: requiredElement("readFirst"),
        toggleIntro: requiredElement("toggleIntro"),
        pageCard: requiredElement("pageCard"),
        chapterTitle: requiredElement("chapterTitle"),
        pageMeta: requiredElement("pageMeta"),
        pageBody: requiredElement("pageBody"),
        pageFooter: requiredElement("pageFooter"),
        pageText: requiredElement("pageText"),
        loadingOverlay: requiredElement("loadingOverlay"),
        loadingLabel: requiredElement("loadingLabel"),
        progress: requiredElement("progress"),
        hint: requiredElement("hint"),
        tapLeft: requiredElement("tapLeft"),
        tapRight: requiredElement("tapRight"),
        measure: requiredElement("measure"),
        fontMinus: requiredElement("fontMinus"),
        fontPlus: requiredElement("fontPlus"),
        weightMinus: requiredElement("weightMinus"),
        weightPlus: requiredElement("weightPlus"),
        brightnessMinus: requiredElement("brightnessMinus"),
        brightnessPlus: requiredElement("brightnessPlus"),
        reflow: requiredElement("reflow"),
        sheetScrim: requiredElement("sheetScrim"),
        fontSheet: requiredElement("fontSheet"),
        fontMinusSheet: requiredElement("fontMinusSheet"),
        fontPlusSheet: requiredElement("fontPlusSheet"),
        weightMinusSheet: requiredElement("weightMinusSheet"),
        weightPlusSheet: requiredElement("weightPlusSheet"),
        brightnessMinusSheet: requiredElement("brightnessMinusSheet"),
        brightnessPlusSheet: requiredElement("brightnessPlusSheet"),
        reflowSheet: requiredElement("reflowSheet"),
        closeFontSheet: requiredElement("closeFontSheet")
      };
    }
  });

  // web-src/constants.ts
  var MIN_FONT_PX, MAX_FONT_PX, DEFAULT_FONT_PX, DEFAULT_FONT_WEIGHT, DEFAULT_BRIGHTNESS, MIN_FONT_WEIGHT, MAX_FONT_WEIGHT, FONT_WEIGHT_STEP, MIN_BRIGHTNESS, MAX_BRIGHTNESS, BRIGHTNESS_STEP, WEIGHT_PROBE_MIN_DELTA, SEARCH_COOLDOWN_MS, READER_FONT_STACK_DEFAULT, READER_FONT_STACK_FALLBACK, READER_STATE_KEY, READER_STATE_VERSION, BRAND_SUB_IDLE, EMPTY_CHAPTER_TITLE, DEFAULT_HINT_TEXT, EMPTY_GUIDE_PARAGRAPHS;
  var init_constants = __esm({
    "web-src/constants.ts"() {
      MIN_FONT_PX = 14;
      MAX_FONT_PX = 26;
      DEFAULT_FONT_PX = MIN_FONT_PX;
      DEFAULT_FONT_WEIGHT = 500;
      DEFAULT_BRIGHTNESS = 1;
      MIN_FONT_WEIGHT = 300;
      MAX_FONT_WEIGHT = 900;
      FONT_WEIGHT_STEP = 100;
      MIN_BRIGHTNESS = 0.55;
      MAX_BRIGHTNESS = 1.25;
      BRIGHTNESS_STEP = 0.05;
      WEIGHT_PROBE_MIN_DELTA = 0.25;
      SEARCH_COOLDOWN_MS = 1e4;
      READER_FONT_STACK_DEFAULT = `"Microsoft YaHei Variable", "Microsoft YaHei", "PingFang SC", "Noto Sans SC", "Source Han Sans SC", "WenQuanYi Micro Hei", "Noto Serif SC", "Source Han Serif SC", "STSong", "Songti SC", "Noto Serif", serif`;
      READER_FONT_STACK_FALLBACK = `"PingFang SC", "Noto Sans SC", "Source Han Sans SC", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif`;
      READER_STATE_KEY = "danmei_reader_state_v1";
      READER_STATE_VERSION = 1;
      BRAND_SUB_IDLE = "\u53EF\u641C\u7D22\u4E66\u540D\u540E\u70B9\u9009\uFF0C\u4E5F\u53EF\u76F4\u63A5\u8F93\u5165 dmxs.org URL\uFF08#u=...\uFF09";
      EMPTY_CHAPTER_TITLE = "\u672A\u52A0\u8F7D\u5185\u5BB9";
      DEFAULT_HINT_TEXT = "\u70B9\u6B64\u8C03\u5B57\u4F53";
      EMPTY_GUIDE_PARAGRAPHS = [
        "\u53EF\u5148\u7528\u5173\u952E\u8BCD\u641C\u7D22\u4E66\u540D\uFF0C\u518D\u70B9\u51FB\u7ED3\u679C\u76F4\u63A5\u6253\u5F00\u3002",
        "\u8BF7\u5728\u4E0A\u65B9\u8F93\u5165 dmxs.org \u4E66\u7C4D URL \u540E\u70B9\u51FB Open\u3002",
        "\u4E5F\u53EF\u4EE5\u901A\u8FC7\u5730\u5740\u680F #u=... \u4F20\u5165 URL\uFF0C\u9875\u9762\u4F1A\u81EA\u52A8\u6253\u5F00\u3002"
      ];
    }
  });

  // web-src/utils/text.ts
  function escapeHtml(s) {
    return (s || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  }
  function sanitizeFilename(name) {
    const cleaned = String(name || "danmei").replace(/[\\/:*?"<>|\x00-\x1f]/g, " ").replace(/\s+/g, " ").trim();
    return cleaned || "danmei";
  }
  function downloadTextFile(filename, content) {
    const text = String(content || "");
    const blob = new Blob([`\uFEFF${text}`], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
  function htmlToParagraphs(html) {
    const doc = new DOMParser().parseFromString(`<div>${html || ""}</div>`, "text/html");
    const root = doc.body.firstElementChild;
    if (!root) return [];
    const ps = Array.from(root.querySelectorAll("p"));
    if (ps.length) {
      return ps.map((p) => p.textContent?.trim() || "").filter(Boolean);
    }
    const t = root.textContent || "";
    return t.split("\n").map((x) => x.trim()).filter(Boolean);
  }
  var init_text = __esm({
    "web-src/utils/text.ts"() {
    }
  });

  // web-src/domain/pagination.ts
  function chunkLong(text) {
    const t = (text || "").trim();
    if (t.length <= 360) return [t];
    const parts = [];
    let start = 0;
    while (start < t.length) {
      let end = Math.min(t.length, start + 360);
      const slice = t.slice(start, end);
      const cut = Math.max(
        slice.lastIndexOf("\u3002"),
        slice.lastIndexOf("\uFF01"),
        slice.lastIndexOf("\uFF1F"),
        slice.lastIndexOf("\uFF1B"),
        slice.lastIndexOf("\uFF0C")
      ) + 1;
      if (cut > 40) end = start + cut;
      parts.push(t.slice(start, end).trim());
      start = end;
    }
    return parts.filter(Boolean);
  }
  function paginate(paragraphs, pageTextEl, measure) {
    const style = getComputedStyle(pageTextEl);
    const rect = pageTextEl.getBoundingClientRect();
    const width = Math.floor(rect.width || pageTextEl.clientWidth || pageTextEl.offsetWidth || 0);
    const height = Math.floor(rect.height || pageTextEl.clientHeight || pageTextEl.offsetHeight || 0);
    measure.style.width = `${Math.max(1, width)}px`;
    measure.style.padding = style.padding;
    measure.style.fontFamily = style.fontFamily;
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
      const separators = "\u3002\uFF01\uFF1F\uFF1B\uFF0C\u3001,.!?;:\uFF1A \n	";
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
          pages.push([piece]);
          cur = [];
        }
      }
    }
    if (cur.length) pages.push(cur);
    return pages.length ? pages : [[]];
  }
  var init_pagination = __esm({
    "web-src/domain/pagination.ts"() {
      init_text();
    }
  });

  // web-src/services/api.ts
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
  var init_api = __esm({
    "web-src/services/api.ts"() {
    }
  });

  // web-src/services/storage.ts
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
  function normalizeChapterPathKey(url) {
    const u = String(url || "").trim();
    if (!u) return "";
    try {
      const parsed = new URL(u, window.location.origin);
      let pathname = parsed.pathname || "/";
      if (pathname.length > 1) pathname = pathname.replace(/\/+$/, "");
      return `${pathname}${parsed.search}`;
    } catch {
      return u.replace(/#.*$/, "");
    }
  }
  function normalizeChapterIndex(idx) {
    const n = Number(idx);
    if (!Number.isFinite(n)) return null;
    const i = Math.floor(n);
    return i >= 1 ? i : null;
  }
  function resolveBookKey(opts) {
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
      if (!isPlainObject(parsed) || !isPlainObject(parsed.books)) {
        throw new Error("Invalid reader state");
      }
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
  function getStoredBrightness(bookKey) {
    const bookState = readBookScopedState(bookKey);
    const n = Number(bookState?.brightness);
    return Number.isFinite(n) ? n : null;
  }
  function getStoredProgress(bookKey) {
    const bookState = readBookScopedState(bookKey);
    if (!isPlainObject(bookState?.progress)) return null;
    const rawProgress = bookState.progress;
    const chapterUrl = normalizeUrl(rawProgress.chapterUrl);
    const chapterPathKey = normalizeChapterPathKey(rawProgress.chapterPathKey || chapterUrl);
    const chapterIndex = normalizeChapterIndex(rawProgress.chapterIndex);
    const bookUrlNormalized = normalizeUrl(rawProgress.bookUrlNormalized || bookKey);
    if (!chapterUrl && !chapterPathKey && chapterIndex == null) return null;
    return {
      chapterUrl,
      chapterPathKey,
      chapterIndex,
      bookUrlNormalized,
      ratio: clamp01(Number(rawProgress.ratio)),
      updatedAt: Number(rawProgress.updatedAt) || Date.now()
    };
  }
  function findChapterUrlByNormalized(chapters, normalizedChapterUrl) {
    const target = normalizeUrl(normalizedChapterUrl);
    if (!target) return null;
    const hit = (chapters || []).find((c) => normalizeUrl(c.url) === target);
    return hit?.url || null;
  }
  function findChapterUrlByPathKey(chapters, chapterPathKey) {
    const target = normalizeChapterPathKey(chapterPathKey);
    if (!target) return null;
    const hit = (chapters || []).find((c) => normalizeChapterPathKey(c.url) === target);
    return hit?.url || null;
  }
  function findChapterUrlByProgress(chapters, progress) {
    if (!progress) return null;
    const byUrl = findChapterUrlByNormalized(chapters, progress.chapterUrl);
    if (byUrl) return byUrl;
    const byPathKey = findChapterUrlByPathKey(chapters, progress.chapterPathKey);
    if (byPathKey) return byPathKey;
    const chapterIndex = normalizeChapterIndex(progress.chapterIndex);
    if (chapterIndex != null) {
      const idx = chapterIndex - 1;
      const hit = chapters?.[idx];
      if (hit?.url) return hit.url;
    }
    return null;
  }
  function isProgressForChapter(progress, chapterUrl, chapterIdx) {
    if (!progress) return false;
    const normalizedChapterUrl = normalizeUrl(chapterUrl);
    if (progress.chapterUrl && normalizedChapterUrl && progress.chapterUrl === normalizedChapterUrl) return true;
    const chapterPathKey = normalizeChapterPathKey(chapterUrl);
    if (progress.chapterPathKey && chapterPathKey && progress.chapterPathKey === chapterPathKey) return true;
    const normalizedIdx = normalizeChapterIndex(Number(chapterIdx) + 1);
    return progress.chapterIndex != null && normalizedIdx != null && progress.chapterIndex === normalizedIdx;
  }
  var readerStateCache;
  var init_storage = __esm({
    "web-src/services/storage.ts"() {
      init_constants();
      readerStateCache = null;
    }
  });

  // web-src/state/store.ts
  var state;
  var init_store = __esm({
    "web-src/state/store.ts"() {
      init_constants();
      state = {
        book: null,
        chapters: [],
        chapterIdx: -1,
        chapter: null,
        pages: [],
        pageIdx: 0,
        fontPx: DEFAULT_FONT_PX,
        fontWeight: DEFAULT_FONT_WEIGHT,
        brightness: DEFAULT_BRIGHTNESS,
        lastUrl: localStorage.getItem("danmei_lastUrl") || "",
        searchPanelOpen: false,
        introPanelOpen: false,
        searchKeyword: "",
        searchResults: [],
        searchCooldownUntil: 0,
        searchCooldownTimer: null,
        searchInFlight: false,
        isLoading: false,
        loadingKind: "",
        topVisible: true,
        fontSheetOpen: false,
        repaginateToken: 0,
        currentBookKey: "",
        pendingRestore: null,
        hintTimer: null
      };
    }
  });

  // web-src/state/preferences.ts
  function detectWeightDelta(fontFamily) {
    if (!fontFamily || !document.body) return 0;
    const probe = document.createElement("span");
    probe.textContent = "\u9605\u8BFB\u5B57\u4F53\u7C97\u7EC6AaBb123456789";
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
  function ensureReadableWeightFont() {
    const rootStyle = getComputedStyle(document.documentElement);
    const currentFamily = rootStyle.getPropertyValue("--reader-font-family").trim() || READER_FONT_STACK_DEFAULT;
    const currentDelta = detectWeightDelta(currentFamily);
    if (currentDelta >= WEIGHT_PROBE_MIN_DELTA) return;
    document.documentElement.style.setProperty("--reader-font-family", READER_FONT_STACK_FALLBACK);
  }
  function setFontPx(px) {
    const target = Number.isFinite(Number(px)) ? Number(px) : DEFAULT_FONT_PX;
    const clamped = Math.max(MIN_FONT_PX, Math.min(MAX_FONT_PX, target));
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
  function setBrightness(value) {
    const target = Number.isFinite(Number(value)) ? Number(value) : DEFAULT_BRIGHTNESS;
    const clamped = Math.max(MIN_BRIGHTNESS, Math.min(MAX_BRIGHTNESS, Math.round(target * 100) / 100));
    state.brightness = clamped;
    document.documentElement.style.setProperty("--page-brightness", clamped.toFixed(2));
    if (state.currentBookKey) {
      patchBookScopedState(state.currentBookKey, { brightness: clamped });
    }
  }
  function applyScopedFontForCurrentBook() {
    if (!state.currentBookKey) return;
    const savedFontPx = getStoredFontPx(state.currentBookKey);
    const nextFontPx = savedFontPx == null ? DEFAULT_FONT_PX : savedFontPx;
    const fontPx = Math.max(MIN_FONT_PX, Math.min(MAX_FONT_PX, nextFontPx));
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
  function saveProgressForCurrentBook() {
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
    const progress = {
      chapterUrl,
      chapterPathKey,
      ratio,
      updatedAt: Date.now()
    };
    if (chapterIndex != null) progress.chapterIndex = chapterIndex;
    if (bookUrlNormalized) progress.bookUrlNormalized = bookUrlNormalized;
    patchBookScopedState(state.currentBookKey, {
      progress
    });
  }
  var init_preferences = __esm({
    "web-src/state/preferences.ts"() {
      init_constants();
      init_storage();
      init_store();
    }
  });

  // web-src/ui/layout.ts
  function registerTopbarRepaginateHandler(handler) {
    topbarRepaginateHandler = handler;
  }
  function applyTopbarVisibility() {
    const hidden = !!state.chapter && !state.topVisible;
    document.body.classList.toggle("topbarHidden", hidden);
    const pageMetaAction = state.chapter && state.topVisible ? "\u9690\u85CF\u9876\u90E8\u83DC\u5355" : "\u663E\u793A\u9876\u90E8\u83DC\u5355";
    els.pageMeta.title = pageMetaAction;
    els.pageMeta.setAttribute("aria-label", pageMetaAction);
    if (!hidden) syncTopbarHeight();
  }
  function setTopbarVisible(visible, opts = {}) {
    const next = !!visible;
    if (state.topVisible === next) return;
    state.topVisible = next;
    applyTopbarVisibility();
    if (opts.skipRepaginate) return;
    if (state.chapter) {
      topbarRepaginateHandler?.();
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
  function applyPanelVisibility() {
    const showSearch = !!state.searchPanelOpen;
    const hasBook = !!state.book;
    const showIntro = hasBook && !!state.introPanelOpen;
    els.searchCard.hidden = !showSearch;
    els.introCard.hidden = !showIntro;
    els.toggleSearchPanel.classList.toggle("isActive", showSearch);
    els.toggleSearchPanel.textContent = showSearch ? "\u6536\u8D77\u641C\u7D22" : "\u641C\u7D22";
    els.toggleIntroPanel.disabled = !hasBook;
    els.toggleIntroPanel.classList.toggle("isActive", showIntro);
    els.toggleIntroPanel.textContent = showIntro ? "\u6536\u8D77\u4ECB\u7ECD" : "\u4ECB\u7ECD";
  }
  function setSearchPanelOpen(open) {
    const next = !!open;
    if (state.searchPanelOpen === next) return;
    state.searchPanelOpen = next;
    applyPanelVisibility();
    if (state.chapter) {
      topbarRepaginateHandler?.();
    }
  }
  function setIntroPanelOpen(open) {
    const next = !!open;
    if (state.introPanelOpen === next) return;
    state.introPanelOpen = next;
    applyPanelVisibility();
    if (state.chapter) {
      topbarRepaginateHandler?.();
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
  function showDrawer(open) {
    const isMobile = window.matchMedia("(max-width: 980px)").matches;
    if (open) setFontSheetOpen(false);
    els.drawer.classList.toggle("open", open);
    els.scrim.hidden = !(open && isMobile);
    els.drawer.setAttribute("aria-hidden", open ? "false" : "true");
  }
  function setIntroCompact(compact) {
    els.introCard.classList.toggle("compact", !!compact);
  }
  function setExportButtonsDisabled(disabled) {
    const next = !!disabled;
    if (els.exportTxtTop) els.exportTxtTop.disabled = next;
    if (els.exportTxt) els.exportTxt.disabled = next;
  }
  function isTopTap(clientY, rect) {
    const y = clientY - rect.top;
    const topZoneH = Math.max(56, Math.min(120, rect.height * 0.18));
    return y >= 0 && y <= topZoneH;
  }
  function showHint(text, opts = {}) {
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
  function isSearchLoading() {
    return !!state.searchInFlight || state.isLoading && state.loadingKind === "search";
  }
  function getSearchCooldownLeftSec(now = Date.now()) {
    const until = Number(state.searchCooldownUntil) || 0;
    if (!until) return 0;
    return Math.max(0, Math.ceil((until - now) / 1e3));
  }
  function getSearchStatusText(defaultText) {
    if (isSearchLoading()) return "\u6B63\u5728\u641C\u7D22\uFF0C\u8BF7\u7A0D\u5019...";
    const cooldownLeft = getSearchCooldownLeftSec();
    if (cooldownLeft > 0) return `\u641C\u7D22\u51B7\u5374\u4E2D\uFF0C\u8FD8\u9700 ${cooldownLeft} \u79D2`;
    return defaultText;
  }
  function refreshSearchControls() {
    const cooldownLeft = getSearchCooldownLeftSec();
    els.searchInput.disabled = !!state.isLoading;
    els.searchSubmit.disabled = !!state.isLoading || cooldownLeft > 0;
    if (isSearchLoading()) {
      els.searchSubmit.textContent = "\u641C\u7D22\u4E2D...";
    } else if (cooldownLeft > 0) {
      els.searchSubmit.textContent = `${cooldownLeft}\u79D2\u540E\u53EF\u641C`;
    } else {
      els.searchSubmit.textContent = "\u641C\u7D22";
    }
  }
  function setLoading(isLoading, label = "", kind = "") {
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
      els.loadingLabel.textContent = label || "\u52A0\u8F7D\u4E2D...";
    }
  }
  var topbarRepaginateHandler, topbarRepaginateTimer;
  var init_layout = __esm({
    "web-src/ui/layout.ts"() {
      init_constants();
      init_elements();
      init_store();
      topbarRepaginateHandler = null;
      topbarRepaginateTimer = null;
    }
  });

  // web-src/ui/render.ts
  function renderEmptyState() {
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
    els.drawerTitle.textContent = "\u7AE0\u8282";
    els.chapterSearch.value = "";
    renderChapters("");
    els.chapterTitle.textContent = EMPTY_CHAPTER_TITLE;
    els.chapterTitle.title = EMPTY_CHAPTER_TITLE;
    els.pageMeta.textContent = "\u66F4\u591A\u8BBE\u7F6E";
    els.pageMeta.title = "\u663E\u793A\u9876\u90E8\u83DC\u5355";
    els.pageText.innerHTML = EMPTY_GUIDE_PARAGRAPHS.map((t) => `<p>${escapeHtml(t)}</p>`).join("");
    showHint(DEFAULT_HINT_TEXT);
    els.progress.textContent = "";
    els.loadingOverlay.hidden = true;
    applyPanelVisibility();
    renderSearchResults();
  }
  function renderSearchResults() {
    const keyword = String(state.searchKeyword || "").trim();
    const items = Array.isArray(state.searchResults) ? state.searchResults : [];
    let statusText = "";
    if (!keyword) {
      statusText = "\u8F93\u5165\u5173\u952E\u8BCD\u540E\u70B9\u51FB\u641C\u7D22\uFF0C\u9009\u62E9\u7ED3\u679C\u5373\u53EF\u6253\u5F00\u3002";
    } else if (!items.length) {
      statusText = `\u672A\u627E\u5230\u201C${keyword}\u201D\u76F8\u5173\u7ED3\u679C\u3002`;
    } else {
      statusText = `\u201C${keyword}\u201D\u627E\u5230 ${items.length} \u6761\u7ED3\u679C\uFF0C\u70B9\u51FB\u5373\u53EF\u6253\u5F00\u3002`;
    }
    els.searchStatus.textContent = getSearchStatusText(statusText);
    els.searchList.innerHTML = items.map((item, idx) => {
      const title = escapeHtml(String(item?.title || "\u672A\u547D\u540D\u4E66\u7C4D"));
      const url = escapeHtml(String(item?.url || ""));
      return `<button class="searchItem" type="button" data-idx="${idx}">
        <div class="searchItemTitle">${title}</div>
        <div class="searchItemUrl">${url}</div>
      </button>`;
    }).join("");
    refreshSearchControls();
  }
  function renderChapters(filter = "") {
    const needle = (filter || "").trim().toLowerCase();
    const items = state.chapters.map((c, i) => ({ ...c, i })).filter((c) => {
      if (!needle) return true;
      return (c.name || "").toLowerCase().includes(needle) || String(c.i + 1).includes(needle);
    });
    els.chapterList.innerHTML = items.map((c) => {
      const active = c.i === state.chapterIdx ? "active" : "";
      return `<div class="chapterItem ${active}" data-idx="${c.i}">
        <div class="chapterIdx">${c.i + 1}</div>
        <div class="chapterName">${escapeHtml(c.name)}</div>
      </div>`;
    }).join("");
  }
  function renderBookCard(book) {
    if (!book) return;
    const bookTitle = String(book.title || "").trim();
    els.chapterTitle.textContent = bookTitle || EMPTY_CHAPTER_TITLE;
    els.chapterTitle.title = bookTitle || EMPTY_CHAPTER_TITLE;
    els.pageMeta.textContent = "\u66F4\u591A\u8BBE\u7F6E";
    els.pageMeta.title = "\u663E\u793A\u9876\u90E8\u83DC\u5355";
    els.bookTitle.textContent = book.title || "Untitled";
    els.drawerTitle.textContent = book.title ? `\u7AE0\u8282: ${book.title}` : "\u7AE0\u8282";
    els.bookMeta.textContent = [book.author ? `\u4F5C\u8005: ${book.author}` : "", book.dateText || ""].filter(Boolean).join("  \xB7  ");
    const introPs = htmlToParagraphs(book.introHtml || "");
    els.bookIntro.innerHTML = introPs.map((t) => `<p>${escapeHtml(t)}</p>`).join("");
    applyPanelVisibility();
  }
  function renderPage() {
    const pages = state.pages || [];
    const idx = Math.max(0, Math.min(state.pageIdx, pages.length - 1));
    state.pageIdx = idx;
    const lines = pages[idx] || [];
    els.pageText.innerHTML = lines.map((t) => `<p>${escapeHtml(t)}</p>`).join("");
    els.pageText.scrollTop = 0;
    const chapterCurrent = Number(state.chapter?.chapterIndex) > 0 ? Number(state.chapter?.chapterIndex) : state.chapterIdx >= 0 ? state.chapterIdx + 1 : null;
    const chapterTotal = Number(state.chapter?.chapterTotal) > 0 ? Number(state.chapter?.chapterTotal) : Array.isArray(state.chapters) && state.chapters.length ? state.chapters.length : null;
    const totalPages = pages.length || 1;
    if (chapterCurrent && chapterTotal) {
      els.progress.textContent = `\u7B2C${chapterCurrent}/${chapterTotal}\u7AE0 ${idx + 1}/${totalPages}\u9875`;
    } else if (chapterCurrent) {
      els.progress.textContent = `\u7B2C${chapterCurrent}\u7AE0 ${idx + 1}/${totalPages}\u9875`;
    } else {
      els.progress.textContent = `${idx + 1}/${totalPages}\u9875`;
    }
    els.loadingOverlay.hidden = true;
    applyTopbarVisibility();
  }
  var init_render = __esm({
    "web-src/ui/render.ts"() {
      init_constants();
      init_elements();
      init_text();
      init_store();
      init_layout();
    }
  });

  // web-src/reader/navigation.ts
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
  function findChapterIndexByUrl(url) {
    const u = normalizeUrl(url);
    if (!u) return -1;
    return state.chapters.findIndex((c) => normalizeUrl(c.url) === u);
  }
  var init_navigation = __esm({
    "web-src/reader/navigation.ts"() {
      init_store();
      init_storage();
    }
  });

  // web-src/reader/reflow.ts
  function nextFrame() {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()));
  }
  async function waitForLayoutStable() {
    await nextFrame();
    await nextFrame();
  }
  async function repaginateCurrentChapter(opts = {}) {
    if (!state.chapter) return null;
    const token = ++state.repaginateToken;
    const preserveProgress = opts.preserveProgress !== false;
    const shouldWait = opts.waitForLayout !== false;
    const oldTotal = Math.max(1, state.pages.length || 1);
    const oldPageIdx = Math.max(0, state.pageIdx || 0);
    let oldRatio = 0;
    if (preserveProgress) {
      oldRatio = state.pageIdx / Math.max(1, oldTotal - 1);
    }
    if (shouldWait) await waitForLayoutStable();
    if (token !== state.repaginateToken) return null;
    if (!state.chapter) return null;
    state.pages = paginate(state.chapter.paragraphs || [], els.pageText, els.measure);
    if (token !== state.repaginateToken) return null;
    const total = Math.max(1, state.pages.length || 1);
    if (preserveProgress) {
      state.pageIdx = Math.max(0, Math.min(total - 1, Math.round(oldRatio * Math.max(1, total - 1))));
    } else {
      state.pageIdx = Math.max(0, Math.min(state.pageIdx, total - 1));
    }
    renderPage();
    saveProgressForCurrentBook();
    return {
      oldTotal,
      newTotal: total,
      oldPageIdx,
      newPageIdx: state.pageIdx
    };
  }
  async function forceReflowCurrentChapter(opts = {}) {
    if (!state.chapter) return null;
    const result = await repaginateCurrentChapter({
      preserveProgress: opts.preserveProgress !== false,
      waitForLayout: opts.waitForLayout !== false
    });
    if (!result) return null;
    if (opts.showHint !== false) {
      const msg = result.oldTotal !== result.newTotal ? `\u5DF2\u91CD\u6392 ${result.oldTotal}->${result.newTotal} \u9875` : "\u5DF2\u91CD\u6392\uFF08\u9875\u6570\u672A\u53D8\uFF09";
      showHint(msg, { autoResetMs: 1400 });
    }
    return result;
  }
  async function repaginateForViewportModeSwitch() {
    if (!state.chapter) return;
    try {
      await repaginateCurrentChapter({ preserveProgress: true, waitForLayout: true });
    } catch {
    }
  }
  var init_reflow = __esm({
    "web-src/reader/reflow.ts"() {
      init_pagination();
      init_elements();
      init_preferences();
      init_store();
      init_layout();
      init_render();
    }
  });

  // web-src/reader/actions.ts
  async function loadBook(url) {
    setLoading(true, "Fetching book...", "book");
    try {
      const book = await apiGet("/api/book", { url });
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
      if (initialChapterUrl) {
        setLoading(true, "Fetching chapter...", "chapter");
        await loadChapter(initialChapterUrl, {
          openDrawer: false,
          fromBook: true,
          compactIntro: true,
          skipLoading: true
        });
      }
    } finally {
      setLoading(false);
    }
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
        inputUrl: url
      });
      applyScopedFontForCurrentBook();
      state.repaginateToken += 1;
      setFontSheetOpen(false);
      const chapterBookKey = resolveBookKey({ bookUrl: chapter.bookUrl });
      const currentBookKey = resolveBookKey({ bookUrl: state.book?.url });
      const shouldBackfillBook = !!chapter.bookUrl && (!state.book || !state.chapters.length || chapterBookKey && currentBookKey && chapterBookKey !== currentBookKey);
      if (shouldBackfillBook) {
        try {
          const book = await apiGet("/api/book", { url: chapter.bookUrl });
          state.book = book;
          state.currentBookKey = resolveBookKey({
            bookUrl: state.book?.url,
            chapterBookUrl: chapter.bookUrl,
            inputUrl: url
          });
          setIntroPanelOpen(false);
          applyScopedFontForCurrentBook();
          state.chapters = book.chapters || [];
          setExportButtonsDisabled(!state.chapters.length);
          renderBookCard(book);
          renderChapters(els.chapterSearch.value);
        } catch {
        }
      }
      state.chapterIdx = findChapterIndexByUrl(chapter.url);
      if (state.chapterIdx >= 0) renderChapters(els.chapterSearch.value);
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
              tryProgressRestore: false
            });
            return;
          }
          if (isProgressForChapter(storedProgress, chapter.url, state.chapterIdx)) {
            state.pendingRestore = storedProgress;
          }
        }
      }
      const title = String(state.book?.title || "").trim() || chapter.title || "\u672A\u547D\u540D\u5C0F\u8BF4";
      els.chapterTitle.textContent = title;
      els.chapterTitle.title = title;
      els.pageMeta.textContent = "\u66F4\u591A\u8BBE\u7F6E";
      els.pageMeta.title = "\u663E\u793A\u9876\u90E8\u83DC\u5355";
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
  async function exportBookToTxt() {
    if (state.isLoading) return;
    const chapters = state.chapters || [];
    if (!chapters.length) {
      alert("\u5F53\u524D\u6CA1\u6709\u53EF\u5BFC\u51FA\u7684\u7AE0\u8282\u3002");
      return;
    }
    const bookTitle = String(state.book?.title || "danmei").trim() || "danmei";
    const fileName = `${sanitizeFilename(bookTitle)}.txt`;
    const blocks = [];
    const total = chapters.length;
    setExportButtonsDisabled(true);
    setLoading(true, `\u5BFC\u51FATXT\u4E2D 0/${total}...`, "export");
    try {
      for (let i = 0; i < total; i += 1) {
        const chapterMeta = chapters[i];
        const chapter = await apiGet("/api/chapter", { url: chapterMeta.url });
        const paragraphs = Array.isArray(chapter.paragraphs) ? chapter.paragraphs.map((p) => String(p || "").trim()).filter(Boolean) : [];
        const body = paragraphs.join("\r\n\r\n");
        const separator = `\u3010===== \u7AE0\u8282 ${i + 1}/${total} =====\u3011`;
        blocks.push(separator);
        if (body) blocks.push(body);
        else blocks.push("\uFF08\u672C\u7AE0\u65E0\u6B63\u6587\uFF09");
        setLoading(true, `\u5BFC\u51FATXT\u4E2D ${i + 1}/${total}...`, "export");
      }
      const header = [
        `\u4E66\u540D\uFF1A${bookTitle}`,
        state.book?.author ? `\u4F5C\u8005\uFF1A${state.book.author}` : "",
        `\u7AE0\u8282\u603B\u6570\uFF1A${total}`,
        "\u5206\u9694\u6807\u8BB0\uFF1A\u6BCF\u7AE0\u4EE5\u3010===== \u7AE0\u8282 i/total =====\u3011\u5F00\u5934",
        `\u5BFC\u51FA\u65F6\u95F4\uFF1A${(/* @__PURE__ */ new Date()).toLocaleString()}`
      ].filter(Boolean).join("\r\n");
      const content = [header, "", blocks.join("\r\n\r\n")].join("\r\n");
      downloadTextFile(fileName, content);
      showHint(`\u5DF2\u5BFC\u51FA ${total} \u7AE0`, { autoResetMs: 2200 });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err || "\u672A\u77E5\u9519\u8BEF");
      alert(`\u5BFC\u51FA\u5931\u8D25\uFF1A${msg}`);
    } finally {
      setLoading(false);
      setExportButtonsDisabled(!state.chapters.length);
    }
  }
  function clearSearchCooldownTimer() {
    if (!state.searchCooldownTimer) return;
    clearInterval(state.searchCooldownTimer);
    state.searchCooldownTimer = null;
  }
  function startSearchCooldown(durationMs) {
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
    state.searchCooldownTimer = setInterval(tick, 1e3);
  }
  async function searchBooks(keyword) {
    const q = String(keyword || "").trim();
    state.searchKeyword = q;
    if (!q) {
      state.searchResults = [];
      renderSearchResults();
      showHint("\u8BF7\u8F93\u5165\u641C\u7D22\u5173\u952E\u8BCD", { autoResetMs: 1600 });
      return;
    }
    const cooldownLeft = getSearchCooldownLeftSec();
    if (cooldownLeft > 0) {
      renderSearchResults();
      showHint(`\u641C\u7D22\u51B7\u5374\u4E2D\uFF0C\u8BF7 ${cooldownLeft} \u79D2\u540E\u518D\u8BD5`, { autoResetMs: 1600 });
      return;
    }
    state.searchInFlight = true;
    setLoading(true, "Searching books...", "search");
    renderSearchResults();
    try {
      const payload = await apiGet("/api/search", { q });
      state.searchKeyword = String(payload.keyword || q).trim();
      state.searchResults = Array.isArray(payload.results) ? payload.results.map((item) => ({
        title: String(item?.title || "").trim(),
        url: String(item?.url || "").trim()
      })).filter((item) => item.title && item.url) : [];
      renderSearchResults();
      if (!state.searchResults.length) {
        showHint("\u672A\u627E\u5230\u76F8\u5173\u4E66\u7C4D", { autoResetMs: 1800 });
      }
    } catch (err) {
      state.searchResults = [];
      renderSearchResults();
      const msg = err instanceof Error ? err.message : String(err || "\u672A\u77E5\u9519\u8BEF");
      showHint(`\u641C\u7D22\u5931\u8D25\uFF1A${msg}`, { autoResetMs: 2600 });
    } finally {
      state.searchInFlight = false;
      setLoading(false);
      startSearchCooldown(SEARCH_COOLDOWN_MS);
    }
  }
  async function openUrl(url) {
    const u = String(url || "").trim();
    if (!u) return;
    if (u.includes("/view/")) return loadChapter(u, { openDrawer: false, tryProgressRestore: true });
    return loadBook(u);
  }
  function goNext() {
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
  function goPrev() {
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
  function adjustFont(delta) {
    setFontPx(state.fontPx + delta);
    if (!state.chapter) return;
    void forceReflowCurrentChapter({ preserveProgress: true, waitForLayout: true, showHint: false });
  }
  function adjustFontWeight(delta) {
    setFontWeight(state.fontWeight + delta * FONT_WEIGHT_STEP);
    if (!state.chapter) return;
    void forceReflowCurrentChapter({ preserveProgress: true, waitForLayout: true, showHint: false });
  }
  function adjustBrightness(delta) {
    setBrightness(state.brightness + delta * BRIGHTNESS_STEP);
    showHint(`\u4EAE\u5EA6 ${Math.round(state.brightness * 100)}%`, { autoResetMs: 1200 });
  }
  function reflowCurrentChapter() {
    if (!state.chapter) return;
    void forceReflowCurrentChapter({ preserveProgress: true, waitForLayout: true, showHint: true });
  }
  function openFontSheet() {
    if (!state.chapter) return;
    showDrawer(false);
    setFontSheetOpen(true);
  }
  var init_actions = __esm({
    "web-src/reader/actions.ts"() {
      init_constants();
      init_pagination();
      init_elements();
      init_api();
      init_storage();
      init_preferences();
      init_store();
      init_text();
      init_layout();
      init_render();
      init_navigation();
      init_reflow();
    }
  });

  // web-src/main.ts
  var require_main = __commonJS({
    "web-src/main.ts"() {
      init_elements();
      init_actions();
      init_navigation();
      init_reflow();
      init_preferences();
      init_store();
      init_layout();
      init_render();
      syncTopbarHeight();
      setFontPx(state.fontPx);
      setFontWeight(state.fontWeight);
      setBrightness(state.brightness);
      ensureReadableWeightFont();
      registerTopbarRepaginateHandler(() => {
        void repaginateForViewportModeSwitch();
      });
      var touch = null;
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
        if (dt < 800 && Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) {
          if (dx < 0) goNext();
          else goPrev();
        }
      }
      els.urlForm.addEventListener("submit", (e) => {
        e.preventDefault();
        void openUrl(els.urlInput.value);
      });
      els.toggleSearchPanel.addEventListener("click", () => {
        setSearchPanelOpen(!state.searchPanelOpen);
      });
      els.toggleIntroPanel.addEventListener("click", () => {
        if (!state.book) return;
        setIntroPanelOpen(!state.introPanelOpen);
      });
      els.searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        void searchBooks(els.searchInput.value);
      });
      els.searchList.addEventListener("click", (e) => {
        if (state.isLoading) return;
        const target = e.target;
        const item = target?.closest(".searchItem");
        if (!item) return;
        const idx = Number(item.getAttribute("data-idx"));
        const hit = state.searchResults[idx];
        if (!hit?.url) return;
        els.urlInput.value = hit.url;
        void openUrl(hit.url);
      });
      els.hideTopbar.addEventListener("click", () => {
        setFontSheetOpen(false);
        setTopbarVisible(false);
      });
      els.pageMeta.addEventListener("click", () => {
        if (!state.chapter) {
          setTopbarVisible(true);
          return;
        }
        if (state.topVisible) {
          setFontSheetOpen(false);
        }
        setTopbarVisible(!state.topVisible);
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
        if (state.isLoading) return;
        const target = e.target;
        const item = target?.closest(".chapterItem");
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
      els.pageBody.addEventListener("click", (e) => {
        if (state.isLoading) return;
        if (state.fontSheetOpen) {
          setFontSheetOpen(false);
          return;
        }
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
        if (els.drawer.classList.contains("open")) showDrawer(true);
        if (!state.chapter) return;
        clearTimeout(window.__danmeiResizeT);
        window.__danmeiResizeT = setTimeout(() => {
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
      var initial = getHashUrl() || state.lastUrl || "";
      applyPanelVisibility();
      refreshSearchControls();
      els.urlInput.value = initial;
      if (initial) {
        void openUrl(initial);
      } else {
        renderEmptyState();
      }
      showDrawer(false);
    }
  });
  require_main();
})();
