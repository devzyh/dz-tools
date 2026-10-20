<script setup lang="ts">
import { ref } from 'vue'

const input = useCachedText('dz-tools-base64-input', '')
const output = ref('')
const message = useMessage()

function encode() {
  try {
    output.value = btoa(unescape(encodeURIComponent(input.value)))
  } catch {
    message.error('编码失败')
  }
}

function decode() {
  try {
    output.value = decodeURIComponent(escape(atob(input.value)))
  } catch {
    message.error('解码失败：输入内容不是有效的 Base64')
  }
}

function copy() {
  copyToClipboard(output.value)
}
</script>

<template>
  <div class="tool-form">
    <UTextarea v-model="input" :rows="5" placeholder="请输入需要编码或解码的内容" />
    <div class="tool-actions">
      <UButton color="success" @click="encode">Base64编码</UButton>
      <UButton color="warning" @click="decode">Base64解码</UButton>
      <UButton color="neutral" variant="outline" @click="copy">复制</UButton>
    </div>
    <UTextarea v-model="output" :rows="5" readonly placeholder="处理结果将在这里显示" />
  </div>
</template>

<style scoped lang="scss">
.tool-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tool-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
