import { READER_STATE_KEY, READER_STATE_VERSION } from "../constants";
import type {
  ChapterListItem,
  ReaderBookScopedState,
  ReaderProgress,
  ReaderStorageState,
} from "../types";

let readerStateCache: ReaderStorageState | null = null;

function createEmptyReaderState(): ReaderStorageState {
  return { version: READER_STATE_VERSION, books: {} };
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

export function clamp01(n: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));
}

export function normalizeUrl(url: string | null | undefined): string {
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

export function normalizeChapterPathKey(url: string | null | undefined): string {
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

export function normalizeChapterIndex(idx: unknown): number | null {
  const n = Number(idx);
  if (!Number.isFinite(n)) return null;
  const i = Math.floor(n);
  return i >= 1 ? i : null;
}

export function resolveBookKey(opts: {
  bookUrl?: string | null;
  chapterBookUrl?: string | null;
  inputUrl?: string | null;
}): string {
  return normalizeUrl(opts.bookUrl || opts.chapterBookUrl || opts.inputUrl || "");
}

function readReaderState(): ReaderStorageState {
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
    readerStateCache = { version: READER_STATE_VERSION, books: parsed.books as Record<string, ReaderBookScopedState> };
  } catch {
    readerStateCache = createEmptyReaderState();
  }
  return readerStateCache;
}

function writeReaderState(): void {
  try {
    localStorage.setItem(READER_STATE_KEY, JSON.stringify(readReaderState()));
  } catch {
    // Ignore quota / privacy mode write failures.
  }
}

function readBookScopedState(bookKey: string): ReaderBookScopedState | null {
  if (!bookKey) return null;
  const stateObj = readReaderState();
  const val = stateObj.books[bookKey];
  return isPlainObject(val) ? (val as ReaderBookScopedState) : null;
}

export function patchBookScopedState(bookKey: string, partial: ReaderBookScopedState): void {
  if (!bookKey || !isPlainObject(partial)) return;
  const stateObj = readReaderState();
  const prev = readBookScopedState(bookKey) || {};
  stateObj.books[bookKey] = { ...prev, ...partial };
  writeReaderState();
}

export function getStoredFontPx(bookKey: string): number | null {
  const bookState = readBookScopedState(bookKey);
  const n = Number(bookState?.fontPx);
  return Number.isFinite(n) ? n : null;
}

export function getStoredFontWeight(bookKey: string): number | null {
  const bookState = readBookScopedState(bookKey);
  const n = Number(bookState?.fontWeight);
  return Number.isFinite(n) ? n : null;
}

export function getStoredBrightness(bookKey: string): number | null {
  const bookState = readBookScopedState(bookKey);
  const n = Number(bookState?.brightness);
  return Number.isFinite(n) ? n : null;
}

export function getStoredProgress(bookKey: string): ReaderProgress | null {
  const bookState = readBookScopedState(bookKey);
  if (!isPlainObject(bookState?.progress)) return null;
  const rawProgress = bookState.progress as Partial<ReaderProgress>;
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
    updatedAt: Number(rawProgress.updatedAt) || Date.now(),
  };
}

function findChapterUrlByNormalized(
  chapters: ChapterListItem[] | null | undefined,
  normalizedChapterUrl: string | null | undefined
): string | null {
  const target = normalizeUrl(normalizedChapterUrl);
  if (!target) return null;
  const hit = (chapters || []).find((c) => normalizeUrl(c.url) === target);
  return hit?.url || null;
}

function findChapterUrlByPathKey(
  chapters: ChapterListItem[] | null | undefined,
  chapterPathKey: string | null | undefined
): string | null {
  const target = normalizeChapterPathKey(chapterPathKey);
  if (!target) return null;
  const hit = (chapters || []).find((c) => normalizeChapterPathKey(c.url) === target);
  return hit?.url || null;
}

export function findChapterUrlByProgress(
  chapters: ChapterListItem[] | null | undefined,
  progress: ReaderProgress | null | undefined
): string | null {
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

export function isProgressForChapter(
  progress: ReaderProgress | null | undefined,
  chapterUrl: string,
  chapterIdx: number
): boolean {
  if (!progress) return false;
  const normalizedChapterUrl = normalizeUrl(chapterUrl);
  if (progress.chapterUrl && normalizedChapterUrl && progress.chapterUrl === normalizedChapterUrl) return true;
  const chapterPathKey = normalizeChapterPathKey(chapterUrl);
  if (progress.chapterPathKey && chapterPathKey && progress.chapterPathKey === chapterPathKey) return true;
  const normalizedIdx = normalizeChapterIndex(Number(chapterIdx) + 1);
  return progress.chapterIndex != null && normalizedIdx != null && progress.chapterIndex === normalizedIdx;
}
