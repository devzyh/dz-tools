<script setup lang="ts">
import { ref } from 'vue'
import he from 'he'

const { encode, decode } = he

const input = useCachedText('dz-tools-html-input', '')
const output = ref('')
const message = useMessage()

function convert() {
  if (!input.value.trim()) {
    message.warning('请输入需要处理的内容')
    return
  }
  output.value = encode(input.value)
}

function reverse() {
  if (!input.value.trim()) {
    message.warning('请输入需要处理的内容')
    return
  }
  output.value = decode(input.value)
}

function copy() {
  if (!output.value) {
    message.warning('没有可复制的内容')
    return
  }
  if (import.meta.client) {
    copyToClipboard(output.value)
  }
}
</script>

<template>
  <div class="tool-form">
    <UTextarea v-model="input" :rows="6" placeholder="请输入需要转义或反转义的内容" />
    <div class="tool-actions">
      <UButton color="success" @click="convert">转义HTML实体</UButton>
      <UButton color="warning" @click="reverse">反转义HTML实体</UButton>
      <UButton color="neutral" variant="outline" @click="copy">复制</UButton>
    </div>
    <UTextarea v-model="output" :rows="6" readonly placeholder="处理结果将在这里显示" />
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
