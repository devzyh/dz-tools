// 将 vditor 运行时静态资源复制到 public/vditor/dist，
// 编辑器初始化时配置 cdn: '/vditor' 即可从本站加载全部子模块，去除 jsdelivr 外网依赖
import { cpSync, rmSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)
const src = join(dirname(require.resolve('vditor/package.json')), 'dist')
const dest = join(process.cwd(), 'public', 'vditor', 'dist')

rmSync(dest, { recursive: true, force: true })
cpSync(src, dest, { recursive: true })
console.log(`vditor assets copied to ${dest}`)
