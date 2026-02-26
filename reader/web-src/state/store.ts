import { DEFAULT_BRIGHTNESS, DEFAULT_FONT_PX, DEFAULT_FONT_WEIGHT } from "../constants";

export const state = {
  book: null,
  chapters: [],
  chapterIdx: -1,
  chapter: null,
  pages: [],
  pageIdx: 0,
  fontPx: DEFAULT_FONT_PX,
  fontWeight: DEFAULT_FONT_WEIGHT,
  brightness: DEFAULT_BRIGHTNESS,
  lastUrl: localStorage.getItem("danmei_lastUrl") || "",
  isLoading: false,
  loadingKind: "",
  topVisible: true,
  fontSheetOpen: false,
  repaginateToken: 0,
  currentBookKey: "",
  pendingRestore: null,
  hintTimer: null,
};
