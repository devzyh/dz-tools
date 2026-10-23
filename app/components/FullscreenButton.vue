<script setup lang="ts">
/** 全屏状态,v-model 双向绑定 */
const fullscreen = defineModel<boolean>('fullscreen', { default: false })
</script>

<template>
  <UButton
    color="neutral"
    variant="soft"
    :icon="fullscreen ? 'i-ep-scale-to-original' : 'i-ep-full-screen'"
    :title="fullscreen ? '退出全屏' : '进入全屏'"
    :aria-label="fullscreen ? '退出全屏' : '进入全屏'"
    @click="fullscreen = !fullscreen"
  />
</template>
