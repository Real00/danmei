import type { LRUCache } from "lru-cache";
import { parseBook } from "./parser/bookParser";
import { parseChapter } from "./parser/chapterParser";
import { parsedCache, type CachedPayload, type CachedBookPayload, type CachedChapterPayload } from "./cache/parsedCache";
import type { FetchHtmlFn } from "./fetcher";

export interface ContentServiceOptions {
  fetchHtml: FetchHtmlFn;
  cache?: LRUCache<string, CachedPayload>;
}

export interface ServiceResult<TPayload> {
  payload: TPayload;
  cached: boolean;
}

export function createContentService(options: ContentServiceOptions) {
  const cache = options.cache || parsedCache;

  async function getBook(
    normalizedUrl: string
  ): Promise<ServiceResult<CachedBookPayload>> {
    const cacheKey = `book:${normalizedUrl}`;
    const cached = cache.get(cacheKey);
    if (cached && cached.kind === "book") {
      return { payload: cached, cached: true };
    }

    const { html, finalUrl, fetcher } = await options.fetchHtml(normalizedUrl);
    const book = parseBook(html, finalUrl);
    const payload: CachedBookPayload = { ...book, fetcher };
    cache.set(cacheKey, payload);
    return { payload, cached: false };
  }

  async function getChapter(
    normalizedUrl: string
  ): Promise<ServiceResult<CachedChapterPayload>> {
    const cacheKey = `chapter:${normalizedUrl}`;
    const cached = cache.get(cacheKey);
    if (cached && cached.kind === "chapter") {
      return { payload: cached, cached: true };
    }

    const { html, finalUrl, fetcher } = await options.fetchHtml(normalizedUrl);
    const chapter = parseChapter(html, finalUrl);
    const payload: CachedChapterPayload = { ...chapter, fetcher };
    cache.set(cacheKey, payload);
    return { payload, cached: false };
  }

  return {
    getBook,
    getChapter,
  };
}
