<script setup lang="ts">
const ready = defineModel<boolean>('ready', { default: false })

withDefaults(
  defineProps<{
    text?: string
  }>(),
  {
    text: '正在加载编辑器...',
  },
)
</script>

<template>
  <div class="editor-loader">
    <slot />
    <div v-if="!ready" class="editor-loading">
      <UIcon name="i-ep-loading" class="size-5 animate-spin" />
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
  background: var(--ui-bg-elevated);
  border: 1px solid var(--ui-border);
  border-radius: inherit;
  color: var(--ui-text-muted);
  font-size: 14px;
}
</style>
