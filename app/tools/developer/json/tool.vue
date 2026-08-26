<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'

const STORAGE_KEY = 'dz-tools-json'
const { read, write } = useToolCache()
const editorContainer = ref<HTMLDivElement>()
const editorReady = ref(false)
let editor: any = null

function getEditor(): any {
  if (!editor) throw new Error('编辑器未初始化')
  return editor
}

function formatJson() {
  try {
    getEditor().format()
  } catch {
    ElMessage.error('JSON 格式不正确，无法美化')
  }
}

function compactJson() {
  try {
    getEditor().compact()
  } catch {
    ElMessage.error('JSON 格式不正确，无法压缩')
  }
}

function sortJson() {
  try {
    getEditor()._showSortModal()
  } catch {
    ElMessage.error('排序功能不可用')
  }
}

function transformJson() {
  try {
    getEditor()._showTransformModal()
  } catch {
    ElMessage.error('筛选功能不可用')
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
    ElMessage.error('转义失败')
  }
}

function unescapeJson() {
  try {
    let text = getEditor().getText()
    text = text.replace(/\\\\/g, '\\').replace(/\\"/g, '"')
    getEditor().setText(text)
  } catch {
    ElMessage.error('修复失败')
  }
}

function decodeJson() {
  try {
    getEditor().setText(decodeURIComponent(getEditor().getText()))
  } catch {
    ElMessage.error('解码失败，内容不是有效的 URI 编码')
  }
}

function clearJson() {
  getEditor().setText('')
  write(STORAGE_KEY, '')
}

onMounted(async () => {
  if (!import.meta.client || !editorContainer.value) return

  const aceModule = await import('ace-builds')
  ;(window as any).ace = aceModule
  const workerUrl = (await import('ace-builds/src-noconflict/worker-json.js?url')).default
  aceModule.config.setModuleUrl('ace/mode/json_worker', workerUrl)
  const searchboxUrl = (await import('ace-builds/src-noconflict/ext-searchbox.js?url')).default
  aceModule.config.setModuleUrl('ace/ext/searchbox', searchboxUrl)
  await import('ace-builds/src-noconflict/mode-json')
  await import('ace-builds/src-noconflict/theme-sqlserver')

  const editorModule = await import('jsoneditor/dist/jsoneditor-minimalist.min.js')
  await import('jsoneditor/dist/jsoneditor.css')
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
      <el-button-group>
        <el-button type="primary" @click="formatJson">美化</el-button>
        <el-button type="primary" @click="compactJson">压缩</el-button>
        <el-button type="primary" @click="sortJson">排序</el-button>
        <el-button type="primary" @click="transformJson">筛选</el-button>
      </el-button-group>
      <el-button-group>
        <el-button type="success" @click="escapeJson">转义</el-button>
        <el-button type="success" @click="unescapeJson">修复</el-button>
        <el-button type="success" @click="decodeJson">解码</el-button>
      </el-button-group>
      <el-button-group>
        <el-button type="danger" @click="clearJson">清空</el-button>
      </el-button-group>
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

.json-editor-container {
  height: 74.5vh;
  border: 1px solid #d3d3d3;
  border-radius: 4px;
  overflow: hidden;
}
</style>
