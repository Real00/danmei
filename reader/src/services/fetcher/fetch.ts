import iconv from "iconv-lite";
import { detectCharset } from "../text/charset";
import { assertAllowedHost } from "../url/normalize";
import type { FetchHtmlResult } from "../../types/api";

export async function fetchHtmlViaFetch(url: string, userAgent: string): Promise<FetchHtmlResult> {
  const urlObj = new URL(url);
  assertAllowedHost(urlObj);

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(urlObj.toString(), {
      headers: {
        "User-Agent": userAgent,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
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
    return {
      fetcher: "fetch",
      status: res.status,
      ok: res.ok,
      html,
      finalUrl: res.url,
      charset,
    };
  } finally {
    clearTimeout(t);
  }
}
