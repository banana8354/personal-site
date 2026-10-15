import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { IconArrowLeft, IconExternal, IconGithub } from './Icons'
import Reveal from './Reveal'
import { Button } from './Form'

interface PageShellProps {
  eyebrow: string
  title: string
  description?: string
  children: ReactNode
}

/** 内页（项目/博客列表与详情）统一外壳 */
export function PageShell({ eyebrow, title, description, children }: PageShellProps) {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6 sm:py-20">
      <Reveal>
        <p className="font-mono text-xs tracking-[0.2em] text-accent uppercase">{eyebrow}</p>
        <h1 className="mt-3 text-3xl font-bold text-ink sm:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">{description}</p>
        ) : null}
      </Reveal>
      {children}
    </div>
  )
}

/** 内页返回链接 */
export function BackLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-accent"
    >
      <IconArrowLeft className="h-4 w-4" />
      {children}
    </Link>
  )
}

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
}

/** 空状态：插画位 + 引导文案（FR-22） */
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-card border border-dashed border-line bg-surface/40 px-6 py-16 text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-line bg-surface-2">
        <IconSparkleMini />
      </div>
      <p className="text-base font-medium text-ink">{title}</p>
      {description ? <p className="mt-2 text-sm text-muted">{description}</p> : null}
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  )
}

function IconSparkleMini() {
  return (
    <svg className="h-6 w-6 text-accent" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.5l1.9 5.3 5.3 1.9-5.3 1.9L12 17l-1.9-5.4L4.8 9.7l5.3-1.9L12 2.5Z" />
    </svg>
  )
}

interface DetailActionsProps {
  repoUrl?: string
  demoUrl?: string
}

/** 详情页外链按钮组 */
export function DetailActions({ repoUrl, demoUrl }: DetailActionsProps) {
  if (!repoUrl && !demoUrl) return null
  return (
    <div className="mt-6 flex flex-wrap gap-3">
      {demoUrl ? (
        <a href={demoUrl} target="_blank" rel="noopener noreferrer">
          <Button size="sm">
            <IconExternal className="h-4 w-4" />
            访问在线地址
          </Button>
        </a>
      ) : null}
      {repoUrl ? (
        <a href={repoUrl} target="_blank" rel="noopener noreferrer">
          <Button size="sm" variant="ghost">
            <IconGithub className="h-4 w-4" />
            查看源码
          </Button>
        </a>
      ) : null}
    </div>
  )
}
