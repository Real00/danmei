import { LRUCache } from "lru-cache";
import type { BookPayload, ChapterPayload, FetcherName } from "../../types/api";

export type CachedBookPayload = BookPayload & { fetcher: FetcherName };
export type CachedChapterPayload = ChapterPayload & { fetcher: FetcherName };
export type CachedPayload = CachedBookPayload | CachedChapterPayload;

export function createParsedCache(): LRUCache<string, CachedPayload> {
  return new LRUCache<string, CachedPayload>({
    max: 200,
    ttl: 10 * 60 * 1000,
  });
}

export const parsedCache = createParsedCache();
