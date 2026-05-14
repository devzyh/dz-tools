<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const { t } = useI18n()

const input = ref('')
const output = ref('')
const wrapStart = ref('"')
const wrapEnd = ref('"')
const joinSymbol = ref(',')

function join() {
  if (!input.value.trim()) {
    ElMessage.warning(t('tools.join-text.pleaseInput'))
    return
  }
  const lines = input.value.split('\n').map(l => l.trim()).filter(Boolean)
  if (lines.length === 0) {
    ElMessage.warning(t('tools.join-text.noValidContent'))
    return
  }
  output.value = lines.map(l => `${wrapStart.value}${l}${wrapEnd.value}`).join(joinSymbol.value)
  ElMessage.success(t('tools.join-text.joined', { count: lines.length }))
}

function copy() {
  if (!output.value) {
    ElMessage.warning(t('tools.join-text.noContent'))
    return
  }
  navigator.clipboard.writeText(output.value)
  ElMessage.success(t('tools.join-text.copied'))
}
</script>

<template>
  <div class="join-text-tool">
    <div class="config-card">
      <div class="config-row">
        <span class="config-label">{{ $t('tools.join-text.delimiters') }}</span>
        <div class="symbol-inputs">
          <el-input v-model="wrapStart" :placeholder="$t('tools.join-text.prefix')" style="width: 80px" />
          <span class="symbol-sep">…</span>
          <el-input v-model="wrapEnd" :placeholder="$t('tools.join-text.suffix')" style="width: 80px" />
        </div>
      </div>
      <div class="config-row">
        <span class="config-label">{{ $t('tools.join-text.connector') }}</span>
        <el-input v-model="joinSymbol" style="width: 120px" />
      </div>
    </div>

    <div class="action-bar">
      <el-button type="primary" @click="join">{{ $t('tools.join-text.join') }}</el-button>
      <el-button @click="copy">{{ $t('tools.join-text.copy') }}</el-button>
    </div>

    <el-input
      v-model="input"
      type="textarea"
      :rows="10"
      :placeholder="$t('tools.join-text.inputPlaceholder')"
    />

    <div class="result-card">
      <div class="result-header">
        <span class="config-label">{{ $t('tools.join-text.result') }}</span>
      </div>
      <el-input
        v-model="output"
        type="textarea"
        :autosize="{ minRows: 4, maxRows: 20 }"
        readonly
        :placeholder="$t('tools.join-text.resultPlaceholder')"
        class="result-textarea"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.join-text-tool {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.config-card {
  background: var(--el-bg-color-page);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.config-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.config-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  white-space: nowrap;
  line-height: 32px;
}

.symbol-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.symbol-sep {
  color: #909399;
  font-size: 16px;
}

.result-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.result-textarea {
  :deep(.el-textarea__inner) {
    font-family: 'Courier New', Courier, monospace;
    font-size: 14px;
    line-height: 1.8;
    word-break: break-all;
  }
}

.action-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

@media (max-width: 768px) {
  .config-card {
    padding: 14px;
    gap: 14px;
  }

  .config-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
