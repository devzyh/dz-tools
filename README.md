# DZ Tools

基于 Nuxt 4 的在线工具箱，提供 Web 开发、文本处理、加解密、格式转换等常用工具。

## 技术栈

- Nuxt 4 + TypeScript
- Element Plus + SCSS
- @nuxtjs/i18n（中/英双语）
- Nitro Server Routes
- 部署：通用 Node.js（可通过 `NITRO_PRESET` 环境变量切换）

## 工具列表

| 分组 | 工具 |
|------|------|
| Web | IP查询、HTML实体 |
| 开发工具 | JSON编辑器、XML编辑器、Cron表达式、XSLT测试器、正则测试 |
| 加解密 | 文本加解密、哈希文本 |
| 文本 | 文本差异、随机密码、文本提取器、文本连接器、字数统计 |
| 转换器 | Base64、格式转换、时间戳 |
| 通天晓 | Groovy转SQL、OLY加解密 |

## 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# SSG 静态预渲染
pnpm generate

# 预览构建结果
pnpm preview
```

## 部署

默认输出 Node.js 服务端，页面使用 SSG 预渲染，API 路由按部署平台运行。通过 `NITRO_PRESET` 环境变量可切换到其他平台（如 `vercel`、`netlify`、`docker`）。
