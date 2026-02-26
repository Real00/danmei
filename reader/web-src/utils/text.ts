export function escapeHtml(s: string | null | undefined): string {
  return (s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function sanitizeFilename(name: string | null | undefined): string {
  const cleaned = String(name || "danmei")
    .replace(/[\\/:*?"<>|\x00-\x1f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || "danmei";
}

export function downloadTextFile(filename: string, content: string): void {
  const text = String(content || "");
  const blob = new Blob([`\uFEFF${text}`], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function htmlToParagraphs(html: string): string[] {
  // Keep basic formatting while avoiding arbitrary scripts/styles.
  const doc = new DOMParser().parseFromString(`<div>${html || ""}</div>`, "text/html");
  const root = doc.body.firstElementChild;
  if (!root) return [];
  const ps = Array.from(root.querySelectorAll("p"));
  if (ps.length) {
    return ps
      .map((p) => p.textContent?.trim() || "")
      .filter(Boolean);
  }
  const t = root.textContent || "";
  return t
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
}
