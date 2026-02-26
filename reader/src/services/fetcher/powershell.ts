import { execFile } from "child_process";
import iconv from "iconv-lite";
import { detectCharset } from "../text/charset";
import { assertAllowedHost } from "../url/normalize";
import type { FetchHtmlResult } from "../../types/api";

export function fetchHtmlViaPowerShell(url: string, userAgent: string): Promise<FetchHtmlResult> {
  const urlObj = new URL(url);
  assertAllowedHost(urlObj);

  if (process.platform !== "win32") {
    return Promise.reject(new Error("PowerShell fetcher is only available on Windows."));
  }

  // PowerShell's Invoke-WebRequest often passes through WAF rules that block Node/curl.
  // Emit base64 of raw response bytes to avoid stdout encoding corruption.
  const ps = [
    "$ProgressPreference='SilentlyContinue';",
    `$u='${urlObj.toString().replace(/'/g, "''")}';`,
    "$h=@{",
    `  'User-Agent'='${userAgent.replace(/'/g, "''")}';`,
    "  'Accept'='text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';",
    "  'Accept-Language'='zh-CN,zh;q=0.9,en;q=0.7';",
    "  'Referer'='https://www.dmxs.org/';",
    "  'Upgrade-Insecure-Requests'='1';",
    "};",
    "$r=Invoke-WebRequest -UseBasicParsing -Uri $u -Headers $h -MaximumRedirection 5;",
    "$ms = New-Object System.IO.MemoryStream;",
    "$r.RawContentStream.CopyTo($ms) | Out-Null;",
    "[Convert]::ToBase64String($ms.ToArray())",
  ].join("\n");

  return new Promise((resolve, reject) => {
    execFile(
      "powershell.exe",
      ["-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", ps],
      { windowsHide: true, maxBuffer: 20 * 1024 * 1024, timeout: 30000 },
      (err, stdout, stderr) => {
        if (err) {
          reject(new Error(`PowerShell fetch failed: ${stderr || err.message}`.trim()));
          return;
        }
        const b64 = String(stdout || "").trim();
        if (!b64) {
          reject(new Error("PowerShell fetch failed: empty response"));
          return;
        }

        let buf: Buffer;
        try {
          buf = Buffer.from(b64, "base64");
        } catch {
          reject(new Error("PowerShell fetch failed: invalid base64"));
          return;
        }

        const headSampleLatin1 = buf.toString("latin1", 0, 2048);
        const charset = detectCharset(null, headSampleLatin1);
        const html = iconv.decode(buf, charset);
        resolve({
          fetcher: "powershell",
          status: 200,
          ok: true,
          html,
          finalUrl: urlObj.toString(),
          charset,
        });
      }
    );
  });
}
