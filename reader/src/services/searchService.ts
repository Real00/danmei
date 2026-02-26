import { execFile } from "child_process";
import iconv from "iconv-lite";
import { detectCharset } from "./text/charset";
import { parseSearchResults } from "./parser/searchParser";
import type { FetcherName, SearchPayload } from "../types/api";

const SEARCH_ENDPOINT = "https://www.dmxs.org/e/search/indexsearch.php";
const REQUEST_TIMEOUT_MS = 15000;

interface SearchFetchResult {
  fetcher: FetcherName;
  status: number;
  html: string;
  finalUrl: string;
  charset: string;
}

interface CreateSearchServiceOptions {
  userAgent: string;
}

function encodeFormComponentGbk(value: string): string {
  const bytes = iconv.encode(value, "gbk");
  let out = "";
  for (const byte of bytes) {
    if (
      (byte >= 0x30 && byte <= 0x39) ||
      (byte >= 0x41 && byte <= 0x5a) ||
      (byte >= 0x61 && byte <= 0x7a) ||
      byte === 0x2d ||
      byte === 0x5f ||
      byte === 0x2e ||
      byte === 0x7e
    ) {
      out += String.fromCharCode(byte);
    } else if (byte === 0x20) {
      out += "+";
    } else {
      out += `%${byte.toString(16).toUpperCase().padStart(2, "0")}`;
    }
  }
  return out;
}

function buildSearchPostData(keyword: string): string {
  return `keyboard=${encodeFormComponentGbk(keyword)}&show=title&classid=0`;
}

async function fetchSearchViaFetch(keyword: string, userAgent: string): Promise<SearchFetchResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(SEARCH_ENDPOINT, {
      method: "POST",
      headers: {
        "User-Agent": userAgent,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.7",
        Referer: "https://www.dmxs.org/",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: buildSearchPostData(keyword),
      redirect: "follow",
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`Search request failed: ${res.status}`);
    }

    const buf = Buffer.from(await res.arrayBuffer());
    const headSampleLatin1 = buf.toString("latin1", 0, 2048);
    const charset = detectCharset(res.headers.get("content-type"), headSampleLatin1);
    const html = iconv.decode(buf, charset);
    return {
      fetcher: "fetch",
      status: res.status,
      html,
      finalUrl: res.url || SEARCH_ENDPOINT,
      charset,
    };
  } finally {
    clearTimeout(timer);
  }
}

function fetchSearchViaPowerShell(keyword: string, userAgent: string): Promise<SearchFetchResult> {
  if (process.platform !== "win32") {
    return Promise.reject(new Error("PowerShell fetcher is only available on Windows."));
  }

  const postData = buildSearchPostData(keyword);
  const ps = [
    "$ProgressPreference='SilentlyContinue';",
    `$u='${SEARCH_ENDPOINT.replace(/'/g, "''")}';`,
    `$body='${postData.replace(/'/g, "''")}';`,
    "$h=@{",
    `  'User-Agent'='${userAgent.replace(/'/g, "''")}';`,
    "  'Accept'='text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';",
    "  'Accept-Language'='zh-CN,zh;q=0.9,en;q=0.7';",
    "  'Referer'='https://www.dmxs.org/';",
    "  'Upgrade-Insecure-Requests'='1';",
    "};",
    "$r=Invoke-WebRequest -UseBasicParsing -Uri $u -Method POST -Headers $h -ContentType 'application/x-www-form-urlencoded' -Body $body -MaximumRedirection 5;",
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
          reject(new Error(`PowerShell search failed: ${stderr || err.message}`.trim()));
          return;
        }

        const b64 = String(stdout || "").trim();
        if (!b64) {
          reject(new Error("PowerShell search failed: empty response"));
          return;
        }

        let buf: Buffer;
        try {
          buf = Buffer.from(b64, "base64");
        } catch {
          reject(new Error("PowerShell search failed: invalid base64"));
          return;
        }

        const headSampleLatin1 = buf.toString("latin1", 0, 2048);
        const charset = detectCharset(null, headSampleLatin1);
        const html = iconv.decode(buf, charset);
        resolve({
          fetcher: "powershell",
          status: 200,
          html,
          finalUrl: SEARCH_ENDPOINT,
          charset,
        });
      }
    );
  });
}

export function createSearchService(options: CreateSearchServiceOptions) {
  return {
    async searchBooks(keyword: string): Promise<SearchPayload> {
      const trimmedKeyword = String(keyword || "").trim();
      if (!trimmedKeyword) {
        throw new Error("Missing keyword");
      }

      let fetched: SearchFetchResult;
      try {
        fetched = await fetchSearchViaFetch(trimmedKeyword, options.userAgent);
      } catch (fetchErr) {
        if (process.platform !== "win32") throw fetchErr;
        try {
          fetched = await fetchSearchViaPowerShell(trimmedKeyword, options.userAgent);
        } catch (psErr) {
          const msg = (fetchErr as Error)?.message || "Search failed";
          const psMsg = (psErr as Error)?.message || "PowerShell fallback failed";
          throw new Error(`${msg}; ${psMsg}`);
        }
      }

      return {
        kind: "search",
        keyword: trimmedKeyword,
        url: fetched.finalUrl,
        results: parseSearchResults(fetched.html, fetched.finalUrl),
        fetcher: fetched.fetcher,
      };
    },
  };
}
