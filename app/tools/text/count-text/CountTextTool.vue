<script setup lang="ts">
import { ref, computed } from 'vue'

const input = ref('')

const cnPunctuation = '，。、；：？！""‘’【】《》（）—…～·'
const enPunctuation = ',.;:?!\'"()[]{}<>'

const totalChars = computed(() => input.value.length)

const digitCount = computed(() => {
  let n = 0
  for (const c of input.value) if (/\d/.test(c)) n++
  return n
})

const cnCharCount = computed(() => {
  let n = 0
  for (const c of input.value) if (/[一-鿿]/.test(c)) n++
  return n
})

const cnPuncCount = computed(() => {
  let n = 0
  for (const c of input.value) if (cnPunctuation.includes(c)) n++
  return n
})

const enCharCount = computed(() => {
  let n = 0
  for (const c of input.value) if (/[a-zA-Z]/.test(c)) n++
  return n
})

const enPuncCount = computed(() => {
  let n = 0
  for (const c of input.value) if (enPunctuation.includes(c)) n++
  return n
})

const lineCount = computed(() => {
  if (!input.value) return 0
  return input.value.split('\n').length
})

const paragraphCount = computed(() => {
  if (!input.value.trim()) return 0
  return input.value.split(/\n\s*\n/).filter(p => p.trim()).length
})
</script>

<template>
  <div class="count-text-tool">
    <el-input
      v-model="input"
      type="textarea"
      :rows="16"
      placeholder="请输入或粘贴文本，实时统计"
    />

    <div class="stats-card">
      <div class="stat-row">
        <span class="stat-label">字符总数</span>
        <span class="stat-value">{{ totalChars }} 个</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">数字字符总数</span>
        <span class="stat-value">{{ digitCount }} 个</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">中文字符总数</span>
        <span class="stat-value">{{ cnCharCount }} 个</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">中文标点总数</span>
        <span class="stat-value">{{ cnPuncCount }} 个</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">英文字符总数</span>
        <span class="stat-value">{{ enCharCount }} 个</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">英文标点总数</span>
        <span class="stat-value">{{ enPuncCount }} 个</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">总行数</span>
        <span class="stat-value">{{ lineCount }} 行</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">段落数</span>
        <span class="stat-value">{{ paragraphCount }} 个</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.count-text-tool {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.stats-card {
  background: var(--el-bg-color-page);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px 24px;
}

.stat-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-radius: 6px;
  background: var(--el-bg-color);
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.stat-value {
  font-size: 14px;
  color: #303133;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

@media (max-width: 768px) {
  .stats-card {
    grid-template-columns: 1fr;
    padding: 14px;
    gap: 8px;
  }
}
</style>
