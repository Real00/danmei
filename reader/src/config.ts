export const PORT = Number(process.env.PORT || 8787);

export const USER_AGENT =
  process.env.DANMEI_UA ||
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

export const DEBUG_ENABLED = process.env.DANMEI_DEBUG === "1";
export const PLAYWRIGHT_ENABLED = process.env.DANMEI_PLAYWRIGHT === "1";
