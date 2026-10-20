/**
 * 基于 Nuxt UI Toast 的命令式消息提示，用于替代 Element Plus 的 ElMessage。
 * 须在组件 setup 上下文中调用，返回的函数可在事件处理器中随意使用。
 * 底部进度条与类型同色：报错红条、成功绿条、警告黄条、信息蓝条。
 */
export function useMessage() {
  const toast = useToast()

  return {
    /** 成功提示 */
    success: (title: string) =>
      toast.add({ title, color: 'success', progress: { color: 'success' }, duration: 3000 }),
    /** 错误提示 */
    error: (title: string) =>
      toast.add({ title, color: 'error', progress: { color: 'error' }, duration: 3000 }),
    /** 警告提示 */
    warning: (title: string) =>
      toast.add({ title, color: 'warning', progress: { color: 'warning' }, duration: 3000 }),
    /** 信息提示 */
    info: (title: string) =>
      toast.add({ title, color: 'info', progress: { color: 'info' }, duration: 3000 }),
  }
}
