<script setup lang="ts">
import { ref } from 'vue'
import CryptoJS from 'crypto-js'
import { ElMessage } from 'element-plus'

const { t } = useI18n()

const algorithm = ref('AES')
const input = ref('')
const key = ref('')
const output = ref('')

const keyLengths: Record<string, number> = {
  AES: 32,
  TripleDES: 24,
  Rabbit: 16,
  RC4: 16,
}

function generateKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const len = keyLengths[algorithm.value] || 16
  let result = ''
  for (let i = 0; i < len; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  key.value = result
}

function encrypt() {
  if (!input.value.trim()) { ElMessage.warning(t('tools.crypto.pleaseInput')); return }
  if (!key.value.trim()) { ElMessage.warning(t('tools.crypto.pleaseInputKey')); return }
  try {
    let encrypted: CryptoJS.lib.CipherParams
    switch (algorithm.value) {
      case 'AES': encrypted = CryptoJS.AES.encrypt(input.value, key.value); break
      case 'TripleDES': encrypted = CryptoJS.TripleDES.encrypt(input.value, key.value); break
      case 'Rabbit': encrypted = CryptoJS.Rabbit.encrypt(input.value, key.value); break
      case 'RC4': encrypted = CryptoJS.RC4.encrypt(input.value, key.value); break
      default: throw new Error(t('tools.crypto.unsupportedAlgo'))
    }
    output.value = encrypted.toString()
  } catch (err) {
    ElMessage.error(t('tools.crypto.encryptError') + (err as Error).message)
  }
}

function decrypt() {
  if (!input.value.trim()) { ElMessage.warning(t('tools.crypto.pleaseInput')); return }
  if (!key.value.trim()) { ElMessage.warning(t('tools.crypto.pleaseInputKey')); return }
  try {
    let decrypted: CryptoJS.lib.WordArray
    switch (algorithm.value) {
      case 'AES': decrypted = CryptoJS.AES.decrypt(input.value, key.value); break
      case 'TripleDES': decrypted = CryptoJS.TripleDES.decrypt(input.value, key.value); break
      case 'Rabbit': decrypted = CryptoJS.Rabbit.decrypt(input.value, key.value); break
      case 'RC4': decrypted = CryptoJS.RC4.decrypt(input.value, key.value); break
      default: throw new Error(t('tools.crypto.unsupportedAlgo'))
    }
    output.value = decrypted.toString(CryptoJS.enc.Utf8)
  } catch (err) {
    ElMessage.error(t('tools.crypto.decryptError') + (err as Error).message)
  }
}

function copy() {
  if (!output.value) { ElMessage.warning(t('tools.crypto.noContent')); return }
  navigator.clipboard.writeText(output.value)
  ElMessage.success(t('tools.crypto.copied'))
}

generateKey()
</script>

<template>
  <div class="tool-form">
    <div class="tool-row">
      <el-select v-model="algorithm" style="width: 200px">
        <el-option label="AES" value="AES" />
        <el-option label="TripleDES" value="TripleDES" />
        <el-option label="Rabbit" value="Rabbit" />
        <el-option label="RC4" value="RC4" />
      </el-select>
      <div class="key-group">
        <el-input v-model="key" :placeholder="$t('tools.crypto.keyPlaceholder')" />
        <el-button @click="generateKey">{{ $t('tools.crypto.random') }}</el-button>
      </div>
    </div>
    <el-input
      v-model="input"
      type="textarea"
      :rows="5"
      :placeholder="$t('tools.crypto.inputPlaceholder')"
    />
    <div class="tool-actions">
      <el-button type="success" @click="encrypt">{{ $t('tools.crypto.encrypt') }}</el-button>
      <el-button type="warning" @click="decrypt">{{ $t('tools.crypto.decrypt') }}</el-button>
      <el-button @click="copy">{{ $t('tools.crypto.copy') }}</el-button>
    </div>
    <el-input
      v-model="output"
      type="textarea"
      :rows="5"
      readonly
      :placeholder="$t('tools.crypto.resultPlaceholder')"
    />
  </div>
</template>

<style scoped lang="scss">
.tool-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tool-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.key-group {
  display: flex;
  gap: 8px;
  flex: 1;
  min-width: 200px;
}

.tool-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
