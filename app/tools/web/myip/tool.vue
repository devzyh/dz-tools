<script setup lang="ts">
import { ref, onMounted } from 'vue'

const ip = ref('')
const loading = ref(true)
const curlCmd = ref('')
const copiedTarget = ref<'ip' | 'curl' | null>(null)
const error = ref('')

const IP_REG = /^([0-9a-fA-F.:]+)$/

onMounted(async () => {
  curlCmd.value = `curl ${location.protocol}//${location.host}/ip`
  try {
    const res = await fetch('/ip')
    if (!res.ok) {
      error.value = '服务暂不可用，请稍后再试'
      return
    }
    const text = (await res.text()).trim()
    if (!text || text === 'unknown') {
      error.value = '未能获取到有效的 IP 地址'
      return
    }
    ip.value = text
  } catch {
    error.value = '网络连接失败，请检查网络后刷新重试'
  } finally {
    loading.value = false
  }
})

function copy() {
  if (!ip.value) return
  copyToClipboard(ip.value, 'IP 地址已复制')
  copiedTarget.value = 'ip'
}

function copyCurl() {
  if (!curlCmd.value) return
  copyToClipboard(curlCmd.value, '命令已复制')
  copiedTarget.value = 'curl'
}
</script>

<template>
  <div class="ip-tool">
    <div v-if="loading" class="ip-loading">
      <UIcon name="i-ep-loading" class="size-5 animate-spin" />
      <span>正在查询公网 IP...</span>
    </div>
    <template v-else-if="ip">
      <div class="ip-card" @click="copy">
        <span class="ip-text">{{ ip }}</span>
        <span class="copy-hint">{{ copiedTarget === 'ip' ? '已复制' : '复制 IP' }}</span>
      </div>
    </template>
    <div v-if="curlCmd" class="curl-section">
      <p class="curl-tip">直接复制下方的 CURL 命令执行 IP 查询</p>
      <div class="curl-card" @click="copyCurl">
        <code class="curl-cmd">{{ curlCmd }}</code>
        <span class="curl-hint">{{ copiedTarget === 'curl' ? '已复制' : '点击复制' }}</span>
      </div>
    </div>
    <div v-else-if="error" class="ip-error">
      <span>{{ error }}</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ip-tool {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 60px;
}

.ip-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--ui-text-muted);
  font-size: 14px;
}

.ip-card,
.curl-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border: 1px solid var(--ui-border-accented);
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s;

  &:hover {
    border-color: var(--ui-primary);
  }
}

.curl-card {
  background: var(--ui-bg-accented);
  border-color: transparent;

  &:hover {
    border-color: var(--ui-border-accented);
    background: var(--ui-bg-accented);
  }
}

.ip-text {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 22px;
  font-weight: 500;
  letter-spacing: 1px;
  color: var(--ui-text-highlighted);
  font-variant-numeric: tabular-nums;
}

.copy-hint {
  font-size: 12px;
  color: var(--ui-text-dimmed);
  white-space: nowrap;
}

.curl-cmd {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  color: var(--ui-text);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.curl-label {
  font-size: 12px;
  color: var(--ui-text-muted);
  white-space: nowrap;
}

.curl-section {
  width: 100%;
}

.curl-tip {
  margin: 0 0 8px;
  font-size: 13px;
  color: var(--ui-text-muted);
}

.curl-hint {
  font-size: 12px;
  color: var(--ui-text-dimmed);
  white-space: nowrap;
}

.ip-error {
  color: var(--ui-text-muted);
  font-size: 14px;
}

@media (max-width: 768px) {
  .ip-text {
    font-size: 18px;
  }

  .curl-cmd {
    font-size: 12px;
    white-space: normal;
    word-break: break-all;
  }
}
</style>
