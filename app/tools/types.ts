export interface ToolMeta {
  title: string
  description: string
  sort: number
  icon?: string
  showHeader?: boolean
  hidden?: boolean
}

export interface GroupMeta {
  title: string
  description?: string | null
  sort: number
  hidden?: boolean
}

export interface ResolvedTool {
  slug: string
  group: string
  meta: ToolMeta
}

export interface ResolvedGroup {
  slug: string
  meta: GroupMeta
  tools: ResolvedTool[]
}

export type ResolvedEntry = ResolvedTool | ResolvedGroup

export function isTool(entry: ResolvedEntry): entry is ResolvedTool {
  return 'group' in entry
}

export function isGroup(entry: ResolvedEntry): entry is ResolvedGroup {
  return 'tools' in entry
}

export function defineToolMeta(meta: ToolMeta): ToolMeta {
  return meta
}

export function defineGroupMeta(meta: GroupMeta): GroupMeta {
  return meta
}
