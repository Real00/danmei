function requiredElement<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Missing required element: #${id}`);
  }
  return el as T;
}

export const els = {
  urlForm: requiredElement<HTMLFormElement>("urlForm"),
  urlInput: requiredElement<HTMLInputElement>("urlInput"),
  brandSub: requiredElement<HTMLElement>("brandSub"),
  hideTopbar: requiredElement<HTMLButtonElement>("hideTopbar"),

  drawer: requiredElement<HTMLElement>("drawer"),
  scrim: requiredElement<HTMLElement>("scrim"),
  toggleChapters: requiredElement<HTMLButtonElement>("toggleChapters"),
  closeDrawer: requiredElement<HTMLButtonElement>("closeDrawer"),
  openChapters: requiredElement<HTMLButtonElement>("openChapters"),
  exportTxtTop: document.getElementById("exportTxtTop") as HTMLButtonElement | null,
  exportTxt: requiredElement<HTMLButtonElement>("exportTxt"),
  chapterSearch: requiredElement<HTMLInputElement>("chapterSearch"),
  chapterList: requiredElement<HTMLElement>("chapterList"),
  drawerTitle: requiredElement<HTMLElement>("drawerTitle"),

  introCard: requiredElement<HTMLElement>("introCard"),
  bookTitle: requiredElement<HTMLElement>("bookTitle"),
  bookMeta: requiredElement<HTMLElement>("bookMeta"),
  bookIntro: requiredElement<HTMLElement>("bookIntro"),
  readFirst: requiredElement<HTMLButtonElement>("readFirst"),
  toggleIntro: requiredElement<HTMLButtonElement>("toggleIntro"),

  pageCard: requiredElement<HTMLElement>("pageCard"),
  chapterTitle: requiredElement<HTMLElement>("chapterTitle"),
  pageMeta: requiredElement<HTMLElement>("pageMeta"),
  pageBody: requiredElement<HTMLElement>("pageBody"),
  pageFooter: requiredElement<HTMLElement>("pageFooter"),
  pageText: requiredElement<HTMLElement>("pageText"),
  loadingOverlay: requiredElement<HTMLElement>("loadingOverlay"),
  loadingLabel: requiredElement<HTMLElement>("loadingLabel"),
  progress: requiredElement<HTMLElement>("progress"),
  hint: requiredElement<HTMLElement>("hint"),

  tapLeft: requiredElement<HTMLElement>("tapLeft"),
  tapRight: requiredElement<HTMLElement>("tapRight"),
  measure: requiredElement<HTMLElement>("measure"),

  fontMinus: requiredElement<HTMLButtonElement>("fontMinus"),
  fontPlus: requiredElement<HTMLButtonElement>("fontPlus"),
  weightMinus: requiredElement<HTMLButtonElement>("weightMinus"),
  weightPlus: requiredElement<HTMLButtonElement>("weightPlus"),
  brightnessMinus: requiredElement<HTMLButtonElement>("brightnessMinus"),
  brightnessPlus: requiredElement<HTMLButtonElement>("brightnessPlus"),
  reflow: requiredElement<HTMLButtonElement>("reflow"),
  sheetScrim: requiredElement<HTMLElement>("sheetScrim"),
  fontSheet: requiredElement<HTMLElement>("fontSheet"),
  fontMinusSheet: requiredElement<HTMLButtonElement>("fontMinusSheet"),
  fontPlusSheet: requiredElement<HTMLButtonElement>("fontPlusSheet"),
  weightMinusSheet: requiredElement<HTMLButtonElement>("weightMinusSheet"),
  weightPlusSheet: requiredElement<HTMLButtonElement>("weightPlusSheet"),
  brightnessMinusSheet: requiredElement<HTMLButtonElement>("brightnessMinusSheet"),
  brightnessPlusSheet: requiredElement<HTMLButtonElement>("brightnessPlusSheet"),
  reflowSheet: requiredElement<HTMLButtonElement>("reflowSheet"),
  closeFontSheet: requiredElement<HTMLButtonElement>("closeFontSheet"),
};

export function syncTopbarHeight(): void {
  const topbar = document.querySelector(".topbar") as HTMLElement | null;
  if (!topbar) return;
  const h = Math.max(56, Math.min(140, topbar.offsetHeight || 74));
  document.documentElement.style.setProperty("--top", `${h}px`);
}
