import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },

  app: {
    buildAssetsDir: 'assets',
    head: {
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
      script: [
        {
          src: 'https://www.googletagmanager.com/gtag/js?id=G-J80TRKBMB0',
          async: true,
          tagPosition: 'bodyClose',
        },
        {
          innerHTML: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-J80TRKBMB0');`,
          tagPosition: 'bodyClose',
        },
      ],
    },
  },

  modules: ['@nuxtjs/i18n', '@nuxtjs/sitemap'],

  site: {
    url: 'https://devzyh.cn',
  },

  // element-plus 组件样式由 ElementPlusResolver 按需注入;
  // ElMessage 为命令式调用(不在模板),样式需全局保留。
  // 必须用纯 css 文件而非 es/*/style/css 入口:后者内嵌 .css import,
  // dev 模式 SSR 端将 node_modules 外部化给 Node 原生 ESM,会报 Unknown file extension ".css"
  css: ['element-plus/theme-chalk/base.css', 'element-plus/theme-chalk/el-message.css', '~/styles/index.scss'],

  vite: {
    plugins: [
      // dirs/dts 关闭:本地组件自动注册由 Nuxt 负责,此处仅解析模板内 el-* 按需引入
      Components({
        resolvers: [ElementPlusResolver()],
        dirs: [],
        dts: false,
      }),
    ],
    // 按需样式入口(es/components/*/style/css)内嵌 .css import,
    // dev 模式 SSR 端若将 element-plus 外部化给 Node 原生 ESM 会报
    // Unknown file extension ".css";交回 Vite 管线即可正常转换
    ssr: {
      noExternal: ['element-plus'],
    },
  },

  i18n: {
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    },
    locales: [
      { code: 'zh-CN', name: '中文', files: ['zh-CN/common.json'] },
      { code: 'en', name: 'English', files: ['en/common.json'] },
    ],
    defaultLocale: 'zh-CN',
    langDir: 'locales/',
  },

  nitro: {
    // element-plus 的 @popperjs/core 是 npm alias（实际包 @sxzz/popperjs-es），
    // Nitro 复制 externals 时无法按别名跟踪，导致运行时 SSR 报 ERR_MODULE_NOT_FOUND。
    // 已将 alias 包加为项目直接依赖提升到顶层 node_modules，此处再将其内联进 server bundle
    externals: {
      inline: ['element-plus', '@popperjs/core'],
    },
    prerender: {
      crawlLinks: true,
      routes: ['/', '/about', '/links'],
      failOnError: false,
    },
  },

  routeRules: {
    '/': { prerender: true },
    '/about': { prerender: true },
    '/links': { prerender: true },
    '/api/**': { cors: true },
  },

  ssr: true,
})
