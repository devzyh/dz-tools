<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'

const NUMBER_ARR = '0123456789'.split('')
const LOWER_ARR = 'abcdefghijklmnopqrstuvwxyz'.split('')
const UPPER_ARR = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
/** 常见特殊符号:多数限制符号的网站均可接受 */
const COMMON_SYMBOL_ARR = '!@#$%^&*()-_=+'.split('')
/** 全部特殊符号:完整可打印 ASCII 标点 */
const ALL_SYMBOL_ARR = '!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~'.split('')

const useNumber = useCachedRef('dz-tools-password-use-number', true)
const useLower = useCachedRef('dz-tools-password-use-lower', true)
const useUpper = useCachedRef('dz-tools-password-use-upper', true)
/** 符号档位:关闭 / 常见 / 全部 */
type SymbolMode = 'off' | 'common' | 'all'
const SYMBOL_MODE_KEY = 'dz-tools-password-symbol-mode'
const SYMBOL_LEGACY_KEY = 'dz-tools-password-use-symbol'
const symbolMode = useCachedRef<SymbolMode>(SYMBOL_MODE_KEY, 'common')

const generateCount = useCachedRef('dz-tools-password-count', 10)
const passwordLength = useCachedRef('dz-tools-password-length', 20)
const includeChars = useCachedText('dz-tools-password-include', '')
const excludeChars = useCachedText('dz-tools-password-exclude', '0oO1iIlLq9g')

const { read: readCache } = useToolCache()
const { cacheEnabled } = useAppSettings()

/**
 * 迁移旧版符号开关(boolean)到三态档位:true→全部、false→关闭;
 * 新 key 已存在时不覆盖,迁移完成后清理旧 key
 */
function migrateSymbolMode() {
  const legacy = readCache(SYMBOL_LEGACY_KEY)
  if (legacy === null) return
  if (readCache(SYMBOL_MODE_KEY) === null) {
    symbolMode.value = legacy === 'true' ? 'all' : 'off'
  }
  try {
    localStorage.removeItem(SYMBOL_LEGACY_KEY)
  } catch {
    /* 删除失败时忽略,下次进入再迁移 */
  }
}

onMounted(migrateSymbolMode)
watch(cacheEnabled, (enabled) => {
  if (enabled) migrateSymbolMode()
})

// 生成的密码为敏感内容,不参与缓存
const result = ref('')

const charPool = computed(() => {
  let pool: string[] = []
  if (useNumber.value) pool.push(...NUMBER_ARR)
  if (useLower.value) pool.push(...LOWER_ARR)
  if (useUpper.value) pool.push(...UPPER_ARR)
  if (symbolMode.value === 'common') pool.push(...COMMON_SYMBOL_ARR)
  else if (symbolMode.value === 'all') pool.push(...ALL_SYMBOL_ARR)
  if (includeChars.value) pool.push(...includeChars.value.split(''))
  if (excludeChars.value) {
    const excludeSet = new Set(excludeChars.value.split(''))
    pool = pool.filter((c) => !excludeSet.has(c))
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
    ElMessage.error('没有候选字符，请至少选择一种字符类型')
    return
  }

  const count = generateCount.value
  const len = passwordLength.value

  if (count < 1 || count > 1000000) {
    ElMessage.error('生成数量范围为 1 - 1,000,000')
    return
  }
  if (len < 1 || len > 1000000) {
    ElMessage.error('密码长度范围为 1 - 1,000,000')
    return
  }

  if (pool.length ** len < count) {
    ElMessage.warning('候选字符不足以生成指定数量的唯一密码')
  }

  const set = new Set<string>()
  const maxAttempts = count * 10
  let attempts = 0

  while (set.size < count && attempts < maxAttempts) {
    set.add(generateRandomString(pool, len))
    attempts++
  }

  result.value = [...set].join('\n')
  ElMessage.success(`已生成 ${set.size} 个密码`)
}

function copyResult() {
  if (!result.value) {
    ElMessage.warning('请先生成密码')
    return
  }
  copyToClipboard(result.value, '已复制到剪贴板')
}

function clearResult() {
  result.value = ''
}
</script>

<template>
  <div class="password-tool">
    <div class="config-card">
      <div class="config-row">
        <span class="config-label">使用字符</span>
        <div class="char-checks">
          <el-checkbox v-model="useNumber">0-9 数字</el-checkbox>
          <el-checkbox v-model="useLower">a-z 小写</el-checkbox>
          <el-checkbox v-model="useUpper">A-Z 大写</el-checkbox>
          <span class="pool-size">候选字符 {{ poolSize }} 个</span>
        </div>
      </div>

      <div class="config-row">
        <span class="config-label">特殊符号</span>
        <el-radio-group v-model="symbolMode">
          <el-radio-button value="off">关闭</el-radio-button>
          <el-radio-button value="common">常见</el-radio-button>
          <el-radio-button value="all">全部</el-radio-button>
        </el-radio-group>
      </div>

      <el-row :gutter="16">
        <el-col :xs="12" :sm="8">
          <div class="config-item">
            <span class="config-label">生成数量</span>
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
            <span class="config-label">密码长度</span>
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
            <span class="config-label">包含字符</span>
            <el-input v-model="includeChars" placeholder="可选，添加到候选字符池" />
          </div>
        </el-col>
        <el-col :xs="24" :sm="12">
          <div class="config-item">
            <span class="config-label">排除字符</span>
            <el-input v-model="excludeChars" placeholder="可选" />
          </div>
        </el-col>
      </el-row>
    </div>

    <div class="action-bar">
      <el-button type="primary" @click="generate">生成密码</el-button>
      <el-button @click="copyResult">复制结果</el-button>
      <el-button @click="clearResult">清空</el-button>
    </div>

    <div class="result-card">
      <div class="result-header">
        <span class="config-label">生成结果</span>
        <span v-if="result" class="result-count">{{ result.split('\n').length }} 条</span>
      </div>
      <el-input
        v-model="result"
        type="textarea"
        :autosize="{ minRows: 10, maxRows: 20 }"
        readonly
        placeholder="生成结果将在这里显示"
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
