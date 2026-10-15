import { Link } from 'react-router-dom'
import type { Project } from '../api/types'
import { formatDate } from '../lib/format'
import { IconArrowRight, IconExternal, IconGithub } from './Icons'
import Tag from './Tag'

interface ProjectCardProps {
  project: Project
}

/** 项目卡片：封面 + 标题 + 简介 + 技术标签 + 外链（FR-12） */
export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-surface/80 transition duration-200 hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-float">
      <Link
        to={`/projects/${project.slug}`}
        className="relative block aspect-[16/10] overflow-hidden bg-surface-2"
        aria-label={`查看项目详情：${project.title}`}
      >
        <img
          src={project.cover}
          alt={`${project.title} 封面`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        {project.featured ? (
          <span className="absolute top-3 left-3 rounded-full bg-base/80 px-2.5 py-1 text-[11px] font-medium text-accent backdrop-blur">
            精选项目
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-ink">
            <Link to={`/projects/${project.slug}`} className="hover:text-accent">
              {project.title}
            </Link>
          </h3>
          <time className="shrink-0 font-mono text-[11px] text-muted" dateTime={project.date}>
            {formatDate(project.date)}
          </time>
        </div>

        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted">
          {project.summary}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {project.tags.slice(0, 4).map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>

        <div className="mt-5 flex items-center gap-4 border-t border-line pt-4 text-xs">
          <Link
            to={`/projects/${project.slug}`}
            className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
          >
            查看详情
            <IconArrowRight className="h-3.5 w-3.5" />
          </Link>
          {project.repoUrl ? (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-muted transition hover:text-ink"
            >
              <IconGithub className="h-3.5 w-3.5" />
              源码
            </a>
          ) : null}
          {project.demoUrl ? (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-muted transition hover:text-ink"
            >
              <IconExternal className="h-3.5 w-3.5" />
              在线
            </a>
          ) : null}
        </div>
      </div>
    </article>
  )
}
