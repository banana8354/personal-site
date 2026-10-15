import type { ReactNode } from 'react'

interface AdminCardProps {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
}

/** 后台内容卡片：统一标题 / 说明 / 右上操作 */
export function AdminCard({ title, description, action, children }: AdminCardProps) {
  return (
    <section className="rounded-card border border-line bg-surface/70 p-5 sm:p-6">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">{title}</h2>
          {description ? <p className="mt-1 text-xs text-muted">{description}</p> : null}
        </div>
        {action}
      </header>
      {children}
    </section>
  )
}

interface AdminPageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
}

/** 后台页面标题 */
export function AdminPageHeader({ title, description, action }: AdminPageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold text-ink">{title}</h1>
        {description ? <p className="mt-1.5 text-xs text-muted">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string | number
  hint?: string
}

/** 仪表盘统计卡片 */
export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="rounded-card border border-line bg-surface/70 p-5">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-2 font-mono text-3xl font-semibold text-ink">{value}</p>
      {hint ? <p className="mt-1.5 text-[11px] text-muted/80">{hint}</p> : null}
    </div>
  )
}
