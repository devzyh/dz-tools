<script setup lang="ts">
import { ref, computed } from 'vue'
import { sortLines, type SortDimension, type SortDirection } from './sort'

const input = ref('')
const output = ref('')
const message = useMessage()

const dimension = ref<SortDimension>('name')
const direction = ref<SortDirection>('asc')
const trim = ref(true)
const removeEmpty = ref(true)
const unique = ref(false)
const ignoreCase = ref(false)

const dimensions: { label: string; value: SortDimension }[] = [
  { label: '名称', value: 'name' },
  { label: '数值', value: 'number' },
  { label: '长度', value: 'length' },
  { label: '自然序', value: 'natural' },
  { label: '随机', value: 'random' },
]

const directionItems = [
  { label: '升序', value: 'asc' },
  { label: '降序', value: 'desc' },
]

const isRandom = computed(() => dimension.value === 'random')

function sort() {
  if (!input.value.trim()) {
    message.warning('请输入文本内容')
    return
  }
  const result = sortLines(input.value, {
    dimension: dimension.value,
    direction: direction.value,
    trim: trim.value,
    removeEmpty: removeEmpty.value,
    unique: unique.value,
    ignoreCase: ignoreCase.value,
  })
  output.value = result.join('\n')
  message.success(`已排序 ${result.length} 项`)
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
  <div class="sort-text-tool">
    <div class="config-card">
      <div class="config-row">
        <span class="config-label">排序维度</span>
        <USelect v-model="dimension" :items="dimensions" class="w-35" />
        <span class="config-label">方向</span>
        <URadioGroup v-model="direction" :disabled="isRandom" :items="directionItems" />
      </div>
      <div class="config-row">
        <UCheckbox v-model="trim" label="去除首尾空白" />
        <UCheckbox v-model="removeEmpty" label="去除空行" />
        <UCheckbox v-model="unique" label="去重" />
        <UCheckbox v-model="ignoreCase" label="忽略大小写" />
      </div>
    </div>

    <UTextarea v-model="input" :rows="10" placeholder="请输入多行文本，每行一个元素" />

    <div class="action-bar">
      <UButton @click="sort">排序</UButton>
      <UButton color="neutral" variant="outline" @click="copy">复制</UButton>
    </div>

    <div class="result-card">
      <div class="result-header">
        <span class="config-label">排序结果</span>
      </div>
      <UTextarea
        v-model="output"
        :rows="4"
        autoresize
        readonly
        placeholder="排序结果将在这里显示"
        class="result-textarea"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.sort-text-tool {
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
  justify-content: flex-end;
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

  .action-bar {
    justify-content: flex-start;
  }
}
</style>
