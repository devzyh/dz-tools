export type SortDimension = 'name' | 'number' | 'length' | 'natural' | 'random'
export type SortDirection = 'asc' | 'desc'

export interface SortOptions {
  dimension: SortDimension
  direction: SortDirection
  trim: boolean
  removeEmpty: boolean
  unique: boolean
  ignoreCase: boolean
}

/** 自然序比较：使 file2 < file10。ignoreCase 仅作用于非数字段。 */
export function naturalCompare(a: string, b: string, ignoreCase = false): number {
  const ta = [...a.matchAll(/\d+|\D+/g)].map((m) => m[0])
  const tb = [...b.matchAll(/\d+|\D+/g)].map((m) => m[0])
  const len = Math.min(ta.length, tb.length)
  for (let i = 0; i < len; i++) {
    const x = ta[i]
    const y = tb[i]
    const xn = /^\d+$/.test(x)
    const yn = /^\d+$/.test(y)
    if (xn && yn) {
      const diff = Number(x) - Number(y)
      if (diff !== 0) return diff < 0 ? -1 : 1
    } else {
      const sx = ignoreCase ? x.toLowerCase() : x
      const sy = ignoreCase ? y.toLowerCase() : y
      if (sx < sy) return -1
      if (sx > sy) return 1
    }
  }
  return ta.length - tb.length
}

/** 提取行内首个数字（含负数、小数）；无数字返回 null。 */
export function extractNumber(line: string): number | null {
  const m = line.match(/-?\d+(\.\d+)?/)
  return m ? Number(m[0]) : null
}

/** 按选项对多行文本排序，返回结果行数组。 */
export function sortLines(input: string, opts: SortOptions): string[] {
  let lines = input.split('\n')
  if (opts.trim) lines = lines.map((l) => l.trim())
  if (opts.removeEmpty) lines = lines.filter((l) => l !== '')
  if (opts.unique) {
    const seen = new Set<string>()
    lines = lines.filter((l) => {
      if (seen.has(l)) return false
      seen.add(l)
      return true
    })
  }

  if (opts.dimension === 'random') {
    for (let i = lines.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[lines[i], lines[j]] = [lines[j], lines[i]]
    }
    return lines
  }

  const dir = opts.direction === 'desc' ? -1 : 1
  const cmpName = (a: string, b: string) => {
    const sa = opts.ignoreCase ? a.toLowerCase() : a
    const sb = opts.ignoreCase ? b.toLowerCase() : b
    return sa.localeCompare(sb)
  }

  lines.sort((a, b) => {
    switch (opts.dimension) {
      case 'name':
        return cmpName(a, b) * dir
      case 'length': {
        const d = [...a].length - [...b].length
        return d * dir
      }
      case 'natural':
        return naturalCompare(a, b, opts.ignoreCase) * dir
      case 'number': {
        const na = extractNumber(a)
        const nb = extractNumber(b)
        if (na === null && nb === null) return 0
        if (na === null) return 1 // 非数字行沉底（不受方向影响）
        if (nb === null) return -1
        return (na - nb) * dir
      }
      default:
        return 0
    }
  })

  return lines
}
