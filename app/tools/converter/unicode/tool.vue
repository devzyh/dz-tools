<script setup lang="ts">
import { computed } from 'vue'

const input = useCachedText('dz-tools-unicode-input', '')
const activeTab = useCachedRef<'charToCode' | 'codeToChar'>('dz-tools-unicode-tab', 'charToCode')
const codeBase = useCachedRef<'hex' | 'dec' | 'oct' | 'binary'>('dz-tools-unicode-base', 'hex')
const codeInput = useCachedText('dz-tools-unicode-code', '')

const tabItems = [
  { label: '字符 → 编码', value: 'charToCode', slot: 'charToCode' },
  { label: '编码 → 字符', value: 'codeToChar', slot: 'codeToChar' },
]

const codeBaseItems = [
  { label: 'HEX', value: 'hex' },
  { label: 'DEC', value: 'dec' },
  { label: 'OCT', value: 'oct' },
  { label: 'BIN', value: 'binary' },
]

function parseCodeInput(raw: string, base: string): number[] {
  const tokens = raw
    .trim()
    .split(/[\s,;]+/)
    .filter(Boolean)
  const results: number[] = []
  for (const token of tokens) {
    let normalized = token
    if (base === 'hex') {
      if (/^\\u/i.test(token)) normalized = token.replace(/^\\u/i, '0x')
      else if (/^U\+/i.test(token)) normalized = token.replace(/^U\+/i, '0x')
      else if (/^&#x/i.test(token)) normalized = token.replace(/^&#x/i, '0x').replace(/;$/, '')
      else if (!/^0x/i.test(token)) normalized = '0x' + token
    } else if (base === 'dec') {
      if (/^&#(\d+);?$/.test(token)) normalized = token.replace(/^&#/, '').replace(/;$/, '')
      else if (/^0x/i.test(token)) normalized = token
    }
    const num = Number(normalized)
    if (!isNaN(num) && num >= 0 && num <= 0x10ffff) results.push(num)
  }
  return results
}

function encodeUtf8(cp: number): string {
  const bytes: number[] = []
  if (cp <= 0x7f) bytes.push(cp)
  else if (cp <= 0x7ff) {
    bytes.push(0xc0 | (cp >> 6), 0x80 | (cp & 0x3f))
  } else if (cp <= 0xffff) {
    bytes.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f))
  } else {
    bytes.push(
      0xf0 | (cp >> 18),
      0x80 | ((cp >> 12) & 0x3f),
      0x80 | ((cp >> 6) & 0x3f),
      0x80 | (cp & 0x3f),
    )
  }
  return bytes.map((b) => b.toString(16).toUpperCase().padStart(2, '0')).join(' ')
}

function getCharName(cp: number): string {
  const ranges: [number, number, string][] = [
    [0x00, 0x1f, '控制字符'],
    [0x20, 0x20, '空格'],
    [0x30, 0x39, '数字'],
    [0x41, 0x5a, '大写字母'],
    [0x61, 0x7a, '小写字母'],
    [0x7f, 0x9f, '控制字符'],
    [0xa0, 0xbf, '拉丁扩展'],
    [0x3000, 0x303f, 'CJK 标点'],
    [0x3400, 0x4dbf, 'CJK 扩展 A'],
    [0x4e00, 0x9fff, 'CJK 汉字'],
    [0xf900, 0xfaff, 'CJK 兼容汉字'],
    [0xff00, 0xffef, '全角字符'],
    [0xfe30, 0xfe4f, 'CJK 兼容形式'],
    [0x2000, 0x206f, '通用标点'],
    [0xac00, 0xd7af, '韩文音节'],
    [0x3040, 0x309f, '平假名'],
    [0x30a0, 0x30ff, '片假名'],
    [0x0400, 0x04ff, '西里尔字母'],
    [0x0600, 0x06ff, '阿拉伯字母'],
    [0x1f300, 0x1f5ff, '象形文字'],
    [0x1f600, 0x1f64f, '表情符号'],
    [0x1f680, 0x1f6ff, '交通地图'],
    [0x1f900, 0x1f9ff, '补充符号'],
    [0x2600, 0x26ff, '杂项符号'],
    [0x2700, 0x27bf, '装饰符号'],
  ]
  for (const [start, end, name] of ranges) {
    if (cp >= start && cp <= end) return name
  }
  return '其他'
}

const charToCodeResults = computed(() => {
  return [...input.value].map((char) => {
    const cp = char.codePointAt(0)!
    return {
      char,
      unicode: 'U+' + cp.toString(16).toUpperCase().padStart(4, '0'),
      decimal: String(cp),
      utf8: encodeUtf8(cp),
      name: getCharName(cp),
    }
  })
})

const codeToCharResults = computed(() => {
  if (!codeInput.value.trim()) return []
  return parseCodeInput(codeInput.value, codeBase.value).map((cp) => ({
    char: String.fromCodePoint(cp),
    cp,
    unicode: 'U+' + cp.toString(16).toUpperCase().padStart(4, '0'),
    name: getCharName(cp),
  }))
})
</script>

<template>
  <div class="unicode-tool">
    <UTabs v-model="activeTab" :items="tabItems">
      <template #charToCode>
        <div class="tab-content">
          <UTextarea
            v-model="input"
            placeholder="输入要查询的字符..."
            :rows="3"
            autoresize
            class="resize-none"
          />
          <div v-if="charToCodeResults.length" class="char-grid">
            <div v-for="(item, idx) in charToCodeResults" :key="idx" class="char-card">
              <div class="char-display">{{ item.char === ' ' ? '␣' : item.char }}</div>
              <div class="char-info">
                <span class="char-unicode" @click="copyToClipboard(item.unicode)">{{
                  item.unicode
                }}</span>
                <span class="char-name">{{ item.name }}</span>
              </div>
              <div class="char-detail">
                <span>DEC {{ item.decimal }}</span>
                <span>UTF-8 {{ item.utf8 }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #codeToChar>
        <div class="tab-content">
          <div class="config-row">
            <URadioGroup
              v-model="codeBase"
              variant="table"
              orientation="horizontal"
              :items="codeBaseItems"
            />
          </div>
          <UTextarea
            v-model="codeInput"
            :placeholder="
              codeBase === 'hex'
                ? '输入编码，如 4E2D U+4E2D \\u4E2D，空格分隔'
                : `输入${{ hex: '十六进制', dec: '十进制', oct: '八进制', binary: '二进制' }[codeBase]}编码，空格分隔`
            "
            :rows="3"
            autoresize
            class="resize-none"
          />
          <div v-if="codeToCharResults.length" class="char-grid">
            <div v-for="(item, idx) in codeToCharResults" :key="idx" class="char-card">
              <div class="char-display">{{ item.char === ' ' ? '␣' : item.char }}</div>
              <div class="char-info">
                <span class="char-unicode" @click="copyToClipboard(item.unicode)">{{
                  item.unicode
                }}</span>
                <span class="char-name">{{ item.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </UTabs>
  </div>
</template>

<style scoped lang="scss">
.unicode-tool {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 12px;
}

.config-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.char-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
  max-height: 420px;
  overflow-y: auto;
  padding: 2px;
}

.char-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: var(--ui-bg-muted);
  border: 1px solid var(--ui-border);
  border-radius: 8px;
  padding: 12px;
  transition: border-color 0.2s;

  &:hover {
    border-color: color-mix(in srgb, var(--ui-primary) 50%, transparent);
  }
}

.char-display {
  font-size: 28px;
  line-height: 1.3;
  min-height: 36px;
  word-break: break-all;
}

.char-info {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}

.char-unicode {
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 13px;
  font-weight: 600;
  color: var(--ui-primary);
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

.char-name {
  font-size: 12px;
  color: var(--ui-text-muted);
}

.char-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-family: 'Cascadia Code', 'Fira Code', Consolas, monospace;
  font-size: 11px;
  color: var(--ui-text-dimmed);
  line-height: 1.5;
}

@media (max-width: 768px) {
  .char-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 8px;
  }
}
</style>
