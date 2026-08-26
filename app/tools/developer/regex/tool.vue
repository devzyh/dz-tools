<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Select, CloseBold } from '@element-plus/icons-vue'

const pattern = useCachedText('dz-tools-regex-pattern', '')
const testText = useCachedText('dz-tools-regex-text', '')
const flagGlobal = useCachedRef('dz-tools-regex-flag-global', true)
const flagIgnoreCase = useCachedRef('dz-tools-regex-flag-ignore-case', false)
const flagMultiline = useCachedRef('dz-tools-regex-flag-multiline', false)

const matchResults = ref<
  { match: string; groups: (string | undefined)[]; index: number; end: number }[]
>([])
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

const hasGroups = computed(() => matchResults.value.some((m) => m.groups.length > 1))

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
    ElMessage.warning('请输入正则表达式')
    return
  }
  if (!testText.value) {
    ElMessage.warning('请输入测试字符串')
    return
  }

  hasError.value = false
  errorMsg.value = ''
  hasRun.value = true

  try {
    const regex = new RegExp(pattern.value, flagStr.value)
    const matches = Array.from(testText.value.matchAll(regex))
    matchResults.value = matches.map((m) => ({
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
        placeholder="输入正则表达式，如 ^[a-zA-Z]+$"
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
        <el-checkbox v-model="flagGlobal" label="全局(g)" />
        <el-checkbox v-model="flagIgnoreCase" label="忽略大小写(i)" />
        <el-checkbox v-model="flagMultiline" label="多行(m)" />
      </div>
    </div>

    <el-input
      v-model="testText"
      type="textarea"
      :rows="5"
      placeholder="输入要测试的文本..."
      class="regex-textarea"
      @keyup.enter.ctrl="runTest"
    />

    <div class="regex-actions">
      <el-button type="primary" @click="runTest">运行测试</el-button>
      <span class="regex-hint">Ctrl+Enter 快捷运行</span>
    </div>

    <template v-if="hasRun">
      <div v-if="hasError" class="regex-error">
        <span>正则表达式错误：{{ errorMsg }}</span>
      </div>

      <template v-else>
        <div class="regex-status" :class="matchResults.length ? 'is-matched' : 'is-unmatched'">
          <el-icon v-if="matchResults.length" class="status-icon"><Select /></el-icon>
          <el-icon v-else class="status-icon"><CloseBold /></el-icon>
          <span>{{
            matchResults.length ? `找到 ${matchResults.length} 个匹配项` : '没有找到匹配项'
          }}</span>
        </div>

        <div v-if="matchResults.length" class="regex-section">
          <div class="section-title">格式化文本</div>
          <div class="regex-formatted" v-html="formattedHtml" />
        </div>

        <div v-if="matchResults.length" class="regex-section">
          <div class="section-title">
            匹配详情
            <el-tag size="small" effect="plain" class="count-tag">{{ matchCount }} 项</el-tag>
            <el-tag v-if="hasGroups" size="small" type="warning" effect="plain" class="count-tag"
              >{{ totalGroupCount }} 个捕获组</el-tag
            >
          </div>
          <div class="regex-details">
            <div v-for="(item, idx) in matchResults" :key="idx" class="detail-row">
              <span class="detail-index">#{{ idx + 1 }}</span>
              <span class="detail-match">{{ item.match }}</span>
              <span class="detail-pos">位置 {{ item.index }}–{{ item.end }}</span>
            </div>
          </div>
        </div>

        <div v-if="hasGroups && matchResults.length" class="regex-section">
          <div class="section-title">捕获组</div>
          <div class="regex-details">
            <div v-for="(item, idx) in matchResults" :key="idx" class="group-row">
              <span class="group-match-label">匹配 #{{ idx + 1 }}</span>
              <div class="group-items">
                <span v-for="(g, gi) in item.groups.slice(1)" :key="gi" class="group-item">
                  <el-tag size="small" effect="plain">组 {{ gi + 1 }}</el-tag>
                  {{ g !== undefined ? g : '未定义' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </template>

    <div class="regex-reference">
      <div class="section-title">常用参考</div>
      <div class="ref-grid">
        <div class="ref-card">
          <div class="ref-card-title">元字符</div>
          <table class="ref-table">
            <tr
              v-for="item in [
                ['.', '任意字符（除换行）'],
                ['^', '字符串开始'],
                ['$', '字符串结束'],
                ['*', '0次或多次'],
                ['+', '1次或多次'],
                ['?', '0次或1次'],
              ]"
              :key="item[0]"
            >
              <td>
                <code>{{ item[0] }}</code>
              </td>
              <td>{{ item[1] }}</td>
            </tr>
          </table>
        </div>
        <div class="ref-card">
          <div class="ref-card-title">字符类</div>
          <table class="ref-table">
            <tr
              v-for="item in [
                ['\\d', '数字 [0-9]'],
                ['\\D', '非数字'],
                ['\\w', '单词字符'],
                ['\\W', '非单词字符'],
                ['\\s', '空白字符'],
                ['\\S', '非空白字符'],
              ]"
              :key="item[0]"
            >
              <td>
                <code>{{ item[0] }}</code>
              </td>
              <td>{{ item[1] }}</td>
            </tr>
          </table>
        </div>
        <div class="ref-card">
          <div class="ref-card-title">量词</div>
          <table class="ref-table">
            <tr
              v-for="item in [
                ['{n}', '恰好n次'],
                ['{n,}', '至少n次'],
                ['{n,m}', 'n到m次'],
                ['(?=...)', '前瞻断言'],
                ['(?!...)', '负前瞻'],
                ['(?:...)', '非捕获组'],
              ]"
              :key="item[0]"
            >
              <td>
                <code>{{ item[0] }}</code>
              </td>
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
