import type { ReactNode } from 'react'

interface TagProps {
  children: ReactNode
  accent?: boolean
}

/** 标签胶囊 */
export default function Tag({ children, accent = false }: TagProps) {
  return (
    <span
      className={
        accent
          ? 'inline-flex items-center rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent'
          : 'inline-flex items-center rounded-full border border-line bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-muted'
      }
    >
      {children}
    </span>
  )
}
