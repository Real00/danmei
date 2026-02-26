const express = require("express");
const path = require("path");
const { execFile } = require("child_process");
const cheerio = require("cheerio");
const iconv = require("iconv-lite");
const { LRUCache } = require("lru-cache");

const app = express();
const port = Number(process.env.PORT || 8787);

const UA =
  process.env.DANMEI_UA ||
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const parsedCache = new LRUCache({
  max: 200,
  ttl: 10 * 60 * 1000,
});

function safeJsonError(res, status, message) {
  res.status(status).json({ ok: false, error: message });
}

function normalizeInputUrl(input) {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Accept full URL, protocol-relative, absolute path, or site-relative.
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (trimmed.startsWith("/")) return `https://www.dmxs.org${trimmed}`;
  if (/^www\.dmxs\.org\//i.test(trimmed)) return `https://${trimmed}`;
  return `https://www.dmxs.org/${trimmed.replace(/^\.?\//, "")}`;
}

function assertAllowedHost(urlObj) {
  // Avoid turning this into a generic SSRF proxy.
  const host = (urlObj.hostname || "").toLowerCase();
  if (host === "dmxs.org" || host.endsWith(".dmxs.org")) return;
  throw new Error("Only dmxs.org URLs are allowed.");
}

function detectCharset(contentType, headSampleLatin1) {
  const ct = (contentType || "").toLowerCase();
  const ctMatch = ct.match(/charset\s*=\s*([a-z0-9._-]+)/i);
  const metaMatch = (headSampleLatin1 || "").match(
    /charset\s*=\s*["']?\s*([a-z0-9._-]+)/i
  );

  let charset = (ctMatch?.[1] || metaMatch?.[1] || "").toLowerCase();
  if (!charset) return "utf8";
  if (charset === "gb2312") charset = "gbk";
  if (charset === "gb_2312") charset = "gbk";
  if (charset === "gb18030") charset = "gb18030";
  if (charset === "utf-8") charset = "utf8";
  return charset;
}

async function fetchHtmlViaFetch(url) {
  const urlObj = new URL(url);
  assertAllowedHost(urlObj);

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(urlObj.toString(), {
      headers: {
        "User-Agent": UA,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.7",
        Referer: "https://www.dmxs.org/",
        "Upgrade-Insecure-Requests": "1",
      },
      redirect: "follow",
      signal: controller.signal,
    });
    const ab = await res.arrayBuffer();
    const buf = Buffer.from(ab);
    const headSampleLatin1 = buf.toString("latin1", 0, 2048);
    const charset = detectCharset(res.headers.get("content-type"), headSampleLatin1);
    const html = iconv.decode(buf, charset);
    return { fetcher: "fetch", status: res.status, ok: res.ok, html, finalUrl: res.url, charset };
  } finally {
    clearTimeout(t);
  }
}

function fetchHtmlViaPowerShell(url) {
  const urlObj = new URL(url);
  assertAllowedHost(urlObj);

  if (process.platform !== "win32") {
    return Promise.reject(new Error("PowerShell fetcher is only available on Windows."));
  }

  // PowerShell's Invoke-WebRequest often passes through WAF rules that block Node/curl.
  // Emit base64 of raw response bytes to avoid stdout encoding corruption.
  const ps = [
    "$ProgressPreference='SilentlyContinue';",
    `$u='${urlObj.toString().replace(/'/g, "''")}';`,
    "$h=@{",
    `  'User-Agent'='${UA.replace(/'/g, "''")}';`,
    "  'Accept'='text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';",
    "  'Accept-Language'='zh-CN,zh;q=0.9,en;q=0.7';",
    "  'Referer'='https://www.dmxs.org/';",
    "  'Upgrade-Insecure-Requests'='1';",
    "};",
    "$r=Invoke-WebRequest -UseBasicParsing -Uri $u -Headers $h -MaximumRedirection 5;",
    "$ms = New-Object System.IO.MemoryStream;",
    "$r.RawContentStream.CopyTo($ms) | Out-Null;",
    "[Convert]::ToBase64String($ms.ToArray())",
  ].join("\n");

  return new Promise((resolve, reject) => {
    execFile(
      "powershell.exe",
      ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", ps],
      { windowsHide: true, maxBuffer: 20 * 1024 * 1024, timeout: 30000 },
      (err, stdout, stderr) => {
        if (err) {
          reject(new Error(`PowerShell fetch failed: ${stderr || err.message}`.trim()));
          return;
        }
        const b64 = String(stdout || "").trim();
        if (!b64) {
          reject(new Error("PowerShell fetch failed: empty response"));
          return;
        }
        let buf;
        try {
          buf = Buffer.from(b64, "base64");
        } catch {
          reject(new Error("PowerShell fetch failed: invalid base64"));
          return;
        }
        const headSampleLatin1 = buf.toString("latin1", 0, 2048);
        const charset = detectCharset(null, headSampleLatin1);
        const html = iconv.decode(buf, charset);
        resolve({
          fetcher: "powershell",
          status: 200,
          ok: true,
          html,
          finalUrl: urlObj.toString(),
          charset,
        });
      }
    );
  });
}

async function fetchHtml(url) {
  try {
    const r = await fetchHtmlViaFetch(url);
    if (r.ok && (r.html || "").length > 200) return r;
    throw new Error(`Upstream error: HTTP ${r.status}`);
  } catch (e) {
    if (process.platform === "win32") {
      return fetchHtmlViaPowerShell(url);
    }
    if (process.env.DANMEI_PLAYWRIGHT === "1") {
      return fetchHtmlViaPlaywright(url);
    }
    // Keep the error actionable for non-Windows hosts.
    throw new Error(
      `${e?.message || "Fetch failed"} (Note: dmxs.org may block Node/curl; use a headless browser fetcher on Linux.)`
    );
  }
}

let _pwBrowser = null;

async function fetchHtmlViaPlaywright(url) {
  const urlObj = new URL(url);
  assertAllowedHost(urlObj);

  let chromium;
  try {
    chromium = require("playwright").chromium;
  } catch {
    throw new Error(
      "Playwright is not installed. Run `pnpm add playwright` and ensure browsers are installed, then set DANMEI_PLAYWRIGHT=1."
    );
  }

  if (!_pwBrowser) {
    _pwBrowser = await chromium.launch({ headless: true });
    const cleanup = async () => {
      try {
        await _pwBrowser?.close();
      } catch {
        // ignore
      } finally {
        _pwBrowser = null;
      }
    };
    process.once("SIGINT", cleanup);
    process.once("SIGTERM", cleanup);
    process.once("exit", cleanup);
  }

  const page = await _pwBrowser.newPage({
    userAgent: UA,
    extraHTTPHeaders: {
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.7",
      Referer: "https://www.dmxs.org/",
      "Upgrade-Insecure-Requests": "1",
    },
  });

  try {
    await page.goto(urlObj.toString(), { waitUntil: "domcontentloaded", timeout: 30000 });
    const html = await page.content();
    return {
      fetcher: "playwright",
      status: 200,
      ok: true,
      html,
      finalUrl: urlObj.toString(),
      charset: "utf8",
    };
  } finally {
    await page.close().catch(() => {});
  }
}

function absUrl(base, href) {
  if (!href) return null;
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

function cleanText(s) {
  return (s || "")
    .replace(/\r/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

function parseBook(html, baseUrl) {
  const $ = cheerio.load(html, { decodeEntities: false });

  const title = cleanText($(".book_info .infos h1").first().text());
  const author = cleanText($(".book_info .infos .date a").first().text());
  const dateText = cleanText($(".book_info .infos .date").first().text());
  const tags = $(".book_info .infos .tags a")
    .map((_, el) => cleanText($(el).text()))
    .get()
    .filter(Boolean);

  const introHtml = $(".book_info .infos > p").first().html() || "";
  const readNowHref = $(".book_info .booktips a.readnow").attr("href");
  const readNowUrl = absUrl(baseUrl, readNowHref);

  const chapters = $(".book_list ul li a")
    .map((_, el) => {
      const a = $(el);
      const name = cleanText(a.text());
      const href = a.attr("href");
      const url = absUrl(baseUrl, href);
      if (!name || !url) return null;
      return { name, url };
    })
    .get()
    .filter(Boolean);

  return {
    kind: "book",
    url: baseUrl,
    title,
    author,
    dateText,
    tags,
    introHtml,
    readNowUrl,
    chapters,
  };
}

function parseChapter(html, baseUrl) {
  const $ = cheerio.load(html, { decodeEntities: false });

  const title =
    cleanText($(".read_chapterName h1").first().text()) ||
    cleanText($("title").first().text());

  const bookHref =
    $(".newpageNav a")
      .filter((_, el) => (($(el).attr("href") || "").includes("/book/")))
      .first()
      .attr("href") ||
    $(".readTop a")
      .filter((_, el) => (($(el).attr("href") || "").includes("/book/")))
      .first()
      .attr("href");

  const bookUrl = absUrl(baseUrl, bookHref);

  let prevUrl = null;
  let nextUrl = null;
  let tailUrl = null;
  $(".newpageNav a").each((_, el) => {
    const a = $(el);
    const txt = cleanText(a.text());
    const href = a.attr("href");
    const url = absUrl(baseUrl, href);
    if (!url) return;
    if (txt.includes("上一章")) prevUrl = url;
    else if (txt.includes("下一章")) nextUrl = url;
    else if (txt.includes("尾章")) tailUrl = url;
  });

  const navText = cleanText($(".newpageNav").first().text());
  const idxMatch = navText.match(/(\d+)\s*\/\s*(\d+)/);
  const chapterIndex = idxMatch ? Number(idxMatch[1]) : null;
  const chapterTotal = idxMatch ? Number(idxMatch[2]) : null;

  const paragraphs = [];
  const detail = $(".read_chapterDetail").first();
  if (detail.length) {
    const ps = detail.find("p");
    if (ps.length) {
      ps.each((_, p) => {
        const t = cleanText($(p).text());
        if (t) paragraphs.push(t);
      });
    } else {
      const t = cleanText(detail.text());
      if (t) paragraphs.push(...t.split("\n").map(cleanText).filter(Boolean));
    }
  }

  return {
    kind: "chapter",
    url: baseUrl,
    title,
    bookUrl,
    prevUrl,
    nextUrl,
    tailUrl,
    chapterIndex,
    chapterTotal,
    paragraphs,
  };
}

app.get("/api/ping", (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.get("/api/_debug/fetch", async (req, res) => {
  if (process.env.DANMEI_DEBUG !== "1") {
    return safeJsonError(res, 404, "Not found");
  }
  const input = req.query.url;
  const normalized = normalizeInputUrl(String(input || ""));
  if (!normalized) return safeJsonError(res, 400, "Missing url");
  const mode = String(req.query.mode || "auto");
  try {
    const r =
      mode === "fetch"
        ? await fetchHtmlViaFetch(normalized)
        : mode === "powershell"
          ? await fetchHtmlViaPowerShell(normalized)
          : await fetchHtml(normalized);
    res.json({
      ok: true,
      fetcher: r.fetcher,
      status: r.status,
      charset: r.charset,
      finalUrl: r.finalUrl,
      len: (r.html || "").length,
      head: (r.html || "").slice(0, 120),
    });
  } catch (e) {
    safeJsonError(res, 502, e?.message || "debug fetch failed");
  }
});

app.get("/api/book", async (req, res) => {
  const input = req.query.url;
  const normalized = normalizeInputUrl(String(input || ""));
  if (!normalized) return safeJsonError(res, 400, "Missing url");

  const cacheKey = `book:${normalized}`;
  const cached = parsedCache.get(cacheKey);
  if (cached) return res.json({ ok: true, ...cached, cached: true });

  try {
    const { html, finalUrl, fetcher } = await fetchHtml(normalized);
    const book = parseBook(html, finalUrl);
    const payload = { ...book, fetcher };
    parsedCache.set(cacheKey, payload);
    res.json({ ok: true, ...payload, cached: false });
  } catch (e) {
    safeJsonError(res, 502, e?.message || "Failed to fetch book");
  }
});

app.get("/api/chapter", async (req, res) => {
  const input = req.query.url;
  const normalized = normalizeInputUrl(String(input || ""));
  if (!normalized) return safeJsonError(res, 400, "Missing url");

  const cacheKey = `chapter:${normalized}`;
  const cached = parsedCache.get(cacheKey);
  if (cached) return res.json({ ok: true, ...cached, cached: true });

  try {
    const { html, finalUrl, fetcher } = await fetchHtml(normalized);
    const chapter = parseChapter(html, finalUrl);
    const payload = { ...chapter, fetcher };
    parsedCache.set(cacheKey, payload);
    res.json({ ok: true, ...payload, cached: false });
  } catch (e) {
    safeJsonError(res, 502, e?.message || "Failed to fetch chapter");
  }
});

app.use(express.static(path.join(__dirname, "public"), { etag: true }));

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Reader server: http://localhost:${port}`);
});
