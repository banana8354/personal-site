import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Markdown from '../components/Markdown'
import { BackLink, EmptyState } from '../components/PageShell'
import Tag from '../components/Tag'
import { IconArrowLeft, IconArrowRight } from '../components/Icons'
import { getAdjacentPosts } from '../api/siteApi'
import { useSiteData } from '../hooks/useSiteData'
import { estimateReadingMinutes, extractToc, formatDateLong } from '../lib/format'

/** 文章详情页：Markdown + 代码高亮 + TOC 高亮 + 上下篇（FR-18 / FR-19 / FR-21） */
export default function PostDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { data } = useSiteData()
  const post = data.posts.find((item) => item.slug === slug)
  const [activeId, setActiveId] = useState<string>('')

  const toc = useMemo(() => (post ? extractToc(post.content) : []), [post])

  // 目录高亮：跟随滚动位置
  useEffect(() => {
    if (!post || toc.length === 0) return
    const headings = toc
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => node !== null)
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (visible) setActiveId(visible.target.id)
      },
      { rootMargin: '-96px 0px -70% 0px', threshold: [0, 1] },
    )
    headings.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [post, toc])

  // 文档标题
  useEffect(() => {
    if (post) document.title = `${post.title} | ${data.settings.siteName}`
  }, [post, data.settings.siteName])

  if (!post) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-20 sm:px-6">
        <EmptyState
          title="没有找到这篇文章"
          description="链接可能已失效，或者文章已被移除。"
          action={
            <Link
              to="/blog"
              className="rounded-btn border border-line px-4 py-2 text-sm text-muted transition hover:border-accent/60 hover:text-accent"
            >
              返回文章列表
            </Link>
          }
        />
      </div>
    )
  }

  const minutes = post.readingMinutes ?? estimateReadingMinutes(post.content)
  const { prev, next } = getAdjacentPosts(post.slug)

  return (
    <article className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 sm:py-16">
      <BackLink to="/blog">返回文章列表</BackLink>

      <div className="mt-6 grid gap-12 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="min-w-0">
          <header>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
              <time dateTime={post.date}>{formatDateLong(post.date)}</time>
              <span>·</span>
              <span>约 {minutes} 分钟读完</span>
            </div>
            <h1 className="mt-4 text-3xl font-bold text-ink sm:text-4xl">{post.title}</h1>
            <p className="mt-4 text-base leading-relaxed text-muted">{post.excerpt}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Tag key={tag} accent>
                  {tag}
                </Tag>
              ))}
            </div>
          </header>

          {post.cover ? (
            <img
              src={post.cover}
              alt={`${post.title} 配图`}
              className="mt-8 w-full rounded-card border border-line object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : null}

          <div className="mt-10">
            <Markdown content={post.content} />
          </div>

          <nav className="mt-14 grid gap-4 border-t border-line pt-8 sm:grid-cols-2">
            {prev ? (
              <Link
                to={`/blog/${prev.slug}`}
                className="group rounded-card border border-line bg-surface/50 p-4 transition hover:border-accent/60"
              >
                <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                  <IconArrowLeft className="h-3.5 w-3.5" />
                  上一篇
                </span>
                <p className="mt-2 text-sm font-medium text-ink group-hover:text-accent">
                  {prev.title}
                </p>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link
                to={`/blog/${next.slug}`}
                className="group rounded-card border border-line bg-surface/50 p-4 text-right transition hover:border-accent/60"
              >
                <span className="inline-flex items-center gap-1.5 text-xs text-muted">
                  下一篇
                  <IconArrowRight className="h-3.5 w-3.5" />
                </span>
                <p className="mt-2 text-sm font-medium text-ink group-hover:text-accent">
                  {next.title}
                </p>
              </Link>
            ) : null}
          </nav>
        </div>

        {toc.length > 0 ? (
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="mb-3 font-mono text-xs tracking-[0.15em] text-muted uppercase">
                目录
              </p>
              <ul className="grid gap-1 border-l border-line">
                {toc.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={(event) => {
                        event.preventDefault()
                        document
                          .getElementById(item.id)
                          ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                        setActiveId(item.id)
                      }}
                      className={`-ml-px block border-l py-1.5 text-xs transition ${
                        item.level === 3 ? 'pl-6' : 'pl-3'
                      } ${
                        activeId === item.id
                          ? 'border-accent text-accent'
                          : 'border-transparent text-muted hover:text-ink'
                      }`}
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        ) : null}
      </div>
    </article>
  )
}
