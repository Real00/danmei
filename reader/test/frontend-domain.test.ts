import assert from "node:assert/strict";
import test from "node:test";
import { chunkLong } from "../web-src/domain/pagination";
import { findChapterUrlByProgress, normalizeUrl } from "../web-src/services/storage";

test("normalizeUrl strips hash and trailing slash", () => {
  assert.equal(
    normalizeUrl("https://www.dmxs.org/view/1001.html/#foo"),
    "https://www.dmxs.org/view/1001.html"
  );
});

test("findChapterUrlByProgress resolves by url and fallback index", () => {
  const chapters = [
    { name: "1", url: "https://www.dmxs.org/view/1001.html" },
    { name: "2", url: "https://www.dmxs.org/view/1002.html" },
  ];

  const byUrl = findChapterUrlByProgress(chapters, {
    chapterUrl: "https://www.dmxs.org/view/1002.html",
    chapterPathKey: "",
    chapterIndex: null,
    bookUrlNormalized: "https://www.dmxs.org/book/21781.html",
    ratio: 0.5,
    updatedAt: Date.now(),
  });
  assert.equal(byUrl, "https://www.dmxs.org/view/1002.html");

  const byIndex = findChapterUrlByProgress(chapters, {
    chapterUrl: "",
    chapterPathKey: "",
    chapterIndex: 1,
    bookUrlNormalized: "https://www.dmxs.org/book/21781.html",
    ratio: 0.3,
    updatedAt: Date.now(),
  });
  assert.equal(byIndex, "https://www.dmxs.org/view/1001.html");
});

test("chunkLong splits oversized paragraph", () => {
  const long = "测试句子，".repeat(200);
  const chunks = chunkLong(long);
  assert.ok(chunks.length > 1);
  assert.ok(chunks.every((x) => x.length <= 360));
});
