<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'

const { t } = useI18n()

const ip = ref('')
const loading = ref(true)
const curlCmd = ref('')
const copiedTarget = ref<'ip' | 'curl' | null>(null)
const error = ref('')

const IPV4_REG = /^(\d{1,3}\.){3}\d{1,3}$/

onMounted(async () => {
  curlCmd.value = `curl ${location.protocol}//${location.host}/ip`
  try {
    const res = await fetch('/ip')
    if (!res.ok) {
      error.value = t('tools.myip.serviceUnavailable')
      return
    }
    const text = (await res.text()).trim()
    if (!IPV4_REG.test(text)) {
      error.value = t('tools.myip.invalidIp')
      return
    }
    ip.value = text
  } catch {
    error.value = t('tools.myip.networkError')
  } finally {
    loading.value = false
  }
})

function copy() {
  if (!ip.value) return
  navigator.clipboard.writeText(ip.value)
  copiedTarget.value = 'ip'
  ElMessage.success(t('tools.myip.ipCopied'))
}

function copyCurl() {
  if (!curlCmd.value) return
  navigator.clipboard.writeText(curlCmd.value)
  copiedTarget.value = 'curl'
  ElMessage.success(t('tools.myip.curlCopied'))
}
</script>

<template>
  <div class="ip-tool">
    <div v-if="loading" class="ip-loading">
      <el-icon class="is-loading" :size="20"><Loading /></el-icon>
      <span>{{ $t('tools.myip.querying') }}</span>
    </div>
    <template v-else-if="ip">
      <div class="ip-card" @click="copy">
        <span class="ip-text">{{ ip }}</span>
        <span class="copy-hint">{{ copiedTarget === 'ip' ? $t('tools.myip.copied') : $t('tools.myip.copyIp') }}</span>
      </div>
    </template>
    <div v-if="curlCmd" class="curl-section">
      <p class="curl-tip">{{ $t('tools.myip.curlTip') }}</p>
      <div class="curl-card" @click="copyCurl">
        <code class="curl-cmd">{{ curlCmd }}</code>
        <span class="curl-hint">{{ copiedTarget === 'curl' ? $t('tools.myip.copied') : $t('tools.myip.clickToCopy') }}</span>
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
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.ip-card,
.curl-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.2s;

  &:hover {
    border-color: var(--el-color-primary);
  }
}

.curl-card {
  background: var(--el-fill-color);
  border-color: transparent;

  &:hover {
    border-color: var(--el-border-color);
    background: var(--el-fill-color-light);
  }
}

.ip-text {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 22px;
  font-weight: 500;
  letter-spacing: 1px;
  color: var(--el-text-color-primary);
  font-variant-numeric: tabular-nums;
}

.copy-hint {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  white-space: nowrap;
}

.curl-cmd {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  color: var(--el-text-color-regular);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.curl-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

.curl-section {
  width: 100%;
}

.curl-tip {
  margin: 0 0 8px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.curl-hint {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  white-space: nowrap;
}

.ip-error {
  color: var(--el-text-color-secondary);
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
