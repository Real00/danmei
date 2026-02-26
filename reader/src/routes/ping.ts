import { Router } from "express";

export function createPingRouter(): Router {
  const router = Router();

  router.get("/api/ping", (_req, res) => {
    res.json({ ok: true, time: new Date().toISOString() });
  });

  return router;
}
