import { defineToolMeta } from '~/tools/types'

export default defineToolMeta({
  title: 'OLY加解密',
  description: 'OLY文本加解密，AES/ECB模式，密钥通过SHA1PRNG派生',
  sort: 3,
  icon: 'Lock',
})
