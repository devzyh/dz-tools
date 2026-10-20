<script setup lang="ts">
import { ref } from 'vue'

const input = useCachedText('dz-tools-hash-input', '')
const encoding = useCachedRef('dz-tools-hash-encoding', 'hex')
const uppercase = useCachedRef('dz-tools-hash-uppercase', false)
const message = useMessage()

const encodingItems = [
  { label: '十六进制', value: 'hex' },
  { label: '二进制', value: 'binary' },
  { label: 'Base64', value: 'base64' },
  { label: 'URL安全Base64', value: 'urlsafe-base64' },
]

interface HashResult {
  label: string
  value: string
}

const results = ref<HashResult[]>([])

async function compute() {
  if (!input.value) {
    message.warning('请输入需要计算哈希的文本')
    return
  }
  const CryptoJS = (await import('crypto-js')).default
  const algorithms = [
    { label: 'MD5', fn: (msg: string) => CryptoJS.MD5(msg) },
    {
      label: 'MD5(16位)',
      fn: (msg: string) => CryptoJS.MD5(msg),
      format: (h: string) => h.substring(8, 24),
    },
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
        result =
          hash
            .toString(CryptoJS.enc.Binary)
            .match(/.{1,8}/g)
            ?.join(' ') || ''
        break
      case 'base64':
        result = hash.toString(CryptoJS.enc.Base64)
        break
      case 'urlsafe-base64':
        result = hash
          .toString(CryptoJS.enc.Base64)
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '')
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
  copyToClipboard(value)
}
</script>

<template>
  <div class="hash-tool">
    <UTextarea v-model="input" :rows="5" placeholder="请输入需要计算哈希的文本" />
    <div class="tool-actions">
      <USelect v-model="encoding" :items="encodingItems" class="w-45" />
      <UCheckbox v-model="uppercase" label="大写" />
      <UButton @click="compute">计算哈希</UButton>
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
  border: 1px solid var(--ui-border-accented);
  border-radius: 8px;
  overflow: hidden;
}

.hash-row {
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--ui-border);

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
  color: var(--ui-text);
  background: var(--ui-bg-accented);
  border-right: 1px solid var(--ui-border);
}

.hash-value {
  flex: 1;
  padding: 8px 12px;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  color: var(--ui-text-highlighted);
  word-break: break-all;
  cursor: pointer;
  line-height: 1.6;

  &:hover {
    background: var(--ui-bg-accented);
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
