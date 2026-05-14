<script setup lang="ts">
import { ref } from 'vue'
import CryptoJS from 'crypto-js'
import { ElMessage } from 'element-plus'

const { t } = useI18n()

const input = ref('')
const encoding = ref('hex')
const uppercase = ref(false)

interface HashResult {
  label: string
  value: string
}

const results = ref<HashResult[]>([])

const algorithms: { label: string; key: string; fn: (msg: string) => CryptoJS.lib.WordArray; format?: (hash: string) => string }[] = [
  { label: 'MD5', key: 'md5', fn: (msg) => CryptoJS.MD5(msg) },
  { label: 'MD5(16位)', key: 'md5_16', fn: (msg) => CryptoJS.MD5(msg), format: (h) => h.substring(8, 24) },
  { label: 'SHA-1', key: 'sha1', fn: (msg) => CryptoJS.SHA1(msg) },
  { label: 'SHA-224', key: 'sha224', fn: (msg) => CryptoJS.SHA224(msg) },
  { label: 'SHA-256', key: 'sha256', fn: (msg) => CryptoJS.SHA256(msg) },
  { label: 'SHA-384', key: 'sha384', fn: (msg) => CryptoJS.SHA384(msg) },
  { label: 'SHA-512', key: 'sha512', fn: (msg) => CryptoJS.SHA512(msg) },
  { label: 'SHA-3', key: 'sha3', fn: (msg) => CryptoJS.SHA3(msg) },
  { label: 'RIPEMD-160', key: 'ripemd160', fn: (msg) => CryptoJS.RIPEMD160(msg) },
]

function formatHash(hash: CryptoJS.lib.WordArray): string {
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

function compute() {
  if (!input.value) {
    ElMessage.warning(t('tools.hash.pleaseInput'))
    return
  }
  results.value = algorithms.map(({ label, fn, format }) => ({
    label,
    value: format ? format(formatHash(fn(input.value))) : formatHash(fn(input.value)),
  }))
}

function copy(value: string) {
  navigator.clipboard.writeText(value)
  ElMessage.success(t('tools.hash.copied'))
}
</script>

<template>
  <div class="hash-tool">
    <el-input
      v-model="input"
      type="textarea"
      :rows="5"
      :placeholder="$t('tools.hash.inputPlaceholder')"
    />
    <div class="tool-actions">
      <el-select v-model="encoding" style="width: 180px">
        <el-option :label="$t('tools.hash.hex')" value="hex" />
        <el-option :label="$t('tools.hash.binary')" value="binary" />
        <el-option :label="$t('tools.hash.base64')" value="base64" />
        <el-option :label="$t('tools.hash.urlSafeBase64')" value="urlsafe-base64" />
      </el-select>
      <el-checkbox v-model="uppercase">{{ $t('tools.hash.uppercase') }}</el-checkbox>
      <el-button type="primary" @click="compute">{{ $t('tools.hash.compute') }}</el-button>
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
