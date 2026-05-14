import { registry } from '~/tools/registry'

export default defineEventHandler(() => {
  const staticUrls = ['/', '/about', '/links']
  const dynamicUrls = registry.getAllSlugs().map(slug => `/${slug}`)

  return [...staticUrls, ...dynamicUrls].map(url => ({
    loc: url,
    lastmod: new Date().toISOString(),
  }))
})
