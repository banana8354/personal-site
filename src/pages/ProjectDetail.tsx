import { Link, useParams } from 'react-router-dom'
import Markdown from '../components/Markdown'
import { BackLink, DetailActions, EmptyState } from '../components/PageShell'
import ProjectCard from '../components/ProjectCard'
import Reveal from '../components/Reveal'
import Tag from '../components/Tag'
import { useSiteData } from '../hooks/useSiteData'
import { formatDateLong } from '../lib/format'

/** 项目详情页：Markdown 正文 + 技术标签 + 外链 + 相关项目（FR-13 / FR-15 / FR-16） */
export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { data } = useSiteData()
  const project = data.projects.find((item) => item.slug === slug)

  if (!project) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-20 sm:px-6">
        <EmptyState
          title="没有找到这个项目"
          description="链接可能已失效，或者项目已被移除。"
          action={
            <Link
              to="/projects"
              className="rounded-btn border border-line px-4 py-2 text-sm text-muted transition hover:border-accent/60 hover:text-accent"
            >
              返回项目列表
            </Link>
          }
        />
      </div>
    )
  }

  const related = data.projects
    .filter(
      (item) =>
        item.slug !== project.slug && item.tags.some((tag) => project.tags.includes(tag)),
    )
    .slice(0, 3)

  return (
    <article className="mx-auto max-w-[900px] px-4 py-12 sm:px-6 sm:py-16">
      <BackLink to="/projects">返回项目列表</BackLink>

      <Reveal className="mt-6">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
          <time dateTime={project.date}>{formatDateLong(project.date)}</time>
          {project.featured ? <Tag accent>精选项目</Tag> : null}
        </div>
        <h1 className="mt-4 text-3xl font-bold text-ink sm:text-4xl">{project.title}</h1>
        <p className="mt-4 text-base leading-relaxed text-muted">{project.summary}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>

        <DetailActions repoUrl={project.repoUrl} demoUrl={project.demoUrl} />
      </Reveal>

      <Reveal className="mt-10">
        <img
          src={project.cover}
          alt={`${project.title} 封面`}
          className="w-full rounded-card border border-line object-cover"
          loading="lazy"
          decoding="async"
        />
      </Reveal>

      <div className="mt-10 border-t border-line pt-10">
        <Markdown content={project.content} />
      </div>

      {related.length > 0 ? (
        <section className="mt-16 border-t border-line pt-10">
          <h2 className="text-lg font-semibold text-ink">相关项目</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item, index) => (
              <Reveal key={item.id} delay={index * 60} className="h-full">
                <ProjectCard project={item} />
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  )
}
