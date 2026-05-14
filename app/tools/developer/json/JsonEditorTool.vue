<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'

const { t } = useI18n()

const STORAGE_KEY = 'dz-tools-json'
const editorContainer = ref<HTMLDivElement>()
let editor: any = null

function getEditor(): any {
  if (!editor) throw new Error('编辑器未初始化')
  return editor
}

function formatJson() {
  try {
    getEditor().format()
  } catch {
    ElMessage.error(t('tools.json.formatError'))
  }
}

function compactJson() {
  try {
    getEditor().compact()
  } catch {
    ElMessage.error(t('tools.json.compactError'))
  }
}

function sortJson() {
  try {
    getEditor()._showSortModal()
  } catch {
    ElMessage.error(t('tools.json.sortUnavailable'))
  }
}

function transformJson() {
  try {
    getEditor()._showTransformModal()
  } catch {
    ElMessage.error(t('tools.json.filterUnavailable'))
  }
}

function escapeJson() {
  try {
    let text = getEditor().getText().replace(/[\r\n]/g, '')
    text = text.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
    getEditor().setText(text)
  } catch {
    ElMessage.error(t('tools.json.escapeError'))
  }
}

function unescapeJson() {
  try {
    let text = getEditor().getText()
    text = text.replace(/\\\\/g, '\\').replace(/\\"/g, '"')
    getEditor().setText(text)
  } catch {
    ElMessage.error(t('tools.json.fixError'))
  }
}

function decodeJson() {
  try {
    getEditor().setText(decodeURIComponent(getEditor().getText()))
  } catch {
    ElMessage.error(t('tools.json.decodeError'))
  }
}

function clearJson() {
  getEditor().setText('')
  localStorage.setItem(STORAGE_KEY, '')
}

onMounted(async () => {
  if (!import.meta.client || !editorContainer.value) return

  const { default: JSONEditor } = await import('jsoneditor')
  await import('jsoneditor/dist/jsoneditor.css')

  editor = new JSONEditor(editorContainer.value, {
    mode: 'code',
    mainMenuBar: false,
    navigationBar: false,
    statusBar: true,
    onChange: () => {
      localStorage.setItem(STORAGE_KEY, editor?.getText() || '')
    },
  })

  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    editor.setText(saved)
    if (editor.getText().length > 0) {
      editor.format()
    }
  }
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
        <el-button type="primary" @click="formatJson">{{ $t('tools.json.format') }}</el-button>
        <el-button type="primary" @click="compactJson">{{ $t('tools.json.compact') }}</el-button>
        <el-button type="primary" @click="sortJson">{{ $t('tools.json.sort') }}</el-button>
        <el-button type="primary" @click="transformJson">{{ $t('tools.json.filter') }}</el-button>
      </el-button-group>
      <el-button-group>
        <el-button type="success" @click="escapeJson">{{ $t('tools.json.escape') }}</el-button>
        <el-button type="success" @click="unescapeJson">{{ $t('tools.json.fix') }}</el-button>
        <el-button type="success" @click="decodeJson">{{ $t('tools.json.decode') }}</el-button>
      </el-button-group>
      <el-button-group>
        <el-button type="danger" @click="clearJson">{{ $t('tools.json.clear') }}</el-button>
      </el-button-group>
    </div>
    <div ref="editorContainer" class="json-editor-container" />
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
  height: 78vh;
  border: 1px solid #d3d3d3;
  border-radius: 4px;
  overflow: hidden;
}
</style>
