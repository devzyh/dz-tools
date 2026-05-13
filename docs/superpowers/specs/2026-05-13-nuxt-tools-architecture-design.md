# dz-tools-nuxt 架构设计文档

## 概述

将现有 Vue 3 工具类网站（`dz-tools`）迁移至 Nuxt 3，实现 SEO 友好、中/英双语支持、工具最短路径访问、静态预渲染，并为后续扩展提供工具模板系统。

### 核心需求

- **SEO 友好**：SSG 预渲染、结构化数据、Sitemap、canonical URL、OG 标签
- **多语言**：中/英双语，URL 路径不因语言变化
- **最短访问路径**：工具和分组都使用目录名自动推导的短路径（如 `/json`、`/converter`）
- **静态页面**：About、Links 页面静态预渲染
- **工具模板系统**：快速添加新工具的脚手架机制
- **后端 API**：Nitro Server Routes 处理复杂功能
- **迁移不变性**：路由、外观、功能与现有项目完全一致

### 技术选型

| 类别 | 选型 | 说明 |
|------|------|------|
| 框架 | Nuxt 3 | SSG/SSR/Hybrid 一体化 |
| UI 库 | Element Plus | 与现有项目一致 |
| 样式 | SCSS | 与现有项目一致 |
| i18n | @nuxtjs/i18n | Nuxt 官方 i18n 模块 |
| SEO | useHead + useSeoMeta | Nuxt 内置 |
| Sitemap | @nuxtjs/sitemap | 自动生成 |
| 后端 | Nitro Server Routes | Nuxt 内置 |
| 部署 | Vercel | Hybrid 渲染支持 |

## 架构方案：Nuxt Hybrid

利用 Nuxt `routeRules` 实现混合渲染：页面 SSG 预渲染，API 路由走 Vercel Serverless Functions。

### 渲染策略

- 所有页面：`prerender: true`（构建时生成静态 HTML）
- API 路由（`/api/**`）：Vercel Serverless Functions
- 动态路径的预渲染路由通过 `nitro.prerender.routes` 从注册表注入

## 项目结构

```
dz-tools-nuxt/
├── pages/
│   ├── index.vue                      # 首页（分组导航）
│   ├── about.vue                      # 关于页（静态 SSG）
│   ├── links.vue                      # 链接收藏页（静态 SSG）
│   └── [...slug].vue                  # 捕获所有短路径（工具 + 分组）
├── components/
│   ├── AppHeader.vue                  # 导航 + 搜索
│   ├── AppFooter.vue                  # 页脚
│   ├── ToolCard.vue                   # 工具卡片
│   └── ui/                            # 通用 UI 封装
├── layouts/
│   └── default.vue                    # 默认布局（Header + Main + Footer）
├── tools/                             # 工具系统（目录约定驱动）
│   ├── registry.ts                    # 注册表（扫描分组 meta.ts + 工具 meta.ts）
│   ├── types.ts                       # ToolMeta / GroupMeta 类型定义
│   ├── converter/                     # 分组目录
│   │   ├── meta.ts                    # 分组元数据
│   │   ├── base64/
│   │   │   ├── meta.ts                # 工具元数据
│   │   │   └── Base64Tool.vue
│   │   └── timestamp/
│   │       ├── meta.ts
│   │       └── TimestampTool.vue
│   ├── developer/                     # 分组目录
│   │   ├── meta.ts
│   │   ├── json/
│   │   │   ├── meta.ts
│   │   │   └── JsonEditorTool.vue
│   │   └── regex/
│   │       ├── meta.ts
│   │       └── RegexTool.vue
│   ├── crypto/
│   │   ├── meta.ts
│   │   └── crypto-hash/
│   │       ├── meta.ts
│   │       └── CryptoHashTool.vue
│   ├── text/
│   │   └── meta.ts
│   ├── web/
│   │   └── meta.ts
│   └── template/                      # 新工具模板
│       ├── meta.ts
│       └── ToolTemplate.vue
├── composables/
│   ├── useToolRegistry.ts             # 工具发现和查找
│   └── useSeo.ts                      # SEO meta 封装
├── server/
│   └── api/                           # Nitro API（未来复杂功能）
├── i18n/
│   ├── locales/
│   │   ├── zh-CN/
│   │   │   ├── common.json            # 通用文案
│   │   │   └── tools/
│   │   │       ├── json.json          # 每个工具独立翻译文件
│   │   │       ├── base64.json
│   │   │       └── ...
│   │   └── en/
│   │       ├── common.json
│   │       └── tools/
│   │           ├── json.json
│   │           ├── base64.json
│   │           └── ...
├── data/
│   └── links.json                     # 链接收藏数据
├── styles/
│   └── index.scss                     # 全局样式
├── public/
└── nuxt.config.ts
```

## 路径与元数据维护

### 核心原则：两层目录约定

文件结构同时推导路径和分组关系：

```
tools/
├── converter/              → 分组路径 /converter
│   ├── meta.ts             → 分组元数据
│   ├── base64/             → 工具路径 /base64，属于 converter 分组
│   │   ├── meta.ts
│   │   └── Base64Tool.vue
│   └── timestamp/          → 工具路径 /timestamp，属于 converter 分组
│       ├── meta.ts
│       └── TimestampTool.vue
```

推导规则：
- **分组路径** = 分组目录名（第一层）：`tools/converter/` → `/converter`
- **工具路径** = 工具目录名（第二层）：`tools/converter/base64/` → `/base64`
- **分组关系** = 父目录名：`tools/converter/base64/` 的分组是 `converter`
- **目录结构即约束**：分组、路径不可能配错，与现有项目组织方式一致

### 分组元数据（`tools/{group}/meta.ts`）

```ts
// tools/converter/meta.ts
export default defineGroupMeta({
  title: 'groups.converter.title',        // i18n key
  description: 'groups.converter.description',
  sort: 1,
  icon: 'Switch',                         // Element Plus 图标名
})
```

### 工具元数据（`tools/{group}/{tool}/meta.ts`）

```ts
// tools/converter/base64/meta.ts
export default defineToolMeta({
  title: 'tools.base64.title',
  description: 'tools.base64.description',
  sort: 1,
  icon: 'Lock',
  showHeader: true,
})
```

不包含 `href` 和 `group` 字段，均由目录结构自动推导。

### 为什么独立 meta.ts 而非嵌入组件

1. **扫描快**：`registry.ts` 只扫描 `**/meta.ts`（纯 TS 模块），不导入 `.vue` 文件
2. **懒加载**：工具组件只在用户访问时才加载，构建时无需解析所有 SFC
3. **职责分离**：路由/SEO 元数据与工具 UI 逻辑解耦
4. **SSG 友好**：构建时通过 meta.ts 即可获得所有路由，无需加载组件

### 工具注册表（`tools/registry.ts`）

分层扫描 meta.ts 文件：

```ts
// 扫描分组（第一层目录的 meta.ts）
const groupMetas = import.meta.glob<{ default: GroupMeta }>(
  './*/meta.ts',
  { eager: true }
)

// 扫描工具（第二层目录的 meta.ts）
const toolMetas = import.meta.glob<{ default: ToolMeta }>(
  './*/[^.]*/meta.ts',
  { eager: true }
)
```

提供的查询方法：
- `findTool(slug: string)` — 通过路径查找工具（如 `findTool('json')`）
- `findGroup(slug: string)` — 通过路径查找分组（如 `findGroup('converter')`）
- `resolve(slug: string)` — 统一解析，返回工具或分组
- `getGroupTools(group: string)` — 获取分组内所有工具
- `getAllTools()` — 获取所有工具列表
- `getAllSlugs()` — 获取所有路径（分组 + 工具），用于 SSG 和 Sitemap
- `getGroups()` — 获取所有分组及其工具

## 路由设计

### 路由映射

所有页面使用最短路径，无 `/tools/` 前缀：

| URL | 页面 | 类型 | 来源 |
|-----|------|------|------|
| `/` | 首页 | 固定 | `pages/index.vue` |
| `/about` | 关于页 | 固定 | `pages/about.vue` |
| `/links` | 链接收藏页 | 固定 | `pages/links.vue` |
| `/converter` | 转换器概述 | 分组 | `tools/converter/` |
| `/developer` | 开发者工具概述 | 分组 | `tools/developer/` |
| `/json` | JSON 编辑器 | 工具 | `tools/developer/json/` |
| `/base64` | Base64 编解码 | 工具 | `tools/converter/base64/` |

### 路由解析逻辑

`pages/[...slug].vue` 统一处理所有短路径：

1. 查询 `registry.resolve(slug)`
2. 是工具 → 懒加载并渲染工具组件
3. 是分组 → 渲染分组概述页（展示分组内所有工具卡片）
4. 都不是 → 404

### 路径策略

- **目录名即路径**，所有内容使用最短路径，无前缀
- 不存在 `/tools/` 前缀路由，避免重复内容
- 所有路径都是 canonical URL

## 工具模板系统

### 新工具添加流程

```bash
pnpm create:tool
```

交互式输入工具名称和目标分组后自动生成：

1. `tools/{group}/{name}/meta.ts` — 工具元数据（从模板复制）
2. `tools/{group}/{name}/ToolTemplate.vue` → 重命名为 `{Name}Tool.vue` — 工具组件
3. `i18n/locales/zh-CN/tools/{name}.json` — 中文翻译文件
4. `i18n/locales/en/tools/{name}.json` — 英文翻译文件

路径和分组关系自动由目录结构推导，无需手动注册路由，无需重启开发服务器。

### 新分组添加流程

手动创建分组目录和 meta.ts 即可，后续工具放入该目录自动归属：

```
tools/new-group/
└── meta.ts
```

## 国际化

### 路由策略：`no_prefix`

URL 路径不因语言变化。中文和英文都使用 `/json`、`/converter` 等相同路径。

### 语言检测与切换

- 首次访问：通过浏览器 `Accept-Language` 自动检测
- 语言切换：通过 cookie（`i18n_redirected`）存储用户偏好
- 切换后页面刷新保持选择
- 仅根路径 `/` 首次访问时检测语言，工具/分组页面不重定向

### 翻译文件组织

工具翻译按文件拆分（每个工具一个翻译文件），分组翻译在 common.json 中：

- 新增工具时只添加一个翻译文件
- 不会产生合并冲突
- 工具模板自动创建对应翻译文件

### Nuxt i18n 配置

```ts
i18n: {
  strategy: 'no_prefix',
  detectBrowserLanguage: {
    useCookie: true,
    cookieKey: 'i18n_redirected',
    redirectOn: 'root',
  },
  locales: [
    { code: 'zh-CN', name: '中文', file: 'zh-CN.json' },
    { code: 'en', name: 'English', file: 'en.json' },
  ],
  defaultLocale: 'zh-CN',
}
```

## SEO 方案

### SSG 预渲染

所有页面构建时生成静态 HTML，搜索引擎直接抓取完整内容。

### 结构化数据（JSON-LD）

工具页面注入 `WebApplication` schema，保留现有项目的 JSON-LD 实现。

### Sitemap 自动生成

使用 `@nuxtjs/sitemap` 模块，基于工具注册表动态生成 `sitemap.xml`。通过 Nitro route（`/api/__sitemap__/urls`）在构建时提供所有路径 URL。

### Canonical URL

每个页面设置 canonical 为其短路径：

```ts
useSeoMeta({
  canonical: `https://domain.com/${slug}`,
})
```

### Open Graph + Twitter Card

每个页面自动生成 OG 标签：

```ts
useSeoMeta({
  ogTitle: t(meta.title),
  ogDescription: t(meta.description),
  ogType: 'website',
  ogUrl: `https://domain.com/${slug}`,
  twitterCard: 'summary',
})
```

### hreflang 标签

同路径多语言版本通过 hreflang 标识：

```html
<link rel="alternate" hreflang="zh-CN" href="https://domain.com/json" />
<link rel="alternate" hreflang="en" href="https://domain.com/json" />
```

## Nuxt 配置

```ts
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/i18n',
    '@nuxtjs/sitemap',
  ],

  css: ['element-plus/dist/index.css', '~/styles/index.scss'],

  nitro: {
    preset: 'vercel',
  },

  routeRules: {
    '/':        { prerender: true },
    '/about':   { prerender: true },
    '/links':   { prerender: true },
    '/api/**':  { cors: true },
  },

  ssr: true,
  compatibilityDate: '2024-11-01',
})
```

工具和分组路径的预渲染路由通过 `nitro.prerender.routes` 从注册表动态注入。

## 迁移策略

### 原则

- **功能不变**：迁移后每个工具的外观、功能与现有项目完全一致
- **渐进迁移**：逐个工具迁移，每迁移一个验证一个
- **不修改工具内部逻辑**：只调整 meta 导出格式和 SEO 相关代码

### 步骤

1. **初始化 Nuxt 项目** — 配置核心模块（i18n、sitemap、Element Plus）
2. **迁移布局和通用组件** — DefaultLayout、AppHeader、AppFooter、ToolCard
3. **迁移工具框架** — tools/registry.ts、types.ts、defineToolMeta/defineGroupMeta
4. **逐个迁移工具** — 按现有分组目录结构，复制组件到对应子目录，创建独立 meta.ts
5. **添加 i18n** — 提取硬编码文案到翻译文件
6. **迁移静态页面** — About、Links
7. **配置 SEO** — Sitemap、JSON-LD、canonical、OG
8. **部署验证** — Vercel 部署 + SEO 检查

### 从现有项目迁移的变化

| 现有项目 | Nuxt 版本 | 说明 |
|----------|-----------|------|
| `@unhead/vue` | `useHead()` / `useSeoMeta()` | Nuxt 内置 |
| `vue-router` 手动配置 | Nuxt 文件路由 + `pages/[...slug].vue` | 自动路由 |
| 组件内 `export const meta` | 独立 `meta.ts` | 解耦，扫描更快 |
| `meta.href` 手动维护 | 目录名自动推导路径 | 不会配错 |
| 按分组目录嵌套工具 | 保持分组目录嵌套 + 自动推导 | 与现有项目一致 |
| `import.meta.glob` 工具扫描 | 分层扫描 `meta.ts` | 更精准 |
| Element Plus 手动导入 | 自动导入 + CSS | 配置简化 |
| `pnpm create:tool` | 保留 + 增强 | 目录约定 + 翻译文件生成 |
| SPA 无 SEO | SSG + 完整 SEO | 核心升级 |
| 无 i18n | `@nuxtjs/i18n` no_prefix | 新增 |
| 无后端 | Nitro Server Routes | 新增 |
