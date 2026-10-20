<script setup lang="ts">
import { ref } from 'vue'

const input = useCachedText('dz-tools-extract-text-input', '')
const output = ref('')
const startSymbol = useCachedText('dz-tools-extract-text-start', '[')
const endSymbol = useCachedText('dz-tools-extract-text-end', ']')
const enableDedup = useCachedRef('dz-tools-extract-text-dedup', true)
const sortOrder = useCachedRef<'asc' | 'desc' | 'none'>('dz-tools-extract-text-sort', 'asc')
const message = useMessage()

const sortOrderItems = [
  { label: '升序', value: 'asc' },
  { label: '降序', value: 'desc' },
  { label: '不排序', value: 'none' },
]

function extract() {
  if (!input.value.trim()) {
    message.warning('请输入文本内容')
    return
  }
  if (!startSymbol.value || !endSymbol.value) {
    message.warning('起止符号不能为空')
    return
  }

  const start = startSymbol.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const end = endSymbol.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`${start}([^${end}]*)${end}`, 'g')
  const matches = input.value.match(regex)

  if (!matches || matches.length === 0) {
    message.warning(`未找到 ${startSymbol.value}...${endSymbol.value} 包含的内容`)
    output.value = ''
    return
  }

  let results = matches.map((m) =>
    m.slice(startSymbol.value.length, m.length - endSymbol.value.length),
  )

  if (enableDedup.value) {
    results = [...new Set(results)]
  }

  if (sortOrder.value === 'asc') {
    results.sort((a, b) => a.localeCompare(b))
  } else if (sortOrder.value === 'desc') {
    results.sort((a, b) => b.localeCompare(a))
  }

  output.value = results.join('\n')
  message.success(`共提取 ${matches.length} 项`)
}

function copy() {
  if (!output.value) {
    message.warning('没有可复制的内容')
    return
  }
  copyToClipboard(output.value)
}
</script>

<template>
  <div class="extract-text-tool">
    <div class="config-card">
      <div class="config-row">
        <span class="config-label">前缀&后缀</span>
        <div class="symbol-inputs">
          <UInput v-model="startSymbol" placeholder="前缀" class="w-20" />
          <span class="symbol-sep">…</span>
          <UInput v-model="endSymbol" placeholder="后缀" class="w-20" />
        </div>
      </div>
      <div class="config-row">
        <span class="config-label">输出选项</span>
        <div class="option-checks">
          <UCheckbox v-model="enableDedup" label="去重" />
          <URadioGroup
            v-model="sortOrder"
            variant="table"
            orientation="horizontal"
            :items="sortOrderItems"
          />
        </div>
      </div>
    </div>

    <UTextarea v-model="input" :rows="10" placeholder="请粘贴需要提取内容的文本" />

    <div class="action-bar">
      <UButton @click="extract">提取</UButton>
      <UButton color="neutral" variant="outline" @click="copy">复制</UButton>
    </div>

    <div class="result-card">
      <div class="result-header">
        <span class="config-label">提取结果</span>
        <span v-if="output" class="result-count">{{ output.split('\n').length }} 条</span>
      </div>
      <UTextarea
        v-model="output"
        :rows="8"
        autoresize
        readonly
        placeholder="提取结果将在这里显示"
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
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
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
  :deep(textarea) {
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
