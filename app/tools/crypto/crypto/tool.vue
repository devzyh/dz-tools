<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

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

async function encrypt() {
  if (!input.value.trim()) { ElMessage.warning('请输入内容'); return }
  if (!key.value.trim()) { ElMessage.warning('请输入密钥'); return }
  try {
    const CryptoJS = (await import('crypto-js')).default
    let encrypted: ReturnType<typeof CryptoJS.AES.encrypt>
    switch (algorithm.value) {
      case 'AES': encrypted = CryptoJS.AES.encrypt(input.value, key.value); break
      case 'TripleDES': encrypted = CryptoJS.TripleDES.encrypt(input.value, key.value); break
      case 'Rabbit': encrypted = CryptoJS.Rabbit.encrypt(input.value, key.value); break
      case 'RC4': encrypted = CryptoJS.RC4.encrypt(input.value, key.value); break
      default: throw new Error('不支持的算法')
    }
    output.value = encrypted.toString()
  } catch (err) {
    ElMessage.error('加密失败：' + (err as Error).message)
  }
}

async function decrypt() {
  if (!input.value.trim()) { ElMessage.warning('请输入内容'); return }
  if (!key.value.trim()) { ElMessage.warning('请输入密钥'); return }
  try {
    const CryptoJS = (await import('crypto-js')).default
    let decrypted: ReturnType<typeof CryptoJS.AES.decrypt>
    switch (algorithm.value) {
      case 'AES': decrypted = CryptoJS.AES.decrypt(input.value, key.value); break
      case 'TripleDES': decrypted = CryptoJS.TripleDES.decrypt(input.value, key.value); break
      case 'Rabbit': decrypted = CryptoJS.Rabbit.decrypt(input.value, key.value); break
      case 'RC4': decrypted = CryptoJS.RC4.decrypt(input.value, key.value); break
      default: throw new Error('不支持的算法')
    }
    output.value = decrypted.toString(CryptoJS.enc.Utf8)
  } catch (err) {
    ElMessage.error('解密失败：' + (err as Error).message)
  }
}

function copy() {
  if (!output.value) { ElMessage.warning('没有可复制的内容'); return }
  navigator.clipboard.writeText(output.value)
  ElMessage.success('已复制')
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
        <el-input v-model="key" :placeholder="'加密/解密密钥'" />
        <el-button @click="generateKey">随机</el-button>
      </div>
    </div>
    <el-input
      v-model="input"
      type="textarea"
      :rows="5"
      :placeholder="'请输入需要加密或解密的内容'"
    />
    <div class="tool-actions">
      <el-button type="success" @click="encrypt">加密</el-button>
      <el-button type="warning" @click="decrypt">解密</el-button>
      <el-button @click="copy">复制</el-button>
    </div>
    <el-input
      v-model="output"
      type="textarea"
      :rows="5"
      readonly
      :placeholder="'处理结果将在这里显示'"
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
