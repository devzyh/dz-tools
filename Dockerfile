# syntax=docker/dockerfile:1

# ---- builder ----
FROM node:24-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# 先复制依赖描述,最大化层缓存(源码变动不触发依赖重装)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile

# 复制源码并构建
COPY . .

RUN pnpm build

# ---- runner ----
# 干净镜像,不含源码与 node_modules,仅保留 standalone 产物
FROM node:24-alpine AS runner

WORKDIR /app

COPY --from=builder /app/.output .output

# Nitro 读取 HOST/PORT,确保容器外可访问
ENV HOST=0.0.0.0
ENV PORT=3000
ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
