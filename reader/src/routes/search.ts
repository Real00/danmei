import { Router } from "express";
import { safeJsonError } from "../http/errors";
import type { createSearchService } from "../services/searchService";

type SearchService = ReturnType<typeof createSearchService>;

interface CreateSearchRouterOptions {
  searchService: SearchService;
}

export function createSearchRouter(options: CreateSearchRouterOptions): Router {
  const router = Router();

  router.get("/api/search", async (req, res) => {
    const keyword = String(req.query.q || "").trim();
    if (!keyword) return safeJsonError(res, 400, "Missing q");

    try {
      const result = await options.searchService.searchBooks(keyword);
      res.json({ ok: true, ...result });
    } catch (e) {
      safeJsonError(res, 502, (e as Error)?.message || "Failed to search books");
    }
  });

  return router;
}
