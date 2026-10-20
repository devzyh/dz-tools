/**
 * 复制文本到剪贴板，成功或失败时通过 Toast 提示。
 * 剪贴板 API 在权限受限或非安全上下文可能长时间挂起，
 * 短暂超时后降级为 execCommand 方案，保证提示即时弹出。
 */
export function copyToClipboard(text: string, message = '已复制') {
  // useMessage 依赖 Nuxt 上下文，须在同步调用栈内取用（客户端事件回调中可用）
  const msg = useMessage()

  let settled = false
  /** 只兑现一次结果，避免降级与异步回调双报 */
  const once = (notify: () => void) => {
    if (settled) return
    settled = true
    notify()
  }

  /** execCommand 降级方案：用户手势内复制无需权限 */
  const fallback = () => {
    try {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(textarea)
      once(() => (ok ? msg.success(message) : msg.error('复制失败')))
    } catch {
      once(() => msg.error('复制失败'))
    }
  }

  if (!navigator.clipboard?.writeText) {
    fallback()
    return
  }

  const timer = setTimeout(fallback, 800)
  navigator.clipboard
    .writeText(text)
    .then(() => {
      clearTimeout(timer)
      once(() => msg.success(message))
    })
    .catch(() => {
      clearTimeout(timer)
      fallback()
    })
}
