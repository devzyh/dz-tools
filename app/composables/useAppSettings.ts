import { onMounted } from 'vue'
import { useState } from '#app'

/** 设置持久化 key,唯一不受"数据缓存"开关控制的本地存储 */
const SETTINGS_KEY = 'dz-tools-settings'

/**
 * 全局应用设置。
 *
 * 当前提供"数据缓存"开关:关闭后全站工具不再读写 localStorage(无痕模式),
 * 旧数据保留、重新开启后恢复可见。设置自身必须持久化才能跨会话生效,
 * 因此 dz-tools-settings 是唯一的例外 key。
 */
export function useAppSettings() {
  const cacheEnabled = useState('app-settings:cache-enabled', () => true)

  // 客户端挂载后从 localStorage 恢复开关状态(SSR 期间保持默认开启,避免 hydration 冲突)
  onMounted(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY)
      if (raw) cacheEnabled.value = JSON.parse(raw).cacheEnabled !== false
    } catch {
      /* 数据损坏时保持默认值 */
    }
  })

  /**
   * 更新"数据缓存"开关并持久化
   * @param value 是否开启缓存
   */
  function setCacheEnabled(value: boolean) {
    cacheEnabled.value = value
    if (import.meta.client) {
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify({ cacheEnabled: value }))
      } catch {
        /* 写入失败(隐私模式/空间不足)时仅保留内存状态 */
      }
    }
  }

  return { cacheEnabled, setCacheEnabled }
}
