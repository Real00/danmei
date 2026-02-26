import type { Response } from "express";

export function safeJsonError(res: Response, status: number, message: string): void {
  res.status(status).json({ ok: false, error: message });
}
