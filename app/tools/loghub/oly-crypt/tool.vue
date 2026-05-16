<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'



const input = ref('')
const key = ref('')
const output = ref('')
const showCode = ref(false)

const javaCode = `package cn.devzyh.tools.service.loghub;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;

public class LoghubOlyCryptService {

    public static String encrypt(String content, String password) {
        byte[] result = crypt(content.getBytes(StandardCharsets.UTF_8), password, true);
        return result == null ? content : byte2hex(result);
    }

    public static String decrypt(String content, String password) {
        byte[] result = crypt(hex2byte(content), password, false);
        return result == null ? content : new String(result, StandardCharsets.UTF_8);
    }

    private static byte[] crypt(byte[] content, String password, boolean encrypt) {
        try {
            KeyGenerator kgen = KeyGenerator.getInstance("AES");
            SecureRandom random = SecureRandom.getInstance("SHA1PRNG");
            random.setSeed(password.getBytes());
            kgen.init(128, random);
            SecretKey secretKey = kgen.generateKey();
            byte[] enCodeFormat = secretKey.getEncoded();
            SecretKeySpec key = new SecretKeySpec(enCodeFormat, "AES");

            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(encrypt ? Cipher.ENCRYPT_MODE : Cipher.DECRYPT_MODE, key);
            return cipher.doFinal(content);
        } catch (Exception e) {
            return null;
        }
    }

    static String byte2hex(byte[] bytes) {
        StringBuilder builder = new StringBuilder();
        for (byte b : bytes) {
            String hex = Integer.toHexString(b & 0xFF);
            if (hex.length() == 1) hex = '0' + hex;
            builder.append(hex.toUpperCase());
        }
        return builder.toString();
    }

    static byte[] hex2byte(String hex) {
        byte[] result = new byte[hex.length() / 2];
        for (int i = 0; i < hex.length() / 2; i++) {
            int high = Integer.parseInt(hex.substring(i * 2, i * 2 + 1), 16);
            int low = Integer.parseInt(hex.substring(i * 2 + 1, i * 2 + 2), 16);
            result[i] = (byte) (high * 16 + low);
        }
        return result;
    }
}`

async function encrypt() {
  if (!input.value.trim()) { ElMessage.warning('请输入内容'); return }
  if (!key.value.trim()) { ElMessage.warning('请输入密钥'); return }
  try {
    const CryptoJS = (await import('crypto-js')).default
    const state = CryptoJS.SHA1(key.value)
    const aesKey = CryptoJS.lib.WordArray.create(CryptoJS.SHA1(state).words.slice(0, 4))
    const encrypted = CryptoJS.AES.encrypt(input.value, aesKey, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    })
    output.value = encrypted.ciphertext.toString(CryptoJS.enc.Hex).toUpperCase()
  } catch (err) {
    ElMessage.error('加密失败：' + (err as Error).message)
  }
}

async function decrypt() {
  if (!input.value.trim()) { ElMessage.warning('请输入内容'); return }
  if (!key.value.trim()) { ElMessage.warning('请输入密钥'); return }
  try {
    const CryptoJS = (await import('crypto-js')).default
    const state = CryptoJS.SHA1(key.value)
    const aesKey = CryptoJS.lib.WordArray.create(CryptoJS.SHA1(state).words.slice(0, 4))
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Hex.parse(input.value),
    })
    const decrypted = CryptoJS.AES.decrypt(cipherParams, aesKey, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    })
    const result = decrypted.toString(CryptoJS.enc.Utf8)
    if (!result) {
      ElMessage.error('解密失败，请检查密文和密钥是否正确')
      return
    }
    output.value = result
  } catch (err) {
    ElMessage.error('解密失败：' + (err as Error).message)
  }
}

function generateKey() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 16; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  key.value = result
}

function swap() {
  const temp = input.value
  input.value = output.value
  output.value = temp
}

function copy() {
  if (!output.value) { ElMessage.warning('没有可复制的内容'); return }
  copyToClipboard(output.value)
}

function copyCode() {
  copyToClipboard(javaCode, '代码已复制')
}
</script>

<template>
  <div class="tool-form">
    <el-input
      v-model="input"
      type="textarea"
      :rows="5"
      placeholder="请输入需要加密或解密的内容"
    />
    <div class="key-group">
      <el-input v-model="key" placeholder="请输入加密/解密密钥" />
      <el-button @click="generateKey">随机</el-button>
    </div>
    <div class="tool-actions">
      <el-button type="success" @click="encrypt">加密</el-button>
      <el-button type="warning" @click="decrypt">解密</el-button>
      <el-button @click="swap">交换</el-button>
      <el-button @click="copy">复制</el-button>
    </div>
    <el-input
      v-model="output"
      type="textarea"
      :rows="5"
      readonly
      placeholder="处理结果将在这里显示"
    />
    <div class="code-block">
      <div class="code-header" @click="showCode = !showCode">
        <span>Java 实现代码</span>
        <el-button link size="small" @click.stop="copyCode">复制</el-button>
      </div>
      <pre v-show="showCode" class="java-code"><code>{{ javaCode }}</code></pre>
    </div>
  </div>
</template>

<style scoped lang="scss">
.tool-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.key-group {
  display: flex;
  gap: 8px;
}

.tool-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.code-block {
  border: 1px solid var(--el-border-color-lighter, #ebeef5);
  border-radius: 6px;
  overflow: hidden;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--el-fill-color, #f0f2f5);
  font-size: 13px;
  color: var(--el-text-color-secondary, #909399);
  cursor: pointer;
  user-select: none;

  &:hover {
    background: var(--el-fill-color-light, #f5f7fa);
  }
}

.java-code {
  margin: 0;
  padding: 16px;
  background: var(--el-bg-color, #fff);
  font-size: 13px;
  line-height: 1.7;
  overflow-x: auto;
  white-space: pre;
  border-top: 1px solid var(--el-border-color-lighter, #ebeef5);
}
</style>
