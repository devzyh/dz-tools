# DZ Tools

基于 Nuxt 4 的在线工具箱，支持多语言，支持部署在Docker 或 Vercel等服务商。

## 沟通方式

- **语言**：默认中文，代码、命令、变量名用英文。
- **结构**：结论先行，再给理由，不要先铺垫背景。
- **模糊需求**：遇到模糊需求，先给最合理的方案，再问要不要调整。

## 编码规范

- **简单优先**：用最简单的代码解决问题，如果你写了200行代码解决了问题但是你发现50行就可以，重写。
- **Git 提交**：需带类型前缀，全中文描述，字数限 50 字内。
- **移动端适配**：所有实现的页面效果都要在移动端进行适配，避免出现移动端排版混乱的情况。

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
- CommonJS 模块（如 `he`）需使用默认导入 + 解构：`import he from 'he'`
