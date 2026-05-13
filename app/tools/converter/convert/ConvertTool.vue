<script setup lang="ts">
import { ref } from 'vue'
import jsYaml from 'js-yaml'
import { ElMessage } from 'element-plus'

const input = ref('')
const output = ref('')
type Format = 'json' | 'xml' | 'yaml'

const sourceFormat = ref<Format>('json')
const targetFormat = ref<Format>('yaml')

function convert() {
  if (!input.value.trim()) {
    ElMessage.warning('请输入需要转换的内容')
    return
  }
  try {
    const obj = parse(input.value, sourceFormat.value)
    output.value = stringify(obj, targetFormat.value)
  } catch (err) {
    ElMessage.error('转换失败：' + (err as Error).message)
  }
}

function parse(text: string, format: Format): any {
  switch (format) {
    case 'json':
      return JSON.parse(text)
    case 'yaml':
      return jsYaml.load(text)
    case 'xml':
      return xmlToJson(text)
    default:
      throw new Error('不支持的源格式')
  }
}

function stringify(obj: any, format: Format): string {
  switch (format) {
    case 'json':
      return JSON.stringify(obj, null, 2)
    case 'yaml':
      return jsYaml.dump(obj, { indent: 2, lineWidth: -1 })
    case 'xml':
      return jsonToXml(obj)
    default:
      throw new Error('不支持的目标格式')
  }
}

function xmlToJson(xml: string): any {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xml, 'text/xml')
  const error = doc.querySelector('parsererror')
  if (error) throw new Error('XML 解析错误：' + error.textContent)
  return xmlNodeToJson(doc.documentElement)
}

function xmlNodeToJson(node: Element): any {
  if (!node.children.length || (node.children.length === 1 && node.children[0].nodeName === '#text' && !node.attributes.length)) {
    return node.textContent?.trim() ?? ''
  }
  if (node.children.length === 1 && node.children[0].nodeName === '#text') {
    return node.textContent?.trim() ?? ''
  }
  const obj: any = {}
  if (node.attributes.length) {
    for (const attr of node.attributes) {
      obj['@' + attr.name] = attr.value
    }
  }
  const childMap: Record<string, any[]> = {}
  for (const child of node.children) {
    if (child.nodeName === '#text' && !child.textContent?.trim()) continue
    const key = child.nodeName
    if (!childMap[key]) childMap[key] = []
    childMap[key].push(xmlNodeToJson(child))
  }
  for (const [key, values] of Object.entries(childMap)) {
    obj[key] = values.length === 1 ? values[0] : values
  }
  return obj
}

function jsonToXml(obj: any, indent = ''): string {
  if (obj === null || obj === undefined) return ''
  if (typeof obj !== 'object') return String(obj)
  let xml = ''
  const sortedKeys = Object.keys(obj)
  for (const key of sortedKeys) {
    if (key.startsWith('@')) continue
    const val = obj[key]
    if (Array.isArray(val)) {
      for (const item of val) {
        xml += `${indent}<${key}>${typeof item === 'object' ? '\n' + jsonToXml(item, indent + '  ') + indent : escapeXml(String(item))}</${key}>\n`
      }
    } else {
      xml += `${indent}<${key}>${typeof val === 'object' ? '\n' + jsonToXml(val, indent + '  ') + indent : escapeXml(String(val))}</${key}>\n`
    }
  }
  return xml
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function swap() {
  const tmpFormat = sourceFormat.value
  sourceFormat.value = targetFormat.value
  targetFormat.value = tmpFormat
  input.value = output.value
  output.value = ''
}

function copy() {
  if (!output.value) { ElMessage.warning('没有可复制的内容'); return }
  navigator.clipboard.writeText(output.value)
  ElMessage.success('已复制')
}
</script>

<template>
  <div class="convert-tool">
    <div class="convert-toolbar">
      <el-radio-group v-model="sourceFormat">
        <el-radio-button value="json">JSON</el-radio-button>
        <el-radio-button value="xml">XML</el-radio-button>
        <el-radio-button value="yaml">YAML</el-radio-button>
      </el-radio-group>
      <span class="convert-arrow">&rarr;</span>
      <el-radio-group v-model="targetFormat">
        <el-radio-button value="json">JSON</el-radio-button>
        <el-radio-button value="xml">XML</el-radio-button>
        <el-radio-button value="yaml">YAML</el-radio-button>
      </el-radio-group>
      <div class="toolbar-spacer" />
      <el-button type="primary" @click="convert">转换</el-button>
      <el-button @click="swap">互换</el-button>
      <el-button @click="copy">复制</el-button>
    </div>
    <div class="convert-panels">
      <el-input
        v-model="input"
        type="textarea"
        placeholder="请输入要转换的内容"
        class="convert-textarea"
      />
      <el-input
        v-model="output"
        type="textarea"
        readonly
        placeholder="转换结果将显示在这里"
        class="convert-textarea"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.convert-tool {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: calc(100vh - 160px);
  min-height: 400px;
}

.convert-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 10px 14px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  flex-shrink: 0;
}

.convert-arrow {
  font-size: 18px;
  color: var(--el-text-color-placeholder);
  margin: 0 4px;
}

.toolbar-spacer {
  flex: 1;
}

.convert-panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  flex: 1;
  min-height: 0;
}

.convert-textarea {
  :deep(.el-textarea__inner) {
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 13px;
    line-height: 1.6;
    resize: none;
    height: 100% !important;
  }
}

@media (max-width: 768px) {
  .convert-panels {
    grid-template-columns: 1fr;
  }

  .convert-toolbar {
    .convert-arrow {
      display: none;
    }
  }
}
</style>
