<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const { t } = useI18n()

const input = ref('')
const output = ref('')

function encode() {
  try {
    output.value = btoa(unescape(encodeURIComponent(input.value)))
  } catch {
    ElMessage.error(t('tools.base64.encodeError'))
  }
}

function decode() {
  try {
    output.value = decodeURIComponent(escape(atob(input.value)))
  } catch {
    ElMessage.error(t('tools.base64.decodeError'))
  }
}

function copy() {
  navigator.clipboard.writeText(output.value)
  ElMessage.success(t('tools.base64.copied'))
}
</script>

<template>
  <div class="tool-form">
    <el-input
      v-model="input"
      type="textarea"
      :rows="5"
      :placeholder="$t('tools.base64.inputPlaceholder')"
    />
    <div class="tool-actions">
      <el-button type="success" @click="encode">{{ $t('tools.base64.encode') }}</el-button>
      <el-button type="warning" @click="decode">{{ $t('tools.base64.decode') }}</el-button>
      <el-button @click="copy">{{ $t('tools.base64.copy') }}</el-button>
    </div>
    <el-input
      v-model="output"
      type="textarea"
      :rows="5"
      readonly
      :placeholder="$t('tools.base64.resultPlaceholder')"
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
