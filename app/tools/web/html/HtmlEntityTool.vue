<script setup lang="ts">
import { ref } from 'vue'
import he from 'he'
import { ElMessage } from 'element-plus'

const { t } = useI18n()
const { encode, decode } = he

const input = ref('')
const output = ref('')

function convert() {
  if (!input.value.trim()) {
    ElMessage.warning(t('tools.html.pleaseInput'))
    return
  }
  output.value = encode(input.value)
}

function reverse() {
  if (!input.value.trim()) {
    ElMessage.warning(t('tools.html.pleaseInput'))
    return
  }
  output.value = decode(input.value)
}

function copy() {
  if (!output.value) {
    ElMessage.warning(t('tools.html.noContent'))
    return
  }
  if (import.meta.client) {
    navigator.clipboard.writeText(output.value)
  }
  ElMessage.success(t('tools.html.copied'))
}
</script>

<template>
  <div class="tool-form">
    <el-input
      v-model="input"
      type="textarea"
      :rows="6"
      :placeholder="$t('tools.html.inputPlaceholder')"
    />
    <div class="tool-actions">
      <el-button type="success" @click="convert">{{ $t('tools.html.escape') }}</el-button>
      <el-button type="warning" @click="reverse">{{ $t('tools.html.unescape') }}</el-button>
      <el-button @click="copy">{{ $t('tools.html.copy') }}</el-button>
    </div>
    <el-input
      v-model="output"
      type="textarea"
      :rows="6"
      readonly
      :placeholder="$t('tools.html.resultPlaceholder')"
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
