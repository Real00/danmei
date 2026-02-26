import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import request from "supertest";
import { createApp } from "../src/app";
import { createParsedCache } from "../src/services/cache/parsedCache";
import type { FetchHtmlResult } from "../src/types/api";

const fixtureDir = path.join(process.cwd(), "test", "fixtures");
const bookHtml = fs.readFileSync(path.join(fixtureDir, "book.html"), "utf8");
const chapterHtml = fs.readFileSync(path.join(fixtureDir, "chapter.html"), "utf8");

function createMockFetcher(counter: { count: number }) {
  return async (url: string): Promise<FetchHtmlResult> => {
    counter.count += 1;
    if (url.includes("/book/")) {
      return {
        fetcher: "fetch",
        status: 200,
        ok: true,
        html: bookHtml,
        finalUrl: "https://www.dmxs.org/book/21781.html",
        charset: "utf8",
      };
    }
    if (url.includes("/view/")) {
      return {
        fetcher: "fetch",
        status: 200,
        ok: true,
        html: chapterHtml,
        finalUrl: "https://www.dmxs.org/view/1001.html",
        charset: "utf8",
      };
    }
    throw new Error("mock fetch no fixture");
  };
}

test("book route validates missing url", async () => {
  const counter = { count: 0 };
  const fetcher = createMockFetcher(counter);
  const app = createApp({
    debugEnabled: false,
    cache: createParsedCache(),
    fetchers: {
      fetchHtml: fetcher,
      fetchHtmlViaFetch: fetcher,
      fetchHtmlViaPowerShell: fetcher,
    },
  });

  const res = await request(app).get("/api/book");
  assert.equal(res.status, 400);
  assert.equal(res.body.ok, false);
});

test("book route returns cached=true on second call", async () => {
  const counter = { count: 0 };
  const fetcher = createMockFetcher(counter);
  const app = createApp({
    debugEnabled: false,
    cache: createParsedCache(),
    fetchers: {
      fetchHtml: fetcher,
      fetchHtmlViaFetch: fetcher,
      fetchHtmlViaPowerShell: fetcher,
    },
  });

  const first = await request(app)
    .get("/api/book")
    .query({ url: "https://www.dmxs.org/book/21781.html" });
  const second = await request(app)
    .get("/api/book")
    .query({ url: "https://www.dmxs.org/book/21781.html" });

  assert.equal(first.status, 200);
  assert.equal(first.body.cached, false);
  assert.equal(second.status, 200);
  assert.equal(second.body.cached, true);
  assert.equal(counter.count, 1);
});

test("chapter route returns 502 on fetch failure", async () => {
  const failing = async (): Promise<FetchHtmlResult> => {
    throw new Error("boom");
  };

  const app = createApp({
    debugEnabled: false,
    cache: createParsedCache(),
    fetchers: {
      fetchHtml: failing,
      fetchHtmlViaFetch: failing,
      fetchHtmlViaPowerShell: failing,
    },
  });

  const res = await request(app)
    .get("/api/chapter")
    .query({ url: "https://www.dmxs.org/view/1001.html" });

  assert.equal(res.status, 502);
  assert.equal(res.body.ok, false);
  assert.match(String(res.body.error || ""), /boom|Failed to fetch chapter/);
});

test("search route validates missing q", async () => {
  const counter = { count: 0 };
  const fetcher = createMockFetcher(counter);
  const app = createApp({
    debugEnabled: false,
    cache: createParsedCache(),
    fetchers: {
      fetchHtml: fetcher,
      fetchHtmlViaFetch: fetcher,
      fetchHtmlViaPowerShell: fetcher,
    },
  });

  const res = await request(app).get("/api/search");
  assert.equal(res.status, 400);
  assert.equal(res.body.ok, false);
});

test("search route returns formatted search results", async () => {
  const counter = { count: 0 };
  const fetcher = createMockFetcher(counter);
  const app = createApp({
    debugEnabled: false,
    cache: createParsedCache(),
    fetchers: {
      fetchHtml: fetcher,
      fetchHtmlViaFetch: fetcher,
      fetchHtmlViaPowerShell: fetcher,
    },
    searchService: {
      async searchBooks(keyword: string) {
        return {
          kind: "search",
          keyword,
          url: "https://www.dmxs.org/e/search/result/index.html",
          fetcher: "fetch",
          results: [{ title: "测试书名", url: "https://www.dmxs.org/book/21781.html" }],
        };
      },
    } as any,
  });

  const res = await request(app).get("/api/search").query({ q: "测试书名" });
  assert.equal(res.status, 200);
  assert.equal(res.body.ok, true);
  assert.equal(res.body.kind, "search");
  assert.equal(res.body.keyword, "测试书名");
  assert.equal(Array.isArray(res.body.results), true);
  assert.equal(res.body.results.length, 1);
  assert.equal(res.body.results[0].url, "https://www.dmxs.org/book/21781.html");
});
