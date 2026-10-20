<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{ error: NuxtError }>()

useSeoMeta({
  title: `页面未找到 - DZ Tools`,
})
</script>

<template>
  <UError
    :error="{ statusCode: error.statusCode ?? 500, message: error.message || '页面不存在' }"
    :clear="{ label: '返回首页', color: 'primary' }"
  />
</template>
