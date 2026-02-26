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
  fetcher?: string;
  cached?: boolean;
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
  fetcher?: string;
  cached?: boolean;
}

export interface SearchPayload {
  kind: "search";
  keyword: string;
  url: string;
  results: SearchResultItem[];
  fetcher?: string;
}

export interface ReaderProgress {
  chapterUrl: string;
  chapterPathKey: string;
  chapterIndex: number | null;
  bookUrlNormalized: string;
  ratio: number;
  updatedAt: number;
}

export interface ReaderBookScopedState {
  fontPx?: number;
  fontWeight?: number;
  brightness?: number;
  progress?: Partial<ReaderProgress>;
}

export interface ReaderStorageState {
  version: number;
  books: Record<string, ReaderBookScopedState>;
}
