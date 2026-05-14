<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const input = ref('')
const output = ref('')

function encode() {
  try {
    output.value = btoa(unescape(encodeURIComponent(input.value)))
  } catch {
    ElMessage.error('编码失败')
  }
}

function decode() {
  try {
    output.value = decodeURIComponent(escape(atob(input.value)))
  } catch {
    ElMessage.error('解码失败，输入内容不是有效的 Base64')
  }
}

function copy() {
  navigator.clipboard.writeText(output.value)
  ElMessage.success('已复制')
}
</script>

<template>
  <div class="tool-form">
    <el-input
      v-model="input"
      type="textarea"
      :rows="5"
      :placeholder="'请输入需要编码或解码的内容'"
    />
    <div class="tool-actions">
      <el-button type="success" @click="encode">Base64编码</el-button>
      <el-button type="warning" @click="decode">Base64解码</el-button>
      <el-button @click="copy">复制</el-button>
    </div>
    <el-input
      v-model="output"
      type="textarea"
      :rows="5"
      readonly
      :placeholder="'处理结果将在这里显示'"
    />
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
