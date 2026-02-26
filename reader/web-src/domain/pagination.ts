import { escapeHtml } from "../utils/text";

export function chunkLong(text: string): string[] {
  const t = (text || "").trim();
  if (t.length <= 360) return [t];

  const parts: string[] = [];
  let start = 0;
  while (start < t.length) {
    let end = Math.min(t.length, start + 360);
    const slice = t.slice(start, end);
    const cut =
      Math.max(
        slice.lastIndexOf("。"),
        slice.lastIndexOf("！"),
        slice.lastIndexOf("？"),
        slice.lastIndexOf("；"),
        slice.lastIndexOf("，")
      ) + 1;
    if (cut > 40) end = start + cut;
    parts.push(t.slice(start, end).trim());
    start = end;
  }
  return parts.filter(Boolean);
}

export function paginate(
  paragraphs: string[] | null | undefined,
  pageTextEl: HTMLElement,
  measure: HTMLElement
): string[][] {
  const style = getComputedStyle(pageTextEl);

  const rect = pageTextEl.getBoundingClientRect();
  const width = Math.floor(rect.width || pageTextEl.clientWidth || pageTextEl.offsetWidth || 0);
  const height = Math.floor(rect.height || pageTextEl.clientHeight || pageTextEl.offsetHeight || 0);

  // Mirror the actual reading style and box size.
  measure.style.width = `${Math.max(1, width)}px`;
  measure.style.padding = style.padding;
  measure.style.fontFamily = style.fontFamily;
  measure.style.fontSize = style.fontSize;
  measure.style.fontWeight = style.fontWeight;
  measure.style.lineHeight = style.lineHeight;
  measure.style.letterSpacing = style.letterSpacing;
  const availableH = Math.max(120, height);

  const flat: string[] = [];
  for (const p of paragraphs || []) {
    for (const c of chunkLong(p)) flat.push(c);
  }

  const pages: string[][] = [];
  let cur: string[] = [];

  function renderCandidate(candidate: string[]): number {
    measure.innerHTML = candidate.map((t) => `<p>${escapeHtml(t)}</p>`).join("");
    return measure.scrollHeight;
  }

  function splitChunkAtBoundary(text: string): [string, string] {
    const t = String(text || "").trim();
    if (t.length < 2) return [t, ""];

    const mid = Math.floor(t.length / 2);
    const separators = "。！？；，、,.!?;:： \n\t";
    let cut = -1;
    const limit = Math.min(120, t.length - 2);

    for (let d = 0; d <= limit; d += 1) {
      const right = mid + d;
      if (right > 0 && right < t.length - 1 && separators.includes(t[right])) {
        cut = right + 1;
        break;
      }
      const left = mid - d;
      if (left > 0 && left < t.length - 1 && separators.includes(t[left])) {
        cut = left + 1;
        break;
      }
    }

    if (cut <= 0 || cut >= t.length) cut = mid;
    let a = t.slice(0, cut).trim();
    let b = t.slice(cut).trim();
    if (!a || !b) {
      const hard = Math.floor(t.length / 2);
      a = t.slice(0, hard).trim();
      b = t.slice(hard).trim();
    }
    return [a, b];
  }

  function splitChunkToFit(text: string, depth = 0): string[] {
    const t = String(text || "").trim();
    if (!t) return [];
    if (renderCandidate([t]) <= availableH) return [t];
    if (t.length <= 1 || depth >= 14) return [t];

    const [a, b] = splitChunkAtBoundary(t);
    if (!a || !b || a === t || b === t) return [t];
    return splitChunkToFit(a, depth + 1).concat(splitChunkToFit(b, depth + 1));
  }

  for (const p of flat) {
    const pieces = splitChunkToFit(p);
    for (const piece of pieces) {
      const next = cur.concat([piece]);
      if (renderCandidate(next) <= availableH) {
        cur = next;
        continue;
      }
      if (cur.length) pages.push(cur);

      if (renderCandidate([piece]) <= availableH) {
        cur = [piece];
      } else {
        // Extremely small viewport fallback: keep progress instead of dropping content.
        pages.push([piece]);
        cur = [];
      }
    }
  }
  if (cur.length) pages.push(cur);
  return pages.length ? pages : [[]];
}
