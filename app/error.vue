<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

useSeoMeta({
  title: `页面未找到 - DZ Tools`,
})
</script>

<template>
  <div class="error-page">
    <el-result
      icon="warning"
      :title="error.statusCode?.toString()"
      :sub-title="error.message || '页面不存在'"
    >
      <template #extra>
        <el-button type="primary" @click="clearError({ redirect: '/' })">返回首页</el-button>
      </template>
    </el-result>
  </div>
</template>
