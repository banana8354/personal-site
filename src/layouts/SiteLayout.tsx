import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import StarField from '../components/StarField'
import { IconArrowDown, IconTop } from '../components/Icons'
import { useSiteData } from '../hooks/useSiteData'
import { hexToRgbChannels } from '../lib/format'

/** 站点名称 → 文档标题后缀，路由变化时更新（SEO 基础项） */
const TITLES: Record<string, string> = {
  '/': '首页',
  '/projects': '项目展示',
  '/blog': '博客文章',
}

/**
 * 前台布局：星空背景 + 吸顶导航 + 内容区 + 页脚。
 * 同时负责把后台设置的强调色注入 CSS 变量，实现全站换色。
 */
export default function SiteLayout() {
  const { data } = useSiteData()
  const location = useLocation()
  const [showTop, setShowTop] = useState(false)

  // 强调色注入（settings.accent → --accent / --accent-rgb）
  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--accent', data.settings.accent)
    const channels = hexToRgbChannels(data.settings.accent)
    if (channels) root.style.setProperty('--accent-rgb', channels)
  }, [data.settings.accent])

  // 文档标题
  useEffect(() => {
    const base = TITLES[location.pathname]
    document.title = base
      ? `${base} | ${data.settings.siteName}`
      : `${data.settings.siteName} | 前端开发 · 个人作品集`
  }, [location.pathname, data.settings.siteName])

  // 回到顶部按钮
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 800)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // 路由切换回到页首（保留锚点跳转由 Navbar 自行处理）
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.pathname])

  return (
    <div className="relative min-h-screen">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-btn focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-base"
      >
        跳到主要内容
      </a>

      <StarField density={data.settings.starDensity} accent={data.settings.accent} />
      <Navbar profile={data.profile} siteName={data.settings.siteName} />

      <main id="main" className="relative pt-16">
        <Outlet />
      </main>

      <Footer profile={data.profile} settings={data.settings} />

      {showTop ? (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="回到顶部"
          className="fixed right-5 bottom-6 z-30 inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-surface/90 text-muted shadow-float backdrop-blur transition hover:border-accent/60 hover:text-accent"
        >
          <IconTop />
        </button>
      ) : null}

      {location.pathname === '/' ? (
        <div className="pointer-events-none fixed bottom-6 left-1/2 hidden -translate-x-1/2 lg:block">
          <IconArrowDown className="h-5 w-5 animate-bounce text-muted/50" />
        </div>
      ) : null}
    </div>
  )
}
