/**
 * 纯函数格式化工具（无副作用，见 AGENTS.md §2 分层约定）。
 */

const MONTHS = [
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
  '09',
  '10',
  '11',
  '12',
]

/** ISO 日期 → 2026.10.15 */
export function formatDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!match) return iso
  const month = Number(match[2])
  if (month < 1 || month > 12) return iso
  return `${match[1]}.${MONTHS[month - 1]}.${match[3]}`
}

/** ISO 日期 → 2026 年 10 月 15 日 */
export function formatDateLong(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!match) return iso
  return `${match[1]} 年 ${Number(match[2])} 月 ${Number(match[3])} 日`
}

/** 今天的 ISO 日期（YYYY-MM-DD），用于表单默认值 */
export function todayIso(): string {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

/**
 * 阅读时长估算：中文约 350 字/分钟，英文按 200 词/分钟折算。
 * 结果最小 1 分钟（AGENTS.md §9）。
 */
export function estimateReadingMinutes(content: string): number {
  const plain = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/[#>*_~|-]/g, ' ')

  const cjk = (plain.match(/[\u4e00-\u9fa5]/g) ?? []).length
  const words = (plain.match(/[A-Za-z0-9]+/g) ?? []).length
  const minutes = cjk / 350 + words / 200
  return Math.max(1, Math.round(minutes))
}

/** 高亮色 → "56 189 248"，用于 rgb(var(--accent-rgb) / 透明度) */
export function hexToRgbChannels(hex: string): string | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!match) return null
  const value = Number.parseInt(match[1], 16)
  return `${(value >> 16) & 255} ${(value >> 8) & 255} ${value & 255}`
}

/** 把标题转成锚点 id（支持中文） */
export function slugifyHeading(text: string): string {
  return (
    text
      .trim()
      .toLowerCase()
      .replace(/[\s]+/g, '-')
      .replace(/[^\w\u4e00-\u9fa5-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'section'
  )
}

export interface TocItem {
  id: string
  text: string
  level: number
}

/** 从 Markdown 原文提取 h2 / h3 目录 */
export function extractToc(markdown: string): TocItem[] {
  const items: TocItem[] = []
  const seen = new Map<string, number>()
  const lines = markdown.split('\n')
  let inCodeBlock = false

  for (const line of lines) {
    if (line.trimStart().startsWith('```')) {
      inCodeBlock = !inCodeBlock
      continue
    }
    if (inCodeBlock) continue
    const match = /^(#{2,3})\s+(.+?)\s*$/.exec(line)
    if (!match) continue
    const text = match[2].replace(/[*`_]/g, '')
    let id = slugifyHeading(text)
    const count = seen.get(id) ?? 0
    seen.set(id, count + 1)
    if (count > 0) id = `${id}-${count}`
    items.push({ id, text, level: match[1].length })
  }
  return items
}

/** 取正文首个段落作为兜底摘要 */
export function firstParagraph(markdown: string, max = 120): string {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, '')
    .replace(/^#{1,6}\s+.*$/gm, '')
    .replace(/[*`_>]/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
  const text = plain.join(' ')
  return text.length > max ? `${text.slice(0, max)}…` : text
}
