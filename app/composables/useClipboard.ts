/**
 * 复制文本到剪贴板，成功或失败时通过 Toast 提示
 */
export function copyToClipboard(text: string, message = '已复制') {
  // useMessage 依赖 Nuxt 上下文，须在同步调用栈内取用（客户端事件回调中可用）
  const msg = useMessage()
  navigator.clipboard
    .writeText(text)
    .then(() => {
      msg.success(message)
    })
    .catch(() => {
      msg.error('复制失败')
    })
}
