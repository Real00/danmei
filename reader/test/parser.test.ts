import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { parseBook } from "../src/services/parser/bookParser";
import { parseChapter } from "../src/services/parser/chapterParser";

const fixtureDir = path.join(process.cwd(), "test", "fixtures");

test("parseBook extracts title, tags and chapter list", () => {
  const html = fs.readFileSync(path.join(fixtureDir, "book.html"), "utf8");
  const parsed = parseBook(html, "https://www.dmxs.org/book/21781.html");

  assert.equal(parsed.kind, "book");
  assert.equal(parsed.title, "测试书名");
  assert.equal(parsed.author, "测试作者");
  assert.equal(parsed.tags.length, 2);
  assert.equal(parsed.readNowUrl, "https://www.dmxs.org/view/1001.html");
  assert.equal(parsed.chapters.length, 2);
  assert.equal(parsed.chapters[0].url, "https://www.dmxs.org/view/1001.html");
});

test("parseChapter extracts navigation and paragraphs", () => {
  const html = fs.readFileSync(path.join(fixtureDir, "chapter.html"), "utf8");
  const parsed = parseChapter(html, "https://www.dmxs.org/view/1001.html");

  assert.equal(parsed.kind, "chapter");
  assert.equal(parsed.title, "第1章 测试章节");
  assert.equal(parsed.bookUrl, "https://www.dmxs.org/book/21781.html");
  assert.equal(parsed.prevUrl, "https://www.dmxs.org/view/1000.html");
  assert.equal(parsed.nextUrl, "https://www.dmxs.org/view/1002.html");
  assert.equal(parsed.tailUrl, "https://www.dmxs.org/view/1200.html");
  assert.equal(parsed.chapterIndex, 1);
  assert.equal(parsed.chapterTotal, 20);
  assert.deepEqual(parsed.paragraphs, ["第一段正文。", "第二段正文。"]);
});
