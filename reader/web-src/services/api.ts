export async function apiGet<T>(path: string, params: Record<string, unknown>): Promise<T> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params || {})) {
    if (v == null) continue;
    qs.set(k, String(v));
  }
  const res = await fetch(`${path}?${qs.toString()}`, { headers: { Accept: "application/json" } });
  const json = await res.json().catch(() => ({} as Record<string, unknown>));
  if (!res.ok || !(json as { ok?: boolean }).ok) {
    throw new Error((json as { error?: string }).error || `Request failed: ${res.status}`);
  }
  return json as T;
}
