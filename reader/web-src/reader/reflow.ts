import { paginate } from "../domain/pagination";
import { els } from "../dom/elements";
import { saveProgressForCurrentBook } from "../state/preferences";
import { state } from "../state/store";
import { showHint } from "../ui/layout";
import { renderPage } from "../ui/render";

export function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

export async function waitForLayoutStable(): Promise<void> {
  // Two frames helps when DOM changes (intro compact, header text) affect heights.
  await nextFrame();
  await nextFrame();
}

export async function repaginateCurrentChapter(
  opts: { preserveProgress?: boolean; waitForLayout?: boolean } = {}
): Promise<{
  oldTotal: number;
  newTotal: number;
  oldPageIdx: number;
  newPageIdx: number;
} | null> {
  if (!state.chapter) return null;
  const token = ++state.repaginateToken;
  const preserveProgress = opts.preserveProgress !== false;
  const shouldWait = opts.waitForLayout !== false;
  const oldTotal = Math.max(1, state.pages.length || 1);
  const oldPageIdx = Math.max(0, state.pageIdx || 0);

  let oldRatio = 0;
  if (preserveProgress) {
    oldRatio = state.pageIdx / Math.max(1, oldTotal - 1);
  }

  if (shouldWait) await waitForLayoutStable();
  if (token !== state.repaginateToken) return null;
  if (!state.chapter) return null;

  state.pages = paginate(state.chapter.paragraphs || [], els.pageText, els.measure);
  if (token !== state.repaginateToken) return null;

  const total = Math.max(1, state.pages.length || 1);
  if (preserveProgress) {
    state.pageIdx = Math.max(0, Math.min(total - 1, Math.round(oldRatio * Math.max(1, total - 1))));
  } else {
    state.pageIdx = Math.max(0, Math.min(state.pageIdx, total - 1));
  }
  renderPage();
  saveProgressForCurrentBook();
  return {
    oldTotal,
    newTotal: total,
    oldPageIdx,
    newPageIdx: state.pageIdx,
  };
}

export async function forceReflowCurrentChapter(
  opts: { preserveProgress?: boolean; waitForLayout?: boolean; showHint?: boolean } = {}
): Promise<{
  oldTotal: number;
  newTotal: number;
  oldPageIdx: number;
  newPageIdx: number;
} | null> {
  if (!state.chapter) return null;
  const result = await repaginateCurrentChapter({
    preserveProgress: opts.preserveProgress !== false,
    waitForLayout: opts.waitForLayout !== false,
  });
  if (!result) return null;
  if (opts.showHint !== false) {
    const msg =
      result.oldTotal !== result.newTotal
        ? `已重排 ${result.oldTotal}->${result.newTotal} 页`
        : "已重排（页数未变）";
    showHint(msg, { autoResetMs: 1400 });
  }
  return result;
}

export async function repaginateForViewportModeSwitch(): Promise<void> {
  if (!state.chapter) return;
  try {
    await repaginateCurrentChapter({ preserveProgress: true, waitForLayout: true });
  } catch {
    // Ignore reflow errors during rapid mode switches.
  }
}
