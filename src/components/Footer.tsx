import { Link } from 'react-router-dom'
import type { Profile, SiteSettings } from '../api/types'
import { IconSparkle } from './Icons'
import { socialIcon } from './Icons'

interface FooterProps {
  profile: Profile
  settings: SiteSettings
}

/** 页脚：社交链接、快速导航、版权与备案（FR-29） */
export default function Footer({ profile, settings }: FooterProps) {
  const year = new Date().getFullYear()

  return (
    <footer className="relative mt-24 border-t border-line bg-base/60">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-ink">
            <IconSparkle className="h-5 w-5 text-accent" />
            {settings.siteName}
          </div>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
            {profile.tagline}
          </p>
          <ul className="mt-5 flex items-center gap-3">
            {profile.socials.map((social) => (
              <li key={social.label}>
                <a
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-btn border border-line text-muted transition hover:border-accent/60 hover:text-accent"
                >
                  {socialIcon(social.icon, 'h-4 w-4')}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-ink">快速导航</h2>
          <ul className="mt-3 grid gap-2 text-sm text-muted">
            <li>
              <Link to="/projects" className="transition hover:text-accent">
                项目展示
              </Link>
            </li>
            <li>
              <Link to="/blog" className="transition hover:text-accent">
                博客文章
              </Link>
            </li>
            <li>
              <a href={`mailto:${profile.email}`} className="transition hover:text-accent">
                {profile.email}
              </a>
            </li>
            <li>
              <Link to="/admin" className="transition hover:text-accent">
                内容管理后台
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-ink">关于本站</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">{settings.footerNote}</p>
          <p className="mt-3 text-sm text-muted">{profile.location}</p>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-2 px-4 py-5 text-xs text-muted sm:px-6">
          <p>
            © {year} {profile.name} · {settings.siteName}
          </p>
          <p>
            React + TypeScript + Vite + Tailwind CSS
            {settings.icp ? <span className="ml-2">{settings.icp}</span> : null}
          </p>
        </div>
      </div>
    </footer>
  )
}
