export function detectCharset(contentType: string | null, headSampleLatin1: string): string {
  const ct = (contentType || "").toLowerCase();
  const ctMatch = ct.match(/charset\s*=\s*([a-z0-9._-]+)/i);
  const metaMatch = (headSampleLatin1 || "").match(/charset\s*=\s*["']?\s*([a-z0-9._-]+)/i);

  let charset = (ctMatch?.[1] || metaMatch?.[1] || "").toLowerCase();
  if (!charset) return "utf8";
  if (charset === "gb2312") charset = "gbk";
  if (charset === "gb_2312") charset = "gbk";
  if (charset === "gb18030") charset = "gb18030";
  if (charset === "utf-8") charset = "utf8";
  return charset;
}
