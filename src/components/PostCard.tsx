import { Link } from 'react-router-dom'
import type { Post } from '../api/types'
import { estimateReadingMinutes, formatDate } from '../lib/format'
import Tag from './Tag'

interface PostCardProps {
  post: Post
  /** 列表首项可用大卡样式突出显示 */
  featured?: boolean
}

/** 文章卡片：标题、摘要、日期、标签、阅读时长（FR-17） */
export default function PostCard({ post, featured = false }: PostCardProps) {
  const minutes = post.readingMinutes ?? estimateReadingMinutes(post.content)

  if (featured) {
    return (
      <article className="group grid gap-0 overflow-hidden rounded-card border border-line bg-surface/80 transition hover:border-accent/60 hover:shadow-float md:grid-cols-[1.1fr_1fr]">
        {post.cover ? (
          <Link to={`/blog/${post.slug}`} className="block aspect-[16/9] overflow-hidden md:aspect-auto md:h-full">
            <img
              src={post.cover}
              alt={`${post.title} 封面`}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          </Link>
        ) : null}
        <div className="flex flex-col justify-center p-6 sm:p-8">
          <div className="flex items-center gap-3 text-xs text-muted">
            <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 font-medium text-accent">
              最新文章
            </span>
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            <span>· {minutes} 分钟</span>
          </div>
          <h3 className="mt-4 text-xl font-semibold text-ink">
            <Link to={`/blog/${post.slug}`} className="hover:text-accent">
              {post.title}
            </Link>
          </h3>
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted">{post.excerpt}</p>
          <div className="mt-5 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className="group flex h-full flex-col rounded-card border border-line bg-surface/70 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-float">
      <div className="flex items-center gap-3 text-xs text-muted">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <span>·</span>
        <span>{minutes} 分钟</span>
      </div>
      <h3 className="mt-3 text-base font-semibold text-ink">
        <Link to={`/blog/${post.slug}`} className="hover:text-accent">
          {post.title}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">{post.excerpt}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {post.tags.slice(0, 3).map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
    </article>
  )
}
