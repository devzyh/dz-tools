<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import ace from 'ace-builds'
import 'ace-builds/src-noconflict/mode-xml'
import 'ace-builds/src-noconflict/theme-sqlserver'

const { t } = useI18n()
const xsltRef = ref<HTMLElement>()
const sourceRef = ref<HTMLElement>()
const resultRef = ref<HTMLElement>()

const xsltCacheKey = 'dz-tools-xslt'
const sourceCacheKey = 'dz-tools-xslt-source'

let xsltEditor: ace.Ace.Editor | null = null
let sourceEditor: ace.Ace.Editor | null = null
let resultEditor: ace.Ace.Editor | null = null

function createEditor(el: HTMLElement, readOnly = false): ace.Ace.Editor {
  const editor = ace.edit(el)
  editor.setTheme('ace/theme/sqlserver')
  editor.setFontSize('14px')
  editor.setOption('wrap', 'free')
  editor.setShowPrintMargin(false)
  editor.session.setMode('ace/mode/xml')
  if (readOnly) editor.setReadOnly(true)
  return editor
}

function convertXslt() {
  if (!xsltEditor || !sourceEditor || !resultEditor) return
  try {
    resultEditor.setValue(xsltTransform(xsltEditor.getValue(), sourceEditor.getValue()))
  } catch (err) {
    resultEditor.setValue(t('tools.xslt.errorMsg') + (err as Error).message)
  }
}

function xsltTransform(xslt: string, source: string): string {
  const parser = new DOMParser()

  const xmlDoc = parser.parseFromString(source, 'text/xml')
  const xmlError = xmlDoc.querySelector('parsererror')
  if (xmlError) throw new Error(t('tools.xslt.xmlParseError') + xmlError.textContent)

  const xsltDoc = parser.parseFromString(xslt, 'text/xml')
  const xsltError = xsltDoc.querySelector('parsererror')
  if (xsltError) throw new Error(t('tools.xslt.xsltParseError') + xsltError.textContent)

  const processor = new XSLTProcessor()
  processor.importStylesheet(xsltDoc)
  const resultDoc = processor.transformToDocument(xmlDoc)

  return resultDoc.body.querySelector('pre')?.innerHTML
    ?? new XMLSerializer().serializeToString(resultDoc)
}

function formatXml() {
  if (!sourceEditor) return
  const xml = sourceEditor.getValue()
  const formatted = formatXmlString(xml)
  sourceEditor.setValue(formatted)
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

onMounted(() => {
  if (xsltRef.value) {
    xsltEditor = createEditor(xsltRef.value)
    xsltEditor.session.setValue(localStorage.getItem(xsltCacheKey) || '')
    xsltEditor.session.on('change', () => {
      localStorage.setItem(xsltCacheKey, xsltEditor!.getValue())
    })
  }
  if (sourceRef.value) {
    sourceEditor = createEditor(sourceRef.value)
    sourceEditor.session.setValue(localStorage.getItem(sourceCacheKey) || '')
    sourceEditor.session.on('change', () => {
      localStorage.setItem(sourceCacheKey, sourceEditor!.getValue())
    })
  }
  if (resultRef.value) {
    resultEditor = createEditor(resultRef.value, true)
  }
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
      <el-button type="primary" @click="convertXslt">{{ $t('tools.xslt.render') }}</el-button>
      <el-button type="warning" @click="formatXml">{{ $t('tools.xslt.format') }}</el-button>
    </div>
    <div class="editor-section">
      <div class="section-label">{{ $t('tools.xslt.xsltCode') }}</div>
      <div ref="xsltRef" class="editor-panel" />
    </div>
    <div class="editor-row">
      <div class="editor-half">
        <div class="section-label">{{ $t('tools.xslt.xmlData') }}</div>
        <div ref="sourceRef" class="editor-panel" />
      </div>
      <div class="editor-half">
        <div class="section-label">{{ $t('tools.xslt.result') }}</div>
        <div ref="resultRef" class="editor-panel" />
      </div>
    </div>
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
