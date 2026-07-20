# DZ Tools

- 基于 Nuxt 4 的在线工具箱，支持多语言。
- 提供 Web 开发、文本处理、加解密、格式转换等常用工具。
- 支持部署在 Docker 或 Vercel 等服务商。

## 技术栈

- Nuxt 4 + TypeScript + SCSS
- Element Plus
- @nuxtjs/i18n（no_prefix 策略）
- @nuxtjs/sitemap
- Nitro Server Routes

## 项目结构

```
app/
├── components/          # 公共组件
├── composables/         # 组合式函数
├── layouts/
│   └── default.vue      # 默认布局
├── pages/               # 页面路由
│   ├── index.vue        # 首页
│   ├── about.vue        # 关于
│   ├── links.vue        # 友情链接
│   └── [...slug].vue    # 动态路由（工具页面）
├── plugins/
│   └── element-plus.ts  # Element Plus 插件
├── tools/               # 工具实现（18 个工具，8 个分组）
│   ├── registry.ts      # 自动注册路由
│   ├── types.ts         # 类型定义
│   ├── converter/       # 转换器（base64、convert、timestamp、unicode）
│   ├── crypto/          # 加解密（crypto、hash）
│   ├── developer/       # 开发工具（cron、json、regex、xml、xslt）
│   ├── loghub/          # 通天晓（groovy-sql-json、oly-crypt）
│   ├── text/            # 文本处理（count-text、diff、extract-text、join-text、password）
│   ├── web/             # Web 工具（html、myip）
│   └── template/        # 工具模板
├── app.vue              # 根组件
├── app.config.ts        # 应用配置
└── error.vue            # 错误页面
scripts/
└── create-tool.ts       # 工具脚手架
server/
├── api/__sitemap__/urls.ts  # Sitemap API
└── routes/ip.ts             # IP 查询接口
nuxt.config.ts           # Nuxt 配置
```

- **Hybrid 渲染**：页面 SSG 预渲染 + API Serverless
- **源码目录**：`app/`，`~` 别名解析到 `app/`
- **两层目录约定**：`tools/converter/base64/` → 路径 `/base64`，分组 `converter/`，自动推导
- **工具注册表**：`app/tools/registry.ts` 扫描各目录 `meta.ts`，自动构建路由映射
- **统一短路径**：所有页面使用最短路径，无 `/tools/` 前缀

## 开发命令

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

## 部署方式

默认输出 Node.js 服务端，页面使用 SSG 预渲染，API 路由按部署平台运行。通过 `NITRO_PRESET` 环境变量可切换到其他平台（如 `vercel`、`netlify`、`docker`）。
