import { site } from '~/config/site'

export function usePageSeo(options: {
  title: string
  description: string
  path: string
  type?: 'website' | 'WebApplication'
}) {
  const url = `${site.url}${options.path}`

  useSeoMeta({
    title: options.title,
    ogTitle: options.title,
    ogDescription: options.description,
    ogType: 'website',
    ogUrl: url,
    twitterCard: 'summary',
    description: options.description,
    canonical: url,
  })

  const schemaType = options.type || 'website'
  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': schemaType === 'WebApplication' ? 'WebApplication' : 'WebSite',
          name: schemaType === 'WebApplication' ? options.title.replace(` - ${site.title}`, '') : site.title,
          description: options.description,
          url,
          ...(schemaType === 'WebApplication' ? { applicationCategory: 'DeveloperApplication' } : {}),
        }),
      },
    ],
  })
}
