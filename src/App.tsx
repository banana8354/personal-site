import { lazy, Suspense } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout, { RequireAuth } from './layouts/AdminLayout'
import SiteLayout from './layouts/SiteLayout'

/**
 * 路由表。
 *
 * 使用 HashRouter 的原因（TECH_DESIGN §4.2）：
 * 本站同时适配 GitHub Pages / Cloudflare Pages / Vercel，Hash 路由无需平台重写规则，
 * 直接访问子路由或刷新都不会 404。
 *
 * 除 SiteLayout 外全部路由级懒加载，避免后台与详情页代码进入首屏包（TECH_DESIGN §4.7）。
 */
const Home = lazy(() => import('./pages/Home'))
const Projects = lazy(() => import('./pages/Projects'))
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'))
const Blog = lazy(() => import('./pages/Blog'))
const PostDetail = lazy(() => import('./pages/PostDetail'))
const NotFound = lazy(() => import('./pages/NotFound'))

const AdminLogin = lazy(() => import('./pages/admin/Login'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const ProfileAdmin = lazy(() => import('./pages/admin/ProfileAdmin'))
const SkillsAdmin = lazy(() => import('./pages/admin/SkillsAdmin'))
const ProjectsAdmin = lazy(() => import('./pages/admin/ProjectsAdmin'))
const PostsAdmin = lazy(() => import('./pages/admin/PostsAdmin'))
const SettingsAdmin = lazy(() => import('./pages/admin/SettingsAdmin'))

function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-muted">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-accent" />
        正在加载…
      </div>
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* 前台 */}
          <Route element={<SiteLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<PostDetail />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* 后台登录（独立布局，不套用前台导航） */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* 后台（路由守卫 + 侧边栏布局） */}
          <Route element={<RequireAuth />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="profile" element={<ProfileAdmin />} />
              <Route path="skills" element={<SkillsAdmin />} />
              <Route path="projects" element={<ProjectsAdmin />} />
              <Route path="posts" element={<PostsAdmin />} />
              <Route path="settings" element={<SettingsAdmin />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  )
}
