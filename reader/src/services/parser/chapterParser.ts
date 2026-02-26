import { load } from "cheerio";
import { absUrl } from "../url/normalize";
import { cleanText } from "./common";
import type { ChapterPayload } from "../../types/api";

export function parseChapter(html: string, baseUrl: string): ChapterPayload {
  const $ = load(html, { decodeEntities: false } as never);

  const title =
    cleanText($(".read_chapterName h1").first().text()) || cleanText($("title").first().text());

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

  let prevUrl: string | null = null;
  let nextUrl: string | null = null;
  let tailUrl: string | null = null;
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

  const paragraphs: string[] = [];
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
