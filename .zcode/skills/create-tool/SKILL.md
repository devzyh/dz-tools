---
name: create-tool
description: 为 DZ Tools 项目创建新的在线工具——在 app/tools/{分组}/{工具}/ 下生成 meta.ts 与 tool.vue 骨架。当用户要新增、添加、创建一个工具,或搭建工具脚手架(scaffold a tool)时使用。
---

# create-tool

为 DZ Tools 创建一个新的在线工具,生成 `meta.ts` + `tool.vue` 骨架文件。

## 何时使用

用户表达「新增 / 添加 / 创建一个工具」「加个 XX 工具」「脚手架一个新工具」等意图时。
本 skill 取代了已删除的 `scripts/create-tool.ts`,但比脚本更智能:优先根据需求**直接推断全部字段并生成**,只在缺关键字段时才追问。

## 工具目录约定(必须遵守)

- 两层目录:`app/tools/{group}/{tool}/`
  - `app/tools/{group}/{tool}/meta.ts` — 工具元数据
  - `app/tools/{group}/{tool}/tool.vue` — 工具组件
  - `app/tools/{group}/meta.ts` — 分组元数据(仅当分组不存在时才新建)
- 目录名用 **kebab-case**(如 `json-editor`),与中文标题无关。
- 路由自动推导:工具页 `/{tool}`、分组页 `/{group}`,均无 `/tools/` 前缀。
- 注册是**自动**的:`app/tools/registry.ts` 用 glob 扫描各 `meta.ts`,**不要手动改 registry.ts**。
- `meta` 里 `hidden: true` 的条目不会出现在站点上(本 skill 生成的工具默认不隐藏)。

## 字段推断规则(智能生成)

收到需求后,先按以下规则推断字段,能定的直接定:

| 字段 | 推断方式 |
|---|---|
| `name`(目录名) | 由工具功能推 kebab-case 英文名,如「JSON 格式化」→ `json-format`。不要直接用中文。 |
| `group`(分组) | **优先归入现有分组**:`converter` / `crypto` / `developer` / `loghub` / `text` / `web`。仅当确实不属于任何现有分组时,才新建分组。 |
| `title` | 中文,简洁名词(如「JSON 编辑器」)。 |
| `description` | 中文一句话说明功能。 |
| `icon` | 选贴合功能的 `@element-plus/icons-vue` 组件名,如 `Document` / `Edit` / `CopyDocument` / `Calendar` / `Key` / `Lock`。 |
| `showHeader` | 多数工具用 `true`(显示标题与描述);编辑器类全屏工具可用 `false`。 |
| `sort` | **读取同组所有 `{tool}/meta.ts` 的 `sort`,取最大值 + 1**。 |

### 仅在缺关键字段时追问

- `name`、`group`、`title` 三者任一无法合理推断 → 向用户追问。
- `description`、`icon`、`showHeader` 可合理推断,**不必追问**。
- 若需新建分组,确认分组显示标题(可默认等于目录名)。

## 内联模板

### 1. 工具 `meta.ts`

```ts
import { defineToolMeta } from '~/tools/types'

export default defineToolMeta({
  title: '工具标题',
  description: '工具描述',
  sort: 1, // 同组已有 sort 最大值 + 1
  icon: 'Edit',
  showHeader: true,
})
```

### 2. 工具 `tool.vue`

```vue
<script setup lang="ts">
// 工具逻辑
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

### 3. 分组 `meta.ts`(仅新建分组时)

```ts
import { defineGroupMeta } from '~/tools/types'

export default defineGroupMeta({
  title: '分组标题',
  description: null,
  sort: 1, // 现有分组 sort 最大值 + 1
})
```

## 核心约定(易踩坑)

1. **sort 必须读同组取 max+1**,不要随手写 1,否则排序错乱。
2. **SEO 由 `app/pages/[...slug].vue` 自动从 `meta.title` / `meta.description` 生成**(内部调 `usePageSeo`)。`tool.vue` 内**禁止**手动调用 `usePageSeo`,否则重复。填好 meta 的 title/description 即等于填好 SEO。
3. **icon 用 `@element-plus/icons-vue` 的组件名**(字符串),不是路径、不是 SVG。
4. **两层 kebab-case 目录**:`{group}/{tool}/`,组件文件名固定 `tool.vue`。

## 其他

- **已存在检查**:若 `app/tools/{group}/{tool}/` 已存在,停止并告知用户,不要覆盖。
- 浏览器 only 库(如 `jsoneditor`)需在 `tool.vue` 内用动态 `import()` + `import.meta.client` 守卫加载——详见项目 `AGENTS.md`,本 skill 不重复。
- 完成后告知用户:已创建 `tools/{group}/{tool}/`,访问路径 `/{tool}`。
