import { Router } from "express";
import { safeJsonError } from "../http/errors";
import { normalizeInputUrl } from "../services/url/normalize";
import type { FetcherFn, FetchHtmlFn } from "../services/fetcher";

interface CreateDebugRouterOptions {
  enabled: boolean;
  fetchHtml: FetchHtmlFn;
  fetchHtmlViaFetch: FetcherFn;
  fetchHtmlViaPowerShell: FetcherFn;
}

export function createDebugRouter(options: CreateDebugRouterOptions): Router {
  const router = Router();

  router.get("/api/_debug/fetch", async (req, res) => {
    if (!options.enabled) {
      return safeJsonError(res, 404, "Not found");
    }
    const input = req.query.url;
    const normalized = normalizeInputUrl(String(input || ""));
    if (!normalized) return safeJsonError(res, 400, "Missing url");
    const mode = String(req.query.mode || "auto");
    try {
      const r =
        mode === "fetch"
          ? await options.fetchHtmlViaFetch(normalized)
          : mode === "powershell"
            ? await options.fetchHtmlViaPowerShell(normalized)
            : await options.fetchHtml(normalized);
      res.json({
        ok: true,
        fetcher: r.fetcher,
        status: r.status,
        charset: r.charset,
        finalUrl: r.finalUrl,
        len: (r.html || "").length,
        head: (r.html || "").slice(0, 120),
      });
    } catch (e) {
      safeJsonError(res, 502, (e as Error)?.message || "debug fetch failed");
    }
  });

  return router;
}
