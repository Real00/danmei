import express from "express";
import path from "path";
import { DEBUG_ENABLED, PLAYWRIGHT_ENABLED, USER_AGENT } from "./config";
import { createParsedCache } from "./services/cache/parsedCache";
import { createContentService } from "./services/contentService";
import { createFetchers, type FetcherBundle } from "./services/fetcher";
import { createPingRouter } from "./routes/ping";
import { createDebugRouter } from "./routes/debug";
import { createBookRouter } from "./routes/book";
import { createChapterRouter } from "./routes/chapter";
import { createSearchRouter } from "./routes/search";
import { createSearchService } from "./services/searchService";

export interface CreateAppOptions {
  debugEnabled?: boolean;
  allowPlaywright?: boolean;
  userAgent?: string;
  cache?: ReturnType<typeof createParsedCache>;
  fetchers?: Partial<FetcherBundle>;
  searchService?: ReturnType<typeof createSearchService>;
}

export function createApp(options: CreateAppOptions = {}) {
  const app = express();
  const cache = options.cache || createParsedCache();
  const userAgent = options.userAgent || USER_AGENT;
  const debugEnabled = options.debugEnabled ?? DEBUG_ENABLED;
  const allowPlaywright = options.allowPlaywright ?? PLAYWRIGHT_ENABLED;

  const baseFetchers = createFetchers({
    userAgent,
    allowPlaywright,
  });

  const fetchers: FetcherBundle = {
    ...baseFetchers,
    ...options.fetchers,
  };
  const searchService = options.searchService || createSearchService({ userAgent });

  const contentService = createContentService({
    fetchHtml: fetchers.fetchHtml,
    cache,
  });

  app.use(createPingRouter());
  app.use(
    createDebugRouter({
      enabled: debugEnabled,
      fetchHtml: fetchers.fetchHtml,
      fetchHtmlViaFetch: fetchers.fetchHtmlViaFetch,
      fetchHtmlViaPowerShell: fetchers.fetchHtmlViaPowerShell,
    })
  );
  app.use(createBookRouter({ contentService }));
  app.use(createChapterRouter({ contentService }));
  app.use(createSearchRouter({ searchService }));

  app.use(express.static(path.join(__dirname, "..", "public"), { etag: true }));
  return app;
}
