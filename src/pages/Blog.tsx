import { useMemo, useState } from 'react'
import { EmptyState, PageShell } from '../components/PageShell'
import PostCard from '../components/PostCard'
import Reveal from '../components/Reveal'
import { useSiteData } from '../hooks/useSiteData'

/** 博客列表页：文章卡片 + 标签筛选（FR-17 / FR-20 / FR-22） */
export default function Blog() {
  const { data } = useSiteData()
  const [activeTag, setActiveTag] = useState('全部')

  const tags = useMemo(() => {
    const set = new Set<string>()
    data.posts.forEach((post) => post.tags.forEach((tag) => set.add(tag)))
    return ['全部', ...[...set].sort()]
  }, [data.posts])

  const list = useMemo(
    () =>
      activeTag === '全部'
        ? data.posts
        : data.posts.filter((post) => post.tags.includes(activeTag)),
    [data.posts, activeTag],
  )

  return (
    <PageShell
      eyebrow="Blog"
      title="博客文章"
      description={`共 ${data.posts.length} 篇文章，主要是前端工程实践与踩坑记录。`}
    >
      {tags.length > 1 ? (
        <div className="mt-8 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(tag)}
              aria-pressed={activeTag === tag}
              className={`rounded-full border px-3.5 py-1.5 text-xs transition ${
                activeTag === tag
                  ? 'border-accent/60 bg-accent/10 text-accent'
                  : 'border-line bg-surface/60 text-muted hover:border-accent/40 hover:text-ink'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-8">
        {list.length === 0 ? (
          <EmptyState
            title="这个标签下还没有文章"
            description="换一个标签看看，或者到后台写一篇新的。"
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((post, index) => (
              <Reveal key={post.id} delay={index * 50} className="h-full">
                <PostCard post={post} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  )
}
