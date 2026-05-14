<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const { t } = useI18n()

const NUMBER_ARR = '0123456789'.split('')
const LOWER_ARR = 'abcdefghijklmnopqrstuvwxyz'.split('')
const UPPER_ARR = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const SYMBOL_ARR = ['!', '"', '#', '$', '%', '&', "'", '(', ')', '*', '+', ',', '-', '.', '/', ':', ';', '<', '=', '>', '?', '@', '[', ']', '_', '{', '|', '}']

const useNumber = ref(true)
const useLower = ref(true)
const useUpper = ref(true)
const useSymbol = ref(false)

const generateCount = ref(10)
const passwordLength = ref(20)
const includeChars = ref('')
const excludeChars = ref('0oO1iIlLq9g')

const result = ref('')

const charPool = computed(() => {
  let pool: string[] = []
  if (useNumber.value) pool.push(...NUMBER_ARR)
  if (useLower.value) pool.push(...LOWER_ARR)
  if (useUpper.value) pool.push(...UPPER_ARR)
  if (useSymbol.value) pool.push(...SYMBOL_ARR)
  if (includeChars.value) pool.push(...includeChars.value.split(''))
  if (excludeChars.value) {
    const excludeSet = new Set(excludeChars.value.split(''))
    pool = pool.filter(c => !excludeSet.has(c))
  }
  return pool
})

const poolSize = computed(() => charPool.value.length)

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateRandomString(pool: string[], length: number): string {
  let s = ''
  for (let i = 0; i < length; i++) {
    s += pool[randomInt(0, pool.length - 1)]
  }
  return s
}

function generate() {
  const pool = charPool.value
  if (pool.length === 0) {
    ElMessage.error(t('tools.password.noChars'))
    return
  }

  const count = generateCount.value
  const len = passwordLength.value

  if (count < 1 || count > 1000000) {
    ElMessage.error(t('tools.password.invalidCount'))
    return
  }
  if (len < 1 || len > 1000000) {
    ElMessage.error(t('tools.password.invalidLength'))
    return
  }

  if (pool.length ** len < count) {
    ElMessage.warning(t('tools.password.notEnoughChars'))
  }

  const set = new Set<string>()
  const maxAttempts = count * 10
  let attempts = 0

  while (set.size < count && attempts < maxAttempts) {
    set.add(generateRandomString(pool, len))
    attempts++
  }

  result.value = [...set].join('\n')
  ElMessage.success(t('tools.password.generated', { count: set.size }))
}

function copyResult() {
  if (!result.value) {
    ElMessage.warning(t('tools.password.pleaseGenerate'))
    return
  }
  navigator.clipboard.writeText(result.value)
  ElMessage.success(t('tools.password.copied'))
}

function clearResult() {
  result.value = ''
}
</script>

<template>
  <div class="password-tool">
    <div class="config-card">
      <div class="config-row">
        <span class="config-label">{{ $t('tools.password.charTypes') }}</span>
        <div class="char-checks">
          <el-checkbox v-model="useNumber">{{ $t('tools.password.digits') }}</el-checkbox>
          <el-checkbox v-model="useLower">{{ $t('tools.password.lowercase') }}</el-checkbox>
          <el-checkbox v-model="useUpper">{{ $t('tools.password.uppercase') }}</el-checkbox>
          <el-checkbox v-model="useSymbol">{{ $t('tools.password.symbols') }}</el-checkbox>
          <span class="pool-size">{{ $t('tools.password.poolSize', { count: poolSize }) }}</span>
        </div>
      </div>

      <el-row :gutter="16">
        <el-col :xs="12" :sm="8">
          <div class="config-item">
            <span class="config-label">{{ $t('tools.password.count') }}</span>
            <el-input-number
              v-model="generateCount"
              :min="1"
              :max="1000000"
              controls-position="right"
              style="width: 100%"
            />
          </div>
        </el-col>
        <el-col :xs="12" :sm="8">
          <div class="config-item">
            <span class="config-label">{{ $t('tools.password.length') }}</span>
            <el-input-number
              v-model="passwordLength"
              :min="1"
              :max="1000000"
              controls-position="right"
              style="width: 100%"
            />
          </div>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :xs="24" :sm="12">
          <div class="config-item">
            <span class="config-label">{{ $t('tools.password.includeChars') }}</span>
            <el-input v-model="includeChars" :placeholder="$t('tools.password.includePlaceholder')" />
          </div>
        </el-col>
        <el-col :xs="24" :sm="12">
          <div class="config-item">
            <span class="config-label">{{ $t('tools.password.excludeChars') }}</span>
            <el-input v-model="excludeChars" :placeholder="$t('tools.password.excludePlaceholder')" />
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="action-bar">
      <el-button type="primary" @click="generate">{{ $t('tools.password.generate') }}</el-button>
      <el-button @click="copyResult">{{ $t('tools.password.copyResult') }}</el-button>
      <el-button @click="clearResult">{{ $t('tools.password.clear') }}</el-button>
    </div>

    <div class="result-card">
      <div class="result-header">
        <span class="config-label">{{ $t('tools.password.result') }}</span>
        <span v-if="result" class="result-count">{{ $t('tools.password.items', { count: result.split('\n').length }) }}</span>
      </div>
      <el-input
        v-model="result"
        type="textarea"
        :autosize="{ minRows: 10, maxRows: 20 }"
        readonly
        :placeholder="$t('tools.password.resultPlaceholder')"
        class="result-textarea"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.password-tool {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.config-card {
  background: var(--el-bg-color-page);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.config-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 12px;
}

.config-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  white-space: nowrap;
  line-height: 32px;
}

.config-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;

  .config-label {
    line-height: 32px;
  }
}

.char-checks {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
}

.pool-size {
  font-size: 12px;
  color: #909399;
  background: #f0f2f5;
  padding: 2px 10px;
  border-radius: 10px;
  margin-left: 4px;
}

.action-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
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

.result-count {
  font-size: 12px;
  color: #909399;
  background: #f0f2f5;
  padding: 2px 10px;
  border-radius: 10px;
}

.result-textarea {
  :deep(.el-textarea__inner) {
    font-family: 'Courier New', Courier, monospace;
    font-size: 14px;
    line-height: 1.8;
    word-break: break-all;
  }
}

@media (max-width: 768px) {
  .config-card {
    padding: 14px;
    gap: 14px;
  }

  .config-row {
    flex-direction: column;
    gap: 8px;
  }

  .config-item {
    flex-direction: column;
    gap: 6px;
  }
}
</style>
