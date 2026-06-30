## 注意事项

- Agent 的输入和输出内容优先使用简体中文。
- Git 规范 Commit 信息格式，总体控制在 50 字内。
- 优先使用 anysearch-mcp-server 工具进行网页检索。
- 使用基于 Git Bash 的命令或在 Node.js 上运行临时脚本，本地没有 Python 环境。

## 四大准则

- **先思考再编码** (Think Before Coding)：遇到不明确的需求，先提出假设和权衡，与开发者对齐，而不是盲目猜测。
- **极简优先** (Simplicity First)：只编写解决问题所需的最少代码，不进行过度工程化或为未来假想需求编写防御性代码。
- **精准修改** (Surgical Changes)：只修改与任务直接相关的代码，不“顺手”重构无关模块或修改格式，每一处改动都有据可查。
- **目标驱动** (Goal-Driven Execution)：将模糊任务转为明确的验收标准（如“先写一个能复现Bug的测试，再修改代码，最后让测试通过”）。

## 文档导航

- 技术栈、项目结构、开发命令文档 `@README.md`

## 编码规范

- pnpm 严格隔离依赖，不同包各自引用独立的内部模块。当包 A 和包 B 共享同一内部模块（如 `@codemirror/state`），需将该共享模块添加为项目直接依赖，使其被 hoist 到顶层 `node_modules`，避免运行时多实例冲突。
- 项目前端页面的视觉效果保持统一，禁止新增不一致的视觉风格。页面需要进行移动端适配，禁止出现移动端排版混乱的情况。
- 页面内容必须使用项目内 SEO 方案，填充好相关 SEO 信息。
- 浏览器 Only 的库（如 `jsoneditor`）必须用动态 `import()` 在 `onMounted` + `import.meta.client` 内加载，禁止顶层静态 import
- 浏览器 API（`navigator.clipboard`、`localStorage` 等）需用 `import.meta.client` 守卫
- CommonJS 模块（如 `he`）需使用默认导入：`import he from 'he'`
