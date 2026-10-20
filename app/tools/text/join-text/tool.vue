<script setup lang="ts">
import { ref } from 'vue'

const input = useCachedText('dz-tools-join-text-input', '')
const output = ref('')
const wrapStart = useCachedText('dz-tools-join-text-wrap-start', '"')
const wrapEnd = useCachedText('dz-tools-join-text-wrap-end', '"')
const joinSymbol = useCachedText('dz-tools-join-text-join', ',')
const message = useMessage()

function join() {
  if (!input.value.trim()) {
    message.warning('请输入文本内容')
    return
  }
  const lines = input.value
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  if (lines.length === 0) {
    message.warning('没有有效内容')
    return
  }
  output.value = lines.map((l) => `${wrapStart.value}${l}${wrapEnd.value}`).join(joinSymbol.value)
  message.success(`已连接 ${lines.length} 项`)
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
  <div class="join-text-tool">
    <div class="config-card">
      <div class="config-row">
        <span class="config-label">前缀&后缀</span>
        <div class="symbol-inputs">
          <UInput v-model="wrapStart" placeholder="前缀" class="w-20" />
          <span class="symbol-sep">…</span>
          <UInput v-model="wrapEnd" placeholder="后缀" class="w-20" />
        </div>
      </div>
      <div class="config-row">
        <span class="config-label">连接符号</span>
        <UInput v-model="joinSymbol" class="w-30" />
      </div>
    </div>

    <div class="action-bar">
      <UButton @click="join">连接</UButton>
      <UButton color="neutral" variant="outline" @click="copy">复制</UButton>
    </div>

    <UTextarea v-model="input" :rows="10" placeholder="请输入多行文本，每行将作为一个元素" />

    <div class="result-card">
      <div class="result-header">
        <span class="config-label">连接结果</span>
      </div>
      <UTextarea
        v-model="output"
        :rows="4"
        autoresize
        readonly
        placeholder="连接结果将在这里显示"
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
  :deep(textarea) {
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
