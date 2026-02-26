import { load } from "cheerio";
import { absUrl, assertAllowedHost } from "../url/normalize";
import { cleanText } from "./common";
import type { SearchResultItem } from "../../types/api";

const BOOK_PATH_RE = /^\/book\/\d+\.html$/i;

function normalizeBookUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    assertAllowedHost(parsed);
    if (!BOOK_PATH_RE.test(parsed.pathname || "")) return null;
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return null;
  }
}

export function parseSearchResults(html: string, baseUrl: string): SearchResultItem[] {
  const $ = load(html, { decodeEntities: false } as never);
  const seen = new Set<string>();
  const items: SearchResultItem[] = [];

  $("a[href]").each((_, el) => {
    const a = $(el);
    const href = cleanText(a.attr("href"));
    if (!href || !/\/book\/\d+\.html/i.test(href)) return;

    const absolute = absUrl(baseUrl, href);
    if (!absolute) return;
    const url = normalizeBookUrl(absolute);
    if (!url || seen.has(url)) return;

    const title = cleanText(a.text()) || cleanText(a.attr("title"));
    if (!title) return;

    seen.add(url);
    items.push({ title, url });
  });

  return items;
}
