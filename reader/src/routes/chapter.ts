import { Router } from "express";
import { safeJsonError } from "../http/errors";
import { normalizeInputUrl } from "../services/url/normalize";
import type { createContentService } from "../services/contentService";

type ContentService = ReturnType<typeof createContentService>;

interface CreateChapterRouterOptions {
  contentService: ContentService;
}

export function createChapterRouter(options: CreateChapterRouterOptions): Router {
  const router = Router();

  router.get("/api/chapter", async (req, res) => {
    const input = req.query.url;
    const normalized = normalizeInputUrl(String(input || ""));
    if (!normalized) return safeJsonError(res, 400, "Missing url");

    try {
      const result = await options.contentService.getChapter(normalized);
      res.json({ ok: true, ...result.payload, cached: result.cached });
    } catch (e) {
      safeJsonError(res, 502, (e as Error)?.message || "Failed to fetch chapter");
    }
  });

  return router;
}
