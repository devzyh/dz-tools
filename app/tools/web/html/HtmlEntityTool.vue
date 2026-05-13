<script setup lang="ts">
import { ref } from 'vue'
import { encode, decode } from 'he'
import { ElMessage } from 'element-plus'

const input = ref('')
const output = ref('')

function convert() {
  if (!input.value.trim()) {
    ElMessage.warning('请输入需要处理的内容')
    return
  }
  output.value = encode(input.value)
}

function reverse() {
  if (!input.value.trim()) {
    ElMessage.warning('请输入需要处理的内容')
    return
  }
  output.value = decode(input.value)
}

function copy() {
  if (!output.value) {
    ElMessage.warning('没有可复制的内容')
    return
  }
  navigator.clipboard.writeText(output.value)
  ElMessage.success('已复制')
}
</script>

<template>
  <div class="tool-form">
    <el-input
      v-model="input"
      type="textarea"
      :rows="6"
      placeholder="请输入需要转义或反转义的内容"
    />
    <div class="tool-actions">
      <el-button type="success" @click="convert">转义HTML实体</el-button>
      <el-button type="warning" @click="reverse">反转义HTML实体</el-button>
      <el-button @click="copy">复制</el-button>
    </div>
    <el-input
      v-model="output"
      type="textarea"
      :rows="6"
      readonly
      placeholder="处理结果将在这里显示"
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
