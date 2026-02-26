import { fetchHtmlViaFetch } from "./fetch";
import { fetchHtmlViaPowerShell } from "./powershell";
import { fetchHtmlViaPlaywright } from "./playwright";
import type { FetchHtmlResult } from "../../types/api";

export type FetchHtmlFn = (url: string) => Promise<FetchHtmlResult>;
export type FetcherFn = (url: string) => Promise<FetchHtmlResult>;

export interface FetcherBundle {
  fetchHtml: FetchHtmlFn;
  fetchHtmlViaFetch: FetcherFn;
  fetchHtmlViaPowerShell: FetcherFn;
  fetchHtmlViaPlaywright: FetcherFn;
}

export interface CreateFetchersOptions {
  userAgent: string;
  allowPlaywright: boolean;
}

export function createFetchers(options: CreateFetchersOptions): FetcherBundle {
  const viaFetch: FetcherFn = (url) => fetchHtmlViaFetch(url, options.userAgent);
  const viaPowerShell: FetcherFn = (url) => fetchHtmlViaPowerShell(url, options.userAgent);
  const viaPlaywright: FetcherFn = (url) => fetchHtmlViaPlaywright(url, options.userAgent);

  const fetchHtml: FetchHtmlFn = async (url: string) => {
    try {
      const r = await viaFetch(url);
      if (r.ok && (r.html || "").length > 200) return r;
      throw new Error(`Upstream error: HTTP ${r.status}`);
    } catch (e) {
      if (process.platform === "win32") {
        return viaPowerShell(url);
      }
      if (options.allowPlaywright) {
        return viaPlaywright(url);
      }
      throw new Error(
        `${(e as Error)?.message || "Fetch failed"} (Note: dmxs.org may block Node/curl; use a headless browser fetcher on Linux.)`
      );
    }
  };

  return {
    fetchHtml,
    fetchHtmlViaFetch: viaFetch,
    fetchHtmlViaPowerShell: viaPowerShell,
    fetchHtmlViaPlaywright: viaPlaywright,
  };
}
