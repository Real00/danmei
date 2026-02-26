FROM node:20-alpine AS builder

WORKDIR /app

COPY reader/package.json reader/pnpm-lock.yaml ./
RUN corepack enable \
  && corepack prepare pnpm@10.17.1 --activate \
  && pnpm install --frozen-lockfile

COPY reader/src ./src
COPY reader/web-src ./web-src
COPY reader/public ./public
COPY reader/tsconfig.base.json ./tsconfig.base.json
COPY reader/tsconfig.server.json ./tsconfig.server.json
COPY reader/tsconfig.web.json ./tsconfig.web.json
RUN pnpm build

FROM node:20-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8787

COPY reader/package.json reader/pnpm-lock.yaml ./
RUN corepack enable \
  && corepack prepare pnpm@10.17.1 --activate \
  && pnpm install --frozen-lockfile --prod

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Drop root privileges in runtime container.
RUN chown -R node:node /app
USER node

EXPOSE 8787

CMD ["node", "dist/server.js"]
