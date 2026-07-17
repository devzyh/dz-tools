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

  css: ['element-plus/dist/index.css', '~/styles/index.scss'],

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
