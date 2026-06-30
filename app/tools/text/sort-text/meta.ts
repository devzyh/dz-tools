import { defineToolMeta } from '~/tools/types'

export default defineToolMeta({
  title: '文本排序',
  description: '按名称、数值、长度或自然序对多行文本升序降序排列，支持去重、去空行',
  sort: 6,
  icon: 'Sort',
})
