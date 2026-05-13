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
    langDir: 'locales/',
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
