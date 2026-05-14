<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const input = ref('')
const encoding = ref('hex')
const uppercase = ref(false)

interface HashResult {
  label: string
  value: string
}

const results = ref<HashResult[]>([])

async function compute() {
  if (!input.value) {
    ElMessage.warning('请输入需要计算哈希的文本')
    return
  }
  const CryptoJS = (await import('crypto-js')).default
  const algorithms = [
    { label: 'MD5', fn: (msg: string) => CryptoJS.MD5(msg) },
    { label: 'MD5(16位)', fn: (msg: string) => CryptoJS.MD5(msg), format: (h: string) => h.substring(8, 24) },
    { label: 'SHA-1', fn: (msg: string) => CryptoJS.SHA1(msg) },
    { label: 'SHA-224', fn: (msg: string) => CryptoJS.SHA224(msg) },
    { label: 'SHA-256', fn: (msg: string) => CryptoJS.SHA256(msg) },
    { label: 'SHA-384', fn: (msg: string) => CryptoJS.SHA384(msg) },
    { label: 'SHA-512', fn: (msg: string) => CryptoJS.SHA512(msg) },
    { label: 'SHA-3', fn: (msg: string) => CryptoJS.SHA3(msg) },
    { label: 'RIPEMD-160', fn: (msg: string) => CryptoJS.RIPEMD160(msg) },
  ]

  function formatHash(hash: ReturnType<typeof CryptoJS.MD5>): string {
    let result: string
    switch (encoding.value) {
      case 'binary':
        result = hash.toString(CryptoJS.enc.Binary).match(/.{1,8}/g)?.join(' ') || ''
        break
      case 'base64':
        result = hash.toString(CryptoJS.enc.Base64)
        break
      case 'urlsafe-base64':
        result = hash.toString(CryptoJS.enc.Base64).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
        break
      default:
        result = hash.toString(CryptoJS.enc.Hex)
    }
    return uppercase.value ? result.toUpperCase() : result
  }

  results.value = algorithms.map(({ label, fn, format }) => ({
    label,
    value: format ? format(formatHash(fn(input.value))) : formatHash(fn(input.value)),
  }))
}

function copy(value: string) {
  navigator.clipboard.writeText(value)
  ElMessage.success('已复制')
}
</script>

<template>
  <div class="hash-tool">
    <el-input
      v-model="input"
      type="textarea"
      :rows="5"
      :placeholder="'请输入需要计算哈希的文本'"
    />
    <div class="tool-actions">
      <el-select v-model="encoding" style="width: 180px">
        <el-option :label="'十六进制'" value="hex" />
        <el-option :label="'二进制'" value="binary" />
        <el-option :label="'Base64'" value="base64" />
        <el-option :label="'URL安全Base64'" value="urlsafe-base64" />
      </el-select>
      <el-checkbox v-model="uppercase">大写</el-checkbox>
      <el-button type="primary" @click="compute">计算哈希</el-button>
    </div>
    <div v-if="results.length" class="hash-results">
      <div v-for="item in results" :key="item.label" class="hash-row">
        <span class="hash-label">{{ item.label }}</span>
        <span class="hash-value" @click="copy(item.value)">{{ item.value }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.hash-tool {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tool-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.hash-results {
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  overflow: hidden;
}

.hash-row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--el-border-color-lighter);

  &:last-child {
    border-bottom: none;
  }
}

.hash-label {
  width: 120px;
  flex-shrink: 0;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-light);
  border-right: 1px solid var(--el-border-color-lighter);
}

.hash-value {
  flex: 1;
  padding: 8px 12px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  color: var(--el-text-color-primary);
  word-break: break-all;
  cursor: pointer;
  line-height: 1.6;

  &:hover {
    background: var(--el-fill-color-light);
  }
}

@media (max-width: 768px) {
  .hash-label {
    width: 90px;
    font-size: 12px;
    padding: 6px 8px;
  }

  .hash-value {
    padding: 6px 8px;
    font-size: 12px;
  }
}
</style>
