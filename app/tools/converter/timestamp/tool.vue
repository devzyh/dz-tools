<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { CopyDocument } from '@element-plus/icons-vue'

const now = ref(Math.floor(Date.now() / 1000))
let timer: ReturnType<typeof setInterval>

onMounted(() => {
  timer = setInterval(() => {
    now.value = Math.floor(Date.now() / 1000)
  }, 1000)
})

onUnmounted(() => {
  clearInterval(timer)
})

const tsInput = ref('')
const tsResult = ref('')

const dateInput = ref('')
const dateResult = ref('')
const dateResultMs = ref('')

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function formatDate(d: Date) {
  const ms = String(d.getMilliseconds()).padStart(3, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${ms}`
}

function parseTs(raw: string) {
  let str = raw.trim()
  if (!/^\d+$/.test(str)) return null
  // 13位毫秒，10位秒，自动识别
  if (str.length > 13) str = str.slice(0, 13)
  const ms = str.length > 10 ? Number(str) : Number(str) * 1000
  return new Date(ms)
}

function tsToDate() {
  if (!tsInput.value.trim()) {
    ElMessage.warning('请输入时间戳')
    return
  }
  const d = parseTs(tsInput.value)
  if (!d || isNaN(d.getTime())) {
    ElMessage.error('时间戳无效')
    return
  }
  tsResult.value = formatDate(d)
}

function dateToTs() {
  if (!dateInput.value) {
    ElMessage.warning('请选择日期时间')
    return
  }
  const d = new Date(dateInput.value)
  if (isNaN(d.getTime())) {
    ElMessage.error('日期时间无效')
    return
  }
  dateResult.value = String(Math.floor(d.getTime() / 1000))
  dateResultMs.value = String(d.getTime())
}

function copy(val: string) {
  copyToClipboard(val)
}
</script>

<template>
  <div class="timestamp-tool">
    <div class="ts-current" @click="copy(String(now))">
      <div class="ts-current-label">当前 Unix 时间戳 (秒)</div>
      <div class="ts-current-s">{{ now }}</div>
    </div>

    <div class="ts-card">
      <div class="ts-card-head">
        <span class="ts-card-title">时间戳 → 日期时间</span>
      </div>
      <div class="ts-card-row">
        <el-input
          v-model="tsInput"
          :placeholder="'输入时间戳（10位秒 / 13位毫秒，自动识别）'"
          class="ts-card-input"
          clearable
          @keyup.enter="tsToDate"
        />
        <el-button type="primary" @click="tsToDate">转换</el-button>
      </div>
      <div v-if="tsResult" class="ts-card-output" @click="copy(tsResult)">
        <span class="ts-card-output-text">{{ tsResult }}</span>
        <el-icon class="ts-card-output-copy">
          <CopyDocument />
        </el-icon>
      </div>
    </div>

    <div class="ts-card">
      <div class="ts-card-head">
        <span class="ts-card-title">日期时间 → 时间戳</span>
      </div>
      <div class="ts-card-row">
        <el-date-picker
          v-model="dateInput"
          type="datetime"
          :placeholder="'选择或输入日期时间'"
          class="ts-card-picker"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          clearable
          @change="dateToTs"
        />
        <el-button type="primary" @click="dateToTs">转换</el-button>
      </div>
      <div v-if="dateResult" class="ts-card-output-group">
        <div class="ts-card-output" @click="copy(dateResult)">
          <span class="ts-card-output-tag">秒(s)</span>
          <span class="ts-card-output-text">{{ dateResult }}</span>
          <el-icon class="ts-card-output-copy">
            <CopyDocument />
          </el-icon>
        </div>
        <div class="ts-card-output" @click="copy(dateResultMs)">
          <span class="ts-card-output-tag">毫秒(ms)</span>
          <span class="ts-card-output-text">{{ dateResultMs }}</span>
          <el-icon class="ts-card-output-copy">
            <CopyDocument />
          </el-icon>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.timestamp-tool {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 640px;
  margin: 0 auto;
}

.ts-current {
  padding: 20px 24px;
  background: linear-gradient(
    135deg,
    var(--el-color-primary-light-9),
    var(--el-color-primary-light-7)
  );
  border: 1px solid var(--el-color-primary-light-5);
  border-radius: 10px;
  cursor: pointer;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 2px 12px var(--el-color-primary-light-5);
  }
}

.ts-current-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.ts-current-s {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 36px;
  font-weight: 700;
  color: var(--el-color-primary);
  font-variant-numeric: tabular-nums;
  letter-spacing: 2px;
  line-height: 1.2;
}

.ts-card {
  border: 1px solid var(--el-border-color);
  border-radius: 10px;
  overflow: hidden;
}

.ts-card-head {
  padding: 12px 16px;
  background: var(--el-fill-color-light);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.ts-card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.ts-card-row {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  align-items: center;
}

.ts-card-input {
  flex: 1;

  :deep(.el-input__inner) {
    font-family: 'Consolas', 'Monaco', monospace;
  }
}

.ts-card-picker {
  flex: 1;
  width: 100% !important;
}

.ts-card-output-group {
  border-top: 1px solid var(--el-border-color-lighter);
  display: flex;
  flex-direction: column;
}

.ts-card-output {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-top: 1px solid var(--el-border-color-lighter);
  cursor: pointer;
  transition: background 0.15s;

  &:first-child {
    border-top: none;
  }

  &:hover {
    background: var(--el-fill-color-light);
  }
}

.ts-card-output-tag {
  font-size: 12px;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  padding: 2px 8px;
  border-radius: 4px;
  flex-shrink: 0;
  font-weight: 500;
}

.ts-card-output-text {
  flex: 1;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-primary);
  word-break: break-all;
}

.ts-card-output-copy {
  color: var(--el-text-color-placeholder);
  flex-shrink: 0;
  font-size: 15px;
}

@media (max-width: 768px) {
  .timestamp-tool {
    max-width: none;
  }

  .ts-current-s {
    font-size: 26px;
  }

  .ts-card-row {
    flex-wrap: wrap;
  }

  .ts-card-input {
    flex: 1 1 100%;
  }
}
</style>
