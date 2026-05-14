<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const { t } = useI18n()

const input = ref('')
const output = ref('')
const startSymbol = ref('[')
const endSymbol = ref(']')
const enableDedup = ref(true)
const sortOrder = ref<'asc' | 'desc' | 'none'>('asc')

function extract() {
  if (!input.value.trim()) {
    ElMessage.warning(t('tools.extract-text.pleaseInput'))
    return
  }
  if (!startSymbol.value || !endSymbol.value) {
    ElMessage.warning(t('tools.extract-text.emptyDelimiter'))
    return
  }

  const start = startSymbol.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const end = endSymbol.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`${start}([^${end}]*)${end}`, 'g')
  const matches = input.value.match(regex)

  if (!matches || matches.length === 0) {
    ElMessage.warning(t('tools.extract-text.notFound', { start: startSymbol.value, end: endSymbol.value }))
    output.value = ''
    return
  }

  let results = matches.map(m => m.slice(startSymbol.value.length, m.length - endSymbol.value.length))

  if (enableDedup.value) {
    results = [...new Set(results)]
  }

  if (sortOrder.value === 'asc') {
    results.sort((a, b) => a.localeCompare(b))
  } else if (sortOrder.value === 'desc') {
    results.sort((a, b) => b.localeCompare(a))
  }

  output.value = results.join('\n')
  ElMessage.success(t('tools.extract-text.extracted', { count: matches.length }))
}

function copy() {
  if (!output.value) {
    ElMessage.warning(t('tools.extract-text.noContent'))
    return
  }
  navigator.clipboard.writeText(output.value)
  ElMessage.success(t('tools.extract-text.copied'))
}
</script>

<template>
  <div class="extract-text-tool">
    <div class="config-card">
      <div class="config-row">
        <span class="config-label">{{ $t('tools.extract-text.delimiters') }}</span>
        <div class="symbol-inputs">
          <el-input v-model="startSymbol" :placeholder="$t('tools.extract-text.prefix')" style="width: 80px" />
          <span class="symbol-sep">…</span>
          <el-input v-model="endSymbol" :placeholder="$t('tools.extract-text.suffix')" style="width: 80px" />
        </div>
      </div>
      <div class="config-row">
        <span class="config-label">{{ $t('tools.extract-text.outputOptions') }}</span>
        <div class="option-checks">
          <el-checkbox v-model="enableDedup">{{ $t('tools.extract-text.dedup') }}</el-checkbox>
          <el-radio-group v-model="sortOrder">
            <el-radio-button value="asc">{{ $t('tools.extract-text.asc') }}</el-radio-button>
            <el-radio-button value="desc">{{ $t('tools.extract-text.desc') }}</el-radio-button>
            <el-radio-button value="none">{{ $t('tools.extract-text.noSort') }}</el-radio-button>
          </el-radio-group>
        </div>
      </div>
    </div>

    <el-input
      v-model="input"
      type="textarea"
      :rows="10"
      :placeholder="$t('tools.extract-text.inputPlaceholder')"
    />

    <div class="action-bar">
      <el-button type="primary" @click="extract">{{ $t('tools.extract-text.extract') }}</el-button>
      <el-button @click="copy">{{ $t('tools.extract-text.copy') }}</el-button>
    </div>

    <div class="result-card">
      <div class="result-header">
        <span class="config-label">{{ $t('tools.extract-text.result') }}</span>
        <span v-if="output" class="result-count">{{ $t('tools.extract-text.items', { count: output.split('\n').length }) }}</span>
      </div>
      <el-input
        v-model="output"
        type="textarea"
        :autosize="{ minRows: 8, maxRows: 20 }"
        readonly
        :placeholder="$t('tools.extract-text.resultPlaceholder')"
        class="result-textarea"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.extract-text-tool {
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

.option-checks {
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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

.result-count {
  font-size: 12px;
  color: #909399;
  background: #f0f2f5;
  padding: 2px 10px;
  border-radius: 10px;
}

.result-textarea {
  :deep(.el-textarea__inner) {
    font-family: 'Courier New', Courier, monospace;
    font-size: 14px;
    line-height: 1.8;
    word-break: break-all;
  }
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

  .option-checks {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
