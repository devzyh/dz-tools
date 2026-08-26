import { ID_INJECTION_KEY, ZINDEX_INJECTION_KEY } from 'element-plus'

export default defineNuxtPlugin((nuxtApp) => {
  // 组件由 ElementPlusResolver 按需引入,此处仅提供 SSR 所需的确定性注入
  // SSR 期间提供确定性的 id/z-index 前缀,避免 el-switch、el-popover 等组件的 hydration 警告
  nuxtApp.vueApp.provide(ID_INJECTION_KEY, { prefix: 1024, current: 0 })
  nuxtApp.vueApp.provide(ZINDEX_INJECTION_KEY, { current: 0 })
})
