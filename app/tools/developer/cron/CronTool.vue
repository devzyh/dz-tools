<script setup lang="ts">
import { ref } from 'vue'
import { CronExpressionParser } from 'cron-parser'
import { ElMessage } from 'element-plus'
import { WarningFilled, Clock } from '@element-plus/icons-vue'

const expression = ref('')
const schedules = ref<{ date: string; day: string }[]>([])
const error = ref('')

const fieldDesc = [
  { label: '秒', range: '0-59' },
  { label: '分', range: '0-59' },
  { label: '时', range: '0-23' },
  { label: '日', range: '1-31' },
  { label: '月', range: '1-12' },
  { label: '周', range: '1-7' },
]

const presets = [
  { label: '每秒', value: '* * * * * ?' },
  { label: '每分钟', value: '0 * * * * ?' },
  { label: '每5分钟', value: '0 */5 * * * ?' },
  { label: '每小时', value: '0 0 * * * ?' },
  { label: '每天10:15', value: '0 15 10 * * ?' },
  { label: '每天12:00', value: '0 0 12 * * ?' },
  { label: '工作日9点', value: '0 0 9 ? * MON-FRI' },
  { label: '每月1号0点', value: '0 0 0 1 * ?' },
  { label: '每周一0点', value: '0 0 0 ? * MON' },
]

function parse() {
  if (!expression.value.trim()) {
    ElMessage.warning('请输入Cron表达式')
    return
  }
  error.value = ''
  try {
    const interval = CronExpressionParser.parse(expression.value.trim(), {
      throwOnError: true,
    } as any)
    const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
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
      <el-button type="primary" @click="parse">解析</el-button>
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
        <span>最近 10 次执行时间</span>
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
