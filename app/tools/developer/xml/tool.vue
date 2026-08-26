<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage } from 'element-plus'

let ace: typeof import('ace-builds') | null = null
let xmlFormat: (
  xml: string,
  options?: { indentation?: string; collapseContent?: boolean; lineSeparator?: string },
) => string | undefined

const STORAGE_KEY = 'dz-tools-xml'
const { read, write } = useToolCache()
const editorContainer = ref<HTMLDivElement>()
const editorReady = ref(false)
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
  write(STORAGE_KEY, '')
}

onMounted(async () => {
  if (!import.meta.client || !editorContainer.value) return

  // 第一批并行加载:ace 主包、xml-formatter、worker/searchbox(仅取 URL)
  const [aceMod, xmlMod, workerUrl, searchboxUrl] = await Promise.all([
    import('ace-builds/src-min-noconflict/ace.js'),
    import('xml-formatter'),
    import('ace-builds/src-min-noconflict/worker-xml.js?url'),
    import('ace-builds/src-min-noconflict/ext-searchbox.js?url'),
  ])
  ace = aceMod
  xmlFormat = xmlMod.default || xmlMod
  ace.config.setModuleUrl('ace/mode/xml_worker', workerUrl.default)
  ace.config.setModuleUrl('ace/ext/searchbox', searchboxUrl.default)

  // mode/theme 通过全局 ace.define 注册,须在 ace 主包执行后加载
  await Promise.all([
    import('ace-builds/src-min-noconflict/mode-xml.js'),
    import('ace-builds/src-min-noconflict/theme-sqlserver.js'),
  ])

  const container = editorContainer.value!
  editor = ace.edit(container)
  editor.setTheme('ace/theme/sqlserver')
  editor.setFontSize('14px')
  editor.setOption('wrap', 'free')
  editor.setShowPrintMargin(false)
  editor.session.setMode('ace/mode/xml')
  editor.session.setValue(read(STORAGE_KEY) || '')
  editor.session.on('change', () => {
    write(STORAGE_KEY, editor?.getValue() || '')
  })
  editorReady.value = true
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
    <EditorLoader v-model:ready="editorReady">
      <div ref="editorContainer" class="xml-editor-container" />
    </EditorLoader>
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
  height: 74.5vh;
  border: 1px solid #d3d3d3;
  border-radius: 4px;
  overflow: hidden;
}
</style>
