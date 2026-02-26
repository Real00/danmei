export function normalizeInputUrl(input: string | null | undefined): string | null {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Accept full URL, protocol-relative, absolute path, or site-relative.
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (trimmed.startsWith("/")) return `https://www.dmxs.org${trimmed}`;
  if (/^www\.dmxs\.org\//i.test(trimmed)) return `https://${trimmed}`;
  return `https://www.dmxs.org/${trimmed.replace(/^\.?\//, "")}`;
}

export function assertAllowedHost(urlObj: URL): void {
  // Avoid turning this into a generic SSRF proxy.
  const host = (urlObj.hostname || "").toLowerCase();
  if (host === "dmxs.org" || host.endsWith(".dmxs.org")) return;
  throw new Error("Only dmxs.org URLs are allowed.");
}

export function absUrl(base: string, href: string | null | undefined): string | null {
  if (!href) return null;
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}
