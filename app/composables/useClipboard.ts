import { ElMessage } from 'element-plus'

export function copyToClipboard(text: string, message = '已复制') {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      ElMessage.success(message)
    })
    .catch(() => {
      ElMessage.error('复制失败')
    })
}
