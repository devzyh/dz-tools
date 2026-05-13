import type { ToolMeta, GroupMeta, ResolvedTool, ResolvedGroup, ResolvedEntry } from './types'

// Scan group meta files (first level: tools/{group}/meta.ts)
const groupMetaModules = import.meta.glob<{ default: GroupMeta }>(
  './*/meta.ts',
  { eager: true }
)

// Scan tool meta files (second level: tools/{group}/{tool}/meta.ts)
const toolMetaModules = import.meta.glob<{ default: ToolMeta }>(
  './*/[^.]*/meta.ts',
  { eager: true }
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
    if (groupEntry && !groupEntry.meta.hidden) {
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

export const registry = {
  groups,
  allTools,
  findTool,
  findGroup,
  resolve,
  getGroupTools,
  getAllSlugs,
} as const
