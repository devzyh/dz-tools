<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import type Vditor from 'vditor'
import {
  openViaFsAccess,
  openViaInput,
  writeToHandle,
  downloadAsFile,
  consumeLaunchQueue,
  supportsFsAccess,
  type OpenedFile,
  type WritableFileHandle,
} from './file-io'

const editorContainer = ref<HTMLDivElement>()
const editorReady = ref(false)
const dirty = ref(false)
const fileName = ref('')
const message = useMessage()
const colorMode = useColorMode()
// 与页面布局([...slug].vue)共享同一份全屏状态
const { fullscreen } = useToolFullscreen()
let editor: Vditor | null = null
let fileHandle: WritableFileHandle | null = null

/** 提取错误的可读文案 */
function errText(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/** 将打开的文件内容应用到编辑器并复位状态 */
function applyOpenedFile(file: OpenedFile): void {
  editor?.setValue(file.text, true)
  fileName.value = file.name
  fileHandle = file.handle
  dirty.value = false
}

/** 应用内容到编辑器（PWA 双击启动与手动打开共用入口） */
async function openFile(): Promise<void> {
  if (!editor) return
  if (dirty.value && !window.confirm('当前内容尚未保存，确定要丢弃并打开新文件吗？')) return
  try {
    const file = supportsFsAccess() ? await openViaFsAccess() : await openViaInput()
    if (file) applyOpenedFile(file)
  } catch (error) {
    message.error(`打开文件失败：${errText(error)}`)
  }
}

/** 保存：持有句柄时写回原文件，否则下载保存 */
async function saveFile(): Promise<void> {
  if (!editor) return
  try {
    if (fileHandle) {
      await writeToHandle(fileHandle, editor.getValue())
      message.success('已保存')
    } else {
      downloadAsFile(fileName.value || 'untitled.md', editor.getValue())
      message.success('已下载')
    }
    dirty.value = false
  } catch (error) {
    message.error(`保存失败：${errText(error)}`)
  }
}

/** Ctrl+S / Cmd+S 拦截为保存 */
function onKeydown(event: KeyboardEvent): void {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
    event.preventDefault()
    saveFile()
  }
}

/** 有未保存修改时拦截页面关闭与刷新 */
function onBeforeUnload(event: BeforeUnloadEvent): void {
  if (dirty.value) {
    event.preventDefault()
    event.returnValue = ''
  }
}

onMounted(async () => {
  if (!import.meta.client) return
  window.addEventListener('keydown', onKeydown, true)
  window.addEventListener('beforeunload', onBeforeUnload)
  consumeLaunchQueue(applyOpenedFile)
  if (!editorContainer.value) return

  const [{ default: VditorCtor }] = await Promise.all([
    import('vditor'),
    import('vditor/dist/index.css'),
  ])
  editor = new VditorCtor(editorContainer.value, {
    cdn: '/vditor',
    mode: 'ir',
    theme: colorMode.value === 'dark' ? 'dark' : 'classic',
    cache: { enable: false },
    outline: { enable: true, position: 'left' },
    placeholder: '可直接书写，或点击「打开」选择本地 Markdown 文件',
    toolbar: [
      'headings',
      'bold',
      'italic',
      'strike',
      '|',
      'list',
      'ordered-list',
      'check',
      'quote',
      'line',
      '|',
      'link',
      'table',
      'code',
      'inline-code',
      '|',
      'undo',
      'redo',
      'outline',
    ],
    input: () => {
      dirty.value = true
    },
    after: () => {
      editorReady.value = true
    },
  })
})

// 站点当前锁定亮色，跟随 colorMode 以便二期开放暗色时零改动生效
watch(colorMode, (mode) => {
  editor?.setTheme(mode === 'dark' ? 'dark' : 'classic')
})

// 全屏切换是纯 CSS 布局变化，不产生 window resize 事件，vditor 的正文内边距
// 仍按切换前的宽度计算，导致切回非全屏后正文过窄；补发 resize 触发其重算
watch(fullscreen, () => {
  nextTick(() => {
    requestAnimationFrame(() => window.dispatchEvent(new Event('resize')))
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown, true)
  window.removeEventListener('beforeunload', onBeforeUnload)
  editor?.destroy()
  editor = null
})
</script>

<template>
  <div class="md-editor-tool">
    <div class="md-toolbar">
      <div class="btn-group">
        <UButton @click="openFile">打开</UButton>
        <UButton color="success" @click="saveFile">保存</UButton>
      </div>
      <div class="file-status">
        <span class="file-name" :class="{ muted: !fileName }">
          {{ fileName || '未打开文件' }}
        </span>
        <span v-if="dirty" class="dirty-dot" title="有未保存的修改">●</span>
      </div>
    </div>
    <EditorLoader v-model:ready="editorReady">
      <div ref="editorContainer" class="md-editor-container" />
    </EditorLoader>
  </div>
</template>

<style scoped lang="scss">
.md-editor-tool {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.md-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.btn-group {
  display: flex;
  gap: 4px;
}

.file-status {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;

  &.muted {
    color: var(--ui-text-muted);
  }
}

.dirty-dot {
  color: var(--ui-warning);
  font-size: 12px;
  line-height: 1;
}

.md-editor-container {
  // 上下固定占位共 288px(页头+面包屑+按钮行 176px,页脚及间距 112px):
  // 编辑区填满窗口剩余高度,内容超出时随内容增长、整页滚动
  min-height: calc(100vh - 288px);
  border: 1px solid var(--ui-border-accented);
  border-radius: 4px;
  overflow: hidden;
}

.tool-fullscreen .md-editor-tool {
  .editor-loader {
    flex: 1;
    height: auto;
    min-height: 0;
  }

  // vditor 在挂载元素(即本容器)上写有内联 height:auto,需 !important 覆盖才能撑满全屏
  .md-editor-container {
    height: 100% !important;
  }
}

// 窄屏下大纲面板会挤占编辑区，直接隐藏
@media (max-width: 768px) {
  .md-editor-container {
    :deep(.vditor-outline) {
      display: none;
    }
  }
}
</style>
