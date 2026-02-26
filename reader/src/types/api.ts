export interface ChapterListItem {
  name: string;
  url: string;
}

export interface SearchResultItem {
  title: string;
  url: string;
}

export interface BookPayload {
  kind: "book";
  url: string;
  title: string;
  author: string;
  dateText: string;
  tags: string[];
  introHtml: string;
  readNowUrl: string | null;
  chapters: ChapterListItem[];
}

export interface ChapterPayload {
  kind: "chapter";
  url: string;
  title: string;
  bookUrl: string | null;
  prevUrl: string | null;
  nextUrl: string | null;
  tailUrl: string | null;
  chapterIndex: number | null;
  chapterTotal: number | null;
  paragraphs: string[];
}

export type FetcherName = "fetch" | "powershell" | "playwright";

export interface SearchPayload {
  kind: "search";
  keyword: string;
  url: string;
  results: SearchResultItem[];
  fetcher: FetcherName;
}

export interface FetchHtmlResult {
  fetcher: FetcherName;
  status: number;
  ok: boolean;
  html: string;
  finalUrl: string;
  charset: string;
}
