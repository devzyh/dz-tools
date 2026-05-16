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
let mv: InstanceType<typeof MergeView> | null = null

onMounted(async () => {
  if (!import.meta.client || !container.value) return
  const [{ MergeView }, { basicSetup }] = await Promise.all([
    import('@codemirror/merge'),
    import('codemirror'),
  ])
  mv = new MergeView({
    a: { doc: localStorage.getItem(ORIGINAL_KEY) || SAMPLE_ORIGINAL, extensions: [basicSetup] },
    b: { doc: localStorage.getItem(MODIFIED_KEY) || SAMPLE_MODIFIED, extensions: [basicSetup] },
    parent: container.value,
    highlightChanges: true,
    revertControls: 'a-to-b',
    collapseUnchanged: { margin: 4, minSize: 4 },
  })
  editorReady.value = true
})

onBeforeUnmount(() => {
  if (mv) {
    localStorage.setItem(ORIGINAL_KEY, mv.a.state.doc.toString())
    localStorage.setItem(MODIFIED_KEY, mv.b.state.doc.toString())
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
