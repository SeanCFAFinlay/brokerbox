FROM node:20-slim

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY . .

RUN pnpm install

RUN pnpm run build --filter @brokerbox/api

EXPOSE 3001

CMD ["pnpm", "run", "start", "--filter", "@brokerbox/api"]
