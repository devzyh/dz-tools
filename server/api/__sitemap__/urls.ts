import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'

interface Meta {
  hidden?: boolean
  [key: string]: unknown
}

export default defineEventHandler(async () => {
  const staticUrls = ['/', '/about', '/links']
  const toolsDir = resolve(process.cwd(), 'app/tools')
  const dynamicUrls: string[] = []

  const groups = readdirSync(toolsDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('.'))

  for (const group of groups) {
    const groupMetaPath = resolve(toolsDir, group.name, 'meta.ts')
    const groupMod = await import(groupMetaPath).catch(() => null) as { default?: Meta } | null
    if (groupMod?.default?.hidden) continue

    const toolDirs = readdirSync(resolve(toolsDir, group.name), { withFileTypes: true })
      .filter(d => d.isDirectory() && !d.name.startsWith('.'))

    for (const tool of toolDirs) {
      const toolMetaPath = resolve(toolsDir, group.name, tool.name, 'meta.ts')
      const toolMod = await import(toolMetaPath).catch(() => null) as { default?: Meta } | null
      if (toolMod?.default?.hidden) continue
      dynamicUrls.push(`/${tool.name}`)
    }
  }

  return [...staticUrls, ...dynamicUrls].map(url => ({
    loc: url,
    lastmod: new Date().toISOString(),
  }))
})
