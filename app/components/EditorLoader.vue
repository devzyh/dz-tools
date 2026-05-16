<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue'

const ready = defineModel<boolean>('ready', { default: false })

withDefaults(defineProps<{
  text?: string
}>(), {
  text: '正在加载编辑器...',
})
</script>

<template>
  <div class="editor-loader">
    <slot />
    <div v-if="!ready" class="editor-loading">
      <el-icon class="is-loading" :size="20"><Loading /></el-icon>
      <span>{{ text }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.editor-loader {
  position: relative;
  height: 100%;
  min-height: 200px;
}

.editor-loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: inherit;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}
</style>
