import { useState } from 'react'
import { Link, Navigate, NavLink, Outlet, useLocation } from 'react-router-dom'
import {
  IconArrowRight,
  IconChart,
  IconClose,
  IconDoc,
  IconFolder,
  IconLayers,
  IconLogout,
  IconMenu,
  IconSettings,
  IconSparkle,
  IconUser,
} from '../components/Icons'
import { useAuth } from '../hooks/useAuth'
import { useSiteData } from '../hooks/useSiteData'

const NAV = [
  { to: '/admin', label: '仪表盘', icon: IconChart, end: true },
  { to: '/admin/profile', label: '个人信息', icon: IconUser, end: false },
  { to: '/admin/skills', label: '技能管理', icon: IconLayers, end: false },
  { to: '/admin/projects', label: '项目管理', icon: IconFolder, end: false },
  { to: '/admin/posts', label: '博客管理', icon: IconDoc, end: false },
  { to: '/admin/settings', label: '站点设置', icon: IconSettings, end: false },
] as const

/**
 * 路由守卫：未登录访问后台时跳转登录页，并记住来源便于登录后回跳（TECH_DESIGN §4.4）。
 */
export function RequireAuth() {
  const { authenticated } = useAuth()
  const location = useLocation()
  if (!authenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}

/** 后台独立布局：侧边栏 + 顶栏，不复用前台 Navbar（FR-40） */
export default function AdminLayout() {
  const { username, logout } = useAuth()
  const { data } = useSiteData()
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-base lg:grid lg:grid-cols-[248px_1fr]">
      {/* 侧边栏 */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[248px] border-r border-line bg-surface/95 backdrop-blur transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-line px-4">
          <Link to="/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
            <IconSparkle className="h-5 w-5 text-accent" />
            内容管理后台
          </Link>
          <button
            type="button"
            aria-label="关闭侧边栏"
            onClick={() => setOpen(false)}
            className="rounded-btn p-1.5 text-muted lg:hidden"
          >
            <IconClose className="h-4 w-4" />
          </button>
        </div>

        <nav aria-label="后台导航" className="p-3">
          <ul className="grid gap-1">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm transition ${
                      isActive
                        ? 'bg-accent/10 font-medium text-accent'
                        : 'text-muted hover:bg-surface-2 hover:text-ink'
                    }`
                  }
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-4 border-t border-line p-4">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted transition hover:text-accent"
          >
            <IconArrowRight className="h-3.5 w-3.5" />
            返回前台网站
          </Link>
          <p className="mt-3 text-[11px] leading-relaxed text-muted/80">
            数据保存在本机浏览器（localStorage）。上线前请在「站点设置」导出备份，并在接入后端后替换为服务端校验。
          </p>
        </div>
      </aside>

      {open ? (
        <button
          type="button"
          aria-label="关闭侧边栏遮罩"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
        />
      ) : null}

      {/* 主区域 */}
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-line bg-base/85 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="打开侧边栏"
              onClick={() => setOpen(true)}
              className="rounded-btn border border-line p-2 text-ink lg:hidden"
            >
              <IconMenu className="h-4 w-4" />
            </button>
            <div>
              <p className="text-sm font-semibold text-ink">{data.settings.siteName}</p>
              <p className="text-[11px] text-muted">内容随时保存，前台即时生效</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted sm:inline">已登录：{username}</span>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-btn border border-line px-3 py-2 text-xs text-muted transition hover:border-danger/50 hover:text-danger"
            >
              <IconLogout className="h-3.5 w-3.5" />
              退出登录
            </button>
          </div>
        </header>

        <div className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
