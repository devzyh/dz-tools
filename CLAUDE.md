# dz-tools-nuxt

基于 Nuxt 3 的工具类网站，从现有 Vue 3 项目（`D:\SourceCode\dz-tools`）迁移。

## 技术栈

- Nuxt 3 + TypeScript
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

- `pages/` — 页面路由（index, about, links, [...slug].vue）
- `tools/` — 工具系统（分组目录嵌套工具目录，两层目录约定推导路径和分组关系）
- `server/api/` — Nitro API 路由
- `i18n/locales/` — 翻译文件（工具按文件拆分）
- `components/` — 通用组件（AppHeader, AppFooter, ToolCard）
- `composables/` — 组合式函数（useToolRegistry, useSeo）

## 现有项目（dz-tools）关键信息

- 入口：`src/main.ts`，路由：`src/router/index.ts`
- 布局：`src/layouts/DefaultLayout.vue`，通用组件：AppHeader, AppFooter, ToolCard
- 页面：HomeView（分组导航）、GroupView（分组概述）、ToolView（工具渲染）、AboutView、LinksView、NotFoundView
- 全局样式：`src/styles/index.scss`
- 站点配置：`src/config/site.ts`（title: DZ Tools, url: https://devzyh.cn）
- 链接数据：`src/data/links.json`
- 依赖：element-plus, @element-plus/icons-vue, @unhead/vue, crypto-js, codemirror, jsoneditor, ace-builds, cron-parser, he, js-yaml, xml-formatter

### 现有工具分组

| 分组 | 工具 |
|------|------|
| converter（转换器） | Base64Tool, ConvertTool, TimestampTool |
| crypto（加密） | CryptoTool, HashTool |
| developer（开发者） | CronTool, JsonEditorTool, RegexTool, XmlEditorTool, XsltTool |
| loghub（日志） | GroovySqlTool, OlyCryptTool |
| text（文本） | CountTextTool, DiffTool, ExtractTextTool, JoinTextTool, PasswordTool |
| web（Web） | HtmlEntityTool, IpQueryTool |

### 现有工具 meta 格式（嵌入组件内）

```ts
export const meta = {
  title: 'Base64文本',
  description: '对文本使用Base64进行编码和解码',
  href: '/base64',
  sort: 1,
  icon: 'Lock',
}
```

迁移时需拆分为独立 `meta.ts`，移除 `href`（由目录名推导），`title`/`description` 改为 i18n key。

## 迁移原则

- 迁移后路由、外观、功能与现有项目完全一致
- 不修改工具组件内部逻辑，只调整 meta 导出格式和 SEO 代码
- 渐进迁移：逐个工具迁移，每迁移一个验证一个

## 开发

```bash
pnpm dev
pnpm create:tool  # 添加新工具
pnpm build        # 构建（SSG）
```

## 设计文档

- `docs/superpowers/specs/2026-05-13-nuxt-tools-architecture-design.md`
