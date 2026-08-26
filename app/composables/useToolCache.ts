import { onMounted, ref, watch, type Ref } from 'vue'
import { useAppSettings } from './useAppSettings'

/** 序列化策略:字符串直存或 JSON 编解码 */
interface CacheSerializer<T> {
  serialize: (value: T) => string
  deserialize: (raw: string) => T
}

/**
 * 受"数据缓存"开关控制的本地存储读写(无痕模式)。
 *
 * 开关关闭时 read 返回 null、write 不落盘;旧数据保留在 localStorage,
 * 重新开启后恢复可读。适配 jsoneditor 等内部状态不是 Vue ref 的场景。
 */
export function useToolCache() {
  const { cacheEnabled } = useAppSettings()

  /**
   * 读取缓存字符串
   * @param key 存储 key,约定 dz-tools- 前缀
   * @returns 缓存内容;未存储、缓存关闭或 SSR 期间返回 null
   */
  function read(key: string): string | null {
    if (!import.meta.client || !cacheEnabled.value) return null
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  }

  /**
   * 写入缓存字符串,缓存关闭或写入失败时静默不落盘
   * @param key 存储 key,约定 dz-tools- 前缀
   * @param value 内容
   */
  function write(key: string, value: string): void {
    if (!import.meta.client || !cacheEnabled.value) return
    try {
      localStorage.setItem(key, value)
    } catch {
      /* 隐私模式/空间不足时忽略 */
    }
  }

  return { read, write }
}

/**
 * 创建受"数据缓存"开关控制的持久化 ref。
 *
 * 开启时:挂载后从 localStorage 载入,变更即写入。
 * 关闭时:始终为默认值且不写入;开关运行时切换即时生效
 * (开启→载入旧数据,关闭→重置为默认值)。
 */
function createCachedRef<T>(key: string, defaultValue: T, s: CacheSerializer<T>): Ref<T> {
  const { cacheEnabled } = useAppSettings()
  const value = ref(defaultValue) as Ref<T>

  /** 从 localStorage 载入已存数据,缓存关闭或数据损坏时保持默认值 */
  function load() {
    if (!import.meta.client || !cacheEnabled.value) return
    try {
      const raw = localStorage.getItem(key)
      if (raw !== null) value.value = s.deserialize(raw)
    } catch {
      /* 数据损坏时保持默认值 */
    }
  }

  onMounted(load)

  watch(cacheEnabled, (enabled) => {
    if (enabled) load()
    else value.value = defaultValue
  })

  watch(value, (v) => {
    if (!import.meta.client || !cacheEnabled.value) return
    try {
      localStorage.setItem(key, s.serialize(v))
    } catch {
      /* 写入失败时忽略,不影响页面内使用 */
    }
  })

  return value
}

/**
 * 受"数据缓存"开关控制的字符串持久化 ref(纯文本直存,与既有 key 数据格式一致)
 * @param key 存储 key,约定 dz-tools- 前缀
 * @param defaultValue 默认值
 */
export function useCachedText(key: string, defaultValue: string): Ref<string> {
  return createCachedRef(key, defaultValue, {
    serialize: (v) => v,
    deserialize: (raw) => raw,
  })
}

/**
 * 受"数据缓存"开关控制的持久化 ref(JSON 序列化),用于表单选项等非字符串状态
 * @param key 存储 key,约定 dz-tools- 前缀
 * @param defaultValue 默认值
 */
export function useCachedRef<T>(key: string, defaultValue: T): Ref<T> {
  return createCachedRef(key, defaultValue, {
    serialize: (v) => JSON.stringify(v),
    deserialize: (raw) => JSON.parse(raw) as T,
  })
}
