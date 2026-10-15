import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { Profile } from '../api/types'
import { IconClose, IconDownload, IconGithub, IconMenu, IconSparkle } from './Icons'

interface NavbarProps {
  profile: Profile
  siteName: string
}

/** 首页区块导航（锚点） */
const SECTIONS = [
  { id: 'hero', label: '首页' },
  { id: 'about', label: '关于我' },
  { id: 'skills', label: '技能' },
  { id: 'projects', label: '项目' },
  { id: 'blog', label: '博客' },
  { id: 'contact', label: '联系' },
] as const

/** 吸顶毛玻璃导航：滚动高亮当前区块 + 移动端汉堡菜单（FR-27 / FR-28） */
export default function Navbar({ profile, siteName }: NavbarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<string>('hero')
  const onHome = location.pathname === '/'

  // 滚动超过 24px 后加深背景
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // 仅首页监听区块可见性，决定高亮项
  useEffect(() => {
    if (!onHome || typeof IntersectionObserver === 'undefined') return
    const nodes = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (node): node is HTMLElement => node !== null,
    )
    if (nodes.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0.05, 0.25, 0.5] },
    )
    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [onHome])

  // 路由变化时收起移动端菜单
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  function goToSection(id: string) {
    setOpen(false)
    if (!onHome) {
      navigate('/')
      // 等首页挂载后再滚动
      window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 60)
      return
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition duration-300 ${
        scrolled || open
          ? 'border-b border-line bg-base/80 backdrop-blur-md'
          : 'border-b border-transparent'
      }`}
    >
      <nav
        aria-label="主导航"
        className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6"
      >
        <Link
          to="/"
          onClick={() => goToSection('hero')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-ink"
        >
          <IconSparkle className="h-5 w-5 text-accent" />
          <span>{siteName}</span>
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <button
                type="button"
                onClick={() => goToSection(section.id)}
                aria-current={onHome && active === section.id ? 'true' : undefined}
                className={`rounded-btn px-3 py-2 text-sm transition ${
                  onHome && active === section.id
                    ? 'bg-surface-2 text-accent'
                    : 'text-muted hover:bg-surface-2 hover:text-ink'
                }`}
              >
                {section.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            to="/projects"
            className="rounded-btn border border-line px-3 py-2 text-sm text-muted transition hover:border-accent/60 hover:text-accent"
          >
            全部项目
          </Link>
          {profile.resumeUrl && profile.resumeUrl !== '#' ? (
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-btn bg-accent px-3.5 py-2 text-sm font-semibold text-base transition hover:brightness-110"
            >
              <IconDownload className="h-4 w-4" />
              简历
            </a>
          ) : null}
          <a
            href={profile.socials.find((s) => s.icon === 'github')?.url ?? 'https://github.com'}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub 主页"
            className="rounded-btn border border-line p-2 text-muted transition hover:border-accent/60 hover:text-accent"
          >
            <IconGithub className="h-4 w-4" />
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? '关闭菜单' : '打开菜单'}
          className="rounded-btn border border-line p-2 text-ink lg:hidden"
        >
          {open ? <IconClose /> : <IconMenu />}
        </button>
      </nav>

      {open ? (
        <div id="mobile-menu" className="border-t border-line bg-base/95 px-4 pt-3 pb-5 lg:hidden">
          <ul className="grid gap-1">
            {SECTIONS.map((section) => (
              <li key={section.id}>
                <button
                  type="button"
                  onClick={() => goToSection(section.id)}
                  className={`w-full rounded-btn px-3 py-2.5 text-left text-sm transition ${
                    onHome && active === section.id
                      ? 'bg-surface-2 text-accent'
                      : 'text-muted hover:bg-surface-2 hover:text-ink'
                  }`}
                >
                  {section.label}
                </button>
              </li>
            ))}
            <li>
              <Link
                to="/projects"
                className="block rounded-btn px-3 py-2.5 text-sm text-muted transition hover:bg-surface-2 hover:text-ink"
              >
                全部项目
              </Link>
            </li>
            <li>
              <Link
                to="/blog"
                className="block rounded-btn px-3 py-2.5 text-sm text-muted transition hover:bg-surface-2 hover:text-ink"
              >
                全部文章
              </Link>
            </li>
          </ul>
        </div>
      ) : null}
    </header>
  )
}
