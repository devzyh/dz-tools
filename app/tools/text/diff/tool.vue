<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, shallowRef } from 'vue'

let MergeViewClass: any
let basicSetup: any

const ORIGINAL = `const greet = (name) => {
  return "Hello, " + name;
}

const farewell = (name) => {
  return "Goodbye, " + name;
}

console.log(greet("World"));
console.log(farewell("World"));`

const MODIFIED = `const greet = (name) => {
  return \`Hello, \${name}!\`;
}

const farewell = (name, time) => {
  return \`Goodbye, \${name}. See you \${time}!\`;
}

console.log(greet("World"));
console.log(farewell("World", "tomorrow"));`

const container = ref<HTMLDivElement>()
const mv = shallowRef<MergeView>()
const editorReady = ref(false)

onMounted(async () => {
  if (!import.meta.client || !container.value) return
  const mergeMod = await import('@codemirror/merge')
  const cmMod = await import('codemirror')
  MergeViewClass = mergeMod.MergeView
  basicSetup = cmMod.basicSetup
  mv.value = new MergeViewClass({
    a: { doc: ORIGINAL, extensions: [basicSetup] },
    b: { doc: MODIFIED, extensions: [basicSetup] },
    parent: container.value,
    highlightChanges: true,
    revertControls: 'a-to-b',
    collapseUnchanged: { margin: 4, minSize: 4 },
  })
  editorReady.value = true
})

onBeforeUnmount(() => {
  mv.value?.destroy()
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
  height: calc(100vh - 100px);
  min-height: 400px;
}

.diff-merge {
  height: 100%;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  overflow: hidden;

  :deep(.cm-editor) {
    font-size: 14px;
    font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  }

  :deep(.cm-merge-view) {
    height: 100%;
  }

  :deep(.cm-merge-pane) {
    height: 100%;
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
</style>
