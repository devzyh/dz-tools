<script setup lang="ts">
import { ref } from 'vue'

// 密钥为敏感字段,不参与缓存
const input = useCachedText('dz-tools-oly-crypt-input', '')
const key = ref('')
const output = ref('')
const showCode = ref(false)
const message = useMessage()

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
  if (!input.value.trim()) {
    message.warning('请输入需要加密或解密的内容')
    return
  }
  if (!key.value.trim()) {
    message.warning('请输入密钥')
    return
  }
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
    message.error('加密失败：' + (err as Error).message)
  }
}

async function decrypt() {
  if (!input.value.trim()) {
    message.warning('请输入需要加密或解密的内容')
    return
  }
  if (!key.value.trim()) {
    message.warning('请输入密钥')
    return
  }
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
      message.error('解密失败，请检查密文和密钥是否正确')
      return
    }
    output.value = result
  } catch (err) {
    message.error('解密失败：' + (err as Error).message)
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
  if (!output.value) {
    message.warning('没有可复制的内容')
    return
  }
  copyToClipboard(output.value)
}

function copyCode() {
  copyToClipboard(javaCode, '代码已复制')
}
</script>

<template>
  <div class="tool-form">
    <div class="tool-actions">
      <UButton color="success" @click="encrypt">加密</UButton>
      <UButton color="warning" @click="decrypt">解密</UButton>
      <UButton color="neutral" variant="outline" @click="swap">交换</UButton>
      <UButton color="neutral" variant="outline" @click="copy">复制</UButton>
    </div>
    <UTextarea
      v-model="input"
      :rows="5"
      placeholder="请输入需要加密或解密的内容"
      class="fs-grow"
    />
    <div class="key-group">
      <UInput v-model="key" placeholder="请输入加密/解密密钥" />
      <UButton color="neutral" variant="outline" @click="generateKey">随机</UButton>
    </div>
    <UTextarea
      v-model="output"
      :rows="5"
      readonly
      placeholder="处理结果将在这里显示"
      class="fs-grow"
    />
    <div class="code-block">
      <div class="code-header" @click="showCode = !showCode">
        <span>Java 实现代码</span>
        <UButton variant="link" color="neutral" @click.stop="copyCode">复制</UButton>
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
  border: 1px solid var(--ui-border);
  border-radius: 6px;
  overflow: hidden;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--ui-bg-accented);
  font-size: 13px;
  color: var(--ui-text-muted);
  cursor: pointer;
  user-select: none;

  &:hover {
    background: color-mix(in srgb, var(--ui-bg-accented) 60%, var(--ui-bg-muted));
  }
}

.java-code {
  margin: 0;
  padding: 16px;
  background: var(--ui-bg-elevated);
  font-size: 13px;
  line-height: 1.7;
  overflow-x: auto;
  white-space: pre;
  border-top: 1px solid var(--ui-border);
}
</style>
