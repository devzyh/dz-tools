import type { ToolMeta, GroupMeta, ResolvedTool, ResolvedGroup, ResolvedEntry } from './types'

// 扫描分组元数据文件（一级：tools/{group}/meta.ts）
const groupMetaModules = import.meta.glob<{ default: GroupMeta }>(
  './*/meta.ts',
  { eager: true }
)

// 扫描工具元数据文件（二级：tools/{group}/{tool}/meta.ts）
const toolMetaModules = import.meta.glob<{ default: ToolMeta }>(
  './*/[^.]*/meta.ts',
  { eager: true }
)

// 扫描工具 Vue 组件（二级：tools/{group}/{tool}/*.vue）
const toolComponentModules = import.meta.glob<{ default: any }>(
  './**/*.vue',
  { eager: false }
)

function resolveGroups(): ResolvedGroup[] {
  const groups: Map<string, ResolvedGroup> = new Map()

  for (const [filePath, mod] of Object.entries(groupMetaModules)) {
    const match = filePath.match(/\.\/([^/]+)\/meta\.ts$/)
    if (!match) continue
    const slug = match[1]
    groups.set(slug, {
      slug,
      meta: mod.default,
      tools: [],
    })
  }

  for (const [filePath, mod] of Object.entries(toolMetaModules)) {
    const match = filePath.match(/\.\/([^/]+)\/([^/]+)\/meta\.ts$/)
    if (!match) continue
    const group = match[1]
    const slug = match[2]

    if (mod.default.hidden) continue

    const tool: ResolvedTool = {
      slug,
      group,
      meta: mod.default,
    }

    const groupEntry = groups.get(group)
    if (groupEntry) {
      groupEntry.tools.push(tool)
    }
  }

  for (const group of groups.values()) {
    group.tools.sort((a, b) => a.meta.sort - b.meta.sort)
  }

  return Array.from(groups.values()).sort((a, b) => a.meta.sort - b.meta.sort)
}

const groups = resolveGroups()
const allTools: ResolvedTool[] = groups.flatMap(g => g.tools)

function findTool(slug: string): ResolvedTool | undefined {
  return allTools.find(t => t.slug === slug)
}

function findGroup(slug: string): ResolvedGroup | undefined {
  return groups.find(g => g.slug === slug)
}

function resolve(slug: string): ResolvedEntry | undefined {
  return findTool(slug) || findGroup(slug)
}

function getGroupTools(group: string): ResolvedTool[] {
  return findGroup(group)?.tools || []
}

function getAllSlugs(): string[] {
  const slugs: string[] = []
  for (const group of groups) {
    if (!group.meta.hidden) slugs.push(group.slug)
    slugs.push(...group.tools.map(t => t.slug))
  }
  return slugs
}

function getToolComponent(group: string, toolSlug: string): (() => Promise<any>) | null {
  const componentKey = Object.keys(toolComponentModules).find(key => {
    const match = key.match(/\.\/([^/]+)\/([^/]+)\/[^.]+\.vue$/)
    if (!match) return false
    return match[1] === group && match[2] === toolSlug
  })
  return componentKey ? toolComponentModules[componentKey] : null
}

export const registry = {
  groups,
  allTools,
  findTool,
  findGroup,
  resolve,
  getGroupTools,
  getAllSlugs,
  getToolComponent,
} as const
