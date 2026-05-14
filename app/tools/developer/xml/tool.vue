<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'
import ace from 'ace-builds'
import 'ace-builds/src-noconflict/mode-xml'
import 'ace-builds/src-noconflict/theme-sqlserver'
import xmlFormat from 'xml-formatter'

const STORAGE_KEY = 'dz-tools-xml'
const editorContainer = ref<HTMLDivElement>()
let editor: ace.Ace.Editor | null = null

function getEditor(): ace.Ace.Editor {
  if (!editor) throw new Error('编辑器未初始化')
  return editor
}

function formatXml() {
  try {
    const result = xmlFormat(getEditor().getValue(), {
      indentation: '  ',
      collapseContent: true,
      lineSeparator: '\n',
    })
    getEditor().setValue(result, -1)
  } catch {
    ElMessage.error('XML 格式不正确，无法美化')
  }
}

function compactXml() {
  let xml = getEditor().getValue()
  xml = xml
    .replace(/\n/g, '')
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .replace(/<!--[\s\S]*?-->/g, '')
    .trim()
  getEditor().setValue(xml, -1)
}

function decodeXml() {
  try {
    getEditor().setValue(decodeURIComponent(getEditor().getValue()), -1)
  } catch {
    ElMessage.error('解码失败，内容不是有效的 URI 编码')
  }
}

function clearXml() {
  getEditor().setValue('', -1)
  localStorage.setItem(STORAGE_KEY, '')
}

onMounted(() => {
  if (!editorContainer.value) return

  editor = ace.edit(editorContainer.value)
  editor.setTheme('ace/theme/sqlserver')
  editor.setFontSize('14px')
  editor.setOption('wrap', 'free')
  editor.setShowPrintMargin(false)
  editor.session.setMode('ace/mode/xml')
  editor.session.setValue(localStorage.getItem(STORAGE_KEY) || '')
  editor.session.on('change', () => {
    localStorage.setItem(STORAGE_KEY, editor?.getValue() || '')
  })
})

onBeforeUnmount(() => {
  editor?.destroy()
  editor = null
})
</script>

<template>
  <div class="xml-editor-tool">
    <div class="xml-toolbar">
      <el-button-group>
        <el-button type="primary" @click="formatXml">美化</el-button>
        <el-button type="primary" @click="compactXml">压缩</el-button>
      </el-button-group>
      <el-button-group>
        <el-button type="success" @click="decodeXml">解码</el-button>
      </el-button-group>
      <el-button-group>
        <el-button type="danger" @click="clearXml">清空</el-button>
      </el-button-group>
    </div>
    <div ref="editorContainer" class="xml-editor-container" />
  </div>
</template>

<style scoped lang="scss">
.xml-editor-tool {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.xml-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.xml-editor-container {
  height: 78vh;
  border: 1px solid #d3d3d3;
  border-radius: 4px;
  overflow: hidden;
}
</style>
