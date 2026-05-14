<script setup lang="ts">
import { ref, computed } from 'vue'
import { CronExpressionParser } from 'cron-parser'
import { ElMessage } from 'element-plus'
import { WarningFilled, Clock } from '@element-plus/icons-vue'

const { t } = useI18n()

const expression = ref('')
const schedules = ref<{ date: string; day: string }[]>([])
const error = ref('')

const fieldDesc = computed(() => [
  { label: t('tools.cron.fieldSecond'), range: '0-59' },
  { label: t('tools.cron.fieldMinute'), range: '0-59' },
  { label: t('tools.cron.fieldHour'), range: '0-23' },
  { label: t('tools.cron.fieldDay'), range: '1-31' },
  { label: t('tools.cron.fieldMonth'), range: '1-12' },
  { label: t('tools.cron.fieldWeek'), range: '1-7' },
])

const presets = computed(() => [
  { label: t('tools.cron.presetEverySecond'), value: '* * * * * ?' },
  { label: t('tools.cron.presetEveryMinute'), value: '0 * * * * ?' },
  { label: t('tools.cron.presetEvery5Minutes'), value: '0 */5 * * * ?' },
  { label: t('tools.cron.presetEveryHour'), value: '0 0 * * * ?' },
  { label: t('tools.cron.presetDaily1015'), value: '0 15 10 * * ?' },
  { label: t('tools.cron.presetDaily1200'), value: '0 0 12 * * ?' },
  { label: t('tools.cron.presetWeekday9'), value: '0 0 9 ? * MON-FRI' },
  { label: t('tools.cron.presetMonthly1st'), value: '0 0 0 1 * ?' },
  { label: t('tools.cron.presetMonday'), value: '0 0 0 ? * MON' },
])

function parse() {
  if (!expression.value.trim()) {
    ElMessage.warning(t('tools.cron.pleaseInput'))
    return
  }
  error.value = ''
  try {
    const interval = CronExpressionParser.parse(expression.value.trim(), {
      throwOnError: true,
    } as any)
    const dayNames = [
      t('tools.cron.daySunday'),
      t('tools.cron.dayMonday'),
      t('tools.cron.dayTuesday'),
      t('tools.cron.dayWednesday'),
      t('tools.cron.dayThursday'),
      t('tools.cron.dayFriday'),
      t('tools.cron.daySaturday'),
    ]
    schedules.value = interval.take(10).map((d: any) => {
      const date = d.toDate()
      return {
        date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`,
        day: dayNames[date.getDay()],
      }
    })
  } catch (err) {
    error.value = (err as Error).message
    schedules.value = []
  }
}
</script>

<template>
  <div class="cron-tool">
    <div class="cron-input-row">
      <el-input
        v-model="expression"
        placeholder="0 0 12 * * ?"
        class="cron-input"
        clearable
        @keyup.enter="parse"
      />
      <el-button type="primary" @click="parse">{{ $t('tools.cron.parse') }}</el-button>
    </div>

    <div class="cron-fields">
      <span
        v-for="field in fieldDesc"
        :key="field.label"
        class="field-tag"
      >{{ field.label }}<small>{{ field.range }}</small></span>
    </div>

    <div class="cron-presets">
      <el-tag
        v-for="item in presets"
        :key="item.value"
        class="preset-tag"
        effect="plain"
        @click="expression = item.value; parse()"
      >
        {{ item.label }}
      </el-tag>
    </div>

    <div v-if="error" class="cron-error">
      <el-icon><WarningFilled /></el-icon>
      <span>{{ error }}</span>
    </div>

    <div v-if="schedules.length" class="cron-results">
      <div class="results-header">
        <el-icon><Clock /></el-icon>
        <span>{{ $t('tools.cron.recentExecutions') }}</span>
      </div>
      <div
        v-for="(item, index) in schedules"
        :key="index"
        class="cron-row"
      >
        <span class="cron-index">{{ index + 1 }}</span>
        <span class="cron-date">{{ item.date }}</span>
        <el-tag size="small" effect="plain" class="cron-day">{{ item.day }}</el-tag>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.cron-tool {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cron-input-row {
  display: flex;
  gap: 8px;
}

.cron-input {
  max-width: 480px;

  :deep(.el-input__inner) {
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 14px;
    letter-spacing: 1px;
  }
}

.cron-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.field-tag {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  padding: 2px 10px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  font-size: 13px;
  color: var(--el-text-color-secondary);

  small {
    font-size: 11px;
    color: var(--el-text-color-placeholder);
  }
}

.cron-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.preset-tag {
  cursor: pointer;
}

.cron-error {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  color: var(--el-color-danger);
  background: var(--el-color-danger-light-9);
  border-radius: 6px;
  font-size: 13px;
}

.cron-results {
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  overflow: hidden;
}

.results-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-lighter);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.cron-row {
  display: flex;
  align-items: center;
  padding: 0 14px;
  height: 40px;
  border-bottom: 1px solid var(--el-border-color-lighter);

  &:last-child {
    border-bottom: none;
  }
}

.cron-index {
  width: 32px;
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  font-variant-numeric: tabular-nums;
}

.cron-date {
  flex: 1;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-primary);
}

.cron-day {
  width: 56px;
  justify-content: center;
}

@media (max-width: 768px) {
  .cron-day {
    display: none;
  }
}
</style>
