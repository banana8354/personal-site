import { useMemo, useState } from 'react'
import { EmptyState, PageShell } from '../components/PageShell'
import ProjectCard from '../components/ProjectCard'
import Reveal from '../components/Reveal'
import { useSiteData } from '../hooks/useSiteData'

/** 项目列表页：支持按标签筛选（FR-14） */
export default function Projects() {
  const { data } = useSiteData()
  const [activeTag, setActiveTag] = useState<string>('全部')

  const tags = useMemo(() => {
    const set = new Set<string>()
    data.projects.forEach((project) => project.tags.forEach((tag) => set.add(tag)))
    return ['全部', ...[...set].sort()]
  }, [data.projects])

  const list = useMemo(
    () =>
      activeTag === '全部'
        ? data.projects
        : data.projects.filter((project) => project.tags.includes(activeTag)),
    [data.projects, activeTag],
  )

  return (
    <PageShell
      eyebrow="Projects"
      title="项目展示"
      description={`共 ${data.projects.length} 个项目。每个项目都有详情页，记录了背景、技术方案与结果。`}
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
            title="没有匹配的项目"
            description="换一个标签试试，或者清空筛选查看全部项目。"
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((project, index) => (
              <Reveal key={project.id} delay={index * 60} className="h-full">
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  )
}
