import { state } from "../state/store";
import { normalizeUrl } from "../services/storage";

export function pickFirstChapterUrl(book: { readNowUrl?: string | null; chapters?: Array<{ url: string }> }): string | null {
  if (book.readNowUrl) return book.readNowUrl;
  if (book.chapters && book.chapters.length) return book.chapters[0].url;
  return null;
}

export function setHash(url: string): void {
  const u = url ? encodeURIComponent(url) : "";
  history.replaceState(null, "", u ? `#u=${u}` : "#");
}

export function getHashUrl(): string | null {
  const m = location.hash.match(/u=([^&]+)/);
  if (!m) return null;
  try {
    return decodeURIComponent(m[1]);
  } catch {
    return null;
  }
}

export function findChapterIndexByUrl(url: string): number {
  const u = normalizeUrl(url);
  if (!u) return -1;
  return state.chapters.findIndex((c) => normalizeUrl(c.url) === u);
}
