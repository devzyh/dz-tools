<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const input = useCachedText('dz-tools-groovy-sql-json-input', '')
const activeTab = useCachedRef('dz-tools-groovy-sql-json-tab', 'sql')
const sqlOutput = ref('')
const jsonOutput = ref('')

interface GroovyField {
  type: string
  name: string
  comment: string
}

interface DefineInfo {
  table: string
  idColumn: string
  cache: boolean
  cacheKey: string
  autoIncrement: boolean
  logHistory: boolean
}

function parseGroovy(code: string) {
  const lines = code.split('\n')
  let defineInfo: DefineInfo | null = null
  const fields: GroovyField[] = []
  let inDefine = false
  let defineContent = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // 解析 static DEFINE = define([ ... ])
    if (line.includes('static DEFINE = define([')) {
      inDefine = true
      defineContent = line
      continue
    }
    if (inDefine) {
      defineContent += '\n' + line
      if (line.includes('])')) {
        inDefine = false
        // 解析 define 中的键值对
        defineInfo = {
          table: '',
          idColumn: 'id',
          cache: false,
          cacheKey: '',
          autoIncrement: false,
          logHistory: false,
        }
        const tableMatch = defineContent.match(/table\s*:\s*'([^']+)'/)
        if (tableMatch) defineInfo.table = tableMatch[1]
        const idColMatch = defineContent.match(/idColumn\s*:\s*'([^']+)'/)
        if (idColMatch) defineInfo.idColumn = idColMatch[1]
        const cacheMatch = defineContent.match(/cache\s*:\s*(true|false)/)
        if (cacheMatch) defineInfo.cache = cacheMatch[1] === 'true'
        const cacheKeyMatch = defineContent.match(/cacheKey\s*:\s*'([^']+)'/)
        if (cacheKeyMatch) defineInfo.cacheKey = cacheKeyMatch[1]
        const autoIncMatch = defineContent.match(/autoIncrement\s*:\s*(true|false)/)
        if (autoIncMatch) defineInfo.autoIncrement = autoIncMatch[1] === 'true'
        const logMatch = defineContent.match(/logHistory\s*:\s*(true|false)/)
        if (logMatch) defineInfo.logHistory = logMatch[1] === 'true'
      }
      continue
    }

    // 跳过非字段行：class声明、import、static、方法、空行、注解、闭包、子类等
    const firstWord = line.split(/[\s(]/)[0]
    const keywords = new Set([
      'if',
      'else',
      'for',
      'while',
      'switch',
      'case',
      'break',
      'continue',
      'return',
      'throw',
      'new',
      'try',
      'catch',
      'finally',
      'assert',
      'println',
      'super',
      'this',
    ])
    if (
      !line ||
      keywords.has(firstWord) ||
      line.startsWith('import ') ||
      line.startsWith('package ') ||
      line.startsWith('class ') ||
      line.startsWith('static ') ||
      line.startsWith('@') ||
      line.startsWith('//') ||
      line.startsWith('/*') ||
      line.startsWith('*') ||
      line.includes('implements ') ||
      line.includes('extends ') ||
      line.startsWith('public ') ||
      line.startsWith('private ') ||
      line.startsWith('protected ') ||
      line.startsWith('def ') ||
      line.includes('()') ||
      (line.includes('() {') === false && line.includes('{') && !line.includes('=')) ||
      line === '}' ||
      line === '})'
    ) {
      continue
    }

    // 匹配字段：类型 名称 // 注释（排除含括号的行，即方法调用）
    const fieldMatch = line.match(/^([A-Z]\w*)\s+(\w+)\s*(?:=\s*.+?)?\s*(?:\/\/\s*(.*))?$/)
    if (fieldMatch) {
      const [, type, name, comment] = fieldMatch
      // 跳过内部类相关
      if (type === 'static' || type === 'class' || type === 'final') continue
      if (['getEntityId', 'getCacheId', 'toString', 'hashCode'].includes(name)) continue
      fields.push({
        type,
        name,
        comment: (comment || '').trim(),
      })
    }
  }

  return { defineInfo, fields }
}

function dedupFields(fields: GroovyField[]): GroovyField[] {
  const seen = new Set<string>()
  return fields.filter((f) => {
    if (seen.has(f.name)) return false
    seen.add(f.name)
    return true
  })
}

function groovyTypeToSql(type: string, name: string, comment: string, isIdColumn: boolean): string {
  const auditColumns: Record<string, string> = {
    created: '  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP',
    createdBy:
      '  `createdBy` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL',
    lastUpdated:
      '  `lastUpdated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    lastUpdatedBy:
      '  `lastUpdatedBy` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL',
  }
  if (auditColumns[name]) return auditColumns[name]

  const mapping: Record<string, string> = {
    Long: 'BIGINT',
    BigDecimal: 'DECIMAL(18,6)',
    Boolean: 'TINYINT(1)',
    Date: 'DATETIME',
    LocalDateTime: 'DATETIME',
    LocalDate: 'DATE',
    Double: 'DOUBLE',
    Float: 'FLOAT',
    Short: 'SMALLINT',
    Byte: 'TINYINT',
  }

  let sqlType: string
  if (type === 'String') {
    sqlType = 'VARCHAR(50)'
  } else if (type === 'Integer') {
    sqlType = /id/i.test(name) ? 'BIGINT' : 'INT'
  } else {
    sqlType = mapping[type] || 'VARCHAR(50)'
  }
  const commentStr = comment ? ` COMMENT '${comment}'` : ''
  const nullable = isIdColumn ? 'NOT NULL' : 'DEFAULT NULL'
  const autoInc = isIdColumn && ['Long', 'Integer'].includes(type) ? ' AUTO_INCREMENT' : ''
  return `  \`${name}\` ${sqlType} ${nullable}${commentStr}${autoInc}`
}

function generateSql(defineInfo: DefineInfo | null, fields: GroovyField[]): string {
  if (!defineInfo || !defineInfo.table) {
    return `-- 未找到表定义（static DEFINE），请检查 Groovy 类是否包含 define 配置`
  }

  const tableName = defineInfo.table
  const lines: string[] = []
  lines.push(`DROP TABLE IF EXISTS \`${tableName}\`;`)
  lines.push('')
  lines.push(`CREATE TABLE \`${tableName}\` (`)

  const columnDefs: string[] = []
  for (const field of fields) {
    const isId = field.name === defineInfo.idColumn
    columnDefs.push(groovyTypeToSql(field.type, field.name, field.comment, isId))
  }

  lines.push(columnDefs.join(',\n') + ',')
  lines.push(`  PRIMARY KEY (\`${defineInfo.idColumn}\`)`)
  lines.push(`) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='${tableName}';`)

  return lines.join('\n')
}

function groovyTypeToJsonType(type: string): string {
  const mapping: Record<string, string> = {
    Long: 'integer',
    Integer: 'integer',
    BigDecimal: 'number',
    Boolean: 'integer',
    Double: 'number',
    Float: 'number',
    Short: 'integer',
    Byte: 'integer',
    Date: 'datetime',
    LocalDateTime: 'datetime',
    LocalDate: 'datetime',
    String: 'string',
  }
  return mapping[type] || 'string'
}

function generateJson(defineInfo: DefineInfo | null, fields: GroovyField[]): string {
  if (!defineInfo || !defineInfo.table) {
    return `// 未找到表定义`
  }

  const codeField = fields.find((f) => f.name.toLowerCase().includes('code'))
  const nameField = fields.find(
    (f) => f.name.toLowerCase() === 'name' || f.name.toLowerCase().includes('name'),
  )

  const json: Record<string, any> = {
    autoIncrementField: defineInfo.autoIncrement ? defineInfo.idColumn : undefined,
    code: defineInfo.table,
    idColumnName: defineInfo.idColumn,
    idAttr: codeField?.name || defineInfo.idColumn,
    labelAttr:
      codeField && nameField
        ? `${codeField.name},${nameField.name}`
        : nameField?.name || defineInfo.idColumn,
    logHistory: defineInfo.logHistory,
    service: defineInfo.table,
    tableName: defineInfo.table,
  }

  // 移除 undefined 值
  Object.keys(json).forEach((k) => json[k] === undefined && delete json[k])

  const fieldsJson = fields.map((f) => {
    const fieldObj: Record<string, string> = {
      field: f.name,
      id: f.name,
      name: f.comment || f.name,
      type: groovyTypeToJsonType(f.type),
    }
    return fieldObj
  })

  json.fields = fieldsJson

  return JSON.stringify(json, null, 2)
}

function convert() {
  if (!input.value.trim()) {
    ElMessage.warning('请输入 Groovy 实体类')
    return
  }

  const { defineInfo, fields } = parseGroovy(input.value)
  const uniqueFields = dedupFields(fields)

  if (uniqueFields.length === 0) {
    ElMessage.warning('未解析到任何字段')
    return
  }

  sqlOutput.value = generateSql(defineInfo, uniqueFields)
  jsonOutput.value = generateJson(defineInfo, uniqueFields)
  activeTab.value = 'sql'
  ElMessage.success(`解析完成，共 ${uniqueFields.length} 个字段`)
}

function copySql() {
  if (!sqlOutput.value) {
    ElMessage.warning('没有可复制的内容')
    return
  }
  copyToClipboard(sqlOutput.value, 'SQL 已复制')
}

function copyJson() {
  if (!jsonOutput.value) {
    ElMessage.warning('没有可复制的内容')
    return
  }
  copyToClipboard(jsonOutput.value, 'JSON 已复制')
}

function clear() {
  input.value = ''
  sqlOutput.value = ''
  jsonOutput.value = ''
}
</script>

<template>
  <div class="tool-form">
    <el-input v-model="input" type="textarea" :rows="12" placeholder="请粘贴 Groovy 实体类代码" />
    <div class="tool-actions">
      <el-button type="primary" @click="convert">转换</el-button>
      <el-button @click="copySql">复制SQL</el-button>
      <el-button @click="copyJson">复制JSON</el-button>
      <el-button @click="clear">清空</el-button>
    </div>
    <el-tabs v-if="sqlOutput || jsonOutput" v-model="activeTab">
      <el-tab-pane label="MySQL 建表语句" name="sql">
        <el-input v-model="sqlOutput" type="textarea" :rows="16" readonly />
      </el-tab-pane>
      <el-tab-pane label="界面 JSON" name="json">
        <el-input v-model="jsonOutput" type="textarea" :rows="16" readonly />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped lang="scss">
.tool-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tool-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
