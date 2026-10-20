export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },

  app: {
    // dev 下与 @tailwindcss/vite 的虚拟 CSS 模块路径冲突,恢复默认 '_nuxt'
    // buildAssetsDir: 'assets',
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

  modules: ['@nuxt/ui', '@nuxtjs/i18n', '@nuxtjs/sitemap'],

  // 显式声明 ep 图标集走本地 @iconify-json/ep:
  // pnpm 严格隔离下 @nuxt/icon 的自动探测会失联并退回 Iconify API,SSG 产物将缺图标
  icon: {
    serverBundle: {
      collections: ['ep', 'lucide'],
    },
  },

  // 内置 fonts 模块的远程字体源在构建期不可达且非必需(站点使用系统字体栈),直接关闭
  fonts: {
    providers: {
      google: false,
      googleicons: false,
    },
  },

  // 过渡期锁定亮色:暗色主题规划二期,届时移除此配置
  colorMode: {
    preference: 'light',
    fallback: 'light',
  },

  site: {
    url: 'https://devzyh.cn',
  },

  css: ['~/assets/css/main.css', '~/styles/index.scss'],

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
    // @nuxt/icon 的 server bundle 以裸模块名导入图标 JSON,Nitro 会将其外部化,
    // 预渲染运行时解析失败导致图标回退 Iconify API(SSG 离线必挂);
    // 内联进 server bundle 交由 Rollup 直接打包
    externals: {
      inline: ['@iconify-json/ep', '@iconify-json/lucide'],
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
