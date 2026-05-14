<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Select, CloseBold } from '@element-plus/icons-vue'

const { t } = useI18n()

const pattern = ref('')
const testText = ref('')
const flagGlobal = ref(true)
const flagIgnoreCase = ref(false)
const flagMultiline = ref(false)

const matchResults = ref<{ match: string; groups: (string | undefined)[]; index: number; end: number }[]>([])
const hasError = ref(false)
const errorMsg = ref('')
const hasRun = ref(false)

const flagStr = computed(() => {
  let f = ''
  if (flagGlobal.value) f += 'g'
  if (flagIgnoreCase.value) f += 'i'
  if (flagMultiline.value) f += 'm'
  return f
})

const matchCount = computed(() => matchResults.value.length)

const hasGroups = computed(() => matchResults.value.some(m => m.groups.length > 1))

const formattedHtml = computed(() => {
  if (!hasRun.value || matchResults.value.length === 0) return ''
  const text = testText.value
  let result = ''
  let lastIdx = 0
  for (const m of matchResults.value) {
    result += escapeHtml(text.slice(lastIdx, m.index))
    result += `<span class="match-highlight">${escapeHtml(m.match)}</span>`
    lastIdx = m.end
  }
  result += escapeHtml(text.slice(lastIdx))
  return result
})

const totalGroupCount = computed(() => {
  let max = 0
  for (const m of matchResults.value) {
    if (m.groups.length > max) max = m.groups.length
  }
  return max - 1
})

function runTest() {
  if (!pattern.value.trim()) {
    ElMessage.warning(t('tools.regex.pleaseInputPattern'))
    return
  }
  if (!testText.value) {
    ElMessage.warning(t('tools.regex.pleaseInputTest'))
    return
  }

  hasError.value = false
  errorMsg.value = ''
  hasRun.value = true

  try {
    const regex = new RegExp(pattern.value, flagStr.value)
    const matches = Array.from(testText.value.matchAll(regex))
    matchResults.value = matches.map(m => ({
      match: m[0],
      groups: [...m],
      index: m.index,
      end: m.index + m[0].length,
    }))
  } catch (err) {
    hasError.value = true
    errorMsg.value = (err as Error).message
    matchResults.value = []
  }
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br>')
}
</script>

<template>
  <div class="regex-tool">
    <div class="regex-input-row">
      <el-input
        v-model="pattern"
        :placeholder="$t('tools.regex.patternPlaceholder')"
        class="regex-pattern"
        @keyup.enter="runTest"
      >
        <template #prefix>
          <span class="regex-slash">/</span>
        </template>
        <template #suffix>
          <span class="regex-slash">/{{ flagStr }}/&nbsp;</span>
        </template>
      </el-input>
      <div class="regex-flags">
        <el-checkbox v-model="flagGlobal" :label="$t('tools.regex.flagGlobal')" />
        <el-checkbox v-model="flagIgnoreCase" :label="$t('tools.regex.flagIgnoreCase')" />
        <el-checkbox v-model="flagMultiline" :label="$t('tools.regex.flagMultiline')" />
      </div>
    </div>

    <el-input
      v-model="testText"
      type="textarea"
      :rows="5"
      :placeholder="$t('tools.regex.testPlaceholder')"
      class="regex-textarea"
      @keyup.enter.ctrl="runTest"
    />

    <div class="regex-actions">
      <el-button type="primary" @click="runTest">{{ $t('tools.regex.run') }}</el-button>
      <span class="regex-hint">{{ $t('tools.regex.shortcutHint') }}</span>
    </div>

    <template v-if="hasRun">
      <div v-if="hasError" class="regex-error">
        <span>{{ $t('tools.regex.regexError') }}{{ errorMsg }}</span>
      </div>

      <template v-else>
        <div class="regex-status" :class="matchResults.length ? 'is-matched' : 'is-unmatched'">
          <el-icon v-if="matchResults.length" class="status-icon"><Select /></el-icon>
          <el-icon v-else class="status-icon"><CloseBold /></el-icon>
          <span>{{ matchResults.length ? $t('tools.regex.foundMatches', { count: matchResults.length }) : $t('tools.regex.noMatches') }}</span>
        </div>

        <div v-if="matchResults.length" class="regex-section">
          <div class="section-title">{{ $t('tools.regex.formattedText') }}</div>
          <div class="regex-formatted" v-html="formattedHtml" />
        </div>

        <div v-if="matchResults.length" class="regex-section">
          <div class="section-title">
            {{ $t('tools.regex.matchDetails') }}
            <el-tag size="small" effect="plain" class="count-tag">{{ $t('tools.regex.items', { count: matchCount }) }}</el-tag>
            <el-tag v-if="hasGroups" size="small" type="warning" effect="plain" class="count-tag">{{ $t('tools.regex.captureGroups', { count: totalGroupCount }) }}</el-tag>
          </div>
          <div class="regex-details">
            <div
              v-for="(item, idx) in matchResults"
              :key="idx"
              class="detail-row"
            >
              <span class="detail-index">#{{ idx + 1 }}</span>
              <span class="detail-match">{{ item.match }}</span>
              <span class="detail-pos">{{ $t('tools.regex.position') }} {{ item.index }}–{{ item.end }}</span>
            </div>
          </div>
        </div>

        <div v-if="hasGroups && matchResults.length" class="regex-section">
          <div class="section-title">{{ $t('tools.regex.captureGroupTitle') }}</div>
          <div class="regex-details">
            <div
              v-for="(item, idx) in matchResults"
              :key="idx"
              class="group-row"
            >
              <span class="group-match-label">{{ $t('tools.regex.match') }} #{{ idx + 1 }}</span>
              <div class="group-items">
                <span
                  v-for="(g, gi) in item.groups.slice(1)"
                  :key="gi"
                  class="group-item"
                >
                  <el-tag size="small" effect="plain">{{ $t('tools.regex.groupLabel', { count: gi + 1 }) }}</el-tag>
                  {{ g !== undefined ? g : $t('tools.regex.undefined') }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </template>

    <div class="regex-reference">
      <div class="section-title">{{ $t('tools.regex.reference') }}</div>
      <div class="ref-grid">
        <div class="ref-card">
          <div class="ref-card-title">{{ $t('tools.regex.metaChars') }}</div>
          <table class="ref-table">
            <tr v-for="item in [
              ['.', $t('tools.regex.metaAnyChar')],
              ['^', $t('tools.regex.metaStart')],
              ['$', $t('tools.regex.metaEnd')],
              ['*', $t('tools.regex.metaZeroOrMore')],
              ['+', $t('tools.regex.metaOneOrMore')],
              ['?', $t('tools.regex.metaZeroOrOne')],
            ]" :key="item[0]">
              <td><code>{{ item[0] }}</code></td>
              <td>{{ item[1] }}</td>
            </tr>
          </table>
        </div>
        <div class="ref-card">
          <div class="ref-card-title">{{ $t('tools.regex.charClasses') }}</div>
          <table class="ref-table">
            <tr v-for="item in [
              ['\\d', $t('tools.regex.classDigit')],
              ['\\D', $t('tools.regex.classNonDigit')],
              ['\\w', $t('tools.regex.classWord')],
              ['\\W', $t('tools.regex.classNonWord')],
              ['\\s', $t('tools.regex.classSpace')],
              ['\\S', $t('tools.regex.classNonSpace')],
            ]" :key="item[0]">
              <td><code>{{ item[0] }}</code></td>
              <td>{{ item[1] }}</td>
            </tr>
          </table>
        </div>
        <div class="ref-card">
          <div class="ref-card-title">{{ $t('tools.regex.quantifiers') }}</div>
          <table class="ref-table">
            <tr v-for="item in [
              ['{n}', $t('tools.regex.quantExact')],
              ['{n,}', $t('tools.regex.quantMin')],
              ['{n,m}', $t('tools.regex.quantRange')],
              ['(?=...)',$t('tools.regex.quantLookahead')],
              ['(?!...)',$t('tools.regex.quantNegLookahead')],
              ['(?:...)',$t('tools.regex.quantNonCapture')],
            ]" :key="item[0]">
              <td><code>{{ item[0] }}</code></td>
              <td>{{ item[1] }}</td>
            </tr>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.regex-tool {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.regex-input-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.regex-pattern {
  :deep(.el-input__inner) {
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 14px;
  }
}

.regex-slash {
  color: var(--el-color-danger);
  font-weight: bold;
  font-family: 'Consolas', 'Monaco', monospace;
}

.regex-flags {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.regex-textarea {
  :deep(.el-textarea__inner) {
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 13px;
    line-height: 1.6;
  }
}

.regex-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.regex-hint {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.regex-error {
  padding: 10px 14px;
  color: var(--el-color-danger);
  background: var(--el-color-danger-light-9);
  border-radius: 6px;
  font-size: 13px;
}

.regex-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;

  &.is-matched {
    color: var(--el-color-success);
    background: var(--el-color-success-light-9);
  }

  &.is-unmatched {
    color: var(--el-color-danger);
    background: var(--el-color-danger-light-9);
  }
}

.status-icon {
  font-size: 18px;
}

.regex-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
}

.count-tag {
  font-variant-numeric: tabular-nums;
}

.regex-formatted {
  padding: 12px 14px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-fill-color-lighter);
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.8;
  word-break: break-all;
  max-height: 260px;
  overflow-y: auto;
}

:deep(.match-highlight) {
  background: var(--el-color-warning-light-5);
  border-radius: 3px;
  padding: 1px 2px;
}

.regex-details {
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  overflow: hidden;
}

.detail-row {
  display: flex;
  align-items: center;
  padding: 0 14px;
  height: 40px;
  border-bottom: 1px solid var(--el-border-color-lighter);

  &:last-child {
    border-bottom: none;
  }
}

.detail-index {
  width: 40px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  font-variant-numeric: tabular-nums;
}

.detail-match {
  flex: 1;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  color: var(--el-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-pos {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.group-row {
  padding: 8px 14px;
  border-bottom: 1px solid var(--el-border-color-lighter);

  &:last-child {
    border-bottom: none;
  }
}

.group-match-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
  display: block;
}

.group-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.group-item {
  font-size: 13px;
  font-family: 'Consolas', 'Monaco', monospace;
  display: flex;
  align-items: center;
  gap: 4px;
}

.regex-reference {
  margin-top: 4px;
}

.ref-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.ref-card {
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  overflow: hidden;
}

.ref-card-title {
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.ref-table {
  width: 100%;
  border-collapse: collapse;

  td {
    padding: 5px 12px;
    font-size: 12px;
    border-bottom: 1px solid var(--el-border-color-lighter);

    &:last-child {
      color: var(--el-text-color-regular);
    }

    &:last-child {
      border-bottom: none;
    }
  }

  code {
    font-family: 'Consolas', 'Monaco', monospace;
    color: var(--el-color-primary);
    background: var(--el-fill-color);
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 12px;
  }

  tr:last-child td {
    border-bottom: none;
  }
}

@media (max-width: 768px) {
  .detail-pos {
    display: none;
  }

  .regex-formatted {
    max-height: 200px;
  }
}
</style>
