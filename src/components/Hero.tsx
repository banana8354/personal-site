import { Link } from 'react-router-dom'
import type { Profile, SiteSettings } from '../api/types'
import { Button } from './Form'
import {
  IconArrowDown,
  IconArrowRight,
  IconDownload,
  IconMapPin,
  socialIcon,
} from './Icons'

interface HeroProps {
  profile: Profile
  settings: SiteSettings
  projectCount: number
  postCount: number
}

const STATS = (projectCount: number, postCount: number) => [
  { label: '项目', value: projectCount },
  { label: '文章', value: postCount },
  { label: '年经验', value: 3 },
]

/** 首屏 Hero：头像、姓名、头衔、一句话介绍与 CTA（FR-01 / FR-02） */
export default function Hero({ profile, settings, projectCount, postCount }: HeroProps) {
  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section id="hero" className="relative scroll-mt-24 overflow-hidden">
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-4 pt-20 pb-16 sm:px-6 sm:pt-28 sm:pb-24 lg:grid-cols-[1.25fr_1fr]">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3.5 py-1.5 text-xs text-muted backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-ok" />
            </span>
            目前开放远程合作与全职机会
          </p>

          <h1 className="mt-6 text-4xl leading-tight font-bold text-ink sm:text-5xl lg:text-6xl">
            你好，我是
            <span className="bg-gradient-to-r from-accent to-accent-soft bg-clip-text text-transparent">
              {' '}
              {profile.name}
            </span>
          </h1>

          <p className="mt-4 font-mono text-sm text-accent">{profile.title}</p>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted">{profile.tagline}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button onClick={() => scrollTo('projects')}>
              看我的项目
              <IconArrowRight className="h-4 w-4" />
            </Button>
            {profile.resumeUrl && profile.resumeUrl !== '#' ? (
              <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost">
                  <IconDownload className="h-4 w-4" />
                  下载简历
                </Button>
              </a>
            ) : (
              <Button variant="ghost" onClick={() => scrollTo('contact')}>
                <IconDownload className="h-4 w-4" />
                获取简历
              </Button>
            )}
            <Button variant="ghost" onClick={() => scrollTo('contact')}>
              联系我
            </Button>
          </div>

          <dl className="mt-10 flex flex-wrap gap-8">
            {STATS(projectCount, postCount).map((stat) => (
              <div key={stat.label}>
                <dt className="text-xs tracking-wide text-muted">{stat.label}</dt>
                <dd className="mt-1 font-mono text-2xl font-semibold text-ink">
                  {String(stat.value).padStart(2, '0')}
                  <span className="text-accent">+</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-sm lg:mx-0">
          <div className="absolute -inset-6 rounded-full bg-accent/10 blur-3xl" aria-hidden="true" />
          <div className="relative rounded-card border border-line bg-surface/70 p-6 backdrop-blur">
            <div className="relative mx-auto h-40 w-40 overflow-hidden rounded-full border border-line">
              <img
                src={profile.avatar}
                alt={`${profile.name} 的头像`}
                width={320}
                height={320}
                className="h-full w-full object-cover"
              />
            </div>
            <p className="mt-5 text-center text-lg font-semibold text-ink">{profile.name}</p>
            <p className="mt-1 text-center text-xs text-muted">{profile.title}</p>

            <p className="mt-4 inline-flex w-full items-center justify-center gap-1.5 text-xs text-muted">
              <IconMapPin className="h-3.5 w-3.5" />
              {profile.location}
            </p>

            <ul className="mt-5 flex justify-center gap-3">
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

            <Link
              to="/blog"
              className="mt-6 block rounded-btn border border-line bg-base/60 px-4 py-3 text-center text-xs text-muted transition hover:border-accent/60 hover:text-accent"
            >
              最近写了 {postCount} 篇技术笔记 →
            </Link>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => scrollTo('about')}
        className="mx-auto mb-6 hidden items-center gap-2 text-xs text-muted transition hover:text-accent lg:flex"
      >
        向下了解我
        <IconArrowDown className="h-4 w-4" />
      </button>

      <span className="sr-only">站点名称：{settings.siteName}</span>
    </section>
  )
}
