import { defineToolMeta } from '~/tools/types'

export default defineToolMeta({
  title: '文本差异',
  description: '对比两个文本的内容，高亮显示差异并支持合并',
  sort: 1,
  icon: 'Document',
  showHeader: false,
})
