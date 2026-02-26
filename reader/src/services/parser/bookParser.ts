import { load } from "cheerio";
import { absUrl } from "../url/normalize";
import { cleanText } from "./common";
import type { BookPayload } from "../../types/api";

export function parseBook(html: string, baseUrl: string): BookPayload {
  const $ = load(html, { decodeEntities: false } as never);

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
