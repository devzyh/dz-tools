<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const ORIGINAL_KEY = 'dz-tools-diff-original'
const MODIFIED_KEY = 'dz-tools-diff-modified'

const SAMPLE_ORIGINAL = `const greet = (name) => {
  return "Hello, " + name;
}

const farewell = (name) => {
  return "Goodbye, " + name;
}

console.log(greet("World"));
console.log(farewell("World"));`

const SAMPLE_MODIFIED = `const greet = (name) => {
  return \`Hello, \${name}!\`;
}

const farewell = (name, time) => {
  return \`Goodbye, \${name}. See you \${time}!\`;
}

console.log(greet("World"));
console.log(farewell("World", "tomorrow"));`

const container = ref<HTMLDivElement>()
const editorReady = ref(false)
let MergeViewClass: any
let basicSetup: any
let EditorViewModule: any
let mv: any = null
let debounceTimer: ReturnType<typeof setTimeout> | null = null

function debounceRebuild() {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    rebuildMergeView()
  }, 300)
}

function getPanelContent(panel: 'a' | 'b'): string {
  if (!mv) return ''
  return mv[panel].state.doc.toString()
}

function rebuildMergeView() {
  if (!container.value || !MergeViewClass || !basicSetup || !EditorViewModule) return
  const originalDoc = getPanelContent('a')
  const modifiedDoc = getPanelContent('b')
  mv?.destroy()
  mv = new MergeViewClass({
    a: { doc: originalDoc, extensions: [basicSetup, EditorViewModule.updateListener.of(() => debounceRebuild())] },
    b: { doc: modifiedDoc, extensions: [basicSetup, EditorViewModule.updateListener.of(() => debounceRebuild())] },
    parent: container.value,
    highlightChanges: true,
    revertControls: 'a-to-b',
    collapseUnchanged: { margin: 4, minSize: 4 },
  })
}

onMounted(async () => {
  if (!import.meta.client || !container.value) return
  const [{ MergeView }, { basicSetup: bs }, { EditorView }] = await Promise.all([
    import('@codemirror/merge'),
    import('codemirror'),
    import('@codemirror/view'),
  ])
  MergeViewClass = MergeView
  basicSetup = bs
  EditorViewModule = EditorView
  const originalDoc = localStorage.getItem(ORIGINAL_KEY) || SAMPLE_ORIGINAL
  const modifiedDoc = localStorage.getItem(MODIFIED_KEY) || SAMPLE_MODIFIED
  mv = new MergeViewClass({
    a: { doc: originalDoc, extensions: [basicSetup, EditorView.updateListener.of(() => debounceRebuild())] },
    b: { doc: modifiedDoc, extensions: [basicSetup, EditorView.updateListener.of(() => debounceRebuild())] },
    parent: container.value,
    highlightChanges: true,
    revertControls: 'a-to-b',
    collapseUnchanged: { margin: 4, minSize: 4 },
  })
  editorReady.value = true
})

onBeforeUnmount(() => {
  if (debounceTimer) clearTimeout(debounceTimer)
  if (mv) {
    const aContent = getPanelContent('a')
    const bContent = getPanelContent('b')
    localStorage.setItem(ORIGINAL_KEY, aContent)
    localStorage.setItem(MODIFIED_KEY, bContent)
    mv.destroy()
  }
})
</script>

<template>
  <div class="diff-tool">
    <EditorLoader v-model:ready="editorReady">
      <div ref="container" class="diff-merge" />
    </EditorLoader>
  </div>
</template>

<style scoped lang="scss">
.diff-tool {
  height: 79vh;
  min-height: 400px;
}

.diff-merge {
  height: 100%;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  overflow: hidden;

  :deep(.cm-mergeView) {
    height: 100%;
  }

  :deep(.cm-editor) {
    font-size: 14px;
    font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  }

  :deep(.cm-merge-gap) {
    width: 48px;
  }

  :deep(.cm-merge-added) {
    background-color: var(--el-color-success-light-9) !important;
  }

  :deep(.cm-merge-removed) {
    background-color: var(--el-color-danger-light-9) !important;
  }

  :deep(.cm-merge-chunk-start.cm-merge-added) {
    border-top-color: var(--el-color-success) !important;
  }

  :deep(.cm-merge-chunk-end.cm-merge-added) {
    border-bottom-color: var(--el-color-success) !important;
  }

  :deep(.cm-merge-chunk-start.cm-merge-removed) {
    border-top-color: var(--el-color-danger) !important;
  }

  :deep(.cm-merge-chunk-end.cm-merge-removed) {
    border-bottom-color: var(--el-color-danger) !important;
  }
}

@media (max-width: 768px) {
  .diff-tool {
    height: auto;
    min-height: 500px;
  }
}
</style>
