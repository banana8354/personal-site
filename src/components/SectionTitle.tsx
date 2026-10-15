import type { ReactNode } from 'react'
import Reveal from './Reveal'

interface SectionTitleProps {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
}

/** 统一的区块标题：英文小标 + 主标题 + 说明 + 可选右侧操作 */
export default function SectionTitle({
  eyebrow,
  title,
  description,
  action,
}: SectionTitleProps) {
  return (
    <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="mb-2 font-mono text-xs tracking-[0.2em] text-accent uppercase">{eyebrow}</p>
        ) : null}
        <h2 className="text-2xl font-bold text-ink sm:text-3xl">{title}</h2>
        {description ? <p className="mt-3 text-sm leading-relaxed text-muted">{description}</p> : null}
      </div>
      {action}
    </Reveal>
  )
}
