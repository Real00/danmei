FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8787

# Install runtime dependencies with pnpm lockfile.
COPY reader/package.json reader/pnpm-lock.yaml ./
RUN corepack enable \
  && corepack prepare pnpm@10.17.1 --activate \
  && pnpm install --frozen-lockfile --prod

# Copy application source.
COPY reader/server.js ./server.js
COPY reader/public ./public

EXPOSE 8787

CMD ["node", "server.js"]
