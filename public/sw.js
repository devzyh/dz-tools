// 最小 Service Worker：仅提供 PWA 可安装性（file_handlers 双击打开 .md 的前提），
// 不注册 fetch 拦截，避免缓存干扰 SSG 页面内容更新
self.addEventListener('install', () => self.skipWaiting())

self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))
