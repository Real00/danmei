import { Router } from "express";
import { safeJsonError } from "../http/errors";
import { normalizeInputUrl } from "../services/url/normalize";
import type { createContentService } from "../services/contentService";

type ContentService = ReturnType<typeof createContentService>;

interface CreateBookRouterOptions {
  contentService: ContentService;
}

export function createBookRouter(options: CreateBookRouterOptions): Router {
  const router = Router();

  router.get("/api/book", async (req, res) => {
    const input = req.query.url;
    const normalized = normalizeInputUrl(String(input || ""));
    if (!normalized) return safeJsonError(res, 400, "Missing url");

    try {
      const result = await options.contentService.getBook(normalized);
      res.json({ ok: true, ...result.payload, cached: result.cached });
    } catch (e) {
      safeJsonError(res, 502, (e as Error)?.message || "Failed to fetch book");
    }
  });

  return router;
}
