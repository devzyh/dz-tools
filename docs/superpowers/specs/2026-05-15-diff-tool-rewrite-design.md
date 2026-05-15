# Diff 工具重写设计

## 目标

使用 CodeMirror MergeView 重写文本差异对比工具，从硬编码示例改为用户可交互的实时 diff 工具。

## 功能范围

- 双面板可编辑编辑器（原始文本 / 修改后文本）
- 实时差异对比（防抖 300ms）
- 折叠相同行
- 合并箭头（A→B）
- 工具栏：交换文本、清空文本、折叠/展开相同行
- localStorage 缓存用户输入
- 复用 EditorLoader 加载态组件

## 技术方案

### 核心组件

继续使用 `@codemirror/merge` 的 `MergeView` API，双面板均为可编辑 CodeMirror 编辑器。

### 实时刷新机制

监听编辑器内容变化，通过 300ms 防抖后销毁并重建 MergeView。读取当前两个面板的文本内容作为新 MergeView 的 doc。

### 工具栏

顶部三个按钮：
- **交换**：交换左右面板内容
- **清空**：清空两个面板内容
- **折叠切换**：切换 collapseUnchanged 的启用状态

### 数据持久化

使用 localStorage 缓存两个面板内容，key 为 `dz-tools-diff-original` 和 `dz-tools-diff-modified`。页面加载时优先读取缓存，无缓存时使用示例文本。

### SSR 注意事项

- 所有 CodeMirror 模块通过 `onMounted` + `import.meta.client` 动态导入
- 不使用顶层静态 import

### 样式

沿用现有样式方案：
- `cm-merge-added` / `cm-merge-removed` 颜色使用 Element Plus CSS 变量
- 字体、边框、圆角保持一致
- 新增工具栏样式，移动端适配

## 修改文件

- `app/tools/text/diff/tool.vue` — 重写
