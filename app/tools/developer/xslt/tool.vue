<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const xsltRef = ref<HTMLElement>()
const sourceRef = ref<HTMLElement>()
const resultRef = ref<HTMLElement>()
const editorReady = ref(false)

const xsltCacheKey = 'dz-tools-xslt'
const sourceCacheKey = 'dz-tools-xslt-source'

let xsltView: any = null
let sourceView: any = null
let resultView: any = null

function getEditorContent(view: any): string {
  return view.state.doc.toString()
}

function setEditorContent(view: any, content: string) {
  view.dispatch({
    changes: { from: 0, to: view.state.doc.length, insert: content },
  })
}

function convertXslt() {
  if (!xsltView || !sourceView || !resultView) return
  try {
    setEditorContent(resultView, xsltTransform(getEditorContent(xsltView), getEditorContent(sourceView)))
  } catch (err) {
    setEditorContent(resultView, '错误信息：' + (err as Error).message)
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
  if (!sourceView) return
  const xml = getEditorContent(sourceView)
  setEditorContent(sourceView, formatXmlString(xml))
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

async function createEditor(el: HTMLElement, readOnly = false, onChange?: (value: string) => void) {
  const { EditorView, keymap, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, highlightActiveLine } = await import('@codemirror/view')
  const { EditorState } = await import('@codemirror/state')
  const { defaultKeymap, indentWithTab, history } = await import('@codemirror/commands')
  const { xml } = await import('@codemirror/lang-xml')
  const { oneDark } = await import('@codemirror/theme-one-dark')
  const { defaultHighlightStyle, syntaxHighlighting, indentOnInput, bracketMatching } = await import('@codemirror/language')

  return new EditorView({
    state: EditorState.create({
      doc: '',
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        history(),
        drawSelection(),
        EditorState.allowMultipleSelections.of(true),
        indentOnInput(),
        bracketMatching(),
        highlightActiveLine(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        keymap.of([indentWithTab, ...defaultKeymap]),
        xml(),
        oneDark,
        EditorView.lineWrapping,
        ...(onChange ? [EditorView.updateListener.of((update) => {
          if (update.docChanged) onChange(getEditorContent(update.view))
        })] : []),
        ...(readOnly ? [EditorState.readOnly.of(true)] : []),
      ],
    }),
    parent: el,
  })
}

onMounted(async () => {
  if (!import.meta.client) return
  if (xsltRef.value) {
    xsltView = await createEditor(xsltRef.value, false, (val) => {
      localStorage.setItem(xsltCacheKey, val)
    })
    setEditorContent(xsltView, localStorage.getItem(xsltCacheKey) || '')
  }
  if (sourceRef.value) {
    sourceView = await createEditor(sourceRef.value, false, (val) => {
      localStorage.setItem(sourceCacheKey, val)
    })
    setEditorContent(sourceView, localStorage.getItem(sourceCacheKey) || '')
  }
  if (resultRef.value) {
    resultView = await createEditor(resultRef.value, true)
  }
  editorReady.value = true
})

onBeforeUnmount(() => {
  xsltView?.destroy()
  sourceView?.destroy()
  resultView?.destroy()
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

  :deep(.cm-editor) {
    height: 100%;
    font-size: 14px;
    font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  }

  :deep(.cm-scroller) {
    overflow: auto;
    font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  }
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
