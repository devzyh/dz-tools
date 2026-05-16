# DZ Tools

基于 Nuxt 4 的在线工具箱，支持多语言，支持部署在Docker 或 Vercel等服务商。

## 沟通方式

- **语言**：默认中文，代码、命令、变量名用英文。
- **结构**：结论先行，再给理由，不要先铺垫背景。
- **模糊需求**：遇到模糊需求，先给最合理的方案，再问要不要调整。
- **测试驱动**：任务完成时通过自我测试后再交付用户。

## 编码规范

- **编码风格**：用最简单的代码解决问题，如果你写了 200 行代码解决了问题但是你发现 50 行就可以，重写。新增代码要和项目已有代码的风格一致。代码需要符合对应技术栈的最佳实践。
- **禁止重复**：功能实现优先使用项目内已存在的公共功能，不要重复造轮子。局部多次使用的功能询问用户是否需要提升为公共功能。
- **Git 管理**：每天第一次修改代码前先拉去远程分支（如果存在远程分支）。提交信息需带类型前缀，全中文描述，字数限 50 字内，修改文件后禁止直接提交 Git，待开发者确认后再进行提交。禁止直接推送远程。
- **页面效果**：项目前端页面的视觉效果保持统一，禁止新增不一致的视觉风格。页面需要进行移动端适配，禁止出现移动端排版混乱的情况。
- **SEO 优化**：页面内容必须使用项目内 SEO 方案，填充好相关 SEO 信息。
- **文档更新**：涉及基础架构相关的变更需要更新 README.md 文件。

## 技术栈

- Nuxt 4 + TypeScript + SCSS
- Element Plus
- @nuxtjs/i18n（no_prefix 策略）
- @nuxtjs/sitemap
- Nitro Server Routes

## 核心命令

```bash
pnpm dev            # 启动开发服务器
pnpm create:tool    # 添加新工具（脚手架）
pnpm generate       # SSG 静态预渲染
pnpm preview        # 预览构建结果
```

## 项目架构

- **Hybrid 渲染**：页面 SSG 预渲染 + API Serverless
- **源码目录**：`app/`，`~` 别名解析到 `app/`
- **两层目录约定**：`tools/converter/base64/` → 路径 `/base64`，分组 `converter/`，自动推导
- **工具注册表**：`app/tools/registry.ts` 扫描各目录 `meta.ts`，自动构建路由映射
- **统一短路径**：所有页面使用最短路径，无 `/tools/` 前缀
- **翻译文件**：`i18n/locales/`（项目根目录），工具按文件拆分

## SSR 注意事项

- 浏览器 Only 的库（如 `jsoneditor`）必须用动态 `import()` 在 `onMounted` + `import.meta.client` 内加载，禁止顶层静态 import
- 浏览器 API（`navigator.clipboard`、`localStorage` 等）需用 `import.meta.client` 守卫
- CommonJS 模块（如 `he`）需使用默认导入：`import he from 'he'`

## 依赖管理

- **pnpm 隔离**：pnpm 严格隔离依赖，不同包各自引用独立的内部模块。当包 A 和包 B 共享同一内部模块（如 `@codemirror/state`），需将该共享模块添加为项目直接依赖，使其被 hoist 到顶层 `node_modules`，避免运行时多实例冲突。