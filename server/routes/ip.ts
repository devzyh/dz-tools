export default defineEventHandler((event) => {
  const headers = getRequestHeaders(event)
  const forwarded = headers['x-forwarded-for']
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim()
  }
  const realIp = headers['x-real-ip']
  if (typeof realIp === 'string' && realIp) {
    return realIp
  }
  return 'unknown'
})
