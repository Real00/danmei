import assert from "node:assert/strict";
import test from "node:test";
import { normalizeInputUrl } from "../src/services/url/normalize";

test("normalizeInputUrl handles dmxs host shortcuts", () => {
  assert.equal(
    normalizeInputUrl("https://www.dmxs.org/book/21781.html"),
    "https://www.dmxs.org/book/21781.html"
  );
  assert.equal(
    normalizeInputUrl("//www.dmxs.org/book/21781.html"),
    "https://www.dmxs.org/book/21781.html"
  );
  assert.equal(
    normalizeInputUrl("/book/21781.html"),
    "https://www.dmxs.org/book/21781.html"
  );
  assert.equal(
    normalizeInputUrl("www.dmxs.org/book/21781.html"),
    "https://www.dmxs.org/book/21781.html"
  );
  assert.equal(
    normalizeInputUrl("book/21781.html"),
    "https://www.dmxs.org/book/21781.html"
  );
});

test("normalizeInputUrl returns null for invalid input", () => {
  assert.equal(normalizeInputUrl(""), null);
  assert.equal(normalizeInputUrl("   "), null);
  assert.equal(normalizeInputUrl(null), null);
});
