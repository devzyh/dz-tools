<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, shallowRef } from 'vue'
import { MergeView } from '@codemirror/merge'
import { basicSetup } from 'codemirror'

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

onMounted(() => {
  if (!container.value) return
  mv.value = new MergeView({
    a: { doc: ORIGINAL, extensions: [basicSetup] },
    b: { doc: MODIFIED, extensions: [basicSetup] },
    parent: container.value,
    highlightChanges: true,
    revertControls: 'a-to-b',
    collapseUnchanged: { margin: 4, minSize: 4 },
  })
})

onBeforeUnmount(() => {
  mv.value?.destroy()
})
</script>

<template>
  <div class="diff-tool">
    <div ref="container" class="diff-merge" />
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
