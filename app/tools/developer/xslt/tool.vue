<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const xsltRef = ref<HTMLElement>()
const sourceRef = ref<HTMLElement>()
const resultRef = ref<HTMLElement>()
const editorReady = ref(false)

const xsltCacheKey = 'dz-tools-xslt'
const sourceCacheKey = 'dz-tools-xslt-source'

let ace: typeof import('ace-builds') | null = null
let xsltEditor: ace.Ace.Editor | null = null
let sourceEditor: ace.Ace.Editor | null = null
let resultEditor: ace.Ace.Editor | null = null

function convertXslt() {
  try {
    setResult(xsltTransform(xsltEditor.getValue(), sourceEditor.getValue()))
  } catch (err) {
    setResult('错误信息：' + (err as Error).message)
  }
}

function xsltTransform(xslt: string, source: string): string {
  const parser = new DOMParser()

  const xmlDoc = parser.parseFromString(source, 'text/xml')
  const xmlError = xmlDoc.querySelector('parsererror')
  if (xmlError) throw new Error('XML解析错误: ' + xmlError.textContent)

  const xsltDoc = parser.parseFromString(xslt, 'text/xml')
  const xsltError = xsltDoc.querySelector('parsererror')
  if (xsltError) throw new Error('XSLT解析错误: ' + xsltError.textContent)

  const processor = new XSLTProcessor()
  processor.importStylesheet(xsltDoc)
  const resultDoc = processor.transformToDocument(xmlDoc)

  return resultDoc.body.querySelector('pre')?.innerHTML
    ?? new XMLSerializer().serializeToString(resultDoc)
}

function formatXml() {
  try {
    const xml = sourceEditor.getValue()
    sourceEditor.setValue(formatXmlString(xml), -1)
  } catch { /* ignore */ }
}

function formatXmlString(xml: string): string {
  const PADDING = '  '
  let formatted = ''
  let indent = 0

  xml.split(/>\s*</).forEach((node) => {
    if (node.match(/^\/\w/)) indent--
    formatted += PADDING.repeat(Math.max(0, indent)) + node.trim() + '\n'
    if (node.match(/^<?\w[^>]*[^/]$/) && !node.startsWith('?')) indent++
  })

  return formatted.trim()
}

function setResult(content: string) {
  resultEditor.setValue(content, -1)
}

function createAceEditor(el: HTMLElement, readOnly = false, onChange?: (value: string) => void) {
  const editor = ace!.edit(el)
  editor.setTheme('ace/theme/sqlserver')
  editor.setFontSize('14px')
  editor.setOption('wrap', 'free')
  editor.setShowPrintMargin(false)
  editor.session.setMode('ace/mode/xml')

  if (readOnly) {
    editor.setReadOnly(true)
    editor.setOption('highlightActiveLine', false)
  }

  if (onChange) {
    editor.session.on('change', () => onChange(editor.getValue()))
  }

  return editor
}

onMounted(async () => {
  if (!import.meta.client) return

  ace = await import('ace-builds')
  const workerUrl = (await import('ace-builds/src-noconflict/worker-xml.js?url')).default
  ace.config.setModuleUrl('ace/mode/xml_worker', workerUrl)
  await import('ace-builds/src-noconflict/mode-xml')
  await import('ace-builds/src-noconflict/theme-sqlserver')

  if (xsltRef.value) {
    xsltEditor = createAceEditor(xsltRef.value, false, (val) => {
      localStorage.setItem(xsltCacheKey, val)
    })
    xsltEditor.setValue(localStorage.getItem(xsltCacheKey) || '', -1)
  }
  if (sourceRef.value) {
    sourceEditor = createAceEditor(sourceRef.value, false, (val) => {
      localStorage.setItem(sourceCacheKey, val)
    })
    sourceEditor.setValue(localStorage.getItem(sourceCacheKey) || '', -1)
  }
  if (resultRef.value) {
    resultEditor = createAceEditor(resultRef.value, true)
  }

  editorReady.value = true
})

onBeforeUnmount(() => {
  xsltEditor?.destroy()
  sourceEditor?.destroy()
  resultEditor?.destroy()
})
</script>

<template>
  <div class="xslt-tool">
    <div class="tool-actions">
      <el-button type="primary" @click="convertXslt">渲染XML</el-button>
      <el-button type="warning" @click="formatXml">美化XML</el-button>
    </div>
    <EditorLoader v-model:ready="editorReady">
      <div class="editor-section">
        <div class="section-label">XSLT代码</div>
        <div ref="xsltRef" class="editor-panel" />
      </div>
      <div class="editor-row">
        <div class="editor-half">
          <div class="section-label">XML数据</div>
          <div ref="sourceRef" class="editor-panel" />
        </div>
        <div class="editor-half">
          <div class="section-label">转换结果</div>
          <div ref="resultRef" class="editor-panel" />
        </div>
      </div>
    </EditorLoader>
  </div>
</template>

<style scoped lang="scss">
.xslt-tool {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.editor-section {
  display: flex;
  flex-direction: column;
}

.editor-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  flex: 1;
  min-height: 0;
}

.editor-half {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.section-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

.editor-panel {
  height: 300px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  overflow: hidden;
}

.tool-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

@media (max-width: 768px) {
  .editor-row {
    grid-template-columns: 1fr;
  }
}
</style>
