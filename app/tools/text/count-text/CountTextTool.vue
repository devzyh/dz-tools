<script setup lang="ts">
import { ref, computed } from 'vue'

const { t } = useI18n()

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
      :placeholder="$t('tools.count-text.inputPlaceholder')"
    />

    <div class="stats-card">
      <div class="stat-row">
        <span class="stat-label">{{ $t('tools.count-text.totalChars') }}</span>
        <span class="stat-value">{{ $t('tools.count-text.unit', { count: totalChars }) }}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">{{ $t('tools.count-text.digits') }}</span>
        <span class="stat-value">{{ $t('tools.count-text.unit', { count: digitCount }) }}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">{{ $t('tools.count-text.cnChars') }}</span>
        <span class="stat-value">{{ $t('tools.count-text.unit', { count: cnCharCount }) }}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">{{ $t('tools.count-text.cnPunctuation') }}</span>
        <span class="stat-value">{{ $t('tools.count-text.unit', { count: cnPuncCount }) }}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">{{ $t('tools.count-text.enChars') }}</span>
        <span class="stat-value">{{ $t('tools.count-text.unit', { count: enCharCount }) }}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">{{ $t('tools.count-text.enPunctuation') }}</span>
        <span class="stat-value">{{ $t('tools.count-text.unit', { count: enPuncCount }) }}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">{{ $t('tools.count-text.lines') }}</span>
        <span class="stat-value">{{ $t('tools.count-text.lineUnit', { count: lineCount }) }}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">{{ $t('tools.count-text.paragraphs') }}</span>
        <span class="stat-value">{{ $t('tools.count-text.unit', { count: paragraphCount }) }}</span>
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
