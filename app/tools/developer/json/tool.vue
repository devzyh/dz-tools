<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const STORAGE_KEY = 'dz-tools-json'
const { read, write } = useToolCache()
const editorContainer = ref<HTMLDivElement>()
const editorReady = ref(false)
const message = useMessage()
let editor: any = null

function getEditor(): any {
  if (!editor) throw new Error('编辑器未初始化')
  return editor
}

function formatJson() {
  try {
    getEditor().format()
  } catch {
    message.error('JSON 格式不正确，无法美化')
  }
}

function compactJson() {
  try {
    getEditor().compact()
  } catch {
    message.error('JSON 格式不正确，无法压缩')
  }
}

function sortJson() {
  try {
    getEditor()._showSortModal()
  } catch {
    message.error('排序功能不可用')
  }
}

function transformJson() {
  try {
    getEditor()._showTransformModal()
  } catch {
    message.error('筛选功能不可用')
  }
}

function escapeJson() {
  try {
    let text = getEditor()
      .getText()
      .replace(/[\r\n]/g, '')
    text = text.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
    getEditor().setText(text)
  } catch {
    message.error('转义失败')
  }
}

function unescapeJson() {
  try {
    let text = getEditor().getText()
    text = text.replace(/\\\\/g, '\\').replace(/\\"/g, '"')
    getEditor().setText(text)
  } catch {
    message.error('修复失败')
  }
}

function decodeJson() {
  try {
    getEditor().setText(decodeURIComponent(getEditor().getText()))
  } catch {
    message.error('解码失败：内容不是有效的 URI 编码')
  }
}

function clearJson() {
  getEditor().setText('')
  write(STORAGE_KEY, '')
}

onMounted(async () => {
  if (!import.meta.client || !editorContainer.value) return

  // 第一批并行加载:ace 主包、worker/searchbox(仅取 URL)、jsoneditor 样式(无执行副作用)
  const [aceModule, workerUrl, searchboxUrl] = await Promise.all([
    import('ace-builds/src-min-noconflict/ace.js'),
    import('ace-builds/src-min-noconflict/worker-json.js?url'),
    import('ace-builds/src-min-noconflict/ext-searchbox.js?url'),
    import('jsoneditor/dist/jsoneditor.css'),
  ])

  ;(window as any).ace = aceModule
  aceModule.config.setModuleUrl('ace/mode/json_worker', workerUrl.default)
  aceModule.config.setModuleUrl('ace/ext/searchbox', searchboxUrl.default)

  // 第二批:jsoneditor 加载时会同步捕获 window.ace 并固化到模块级变量,
  // 若先于 ace 主包执行会因捕获失败永久降级为空 textarea,故必须串行在赋值之后;
  // mode/theme 通过全局 ace.define 注册,只依赖 ace 主包,可与 jsoneditor 并行
  const [editorModule] = await Promise.all([
    import('jsoneditor/dist/jsoneditor-minimalist.min.js'),
    import('ace-builds/src-min-noconflict/mode-json.js'),
    import('ace-builds/src-min-noconflict/theme-sqlserver.js'),
  ])
  const JSONEditor = editorModule.default || editorModule

  editor = new JSONEditor(editorContainer.value, {
    mode: 'code',
    mainMenuBar: false,
    navigationBar: false,
    statusBar: true,
    onChange: () => {
      write(STORAGE_KEY, editor?.getText() || '')
    },
  })

  const saved = read(STORAGE_KEY)
  if (saved) {
    editor.setText(saved)
    try {
      editor.format()
    } catch {
      /* saved content may not be valid JSON */
    }
  }

  editorReady.value = true
})

onBeforeUnmount(() => {
  editor?.destroy()
  editor = null
})
</script>

<template>
  <div class="json-editor-tool">
    <div class="json-toolbar">
      <div class="btn-group">
        <UButton @click="formatJson">美化</UButton>
        <UButton @click="compactJson">压缩</UButton>
        <UButton @click="sortJson">排序</UButton>
        <UButton @click="transformJson">筛选</UButton>
      </div>
      <div class="btn-group">
        <UButton color="success" @click="escapeJson">转义</UButton>
        <UButton color="success" @click="unescapeJson">修复</UButton>
        <UButton color="success" @click="decodeJson">解码</UButton>
      </div>
      <div class="btn-group">
        <UButton color="error" @click="clearJson">清空</UButton>
      </div>
    </div>
    <EditorLoader v-model:ready="editorReady">
      <div ref="editorContainer" class="json-editor-container" />
    </EditorLoader>
  </div>
</template>

<style scoped lang="scss">
.json-editor-tool {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.json-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.btn-group {
  display: flex;
  gap: 4px;
}

.json-editor-container {
  height: 74.5vh;
  border: 1px solid var(--ui-border-accented);
  border-radius: 4px;
  overflow: hidden;
}
</style>
