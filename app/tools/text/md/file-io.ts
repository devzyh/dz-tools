/**
 * 本地 Markdown 文件的打开与保存封装。
 * 优先走 File System Access API（Chrome/Edge，保存可直接写回原文件），
 * 其余浏览器降级为 input 选文件、Blob 下载保存。
 */

/** 可写回的文件句柄与启动队列类型未收录进 lib.dom，按需局部声明 */
export interface WritableFileHandle extends FileSystemFileHandle {
  createWritable(): Promise<FileSystemWritableFileStream>
}

/** 带 FS Access 能力的 window 视图 */
interface FsWindow extends Window {
  showOpenFilePicker?: (options?: {
    types?: { accept: Record<string, string[]> }[]
  }) => Promise<WritableFileHandle[]>
  launchQueue?: {
    setConsumer(consumer: (params: { files: WritableFileHandle[] }) => void): void
  }
}

/** 打开结果：内容与文件名，handle 非空时保存将写回原文件 */
export interface OpenedFile {
  text: string
  name: string
  handle: WritableFileHandle | null
}

/** 系统选择器允许的 Markdown 文件后缀 */
const PICKER_TYPES = [{ accept: { 'text/markdown': ['.md', '.markdown', '.mdown'] } }]

/** input 降级路径允许的 Markdown 文件后缀 */
const INPUT_ACCEPT = '.md,.markdown,.mdown'

/** 判断浏览器是否支持直接写回原文件 */
export function supportsFsAccess(): boolean {
  return typeof window !== 'undefined' && !!(window as FsWindow).showOpenFilePicker
}

/** 读取文件句柄的内容与名称 */
async function readHandle(handle: WritableFileHandle): Promise<OpenedFile> {
  const file = await handle.getFile()
  return { text: await file.text(), name: file.name, handle }
}

/** 通过 FS Access 系统选择器打开文件；用户取消时返回 null */
export async function openViaFsAccess(): Promise<OpenedFile | null> {
  try {
    const [handle] = await (window as FsWindow).showOpenFilePicker!({ types: PICKER_TYPES })
    return await readHandle(handle)
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return null
    throw error
  }
}

/** 通过隐藏 input 选文件（降级路径）；用户取消时返回 null */
export function openViaInput(): Promise<OpenedFile | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = INPUT_ACCEPT
    input.onchange = async () => {
      const file = input.files?.[0]
      input.remove()
      resolve(file ? { text: await file.text(), name: file.name, handle: null } : null)
    }
    input.oncancel = () => {
      input.remove()
      resolve(null)
    }
    input.style.display = 'none'
    document.body.append(input)
    input.click()
  })
}

/** 将文本写回句柄指向的原文件 */
export async function writeToHandle(handle: WritableFileHandle, text: string): Promise<void> {
  const writable = await handle.createWritable()
  await writable.write(text)
  await writable.close()
}

/** 通过浏览器下载保存（未持有句柄时的保存方式） */
export function downloadAsFile(name: string, text: string): void {
  const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  link.click()
  URL.revokeObjectURL(url)
}

/** 注册 PWA 文件处理消费者：系统双击 .md 启动应用时接管文件 */
export function consumeLaunchQueue(onFile: (file: OpenedFile) => void): void {
  const launchQueue = (window as FsWindow).launchQueue
  if (!launchQueue) return
  launchQueue.setConsumer(async ({ files }) => {
    if (files.length > 0) onFile(await readHandle(files[0]))
  })
}
