import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import { slugifyHeading } from '../lib/format'

interface MarkdownProps {
  content: string
  className?: string
}

/** 取 React 子节点中的纯文本，用于生成标题锚点 id */
function nodeText(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(nodeText).join('')
  if (node && typeof node === 'object' && 'props' in node) {
    const props = (node as { props?: { children?: React.ReactNode } }).props
    return nodeText(props?.children)
  }
  return ''
}

/**
 * Markdown 渲染（博客 / 项目详情）。
 * 安全：不启用 rehype-raw，不解析原始 HTML，天然规避 XSS（AGENTS.md §5）。
 */
export default function Markdown({ content, className = '' }: MarkdownProps) {
  const used = new Map<string, number>()

  function headingId(children: React.ReactNode): string {
    const base = slugifyHeading(nodeText(children))
    const count = used.get(base) ?? 0
    used.set(base, count + 1)
    return count > 0 ? `${base}-${count}` : base
  }

  return (
    <div className={`prose prose-star max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
        components={{
          h2: ({ children }) => (
            <h2 id={headingId(children)} className="scroll-mt-24">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 id={headingId(children)} className="scroll-mt-24">
              {children}
            </h3>
          ),
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
