import { assertAllowedHost } from "../url/normalize";
import type { FetchHtmlResult } from "../../types/api";

type PlaywrightBrowser = {
  newPage: (opts: Record<string, unknown>) => Promise<{
    goto: (url: string, opts: Record<string, unknown>) => Promise<void>;
    content: () => Promise<string>;
    close: () => Promise<void>;
  }>;
  close: () => Promise<void>;
};

let pwBrowser: PlaywrightBrowser | null = null;
let cleanupRegistered = false;

async function closeBrowser(): Promise<void> {
  try {
    await pwBrowser?.close();
  } catch {
    // ignore
  } finally {
    pwBrowser = null;
  }
}

function registerCleanupOnce(): void {
  if (cleanupRegistered) return;
  cleanupRegistered = true;
  process.once("SIGINT", () => void closeBrowser());
  process.once("SIGTERM", () => void closeBrowser());
  process.once("exit", () => void closeBrowser());
}

export async function fetchHtmlViaPlaywright(
  url: string,
  userAgent: string
): Promise<FetchHtmlResult> {
  const urlObj = new URL(url);
  assertAllowedHost(urlObj);

  let chromium: { launch: (opts: Record<string, unknown>) => Promise<PlaywrightBrowser> };
  try {
    // @ts-ignore optional dependency resolved at runtime
    const playwright = (await import("playwright")) as unknown as {
      chromium: { launch: (opts: Record<string, unknown>) => Promise<PlaywrightBrowser> };
    };
    chromium = playwright.chromium;
  } catch {
    throw new Error(
      "Playwright is not installed. Run `pnpm add playwright` and ensure browsers are installed, then set DANMEI_PLAYWRIGHT=1."
    );
  }

  if (!pwBrowser) {
    pwBrowser = await chromium.launch({ headless: true });
    registerCleanupOnce();
  }

  const page = await pwBrowser.newPage({
    userAgent,
    extraHTTPHeaders: {
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.7",
      Referer: "https://www.dmxs.org/",
      "Upgrade-Insecure-Requests": "1",
    },
  });

  try {
    await page.goto(urlObj.toString(), { waitUntil: "domcontentloaded", timeout: 30000 });
    const html = await page.content();
    return {
      fetcher: "playwright",
      status: 200,
      ok: true,
      html,
      finalUrl: urlObj.toString(),
      charset: "utf8",
    };
  } finally {
    await page.close().catch(() => {});
  }
}
