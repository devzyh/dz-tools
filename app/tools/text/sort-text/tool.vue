<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { sortLines, type SortDimension, type SortDirection } from './sort'

const input = ref('')
const output = ref('')

const dimension = ref<SortDimension>('name')
const direction = ref<SortDirection>('asc')
const trim = ref(true)
const removeEmpty = ref(true)
const unique = ref(false)
const ignoreCase = ref(false)

const dimensions: { label: string; value: SortDimension }[] = [
  { label: '名称', value: 'name' },
  { label: '数值', value: 'number' },
  { label: '长度', value: 'length' },
  { label: '自然序', value: 'natural' },
  { label: '随机', value: 'random' },
]

const isRandom = computed(() => dimension.value === 'random')

function sort() {
  if (!input.value.trim()) {
    ElMessage.warning('请输入文本内容')
    return
  }
  const result = sortLines(input.value, {
    dimension: dimension.value,
    direction: direction.value,
    trim: trim.value,
    removeEmpty: removeEmpty.value,
    unique: unique.value,
    ignoreCase: ignoreCase.value,
  })
  output.value = result.join('\n')
  ElMessage.success(`已排序 ${result.length} 项`)
}

function copy() {
  if (!output.value) {
    ElMessage.warning('没有可复制的内容')
    return
  }
  copyToClipboard(output.value)
}
</script>

<template>
  <div class="sort-text-tool">
    <div class="config-card">
      <div class="config-row">
        <span class="config-label">排序维度</span>
        <el-select v-model="dimension" style="width: 140px">
          <el-option v-for="d in dimensions" :key="d.value" :label="d.label" :value="d.value" />
        </el-select>
        <span class="config-label">方向</span>
        <el-radio-group v-model="direction" :disabled="isRandom">
          <el-radio value="asc">升序</el-radio>
          <el-radio value="desc">降序</el-radio>
        </el-radio-group>
      </div>
      <div class="config-row">
        <el-checkbox v-model="trim">去除首尾空白</el-checkbox>
        <el-checkbox v-model="removeEmpty">去除空行</el-checkbox>
        <el-checkbox v-model="unique">去重</el-checkbox>
        <el-checkbox v-model="ignoreCase">忽略大小写</el-checkbox>
      </div>
    </div>

    <el-input
      v-model="input"
      type="textarea"
      :rows="10"
      :placeholder="'请输入多行文本，每行一个元素'"
    />

    <div class="action-bar">
      <el-button type="primary" @click="sort">排序</el-button>
      <el-button @click="copy">复制</el-button>
    </div>

    <div class="result-card">
      <div class="result-header">
        <span class="config-label">排序结果</span>
      </div>
      <el-input
        v-model="output"
        type="textarea"
        :autosize="{ minRows: 4, maxRows: 20 }"
        readonly
        :placeholder="'排序结果将在这里显示'"
        class="result-textarea"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.sort-text-tool {
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
  align-items: center;
  gap: 12px;
}

.config-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  white-space: nowrap;
  line-height: 32px;
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

.result-textarea {
  :deep(.el-textarea__inner) {
    font-family: 'Courier New', Courier, monospace;
    font-size: 14px;
    line-height: 1.8;
    word-break: break-all;
  }
}

.action-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .config-card {
    padding: 14px;
    gap: 14px;
  }

  .config-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .action-bar {
    justify-content: flex-start;
  }
}
</style>
