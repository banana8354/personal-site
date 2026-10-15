import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { IconArrowRight, IconDoc, IconFolder, IconLayers, IconUser } from '../../components/Icons'
import { useSiteData } from '../../hooks/useSiteData'
import { formatDate } from '../../lib/format'
import { AdminCard, AdminPageHeader, StatCard } from './AdminUI'

interface StoredMessage {
  name: string
  email: string
  message: string
  at: string
}

/** 仪表盘：内容统计概览 + 最近内容（FR-33） */
export default function Dashboard() {
  const { data } = useSiteData()

  // 联系表单留言保存在本机，仅用于站主自查
  const messages = useMemo<StoredMessage[]>(() => {
    try {
      return JSON.parse(window.localStorage.getItem('ps.messages') ?? '[]') as StoredMessage[]
    } catch {
      return []
    }
  }, [])

  const recentPosts = data.posts.slice(0, 3)
  const recentProjects = data.projects.slice(0, 3)

  return (
    <>
      <AdminPageHeader
        title="仪表盘"
        description="内容统计概览。所有修改保存后前台即时生效。"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="项目" value={data.projects.length} hint={`精选 ${data.projects.filter((p) => p.featured).length} 个`} />
        <StatCard label="文章" value={data.posts.length} hint="按日期倒序展示" />
        <StatCard label="技能" value={data.skills.length} hint="按四类分组" />
        <StatCard label="留言" value={messages.length} hint="来自本机浏览器" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <AdminCard
          title="最近文章"
          description="点击进入博客管理继续编辑"
          action={
            <Link
              to="/admin/posts"
              className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
            >
              管理文章
              <IconArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          {recentPosts.length === 0 ? (
            <p className="text-sm text-muted">还没有文章。</p>
          ) : (
            <ul className="grid gap-3">
              {recentPosts.map((post) => (
                <li key={post.id} className="flex items-center gap-3">
                  <IconDoc className="h-4 w-4 shrink-0 text-accent" />
                  <Link
                    to={`/blog/${post.slug}`}
                    className="flex-1 truncate text-sm text-ink hover:text-accent"
                  >
                    {post.title}
                  </Link>
                  <span className="font-mono text-[11px] text-muted">{formatDate(post.date)}</span>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>

        <AdminCard
          title="最近项目"
          description="点击进入项目管理继续编辑"
          action={
            <Link
              to="/admin/projects"
              className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
            >
              管理项目
              <IconArrowRight className="h-3.5 w-3.5" />
            </Link>
          }
        >
          {recentProjects.length === 0 ? (
            <p className="text-sm text-muted">还没有项目。</p>
          ) : (
            <ul className="grid gap-3">
              {recentProjects.map((project) => (
                <li key={project.id} className="flex items-center gap-3">
                  <IconFolder className="h-4 w-4 shrink-0 text-accent" />
                  <Link
                    to={`/projects/${project.slug}`}
                    className="flex-1 truncate text-sm text-ink hover:text-accent"
                  >
                    {project.title}
                  </Link>
                  <span className="font-mono text-[11px] text-muted">
                    {project.featured ? '精选' : '普通'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <AdminCard title="最近的留言" description="来自前台联系表单（保存在本机浏览器）">
          {messages.length === 0 ? (
            <p className="text-sm text-muted">暂时还没有留言。</p>
          ) : (
            <ul className="grid gap-4">
              {messages.slice(0, 4).map((msg) => (
                <li key={`${msg.at}-${msg.email}`} className="rounded-btn border border-line bg-base/40 p-3.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-medium text-ink">{msg.name}</span>
                    <span className="font-mono text-muted">{msg.email}</span>
                    <span className="ml-auto font-mono text-[11px] text-muted/80">
                      {formatDate(msg.at.slice(0, 10))}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm text-muted">{msg.message}</p>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>

        <AdminCard title="快捷入口">
          <ul className="grid gap-2">
            {[
              { to: '/admin/profile', label: '编辑个人信息', icon: IconUser },
              { to: '/admin/skills', label: '调整技能熟练度', icon: IconLayers },
              { to: '/admin/projects', label: '新增一个项目', icon: IconFolder },
              { to: '/admin/posts', label: '写一篇新文章', icon: IconDoc },
            ].map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="flex items-center gap-3 rounded-btn border border-line bg-base/40 px-3.5 py-2.5 text-sm text-muted transition hover:border-accent/60 hover:text-accent"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </AdminCard>
      </div>
    </>
  )
}
