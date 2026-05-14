# dz-tools-nuxt

基于 Nuxt 4 的工具类网站，从现有 Vue 3 项目（`D:\SourceCode\dz-tools`）迁移。

## 技术栈

- Nuxt 4 + TypeScript
- Element Plus + SCSS
- @nuxtjs/i18n（中/英双语，no_prefix 策略）
- @nuxtjs/sitemap
- Nitro Server Routes（后端 API）
- 部署：Vercel（Hybrid 渲染）

## 架构要点

- **Hybrid 渲染**：页面 SSG 预渲染 + API Vercel Serverless
- **两层目录约定**：分组和工具都由目录名推导路径（`tools/converter/` → `/converter`，`tools/converter/base64/` → `/base64`）
- **独立 meta.ts**：每个工具/分组目录下独立 meta.ts，不嵌入组件，扫描快、懒加载
- **统一短路径**：所有页面（首页、About、Links、分组概述、工具）都使用最短路径，无 `/tools/` 前缀
- **工具注册表**：`tools/registry.ts` 分层扫描 meta.ts，自动构建路由映射
- **快速添加**：`pnpm create:tool` 脚手架自动生成工具组件 + i18n 翻译文件

## 项目结构

Nuxt 4 使用 `app/` 作为源码目录，`~` 别名解析到 `app/`。

- `app/pages/` — 页面路由（index, about, links, [...slug]）
- `app/tools/` — 工具系统（分组目录嵌套工具目录，两层目录约定推导路径和分组关系）
- `app/server/api/` — Nitro API 路由
- `app/components/` — 通用组件（AppHeader, AppFooter, ToolCard）
- `app/composables/` — 组合式函数（useToolRegistry, useSeo）
- `app/layouts/` — 布局（default.vue）
- `app/config/site.ts` — 站点配置（title: DZ Tools, url: https://devzyh.cn）
- `app/data/links.json` — 链接收藏数据
- `i18n/locales/` — 翻译文件（项目根目录，工具按文件拆分）
- `scripts/` — 脚手架脚本（create-tool.ts）

## 工具分组（19 个工具，6 个分组）

| 分组 | 目录 | 工具 |
|------|------|------|
| Web | web/ | myip, html |
| 开发工具 | developer/ | json, xml, cron, xslt, regex |
| 加解密 | crypto/ | crypto, hash |
| 文本 | text/ | diff, password, extract-text, join-text, count-text |
| 转换器 | converter/ | base64, convert, timestamp |
| 通天晓 | loghub/ | groovy-sql-json, oly-crypt（hidden） |

## 开发

```bash
pnpm dev            # 启动开发服务器
pnpm create:tool    # 添加新工具
pnpm generate       # SSG 构建预渲染
pnpm preview        # 预览构建结果
```

## 注意事项

- CommonJS 模块（如 `he`）需使用默认导入 + 解构，避免 SSR 环境的 ESM 兼容问题
- 工具组件中的浏览器 API（如 `navigator.clipboard`）需用 `import.meta.client` 守卫
- loghub 分组设置了 `hidden: true`，不出现在首页但 URL 仍可访问

## 设计文档

- `docs/superpowers/specs/2026-05-13-nuxt-tools-architecture-design.md`
- `docs/superpowers/plans/2026-05-13-nuxt-tools-migration-plan.md`
