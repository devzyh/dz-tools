import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createInterface } from 'node:readline'

const __dirname = dirname(fileURLToPath(import.meta.url))
const toolsDir = resolve(__dirname, '../app/tools')

const rl = createInterface({ input: process.stdin, output: process.stdout })

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => rl.question(prompt, resolve))
}

function close() { rl.close() }

function metaTemplate(title: string, description: string, sort: number) {
  return `import { defineToolMeta } from '~/tools/types'

export default defineToolMeta({
  title: '${title}',
  description: '${description}',
  sort: ${sort},
  icon: 'Edit',
  showHeader: true,
})
`
}

function componentTemplate() {
  return `<script setup lang="ts">
// 工具逻辑
</script>

<template>
  <div class="tool-form">
    <div class="tool-actions">
      <el-button type="primary">执行</el-button>
    </div>
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
`
}

function nextSort(groupDir: string): number {
  const entries = readdirSync(groupDir, { withFileTypes: true })
  let max = 0
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const metaPath = resolve(groupDir, entry.name, 'meta.ts')
    if (!existsSync(metaPath)) continue
    const content = readFileSync(metaPath, 'utf-8')
    const match = content.match(/sort:\s*(\d+)/)
    if (match) max = Math.max(max, parseInt(match[1]))
  }
  return max + 1
}

async function main() {
  const name = (await question('工具目录名 (kebab-case, e.g. json-editor): ')).trim()
  if (!name) { console.error('工具名不能为空'); close(); process.exit(1) }

  const group = (await question('分组目录名 (e.g. developer): ')).trim()
  if (!group) { console.error('必须指定分组'); close(); process.exit(1) }

  const groupDir = resolve(toolsDir, group)

  if (!existsSync(groupDir)) {
    const create = (await question(`分组 "${group}" 不存在，是否创建？(Y/n): `)).trim().toLowerCase() !== 'n'
    if (create) {
      const groupTitle = (await question(`分组显示标题 (回车默认 "${group}"): `)).trim() || group
      mkdirSync(groupDir, { recursive: true })
      writeFileSync(resolve(groupDir, 'meta.ts'),
        `import { defineGroupMeta } from '~/tools/types'\n\nexport default defineGroupMeta({\n  title: '${groupTitle}',\n  description: null,\n  sort: 1,\n})\n`
      )
      console.log(`已创建分组 ${group}/`)
    } else {
      console.error('操作取消'); close(); process.exit(1)
    }
  }

  const title = (await question('工具标题 (中文): ')).trim()
  if (!title) { console.error('工具标题不能为空'); close(); process.exit(1) }
  const description = (await question('工具描述 (中文): ')).trim()

  const sort = nextSort(groupDir)
  const toolDir = resolve(groupDir, name)

  if (existsSync(toolDir)) {
    console.error(`工具已存在: ${toolDir}`); close(); process.exit(1)
  }

  mkdirSync(toolDir, { recursive: true })
  writeFileSync(resolve(toolDir, 'meta.ts'), metaTemplate(title, description, sort))
  writeFileSync(resolve(toolDir, 'tool.vue'), componentTemplate())

  console.log(`已创建工具: tools/${group}/${name}/`)
  close()
}

main().catch(e => { console.error(e); close(); process.exit(1) })
