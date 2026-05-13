# dz-tools-nuxt Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the existing Vue 3 tool website (dz-tools) to Nuxt 3 with SSG, SEO, i18n, and a tool template system.

**Architecture:** Two-layer directory convention (`tools/{group}/{tool}/`) auto-derives paths and group relationships. A central `tools/registry.ts` scans `meta.ts` files eagerly (no Vue imports). `pages/[...slug].vue` resolves all short-path routes. Vercel Hybrid rendering: SSG pages + serverless API.

**Tech Stack:** Nuxt 3, TypeScript, Element Plus, SCSS, @nuxtjs/i18n, @nuxtjs/sitemap, Nitro Server Routes, Vercel

---

### Task 1: Initialize Nuxt Project

**Files:**
- Create: `nuxt.config.ts`
- Create: `tsconfig.json`
- Create: `package.json`
- Create: `.gitignore`
- Create: `app.vue`

- [ ] **Step 1: Initialize Nuxt project**

Run: `cd D:/SourceCode/dz-tools-nuxt && npx nuxi@latest init . --force --packageManager pnpm`

If prompted, choose defaults. This creates `nuxt.config.ts`, `package.json`, `app.vue`, `tsconfig.json`.

- [ ] **Step 2: Install core dependencies**

Run: `cd D:/SourceCode/dz-tools-nuxt && pnpm add @nuxtjs/i18n @nuxtjs/sitemap element-plus @element-plus/icons-vue sass crypto-js codemirror cron-parser he js-yaml xml-formatter`

Run: `cd D:/SourceCode/dz-tools-nuxt && pnpm add -D @types/he @types/js-yaml`

- [ ] **Step 3: Configure nuxt.config.ts**

Replace `nuxt.config.ts` with:

```ts
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },

  modules: [
    '@nuxtjs/i18n',
    '@nuxtjs/sitemap',
  ],

  css: [
    'element-plus/dist/index.css',
    '~/styles/index.scss',
  ],

  i18n: {
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    },
    locales: [
      { code: 'zh-CN', name: '中文', file: 'zh-CN/common.json' },
      { code: 'en', name: 'English', file: 'en/common.json' },
    ],
    defaultLocale: 'zh-CN',
    langDir: 'i18n/locales/',
  },

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
})
```

- [ ] **Step 4: Create minimal app.vue**

Replace `app.vue` with:

```vue
<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

- [ ] **Step 5: Create global styles**

Create `styles/index.scss`:

```scss
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #333;
  background-color: #f5f5f5;
}

a {
  color: inherit;
  text-decoration: none;
}
```

- [ ] **Step 6: Create i18n locale files**

Create `i18n/locales/zh-CN/common.json`:

```json
{
  "nav": {
    "home": "首页",
    "links": "链接",
    "about": "关于"
  },
  "search": {
    "placeholder": "搜索...",
    "empty": "无匹配结果"
  },
  "footer": {
    "copyright": "保留所有权利"
  },
  "error": {
    "notFound": "页面不存在",
    "goHome": "返回首页",
    "groupNotFound": "分组不存在"
  },
  "home": {
    "title": "开发者在线工具",
    "empty": "暂无工具"
  }
}
```

Create `i18n/locales/en/common.json`:

```json
{
  "nav": {
    "home": "Home",
    "links": "Links",
    "about": "About"
  },
  "search": {
    "placeholder": "Search...",
    "empty": "No results"
  },
  "footer": {
    "copyright": "All rights reserved"
  },
  "error": {
    "notFound": "Page not found",
    "goHome": "Go Home",
    "groupNotFound": "Group not found"
  },
  "home": {
    "title": "Developer Online Tools",
    "empty": "No tools yet"
  }
}
```

- [ ] **Step 7: Verify dev server starts**

Run: `cd D:/SourceCode/dz-tools-nuxt && pnpm dev`
Expected: Nuxt dev server starts without errors on port 3000. Visit http://localhost:3000 and see blank page with no console errors.

- [ ] **Step 8: Commit**

```bash
git init
git add -A
git commit -m "feat: initialize Nuxt 3 project with core modules and i18n"
```

---

### Task 2: Site Config and Default Layout

**Files:**
- Create: `config/site.ts`
- Create: `layouts/default.vue`
- Create: `components/AppHeader.vue`
- Create: `components/AppFooter.vue`
- Create: `data/links.json`

- [ ] **Step 1: Create site config**

Create `config/site.ts`:

```ts
export const site = {
  title: 'DZ Tools',
  description: '面向软件开发者的在线工具网站',
  url: 'https://devzyh.cn',
}
```

- [ ] **Step 2: Copy links.json from existing project**

Copy `D:\SourceCode\dz-tools\src\data\links.json` to `data/links.json` (identical content).

- [ ] **Step 3: Create default layout**

Create `layouts/default.vue`:

```vue
<script setup lang="ts">
import AppHeader from '~/components/AppHeader.vue'
import AppFooter from '~/components/AppFooter.vue'
</script>

<template>
  <div class="app-layout">
    <AppHeader />
    <main class="app-main">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped lang="scss">
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-main {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px 0;
}
</style>
```

- [ ] **Step 4: Create AppFooter component**

Create `components/AppFooter.vue`:

```vue
<script setup lang="ts">
import { site } from '~/config/site'
</script>

<template>
  <footer class="app-footer">
    <div class="footer-divider" />
    <p class="footer-text">© {{ new Date().getFullYear() }} {{ site.title }}. {{ $t('footer.copyright') }}.</p>
  </footer>
</template>

<style scoped lang="scss">
.app-footer {
  text-align: center;
  padding: 16px;
}

.footer-divider {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}

.footer-text {
  color: #909399;
  font-size: 14px;
}
</style>
```

- [ ] **Step 5: Create AppHeader component**

Create `components/AppHeader.vue`. This is migrated from the existing project with Nuxt adaptations (`useRouter()` → `navigateTo()`, `useRoute()` remains, `import.meta.glob` → use `useToolRegistry()` composable, `@unhead/vue` → removed).

```vue
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'

const localePath = useLocalePath()

const route = useRoute()
const activeIndex = computed(() => {
  const path = route.path
  if (path === '/') return '/'
  if (path.startsWith('/links')) return '/links'
  if (path.startsWith('/about')) return '/about'
  return ''
})

const { allTools, allGroups } = useToolRegistry()
const linksData = (await import('~/data/links.json')).default

interface SearchItem {
  title: string
  description: string
  path: string
  type: 'tool' | 'link'
}

const allSearchItems: SearchItem[] = [
  ...allTools.map(tool => ({
    title: tool.title,
    description: tool.description,
    path: `/${tool.slug}`,
    type: 'tool' as const,
  })),
  ...(linksData as { links: { title: string; href: string; description?: string }[] }[]).flatMap(group =>
    group.links.map(link => ({
      title: link.title,
      description: link.description ?? '',
      path: link.href,
      type: 'link' as const,
    })),
  ),
]

function handleSelect(path: string) {
  navigateTo(path)
  menuOpen.value = false
}

const menuOpen = ref(false)
const query = ref('')
const activeItemIndex = ref(-1)
const showDropdown = ref(false)
const searchInputRef = ref()

const filteredItems = computed(() => {
  if (!query.value.trim()) return []
  const q = query.value.toLowerCase()
  return allSearchItems.filter(item =>
    item.title.toLowerCase().includes(q)
    || (item.description || '').toLowerCase().includes(q)
    || item.path.toLowerCase().includes(q),
  )
})

watch(query, () => {
  activeItemIndex.value = -1
  showDropdown.value = true
})

function handleKeydown(e: KeyboardEvent) {
  if (!showDropdown.value && e.key === 'ArrowDown') {
    showDropdown.value = true
    return
  }

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeItemIndex.value = (activeItemIndex.value + 1) % filteredItems.value.length
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeItemIndex.value = activeItemIndex.value <= 0 ? filteredItems.value.length - 1 : activeItemIndex.value - 1
  }

  if (e.key === 'Enter') {
    if (activeItemIndex.value >= 0 && activeItemIndex.value < filteredItems.value.length) {
      navigateTo(filteredItems.value[activeItemIndex.value])
    }
  } else if (e.key === 'Escape') {
    showDropdown.value = false
    searchInputRef.value?.blur()
  }
}

function navigateTo(item: SearchItem) {
  showDropdown.value = false
  query.value = ''
  if (item.type === 'tool') {
    navigateTo(item.path)
  } else {
    window.open(item.path, '_blank')
  }
}

function handleFocus() {
  showDropdown.value = true
}

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}
</script>

<template>
  <header class="app-header">
    <div class="header-brand" @click="handleSelect('/')">
      <strong>DZ Tools</strong>
    </div>
    <nav class="header-nav" :class="{ open: menuOpen }">
      <a class="nav-link" :class="{ active: activeIndex === '/' }" @click="handleSelect('/')">{{ $t('nav.home') }}</a>
      <a class="nav-link" :class="{ active: activeIndex === '/links' }" @click="handleSelect('/links')">{{ $t('nav.links') }}</a>
      <a class="nav-link" :class="{ active: activeIndex === '/about' }" @click="handleSelect('/about')">{{ $t('nav.about') }}</a>
    </nav>
    <div class="header-right">
      <div class="header-search desktop-search" @mouseleave="showDropdown = false">
        <el-input
          ref="searchInputRef"
          v-model="query"
          :placeholder="$t('search.placeholder')"
          :prefix-icon="Search"
          clearable
          class="search-input"
          @focus="handleFocus"
          @keydown="handleKeydown"
        />
        <div v-if="showDropdown && filteredItems.length > 0" class="search-dropdown">
          <div
            v-for="(item, index) in filteredItems"
            :key="item.path"
            class="search-item"
            :class="{ active: index === activeItemIndex }"
            @mousedown.prevent="navigateTo(item)"
            @mouseenter="activeItemIndex = index"
          >
            {{ item.title }}
          </div>
        </div>
        <div v-if="showDropdown && query.trim() && filteredItems.length === 0" class="search-dropdown">
          <div class="search-empty">{{ $t('search.empty') }}</div>
        </div>
      </div>
      <button class="menu-toggle" @click="toggleMenu">
        <span class="menu-bar" :class="{ open: menuOpen }" />
      </button>
    </div>
    <div class="mobile-menu" :class="{ open: menuOpen }">
      <a class="nav-link" :class="{ active: activeIndex === '/' }" @click="handleSelect('/')">{{ $t('nav.home') }}</a>
      <a class="nav-link" :class="{ active: activeIndex === '/links' }" @click="handleSelect('/links')">{{ $t('nav.links') }}</a>
      <a class="nav-link" :class="{ active: activeIndex === '/about' }" @click="handleSelect('/about')">{{ $t('nav.about') }}</a>
      <div class="mobile-search" @mouseleave="showDropdown = false">
        <el-input
          v-model="query"
          :placeholder="$t('search.placeholder')"
          :prefix-icon="Search"
          clearable
          @focus="handleFocus"
          @keydown="handleKeydown"
        />
        <div v-if="showDropdown && filteredItems.length > 0" class="search-dropdown">
          <div
            v-for="(item, index) in filteredItems"
            :key="item.path"
            class="search-item"
            :class="{ active: index === activeItemIndex }"
            @mousedown.prevent="navigateTo(item)"
            @mouseenter="activeItemIndex = index"
          >
            {{ item.title }}
          </div>
        </div>
        <div v-if="showDropdown && query.trim() && filteredItems.length === 0" class="search-dropdown">
          <div class="search-empty">{{ $t('search.empty') }}</div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped lang="scss">
.app-header {
  display: flex;
  align-items: center;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
  padding: 0 20px;
  height: 60px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-brand {
  font-size: 18px;
  cursor: pointer;
  color: var(--el-text-color-primary);
  margin-right: 24px;
}

.header-nav {
  display: flex;
  gap: 4px;
}

.header-right {
  display: flex;
  align-items: center;
  margin-left: auto;
  gap: 12px;
}

.header-search {
  position: relative;
  display: flex;
  align-items: center;

  :deep(.el-input__wrapper) {
    border-radius: 18px;
  }
}

.desktop-search .search-input {
  width: 200px;
}

.search-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 100%;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  z-index: 9999;
  margin-top: 4px;
}

.search-item {
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: var(--el-fill-color-light);
  }

  &.active {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
  }
}

.search-empty {
  padding: 16px;
  text-align: center;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.nav-link {
  padding: 8px 16px;
  font-size: 14px;
  color: var(--el-text-color-regular);
  cursor: pointer;
  border-radius: 4px;
  transition: background 0.15s, color 0.15s;

  &:hover {
    color: var(--el-text-color-primary);
    background: var(--el-fill-color-light);
  }

  &.active {
    color: var(--el-color-primary);
    font-weight: 600;
  }
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  width: 28px;
  height: 20px;
  position: relative;

  .menu-bar {
    &,
    &::before,
    &::after {
      display: block;
      width: 100%;
      height: 2px;
      background: var(--el-text-color-primary);
      border-radius: 1px;
      transition: transform 0.3s, opacity 0.3s;
      position: absolute;
      left: 0;
    }

    & { top: 9px; }
    &::before { content: ''; top: -7px; }
    &::after { content: ''; top: 7px; }

    &.open {
      background: transparent;
      &::before { transform: rotate(45deg); top: 0; }
      &::after { transform: rotate(-45deg); top: 0; }
    }
  }
}

.mobile-menu {
  display: none;
}

.mobile-search {
  margin-top: 8px;
  position: relative;
}

@media (max-width: 768px) {
  .header-nav,
  .desktop-search {
    display: none;
  }

  .menu-toggle {
    display: block;
  }

  .mobile-menu {
    display: none;
    position: absolute;
    top: 60px;
    left: 0;
    right: 0;
    background: var(--el-bg-color);
    border-bottom: 1px solid var(--el-border-color-light);
    flex-direction: column;
    padding: 8px 20px;

    &.open {
      display: flex;
    }
  }

  .mobile-menu .nav-link {
    padding: 12px 0;
    border-bottom: 1px solid var(--el-border-color-extra-light);
  }
}
</style>
```

Note: This component references `useToolRegistry()` which will be created in Task 3. The search will work once that composable exists.

- [ ] **Step 6: Verify layout renders**

Run: `cd D:/SourceCode/dz-tools-nuxt && pnpm dev`
Expected: Header with "DZ Tools" brand, nav links (首页, 链接, 关于), search box, footer visible. AppHeader may show errors about `useToolRegistry` — that's expected, will be resolved in Task 3.

- [ ] **Step 7: Commit**

```bash
git add config/site.ts layouts/default.vue components/AppHeader.vue components/AppFooter.vue data/links.json
git commit -m "feat: add site config, default layout, header and footer"
```

---

### Task 3: Tool Type System and Registry

**Files:**
- Create: `tools/types.ts`
- Create: `tools/registry.ts`
- Create: `composables/useToolRegistry.ts`

- [ ] **Step 1: Create tool type definitions**

Create `tools/types.ts`:

```ts
export interface ToolMeta {
  title: string
  description: string
  sort: number
  icon?: string
  showHeader?: boolean
  hidden?: boolean
}

export interface GroupMeta {
  title: string
  description?: string | null
  sort: number
  hidden?: boolean
}

export interface ResolvedTool {
  slug: string
  group: string
  meta: ToolMeta
}

export interface ResolvedGroup {
  slug: string
  meta: GroupMeta
  tools: ResolvedTool[]
}

export type ResolvedEntry = ResolvedTool | ResolvedGroup

export function isTool(entry: ResolvedEntry): entry is ResolvedTool {
  return 'group' in entry
}

export function isGroup(entry: ResolvedEntry): entry is ResolvedGroup {
  return 'tools' in entry
}
```

- [ ] **Step 2: Create tool registry**

Create `tools/registry.ts`:

```ts
import type { ToolMeta, GroupMeta, ResolvedTool, ResolvedGroup, ResolvedEntry } from './types'

// Scan group meta files (first level: tools/{group}/meta.ts)
const groupMetaModules = import.meta.glob<{ default: GroupMeta }>(
  './*/meta.ts',
  { eager: true }
)

// Scan tool meta files (second level: tools/{group}/{tool}/meta.ts)
const toolMetaModules = import.meta.glob<{ default: ToolMeta }>(
  './*/[^.]*/meta.ts',
  { eager: true }
)

function resolveGroups(): ResolvedGroup[] {
  const groups: Map<string, ResolvedGroup> = new Map()

  for (const [filePath, mod] of Object.entries(groupMetaModules)) {
    const match = filePath.match(/\.\/([^/]+)\/meta\.ts$/)
    if (!match) continue
    const slug = match[1]
    groups.set(slug, {
      slug,
      meta: mod.default,
      tools: [],
    })
  }

  for (const [filePath, mod] of Object.entries(toolMetaModules)) {
    const match = filePath.match(/\.\/([^/]+)\/([^/]+)\/meta\.ts$/)
    if (!match) continue
    const group = match[1]
    const slug = match[2]

    const tool: ResolvedTool = {
      slug,
      group,
      meta: mod.default,
    }

    if (mod.default.hidden) continue

    const groupEntry = groups.get(group)
    if (groupEntry && !groupEntry.meta.hidden) {
      groupEntry.tools.push(tool)
    }
  }

  // Sort tools within each group, then sort groups
  for (const group of groups.values()) {
    group.tools.sort((a, b) => a.meta.sort - b.meta.sort)
  }

  return Array.from(groups.values()).sort((a, b) => a.meta.sort - b.meta.sort)
}

const groups = resolveGroups()
const allTools: ResolvedTool[] = groups.flatMap(g => g.tools)

function findTool(slug: string): ResolvedTool | undefined {
  return allTools.find(t => t.slug === slug)
}

function findGroup(slug: string): ResolvedGroup | undefined {
  return groups.find(g => g.slug === slug)
}

function resolve(slug: string): ResolvedEntry | undefined {
  return findTool(slug) || findGroup(slug)
}

function getGroupTools(group: string): ResolvedTool[] {
  return findGroup(group)?.tools || []
}

function getAllSlugs(): string[] {
  const slugs: string[] = []
  for (const group of groups) {
    if (!group.meta.hidden) slugs.push(group.slug)
    slugs.push(...group.tools.map(t => t.slug))
  }
  return slugs
}

export const registry = {
  groups,
  allTools,
  findTool,
  findGroup,
  resolve,
  getGroupTools,
  getAllSlugs,
} as const
```

- [ ] **Step 3: Create useToolRegistry composable**

Create `composables/useToolRegistry.ts`:

```ts
import { registry } from '~/tools/registry'

export function useToolRegistry() {
  const visibleTools = registry.allTools

  const visibleGroups = registry.groups.filter(g => !g.meta.hidden)

  return {
    allTools: visibleTools,
    allGroups: visibleGroups,
    findTool: registry.findTool,
    findGroup: registry.findGroup,
    resolve: registry.resolve,
    getGroupTools: registry.getGroupTools,
    getAllSlugs: registry.getAllSlugs,
  }
}
```

- [ ] **Step 4: Verify no import errors**

Run: `cd D:/SourceCode/dz-tools-nuxt && pnpm dev`
Expected: Dev server starts, no import errors. AppHeader search will now work (but return empty results since no tools are registered yet).

- [ ] **Step 5: Commit**

```bash
git add tools/types.ts tools/registry.ts composables/useToolRegistry.ts
git commit -m "feat: add tool type system and registry with directory-based scanning"
```

---

### Task 4: Tool Template System and Create Script

**Files:**
- Create: `tools/template/meta.ts`
- Create: `tools/template/ToolTemplate.vue`
- Create: `scripts/create-tool.ts`
- Modify: `package.json` (add create:tool script)

- [ ] **Step 1: Create tool meta template**

Create `tools/template/meta.ts`:

```ts
import { defineToolMeta } from '~/tools/types'

export default defineToolMeta({
  title: 'tools.tool-name.title',
  description: 'tools.tool-name.description',
  sort: 1,
  icon: 'Edit',
  showHeader: true,
})
```

- [ ] **Step 2: Create tool component template**

Create `tools/template/ToolTemplate.vue`:

```vue
<script setup lang="ts">
// Tool logic here
</script>

<template>
  <div class="tool-form">
    <!-- Input area -->
    <div class="tool-actions">
      <el-button type="primary">执行</el-button>
    </div>
    <!-- Output area -->
  </div>
</template>

<style scoped lang="scss">
.tool-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tool-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
```

- [ ] **Step 3: Add defineToolMeta/defineGroupMeta helper to types.ts**

Edit `tools/types.ts` — append at end:

```ts
export function defineToolMeta(meta: ToolMeta): ToolMeta {
  return meta
}

export function defineGroupMeta(meta: GroupMeta): GroupMeta {
  return meta
}
```

- [ ] **Step 4: Create the create:tool script**

Create `scripts/create-tool.ts`. Adapted from existing `D:\SourceCode\dz-tools\scripts\create-tool.ts` with directory convention changes:

```ts
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createInterface } from 'node:readline'

const __dirname = dirname(fileURLToPath(import.meta.url))
const toolsDir = resolve(__dirname, '../tools')
const i18nDir = resolve(__dirname, '../i18n/locales')

const rl = createInterface({ input: process.stdin, output: process.stdout })

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => rl.question(prompt, resolve))
}

function close() { rl.close() }

function metaTemplate(name: string, sort: number) {
  const title = name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  return `import { defineToolMeta } from '~/tools/types'

export default defineToolMeta({
  title: 'tools.${name}.title',
  description: 'tools.${name}.description',
  sort: ${sort},
  icon: 'Edit',
  showHeader: true,
})
`
}

function componentTemplate() {
  return `<script setup lang="ts">
// Tool logic
</script>

<template>
  <div class="tool-form">
    <div class="tool-actions">
      <el-button type="primary">执行</el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.tool-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tool-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
`
}

function i18nTemplate(name: string, title: string) {
  return JSON.stringify({
    title,
    description: '',
  }, null, 2) + '\n'
}

function nextSort(groupDir: string): number {
  const entries = readdirSync(groupDir, { withFileTypes: true })
  let max = 0
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const metaPath = resolve(groupDir, entry.name, 'meta.ts')
    if (!existsSync(metaPath)) continue
    const content = readFileSync(metaPath, 'utf-8')
    const match = content.match(/sort:\s*(\d+)/)
    if (match) max = Math.max(max, parseInt(match[1]))
  }
  return max + 1
}

async function main() {
  const name = (await question('工具目录名 (kebab-case, e.g. json-editor): ')).trim()
  if (!name) { console.error('工具名不能为空'); close(); process.exit(1) }

  const group = (await question('分组目录名 (e.g. developer): ')).trim()
  if (!group) { console.error('必须指定分组'); close(); process.exit(1) }

  const groupDir = resolve(toolsDir, group)

  if (!existsSync(groupDir)) {
    const create = (await question(`分组 "${group}" 不存在，是否创建？(Y/n): `)).trim().toLowerCase() !== 'n'
    if (create) {
      const groupTitle = (await question(`分组显示标题 (回车默认 "${group}"): `)).trim() || group
      mkdirSync(groupDir, { recursive: true })
      writeFileSync(resolve(groupDir, 'meta.ts'),
        `import { defineGroupMeta } from '~/tools/types'\n\nexport default defineGroupMeta({\n  title: 'groups.${group}.title',\n  description: null,\n  sort: 1,\n})\n`
      )
      console.log(`已创建分组 ${group}/`)
    } else {
      console.error('操作取消'); close(); process.exit(1)
    }
  }

  const sort = nextSort(groupDir)
  const toolDir = resolve(groupDir, name)

  if (existsSync(toolDir)) {
    console.error(`工具已存在: ${toolDir}`); close(); process.exit(1)
  }

  mkdirSync(toolDir, { recursive: true })
  writeFileSync(resolve(toolDir, 'meta.ts'), metaTemplate(name, sort))
  writeFileSync(resolve(toolDir, `${name.charAt(0).toUpperCase() + name.slice(1)}Tool.vue`), componentTemplate())

  const title = name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  for (const lang of ['zh-CN', 'en']) {
    const dir = resolve(i18nDir, lang, 'tools')
    mkdirSync(dir, { recursive: true })
    writeFileSync(resolve(dir, `${name}.json`), i18nTemplate(name, lang === 'zh-CN' ? title : title))
  }

  console.log(`已创建工具: tools/${group}/${name}/`)
  close()
}

main().catch(e => { console.error(e); close(); process.exit(1) })
```

- [ ] **Step 5: Add create:tool script to package.json**

Add to `scripts` in `package.json`:

```json
"create:tool": "cross-env MSYS_NO_PATHCONV=1 tsx scripts/create-tool.ts"
```

Run: `cd D:/SourceCode/dz-tools-nuxt && pnpm add -D cross-env tsx`

- [ ] **Step 6: Commit**

```bash
git add tools/template/ tools/types.ts scripts/create-tool.ts package.json pnpm-lock.yaml
git commit -m "feat: add tool template system and create:tool script"
```

---

### Task 5: Pages — Home, About, Links, NotFound

**Files:**
- Create: `pages/index.vue`
- Create: `pages/about.vue`
- Create: `pages/links.vue`
- Create: `pages/[...slug].vue`
- Create: `components/ToolCard.vue`
- Create: `composables/useSeo.ts`
- Create: `error.vue`

- [ ] **Step 1: Create ToolCard component**

Create `components/ToolCard.vue`:

```vue
<script setup lang="ts">
import * as Icons from '@element-plus/icons-vue'

const props = defineProps<{
  title: string
  description: string
  href: string
  icon?: string
}>()
</script>

<template>
  <NuxtLink :to="href" class="tool-card">
    <div class="tool-icon-wrapper">
      <el-icon :size="18" class="tool-icon">
        <component :is="icon ? (Icons as any)[icon] : Icons.Edit" />
      </el-icon>
    </div>
    <div class="tool-info">
      <div class="tool-title">{{ title }}</div>
      <div class="tool-desc">{{ description }}</div>
    </div>
  </NuxtLink>
</template>

<style scoped lang="scss">
.tool-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  background: #fff;
  cursor: pointer;
  transition: box-shadow 0.2s, border-color 0.2s;
  text-decoration: none;

  &:hover {
    border-color: #409eff;
    box-shadow: 0 2px 12px rgba(64, 158, 255, 0.12);
  }
}

.tool-icon-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
}

.tool-icon {
  color: #409eff;
}

.tool-info {
  min-width: 0;
}

.tool-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tool-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
```

- [ ] **Step 2: Create useSeo composable**

Create `composables/useSeo.ts`:

```ts
import { site } from '~/config/site'

export function usePageSeo(options: {
  title: string
  description: string
  path: string
  type?: 'website' | 'WebApplication'
}) {
  const url = `${site.url}${options.path}`

  useSeoMeta({
    title: options.title,
    ogTitle: options.title,
    ogDescription: options.description,
    ogType: 'website',
    ogUrl: url,
    twitterCard: 'summary',
    description: options.description,
    canonical: url,
  })

  const schemaType = options.type || 'website'
  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': schemaType === 'WebApplication' ? 'WebApplication' : 'WebSite',
          name: schemaType === 'WebApplication' ? options.title.replace(` - ${site.title}`, '') : site.title,
          description: options.description,
          url,
          ...(schemaType === 'WebApplication' ? { applicationCategory: 'DeveloperApplication' } : {}),
        }),
      },
    ],
  })
}
```

- [ ] **Step 3: Create home page**

Create `pages/index.vue`:

```vue
<script setup lang="ts">
import { site } from '~/config/site'

const { allGroups } = useToolRegistry()

usePageSeo({
  title: `${site.title} - ${useNuxtApp().$i18n.t('home.title')}`,
  description: site.description,
  path: '/',
})
</script>

<template>
  <div class="home-page">
    <div v-for="group in allGroups" :key="group.slug" class="tool-group">
      <div class="group-header">
        <NuxtLink :to="`/${group.slug}`" class="group-title">{{ group.meta.title }}</NuxtLink>
        <span v-if="group.meta.description" class="group-desc">{{ group.meta.description }}</span>
        <span class="group-count">{{ group.tools.length }}</span>
      </div>
      <div class="tool-grid">
        <ToolCard
          v-for="tool in group.tools"
          :key="tool.slug"
          :title="tool.meta.title"
          :description="tool.meta.description"
          :href="`/${tool.slug}`"
          :icon="tool.meta.icon"
        />
      </div>
    </div>

    <el-empty v-if="allGroups.length === 0" :description="$t('home.empty')" />
  </div>
</template>

<style scoped lang="scss">
.home-page {
  padding-bottom: 24px;
}

.tool-group + .tool-group {
  margin-top: 36px;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.group-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  padding-left: 10px;
  border-left: 3px solid #409eff;
  line-height: 1;
  text-decoration: none;

  &:hover {
    color: #409eff;
  }
}

.group-desc {
  font-size: 13px;
  color: #909399;
}

.group-count {
  font-size: 12px;
  color: #909399;
  background: #f5f7fa;
  padding: 1px 8px;
  border-radius: 10px;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}
</style>
```

- [ ] **Step 4: Create about page**

Create `pages/about.vue`:

```vue
<script setup lang="ts">
import { site } from '~/config/site'

usePageSeo({
  title: `关于 - ${site.title}`,
  description: `关于 ${site.title}，${site.description}`,
  path: '/about',
})
</script>

<template>
  <div class="about-page">
    <div class="about-hero">
      <div class="about-icon">
        <img src="/favicon.svg" :alt="site.title" />
      </div>
      <h1 class="about-title">{{ site.title }}</h1>
    </div>

    <div class="about-sections">
      <div class="about-card">
        <h2 class="section-title">关于项目</h2>
        <p class="section-text">
          {{ site.title }} {{ site.description }}，提供编码转换、文本处理、格式化等常用功能。
          纯前端实现，数据不离开浏览器，安全高效。
        </p>
      </div>

      <div class="about-card">
        <h2 class="section-title">关于我</h2>
        <p class="section-text">
          Yuhang || devzyh<br>
          ZGV2enloQG91dGxvb2suY29t<br>
          用代码解决实际问题，而非创造问题；用数据验证直觉，而非替代直觉。
        </p>
      </div>

      <div class="about-card">
        <h2 class="section-title">技术栈</h2>
        <div class="tech-tags">
          <span class="tech-tag">Java</span>
          <span class="tech-tag">MySQL</span>
          <span class="tech-tag">Vue</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.about-page {
  padding-bottom: 24px;
}

.about-hero {
  text-align: center;
  padding: 48px 24px 40px;
}

.about-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;

  img {
    width: 100%;
    height: 100%;
  }
}

.about-title {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin: 0;
}

.about-sections {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.about-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px 24px;
  border: 1px solid #e4e7ed;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 10px;
  padding-left: 10px;
  border-left: 3px solid #409eff;
  line-height: 1;
}

.section-text {
  font-size: 14px;
  line-height: 1.7;
  color: #606266;
  margin: 0;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tech-tag {
  font-size: 13px;
  color: #409eff;
  background: #ecf5ff;
  padding: 4px 12px;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .about-hero {
    padding: 32px 16px 28px;
  }

  .about-title {
    font-size: 24px;
  }

  .about-card {
    padding: 16px;
  }
}
</style>
```

- [ ] **Step 5: Create links page**

Create `pages/links.vue`:

```vue
<script setup lang="ts">
import { site } from '~/config/site'

const linksData = (await import('~/data/links.json')).default

usePageSeo({
  title: `友情链接 - ${site.title}`,
  description: `${site.title} 收录的友情链接`,
  path: '/links',
})

interface LinkItem {
  title: string
  href: string
  description: string
  icon?: string
}

interface LinkGroup {
  title: string
  links: LinkItem[]
}

const linkGroups = linksData as LinkGroup[]

function handleImgError(e: Event) {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
}
</script>

<template>
  <div class="links-page">
    <div v-for="group in linkGroups" :key="group.title" class="link-group">
      <div class="group-header">
        <h2 class="group-title">{{ group.title }}</h2>
        <span class="group-count">{{ group.links.length }}</span>
      </div>
      <div class="link-grid">
        <a
          v-for="link in group.links"
          :key="link.href"
          :href="link.href"
          target="_blank"
          rel="noopener noreferrer"
          class="link-card"
        >
          <div class="link-icon-wrapper">
            <img
              v-if="link.icon"
              :src="link.icon"
              :alt="link.title"
              class="link-icon"
              @error="handleImgError"
            />
            <svg class="link-icon-default" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <div class="link-info">
            <div class="link-title">{{ link.title }}</div>
            <div class="link-desc">{{ link.description }}</div>
          </div>
        </a>
      </div>
    </div>

    <el-empty v-if="linkGroups.length === 0" description="暂无链接" />
  </div>
</template>

<style scoped lang="scss">
.link-group + .link-group {
  margin-top: 36px;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.group-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  padding-left: 10px;
  border-left: 3px solid #409eff;
  line-height: 1;
}

.group-count {
  font-size: 12px;
  color: #909399;
  background: #f5f7fa;
  padding: 1px 8px;
  border-radius: 10px;
}

.link-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.link-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  background: #fff;
  text-decoration: none;
  transition: box-shadow 0.2s, border-color 0.2s;

  &:hover {
    border-color: #409eff;
    box-shadow: 0 2px 12px rgba(64, 158, 255, 0.12);
  }
}

.link-icon-wrapper {
  position: relative;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  flex-shrink: 0;
  overflow: hidden;
  background: #f0f2f5;
}

.link-icon {
  position: relative;
  width: 100%;
  height: 100%;
  object-fit: contain;
  z-index: 1;
}

.link-icon-default {
  position: absolute;
  inset: 0;
  width: 20px;
  height: 20px;
  margin: auto;
  color: #c0c4cc;
}

.link-info {
  min-width: 0;
}

.link-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.link-desc {
  font-size: 12px;
  color: #909399;
  margin-top: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
```

- [ ] **Step 6: Create dynamic slug page (tools + groups)**

Create `pages/[...slug].vue`. This is the core routing page that resolves both tool and group short paths:

```vue
<script setup lang="ts">
import { site } from '~/config/site'
import { isTool, isGroup } from '~/tools/types'

const route = useRoute()
const slug = route.params.slug as string
const { resolve: resolveEntry, findGroup } = useToolRegistry()

const entry = resolveEntry(slug)

// Lazy load tool component if resolved
let ToolComponent: any = null
if (entry && isTool(entry)) {
  const group = entry.group
  const toolName = entry.slug.charAt(0).toUpperCase() + entry.slug.slice(1)
  const modules = import.meta.glob('~/tools/*/*.vue', { eager: false })
  const componentPath = `/tools/${group}/${toolName}Tool.vue`
  if (modules[componentPath]) {
    ToolComponent = defineAsyncComponent(modules[componentPath])
  }
}

// SEO
if (entry) {
  const title = isTool(entry) ? entry.meta.title : (entry as any).meta.title
  const description = isTool(entry) ? entry.meta.description : (entry as any).meta.description
  usePageSeo({
    title: `${title} - ${site.title}`,
    description,
    path: `/${slug}`,
    type: isTool(entry) ? 'WebApplication' : 'website',
  })
}
</script>

<template>
  <div class="slug-page">
    <!-- Tool page -->
    <template v-if="entry && isTool(entry)">
      <nav class="tool-breadcrumb">
        <NuxtLink to="/">{{ $t('nav.home') }}</NuxtLink>
        <span class="separator">/</span>
        <NuxtLink :to="`/${entry.group}`">{{ findGroup(entry.group)?.meta.title }}</NuxtLink>
        <span class="separator">/</span>
        <span class="current">{{ entry.meta.title }}</span>
      </nav>
      <template v-if="entry.meta.showHeader !== false">
        <h1 class="tool-title">{{ entry.meta.title }}</h1>
        <p class="tool-desc">{{ entry.meta.description }}</p>
      </template>
      <div class="tool-content">
        <component :is="ToolComponent" v-if="ToolComponent" />
      </div>
    </template>

    <!-- Group overview page -->
    <template v-else-if="entry && isGroup(entry)">
      <div class="group-header">
        <h2 class="group-title">{{ entry.meta.title }}</h2>
        <span v-if="entry.meta.description" class="group-desc">{{ entry.meta.description }}</span>
        <span class="group-count">{{ entry.tools.length }}</span>
      </div>
      <div class="tool-grid">
        <ToolCard
          v-for="tool in entry.tools"
          :key="tool.slug"
          :title="tool.meta.title"
          :description="tool.meta.description"
          :href="`/${tool.slug}`"
          :icon="tool.meta.icon"
        />
      </div>
    </template>

    <!-- 404 -->
    <template v-else>
      <ClientOnly>
        <el-result icon="warning" :title="$t('error.notFound')">
          <template #extra>
            <el-button type="primary" @click="navigateTo('/')">{{ $t('error.goHome') }}</el-button>
          </template>
        </el-result>
      </ClientOnly>
    </template>
  </div>
</template>

<style scoped lang="scss">
.slug-page {
  padding-bottom: 0;
}

.tool-breadcrumb {
  font-size: 13px;
  color: #909399;
  margin-bottom: 16px;

  a {
    color: #909399;
    text-decoration: none;

    &:hover {
      color: #409eff;
    }
  }

  .separator {
    margin: 0 6px;
  }

  .current {
    color: #606266;
  }
}

.tool-title {
  font-size: 22px;
  color: #303133;
  margin-bottom: 8px;
}

.tool-desc {
  color: #909399;
  font-size: 14px;
  margin-bottom: 24px;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.group-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  padding-left: 10px;
  border-left: 3px solid #409eff;
  line-height: 1;
}

.group-desc {
  font-size: 13px;
  color: #909399;
}

.group-count {
  font-size: 12px;
  color: #909399;
  background: #f5f7fa;
  padding: 1px 8px;
  border-radius: 10px;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}
</style>
```

- [ ] **Step 7: Create error.vue (404 page)**

Create `error.vue` at project root:

```vue
<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

useSeoMeta({
  title: `页面未找到 - DZ Tools`,
})
</script>

<template>
  <div class="error-page">
    <el-result icon="warning" :title="error.statusCode?.toString()" :sub-title="error.message || '页面不存在'">
      <template #extra>
        <el-button type="primary" @click="clearError({ redirect: '/' })">返回首页</el-button>
      </template>
    </el-result>
  </div>
</template>
```

- [ ] **Step 8: Verify all pages render**

Run: `cd D:/SourceCode/dz-tools-nuxt && pnpm dev`
Expected:
- `/` — Home page with group sections (empty, no tools yet)
- `/about` — About page with project info
- `/links` — Links page with link cards
- `/nonexistent` — 404 result

- [ ] **Step 9: Commit**

```bash
git add pages/ components/ToolCard.vue composables/useSeo.ts error.vue
git commit -m "feat: add all pages - home, about, links, dynamic slug, 404"
```

---

### Task 6: Migrate Tool Group Directories and Meta Files

**Files:**
- Create: `tools/converter/meta.ts`
- Create: `tools/crypto/meta.ts`
- Create: `tools/developer/meta.ts`
- Create: `tools/loghub/meta.ts`
- Create: `tools/text/meta.ts`
- Create: `tools/web/meta.ts`
- Create: `i18n/locales/zh-CN/tools/*.json` (one per tool)
- Create: `i18n/locales/en/tools/*.json` (one per tool)

- [ ] **Step 1: Create all 6 group meta.ts files**

Create `tools/converter/meta.ts`:
```ts
import { defineGroupMeta } from '~/tools/types'

export default defineGroupMeta({
  title: 'groups.converter.title',
  description: null,
  sort: 5,
})
```

Create `tools/crypto/meta.ts`:
```ts
import { defineGroupMeta } from '~/tools/types'

export default defineGroupMeta({
  title: 'groups.crypto.title',
  description: null,
  sort: 3,
})
```

Create `tools/developer/meta.ts`:
```ts
import { defineGroupMeta } from '~/tools/types'

export default defineGroupMeta({
  title: 'groups.developer.title',
  description: null,
  sort: 2,
})
```

Create `tools/loghub/meta.ts`:
```ts
import { defineGroupMeta } from '~/tools/types'

export default defineGroupMeta({
  title: 'groups.loghub.title',
  description: null,
  sort: 6,
  hidden: true,
})
```

Create `tools/text/meta.ts`:
```ts
import { defineGroupMeta } from '~/tools/types'

export default defineGroupMeta({
  title: 'groups.text.title',
  description: null,
  sort: 4,
})
```

Create `tools/web/meta.ts`:
```ts
import { defineGroupMeta } from '~/tools/types'

export default defineGroupMeta({
  title: 'groups.web.title',
  description: null,
  sort: 1,
})
```

- [ ] **Step 2: Add group translations to common.json**

Append to `i18n/locales/zh-CN/common.json`:

```json
"groups": {
  "converter": { "title": "转换器" },
  "crypto": { "title": "加解密" },
  "developer": { "title": "开发工具" },
  "loghub": { "title": "通天晓" },
  "text": { "title": "文本" },
  "web": { "title": "Web" }
}
```

Append to `i18n/locales/en/common.json`:

```json
"groups": {
  "converter": { "title": "Converter" },
  "crypto": { "title": "Crypto" },
  "developer": { "title": "Developer" },
  "loghub": { "title": "TongTianXiao" },
  "text": { "title": "Text" },
  "web": { "title": "Web" }
}
```

- [ ] **Step 3: Verify groups render on home page**

Run: `cd D:/SourceCode/dz-tools-nuxt && pnpm dev`
Expected: Home page shows group sections with titles (except loghub which is hidden). Each group section is empty with "暂无工具".

- [ ] **Step 4: Commit**

```bash
git add tools/converter/meta.ts tools/crypto/meta.ts tools/developer/meta.ts tools/loghub/meta.ts tools/text/meta.ts tools/web/meta.ts i18n/
git commit -m "feat: add all tool group directories and meta files"
```

---

### Task 7: Migrate All Tools

**Files:**
- Create: `tools/converter/base64/meta.ts` + `Base64Tool.vue`
- Create: `tools/converter/timestamp/meta.ts` + `TimestampTool.vue`
- Create: `tools/converter/convert/meta.ts` + `ConvertTool.vue`
- Create: `tools/crypto/crypto/meta.ts` + `CryptoTool.vue`
- Create: `tools/crypto/hash/meta.ts` + `HashTool.vue`
- Create: `tools/developer/json/meta.ts` + `JsonEditorTool.vue`
- Create: `tools/developer/regex/meta.ts` + `RegexTool.vue`
- Create: `tools/developer/xml/meta.ts` + `XmlEditorTool.vue`
- Create: `tools/developer/cron/meta.ts` + `CronTool.vue`
- Create: `tools/developer/xslt/meta.ts` + `XsltTool.vue`
- Create: `tools/text/diff/meta.ts` + `DiffTool.vue`
- Create: `tools/text/password/meta.ts` + `PasswordTool.vue`
- Create: `tools/text/count-text/meta.ts` + `CountTextTool.vue`
- Create: `tools/text/extract-text/meta.ts` + `ExtractTextTool.vue`
- Create: `tools/text/join-text/meta.ts` + `JoinTextTool.vue`
- Create: `tools/web/html/meta.ts` + `HtmlEntityTool.vue`
- Create: `tools/web/myip/meta.ts` + `IpQueryTool.vue`
- Create: `tools/loghub/oly-crypt/meta.ts` + `OlyCryptTool.vue`
- Create: `tools/loghub/groovy-sql-json/meta.ts` + `GroovySqlTool.vue`

> **Migration pattern for each tool:**
> 1. Create `tools/{group}/{tool-dir}/meta.ts` — extract `meta` object from Vue component, remove `href` field, use `defineToolMeta()`
> 2. Create `tools/{group}/{tool-dir}/{Name}Tool.vue` — copy the `<script setup>` + `<template>` + `<style>` blocks from the existing tool, remove the `<script lang="ts">` meta block
> 3. Create `i18n/locales/zh-CN/tools/{tool-dir}.json` and `i18n/locales/en/tools/{tool-dir}.json` — extract title/description

- [ ] **Step 1: Migrate converter tools (3 tools)**

For each tool, follow the migration pattern above. Here are the mappings:

**Base64Tool** (`src/tools/converter/Base64Tool.vue` → `tools/converter/base64/`):
- `meta.ts`: title='Base64文本', description='对文本使用Base64进行编码和解码', sort=1, icon='Lock'
- Directory: `base64`
- Copy `<script setup>` through end of file from existing Base64Tool.vue

**TimestampTool** (`src/tools/converter/TimestampTool.vue` → `tools/converter/timestamp/`):
- `meta.ts`: title='时间戳', description='Unix时间戳与日期时间互转', sort=3, icon='Clock', showHeader=false
- Directory: `timestamp`

**ConvertTool** (`src/tools/converter/ConvertTool.vue` → `tools/converter/convert/`):
- `meta.ts`: title='格式转换', description='JSON、XML、YAML 格式互转', sort=2, icon='Sort'
- Directory: `convert`

For each, the `meta.ts` pattern:
```ts
import { defineToolMeta } from '~/tools/types'

export default defineToolMeta({
  title: '工具中文名',          // will be i18n key later, use raw string for now
  description: '工具描述',
  sort: N,
  icon: 'IconName',
  showHeader: true,            // omit if not in original meta
})
```

For each, the Vue component: copy the full content of the original `.vue` file, remove the `<script lang="ts">` block that contains `export const meta`, keep the `<script setup>`, `<template>`, and `<style>` blocks.

- [ ] **Step 2: Migrate crypto tools (2 tools)**

**CryptoTool** → `tools/crypto/crypto/`: title='文本加解密', sort=1, icon='Lock'
**HashTool** → `tools/crypto/hash/`: title='哈希文本', sort=2, icon='Lock'

- [ ] **Step 3: Migrate developer tools (5 tools)**

**JsonEditorTool** → `tools/developer/json/`: title='JSON编辑器', sort=1, icon='Document', showHeader=false
**RegexTool** → `tools/developer/regex/`: title='正则测试', sort=5, icon='Search', showHeader=false
**XmlEditorTool** → `tools/developer/xml/`: title='XML编辑器', sort=2, icon='Document', showHeader=false
**CronTool** → `tools/developer/cron/`: title='Cron表达式', sort=4, icon='Timer'
**XsltTool** → `tools/developer/xslt/`: title='XSLT测试器', sort=3, icon='SetUp', showHeader=false

- [ ] **Step 4: Migrate text tools (5 tools)**

**DiffTool** → `tools/text/diff/`: title='文本差异', sort=1, icon='Document', showHeader=false
**PasswordTool** → `tools/text/password/`: title='随机密码', sort=2, icon='Lock'
**CountTextTool** → `tools/text/count-text/`: title='字数统计', sort=5, icon='DataAnalysis'
**ExtractTextTool** → `tools/text/extract-text/`: title='文本提取器', sort=3, icon='Tickets'
**JoinTextTool** → `tools/text/join-text/`: title='文本连接器', sort=4, icon='Connection'

- [ ] **Step 5: Migrate web tools (2 tools)**

**IpQueryTool** → `tools/web/myip/`: title='IP查询', sort=0, icon='Position'
**HtmlEntityTool** → `tools/web/html/`: title='HTML实体', sort=1, icon='Document'

- [ ] **Step 6: Migrate loghub tools (2 tools, hidden group)**

**GroovySqlTool** → `tools/loghub/groovy-sql-json/`: title='Groovy转SQL', sort=2
**OlyCryptTool** → `tools/loghub/oly-crypt/`: title='OLY加解密', sort=3, icon='Lock'

- [ ] **Step 7: Create i18n translation files for all tools**

For each of the 19 tools, create `i18n/locales/zh-CN/tools/{dir}.json` and `i18n/locales/en/tools/{dir}.json`.

zh-CN example (`i18n/locales/zh-CN/tools/base64.json`):
```json
{
  "title": "Base64文本",
  "description": "对文本使用Base64进行编码和解码"
}
```

en example (`i18n/locales/en/tools/base64.json`):
```json
{
  "title": "Base64",
  "description": "Encode and decode text using Base64"
}
```

Create these for all 19 tools. Note: loghub tools are hidden so translation is lower priority but still create them.

- [ ] **Step 8: Update meta.ts files to use i18n keys**

After translation files are created, update all tool `meta.ts` files to use i18n keys:

```ts
// Before
title: 'Base64文本',
description: '对文本使用Base64进行编码和解码',

// After
title: 'tools.base64.title',
description: 'tools.base64.description',
```

Same for group meta files — update to use `groups.converter.title` etc. (already done in Task 6).

- [ ] **Step 9: Update [...slug].vue to resolve i18n titles**

The `pages/[...slug].vue` displays `entry.meta.title` which is now an i18n key. The title displayed should be translated. Update the template to use `{{ $t(entry.meta.title) }}` wherever tool/group titles are rendered. Apply this to:
- `pages/[...slug].vue` (breadcrumb, title, description)
- `pages/index.vue` (group titles, tool card titles/descriptions)
- `components/ToolCard.vue` (title, description)
- `components/AppHeader.vue` (search results — search items need translated titles)

- [ ] **Step 10: Verify all tools render**

Run: `cd D:/SourceCode/dz-tools-nuxt && pnpm dev`
Expected:
- `/` — Home page shows all visible groups with their tool cards (except loghub)
- `/base64` — Base64 tool loads and functions
- `/json` — JSON editor loads
- `/converter` — Converter group overview shows 3 tools
- `/loghub/groovy-sql-json` — Accessible but not linked from home (hidden group)

Test each tool's core functionality by interacting with it in the browser.

- [ ] **Step 11: Commit**

```bash
git add tools/ i18n/ pages/ components/
git commit -m "feat: migrate all 19 tools with directory-based meta and i18n"
```

---

### Task 8: SEO — Sitemap, SSG Prerender, hreflang

**Files:**
- Modify: `nuxt.config.ts` (add prerender routes)
- Create: `server/api/__sitemap__/urls.ts`

- [ ] **Step 1: Create sitemap URLs endpoint**

Create `server/api/__sitemap__/urls.ts`:

```ts
import { registry } from '~/tools/registry'

export default defineEventHandler(() => {
  const staticUrls = ['/', '/about', '/links']
  const dynamicUrls = registry.getAllSlugs().map(slug => `/${slug}`)

  return [...staticUrls, ...dynamicUrls].map(url => ({
    loc: url,
    lastmod: new Date().toISOString(),
  }))
})
```

- [ ] **Step 2: Configure sitemap in nuxt.config.ts**

Add to `nuxt.config.ts` inside the module options:

```ts
sitemap: {
  sources: ['/api/__sitemap__/urls'],
},
```

- [ ] **Step 3: Configure SSG prerender routes**

Add to `nuxt.config.ts` inside the `nitro` section:

```ts
nitro: {
  preset: 'vercel',
  prerender: {
    crawlLinks: true,
    routes: ['/', '/about', '/links'],
  },
},
```

The `crawlLinks: true` will auto-discover tool and group links from the home page during `nuxt generate`.

- [ ] **Step 4: Test SSG build**

Run: `cd D:/SourceCode/dz-tools-nuxt && pnpm generate`
Expected: Build completes, `.output/public/` contains static HTML for all pages including `/base64`, `/json`, `/converter`, etc. Check `sitemap.xml` is generated.

- [ ] **Step 5: Verify static output**

Run: `ls .output/public/base64/index.html .output/public/json/index.html .output/public/converter/index.html`
Expected: All files exist.

- [ ] **Step 6: Commit**

```bash
git add nuxt.config.ts server/api/ pnpm-lock.yaml
git commit -m "feat: configure SSG prerender and sitemap auto-generation"
```

---

### Task 9: Copy Static Assets and Final Polish

**Files:**
- Copy: `public/favicon.svg` from existing project
- Copy: `public/logo.svg` from existing project
- Verify: All pages look identical to existing project

- [ ] **Step 1: Copy static assets**

Copy `D:\SourceCode\dz-tools\public\favicon.svg` to `public/favicon.svg`
Copy `D:\SourceCode\dz-tools\public\logo.svg` to `public/logo.svg`
Copy any other static assets from `D:\SourceCode\dz-tools\public/` that are referenced.

- [ ] **Step 2: Visual comparison**

Run dev server. Open existing project (port 9527) and new project (port 3000) side by side. Compare:
- Home page layout, group ordering, tool card styling
- Tool page breadcrumb, title, functionality
- About page content
- Links page layout
- Header navigation, search functionality
- Footer
- Mobile responsiveness

- [ ] **Step 3: Fix any visual/functional differences**

Adjust CSS, component structure, or logic to match the existing project exactly.

- [ ] **Step 4: Commit**

```bash
git add public/
git commit -m "feat: copy static assets and fix visual differences"
```

---

### Task 10: Final Build and Deploy Verification

- [ ] **Step 1: Full production build**

Run: `cd D:/SourceCode/dz-tools-nuxt && pnpm generate`
Expected: Build succeeds with no errors.

- [ ] **Step 2: Preview production build**

Run: `cd D:/SourceCode/dz-tools-nuxt && pnpm preview`
Expected: Preview server starts. Visit all key pages and verify they render correctly.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore: final build verification"
```
