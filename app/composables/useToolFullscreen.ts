import { computed, ref, watch, onMounted, onBeforeUnmount, type Ref } from 'vue'

// 模块级共享状态:工具页布局(按钮)与页面内样式读写同一份,按路由隔离
const stateMap = new Map<string, Ref<boolean>>()

/**
 * 工具页全屏切换(固定定位伪全屏,状态经缓存持久化)。
 *
 * 仅工具页布局([...slug].vue)调用:按钮位于面包屑行,工具组件经
 * .tool-fullscreen 祖先类适配内部填充。不用原生 Fullscreen API:
 * 其状态刷新后浏览器不允许自动恢复,固定定位方案可配合缓存保持。
 */
export function useToolFullscreen() {
  const route = useRoute()
  const nuxtApp = useNuxtApp()
  const { cacheEnabled } = useAppSettings()

  const stateKey = () => `dz-tools-fullscreen:${route.path}`

  /** 获取路由对应的状态 ref,模块级缓存保证同路由读写同一实例 */
  function getState(key: string): Ref<boolean> {
    let state = stateMap.get(key)
    if (!state) {
      state = ref(false)
      stateMap.set(key, state)
      // 水合期间不读缓存,避免与服务端渲染结果不一致;挂载后统一载入
      if (import.meta.client && !nuxtApp.isHydrating) loadInto(state, key)
    }
    return state
  }

  /** 从缓存载入指定 key 的全屏状态 */
  function loadInto(state: Ref<boolean>, key: string) {
    if (!import.meta.client || !cacheEnabled.value) return
    try {
      if (localStorage.getItem(key) === 'true') state.value = true
    } catch {
      /* 隐私模式等场景忽略 */
    }
  }

  const fullscreen = computed({
    get: () => getState(stateKey()).value,
    set: (value) => {
      getState(stateKey()).value = value
    },
  })

  /** 全屏时锁定页面背景滚动,退出或卸载时恢复 */
  function syncBodyOverflow(value: boolean) {
    if (!import.meta.client) return
    document.body.style.overflow = value ? 'hidden' : ''
  }

  watch(fullscreen, (value) => {
    if (!import.meta.client || !cacheEnabled.value) return
    try {
      localStorage.setItem(stateKey(), String(value))
    } catch {
      /* 写入失败时忽略,不影响页面内使用 */
    }
  })

  // 初次进入(含刷新后恢复)即同步一次滚动锁定
  watch(fullscreen, syncBodyOverflow, { immediate: true })

  // 关闭数据缓存时复位为默认值(不写入)
  watch(cacheEnabled, (enabled) => {
    if (!enabled) getState(stateKey()).value = false
  })

  /**
   * Esc 键退出全屏
   * @param e 键盘事件
   */
  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && fullscreen.value) fullscreen.value = false
  }

  onMounted(() => {
    loadInto(getState(stateKey()), stateKey())
    document.addEventListener('keydown', onKeydown)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', onKeydown)
    syncBodyOverflow(false)
  })

  return { fullscreen }
}
