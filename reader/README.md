# Danmei Reader (dmxs.org)

This is a standalone “better reading UI” for `dmxs.org` book/chapter pages.

## Run

```powershell
cd D:\code\danmei\reader
pnpm install
pnpm dev
```

Open `http://localhost:8787`.

Build for production:

```powershell
pnpm build
pnpm start
```

## Usage

- If there is no `#u` hash URL and no local `danmei_lastUrl`, the app stays idle and prompts for a URL (no sample auto-open).
- Pass a URL via hash like `#u=https%3A%2F%2Fwww.dmxs.org%2Fbook%2F21781.html` to auto-open on load, or let it restore `danmei_lastUrl`.
- Paste a book URL like `https://www.dmxs.org/book/21781.html` in the top input.
- Chapters drawer is collapsed by default (`目录` button).
- After opening a book, it loads Chapter 1 by default.
- Swipe left/right (mobile) or use left/right arrow keys (PC) to flip pages.
- On the last page of a chapter, flipping forward switches to the next chapter automatically.

## Notes (Fetching)

`dmxs.org` often blocks Node/curl fetches with HTTP 403.

- Windows: the server falls back to PowerShell `Invoke-WebRequest` automatically.
- Linux/macOS: set `DANMEI_PLAYWRIGHT=1` and install Playwright:
  - `pnpm add playwright`
  - Ensure browsers are installed per Playwright’s docs for your platform.

## GitHub Actions: Auto Publish to Docker Hub

This repository includes `.github/workflows/docker-publish.yml`.

Trigger:
- Push to `main`
- Push tag matching `v*`
- Manual run via `workflow_dispatch`

Required GitHub repository secrets:
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN` (Docker Hub access token)

Published image:
- `${DOCKERHUB_USERNAME}/danmei`
- Tags include `latest` (default branch), timestamp (`YYYYMMDDHHmmss`, Asia/Shanghai), and Git tags.
