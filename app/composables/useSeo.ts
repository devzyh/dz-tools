export function usePageSeo(options: {
  title: string
  description: string
  path: string
  type?: 'website' | 'WebApplication'
}) {
  const appConfig = useAppConfig()
  const url = `${appConfig.url}${options.path}`

  useSeoMeta({
    title: options.title,
    ogTitle: options.title,
    ogDescription: options.description,
    ogType: 'website',
    ogUrl: url,
    twitterCard: 'summary',
    description: options.description,
  })

  const schemaType = options.type || 'website'
  useHead({
    link: [{ rel: 'canonical', href: url }],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': schemaType === 'WebApplication' ? 'WebApplication' : 'WebSite',
          name: schemaType === 'WebApplication' ? options.title.replace(` - ${appConfig.title}`, '') : appConfig.title,
          description: options.description,
          url,
          ...(schemaType === 'WebApplication' ? { applicationCategory: 'DeveloperApplication' } : {}),
        }),
      },
    ],
  })
}
