<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { CalendarDate, CalendarDateTime, Time } from '@internationalized/date'

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

const message = useMessage()
const tsInput = useCachedText('dz-tools-timestamp-input', '')
const tsResult = ref('')

// 分段式日期输入，不再持久化缓存(EP 时代缓存的是格式化字符串)
const dateInput = ref<CalendarDateTime>()
// 日历弹层:选中的日期与时间,选定后并入日期时间字段
const pickerOpen = ref(false)
const calendarDate = ref<CalendarDate>()
const timeValue = ref<Time>()
const dateResult = ref('')
const dateResultMs = ref('')

watch(calendarDate, (d) => {
  if (!d) return
  const t = timeValue.value ?? dateInput.value
  dateInput.value = new CalendarDateTime(
    d.year,
    d.month,
    d.day,
    t?.hour ?? 0,
    t?.minute ?? 0,
    t?.second ?? 0,
  )
  dateToTs()
})

watch(timeValue, (t) => {
  if (!t || !calendarDate.value) return
  dateInput.value = new CalendarDateTime(
    calendarDate.value.year,
    calendarDate.value.month,
    calendarDate.value.day,
    t.hour,
    t.minute,
    t.second ?? 0,
  )
  dateToTs()
})

/**
 * 打开弹层时以字段当前值为基准初始化日历与时间,空值回退到此刻
 */
function openPicker() {
  const now = new Date()
  const d = dateInput.value
  calendarDate.value = d
    ? new CalendarDate(d.year, d.month, d.day)
    : new CalendarDate(now.getFullYear(), now.getMonth() + 1, now.getDate())
  timeValue.value = d
    ? new Time(d.hour, d.minute, d.second)
    : new Time(now.getHours(), now.getMinutes(), now.getSeconds())
  pickerOpen.value = true
}

/**
 * 一键填入当前时刻并换算
 */
function pickNow() {
  const now = new Date()
  dateInput.value = new CalendarDateTime(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
    now.getSeconds(),
  )
  dateToTs()
  pickerOpen.value = false
}

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

/**
 * 解析 yyyy-MM-dd [HH:mm[:ss[.zzz]]] 形式的日期时间字符串,
 * 兼容 / 分隔、T 分隔与 1~3 位毫秒(按 .5 = 500ms 补齐)
 */
function parseDateTimeStr(str: string): Date | null {
  const m = str
    .trim()
    .match(
      /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2})(?:\.(\d{1,3}))?)?)?$/,
    )
  if (!m) return null
  const [, y, mo, d, h = '0', mi = '0', s = '0', ms = '0'] = m
  const date = new Date(+y, +mo - 1, +d, +h, +mi, +s, Number(ms.padEnd(3, '0')))
  return isNaN(date.getTime()) ? null : date
}

/**
 * 将解析结果同步进日期选择器字段
 */
function syncPicker(d: Date) {
  dateInput.value = new CalendarDateTime(
    d.getFullYear(),
    d.getMonth() + 1,
    d.getDate(),
    d.getHours(),
    d.getMinutes(),
    d.getSeconds(),
  )
}

function tsToDate() {
  const raw = tsInput.value.trim()
  if (!raw) {
    message.warning('请输入时间戳或日期时间')
    return
  }
  let d: Date | null
  if (/^\d+$/.test(raw)) {
    d = parseTs(raw)
    if (!d || isNaN(d.getTime())) {
      message.error('时间戳无效')
      return
    }
  } else {
    d = parseDateTimeStr(raw)
    if (!d) {
      message.error('无法解析，支持时间戳或 yyyy-MM-dd HH:mm:ss 格式')
      return
    }
  }
  tsResult.value = formatDate(d)
  syncPicker(d)
}

function dateToTs() {
  const dt = dateInput.value
  if (!dt) {
    message.warning('请选择日期时间')
    return
  }
  const d = new Date(dt.year, dt.month - 1, dt.day, dt.hour, dt.minute, dt.second)
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
        <UInput
          v-model="tsInput"
          placeholder="输入时间戳或日期时间（yyyy-MM-dd HH:mm:ss.zzz）"
          class="ts-card-input"
          @keydown.enter="tsToDate"
        />
        <UButton class="shrink-0" @click="tsToDate">转换</UButton>
      </div>
      <div v-if="tsResult" class="ts-card-output" @click="copy(tsResult)">
        <span class="ts-card-output-text">{{ tsResult }}</span>
        <UIcon name="i-ep-copy-document" class="ts-card-output-copy" />
      </div>
    </div>

    <div class="ts-card">
      <div class="ts-card-head">
        <span class="ts-card-title">日期时间 → 时间戳</span>
      </div>
      <div class="ts-card-row">
        <UInputDate
          v-model="dateInput"
          granularity="second"
          readonly
          class="ts-card-picker w-full"
        />
        <UPopover v-model:open="pickerOpen">
          <UButton
            color="neutral"
            variant="outline"
            icon="i-ep-calendar"
            class="shrink-0"
            aria-label="打开日期时间选择器"
            @click="openPicker"
          />
          <template #content>
            <div class="p-3 flex flex-col items-center gap-3">
              <UCalendar v-model="calendarDate" />
              <div class="flex items-center gap-2">
                <UInputTime v-model="timeValue" granularity="second" class="w-36" />
                <UButton variant="soft" @click="pickNow">此刻</UButton>
              </div>
            </div>
          </template>
        </UPopover>
        <UButton class="shrink-0" @click="dateToTs">转换</UButton>
      </div>
      <div v-if="dateResult" class="ts-card-output-group">
        <div class="ts-card-output" @click="copy(dateResult)">
          <span class="ts-card-output-tag">秒(s)</span>
          <span class="ts-card-output-text">{{ dateResult }}</span>
          <UIcon name="i-ep-copy-document" class="ts-card-output-copy" />
        </div>
        <div class="ts-card-output" @click="copy(dateResultMs)">
          <span class="ts-card-output-tag">毫秒(ms)</span>
          <span class="ts-card-output-text">{{ dateResultMs }}</span>
          <UIcon name="i-ep-copy-document" class="ts-card-output-copy" />
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
    color-mix(in srgb, var(--ui-primary) 10%, transparent),
    color-mix(in srgb, var(--ui-primary) 30%, transparent)
  );
  border: 1px solid color-mix(in srgb, var(--ui-primary) 50%, transparent);
  border-radius: 10px;
  cursor: pointer;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 2px 12px color-mix(in srgb, var(--ui-primary) 50%, transparent);
  }
}

.ts-current-label {
  font-size: 13px;
  color: var(--ui-text-muted);
  margin-bottom: 8px;
}

.ts-current-s {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 36px;
  font-weight: 700;
  color: var(--ui-primary);
  font-variant-numeric: tabular-nums;
  letter-spacing: 2px;
  line-height: 1.2;
}

.ts-card {
  border: 1px solid var(--ui-border-accented);
  border-radius: 10px;
  overflow: hidden;
}

.ts-card-head {
  padding: 12px 16px;
  background: var(--ui-bg-accented);
  border-bottom: 1px solid var(--ui-border);
}

.ts-card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--ui-text-highlighted);
}

.ts-card-row {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  align-items: center;
}

.ts-card-input {
  flex: 1;

  :deep(input) {
    font-family: 'Consolas', 'Monaco', monospace;
  }
}

// 只读展示字段,与下方结果块同宽
.ts-card-picker {
  flex: 1;
  min-width: 0;
}

.ts-card-output-group {
  border-top: 1px solid var(--ui-border);
  display: flex;
  flex-direction: column;
}

.ts-card-output {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-top: 1px solid var(--ui-border);
  cursor: pointer;
  transition: background 0.15s;

  &:first-child {
    border-top: none;
  }

  &:hover {
    background: var(--ui-bg-accented);
  }
}

.ts-card-output-tag {
  font-size: 12px;
  color: var(--ui-primary);
  background: color-mix(in srgb, var(--ui-primary) 10%, transparent);
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
  color: var(--ui-text-highlighted);
  word-break: break-all;
}

.ts-card-output-copy {
  color: var(--ui-text-dimmed);
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
