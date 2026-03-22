import assert from "node:assert/strict";
import test from "node:test";
import { chunkLong } from "../web-src/domain/pagination";
import { findChapterUrlByProgress, normalizeUrl } from "../web-src/services/storage";
import { shouldUseWebShareForTextDownload } from "../web-src/utils/text";

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

test("shouldUseWebShareForTextDownload keeps mobile and tablet share flow only", () => {
  assert.equal(
    shouldUseWebShareForTextDownload({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
      platform: "Win32",
      maxTouchPoints: 0,
      canShare: () => true,
      share: async () => {},
    }),
    false
  );

  assert.equal(
    shouldUseWebShareForTextDownload({
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 18_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3 Mobile/15E148 Safari/604.1",
      platform: "iPhone",
      maxTouchPoints: 5,
      canShare: () => true,
      share: async () => {},
    }),
    true
  );

  assert.equal(
    shouldUseWebShareForTextDownload({
      userAgent:
        "Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Mobile Safari/537.36",
      platform: "Linux armv8l",
      maxTouchPoints: 5,
      canShare: () => true,
      share: async () => {},
    }),
    true
  );

  assert.equal(
    shouldUseWebShareForTextDownload({
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
      platform: "MacIntel",
      maxTouchPoints: 0,
      canShare: () => true,
      share: async () => {},
    }),
    false
  );
});
