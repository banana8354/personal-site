import { useMemo, useState } from 'react'
import { artwork } from '../../api/seed'
import {
  getProjects,
  makeSlug,
  removeProject,
  upsertProject,
} from '../../api/adminApi'
import type { Project } from '../../api/types'
import ConfirmDialog from '../../components/ConfirmDialog'
import { Button, Field, Input, Notice, Textarea } from '../../components/Form'
import { IconEdit, IconPlus, IconTrash } from '../../components/Icons'
import { useSiteData } from '../../hooks/useSiteData'
import { fieldErrors, projectSchema } from '../../lib/validate'
import { formatDate, todayIso } from '../../lib/format'
import { AdminCard, AdminPageHeader } from './AdminUI'
import MarkdownEditor from './MarkdownEditor'

function emptyProject(): Project {
  return {
    id: `pj-${Date.now().toString(36)}`,
    slug: '',
    title: '',
    summary: '',
    cover: artwork({ from: '#0ea5e9', to: '#7c3aed' }, { label: 'New Project', sub: 'PROJECT' }),
    tags: [],
    repoUrl: '',
    demoUrl: '',
    featured: false,
    date: todayIso(),
    content: '## 背景\n\n## 技术方案\n\n## 成果\n',
  }
}

/** 项目管理：列表 + 新建 / 编辑 / 删除（FR-36 / FR-39） */
export default function ProjectsAdmin() {
  const { data } = useSiteData()
  const [editing, setEditing] = useState<Project | null>(null)
  const [draft, setDraft] = useState<Project>(emptyProject())
  const [tagText, setTagText] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null)

  const takenSlugs = useMemo(() => getProjects().map((item) => item.slug), [])

  function startCreate() {
    const next = emptyProject()
    setEditing(next)
    setDraft(next)
    setTagText('')
    setErrors({})
    setStatus(null)
  }

  function startEdit(project: Project) {
    setEditing(project)
    setDraft(project)
    setTagText(project.tags.join(', '))
    setErrors({})
    setStatus(null)
  }

  function closeEditor() {
    setEditing(null)
    setErrors({})
  }

  function update<K extends keyof Project>(key: K, value: Project[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }))
    if (errors[key as string]) setErrors((prev) => ({ ...prev, [key as string]: '' }))
  }

  function onSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const tags = tagText
      .split(/[,，]/)
      .map((tag) => tag.trim())
      .filter((tag) => tag !== '')
      .slice(0, 8)

    const payload: Project = {
      ...draft,
      slug: draft.slug.trim() || makeSlug(draft.title, takenSlugs, editing?.slug),
      tags,
    }

    const parsed = projectSchema.safeParse(payload)
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      setStatus({ kind: 'error', text: '请先修正标红的字段' })
      return
    }

    const result = upsertProject(payload)
    if (!result.ok) {
      setStatus({ kind: 'error', text: result.error ?? '保存失败' })
      return
    }
    setStatus({ kind: 'ok', text: `已保存项目「${payload.title}」` })
    setEditing(null)
  }

  return (
    <>
      <AdminPageHeader
        title="项目管理"
        description="列表支持新建、编辑与删除；正文使用 Markdown，右侧实时预览。"
        action={
          <Button type="button" size="sm" onClick={startCreate}>
            <IconPlus className="h-3.5 w-3.5" />
            新建项目
          </Button>
        }
      />

      {status ? (
        <div className="mb-5">
          <Notice kind={status.kind}>{status.text}</Notice>
        </div>
      ) : null}

      {editing ? (
        <form onSubmit={onSave} noValidate className="grid gap-5">
          <AdminCard
            title={editing.slug ? `编辑项目：${editing.title || '未命名'}` : '新建项目'}
            description="slug 用于访问地址 /projects/<slug>，留空会自动生成。"
            action={
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={closeEditor}>
                  取消
                </Button>
                <Button type="submit" size="sm">
                  保存项目
                </Button>
              </div>
            }
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="标题" htmlFor="pj-title" required error={errors.title}>
                <Input
                  id="pj-title"
                  value={draft.title}
                  onChange={(e) => {
                    const title = e.target.value
                    setDraft((prev) => ({
                      ...prev,
                      title,
                      // 新建时随标题自动生成 slug，编辑时保持既有 slug
                      slug: editing.slug ? prev.slug : makeSlug(title, takenSlugs),
                    }))
                  }}
                  error={errors.title}
                  maxLength={80}
                />
              </Field>
              <Field label="slug" htmlFor="pj-slug" error={errors.slug} hint="只允许字母、数字、中文与连字符">
                <Input
                  id="pj-slug"
                  value={draft.slug}
                  onChange={(e) => update('slug', e.target.value)}
                  error={errors.slug}
                />
              </Field>
              <Field label="日期" htmlFor="pj-date" required error={errors.date}>
                <Input
                  id="pj-date"
                  type="date"
                  value={draft.date}
                  onChange={(e) => update('date', e.target.value)}
                  error={errors.date}
                />
              </Field>
              <Field label="标签" htmlFor="pj-tags" error={errors.tags} hint="英文逗号分隔，最多 8 个">
                <Input
                  id="pj-tags"
                  value={tagText}
                  onChange={(e) => setTagText(e.target.value)}
                  placeholder="React, TypeScript, Canvas"
                />
              </Field>
              <Field label="源码地址" htmlFor="pj-repo" error={errors.repoUrl}>
                <Input
                  id="pj-repo"
                  value={draft.repoUrl ?? ''}
                  onChange={(e) => update('repoUrl', e.target.value)}
                  error={errors.repoUrl}
                  placeholder="https://github.com/..."
                />
              </Field>
              <Field label="在线地址" htmlFor="pj-demo" error={errors.demoUrl}>
                <Input
                  id="pj-demo"
                  value={draft.demoUrl ?? ''}
                  onChange={(e) => update('demoUrl', e.target.value)}
                  error={errors.demoUrl}
                  placeholder="https://..."
                />
              </Field>
            </div>

            <div className="mt-5 grid gap-5">
              <Field label="简介" htmlFor="pj-summary" required error={errors.summary} hint={`${draft.summary.length}/200`}>
                <Textarea
                  id="pj-summary"
                  rows={3}
                  value={draft.summary}
                  onChange={(e) => update('summary', e.target.value)}
                  error={errors.summary}
                  maxLength={200}
                />
              </Field>

              <Field label="封面图地址" htmlFor="pj-cover" hint="留空时使用内置渐变封面">
                <Input
                  id="pj-cover"
                  value={draft.cover}
                  onChange={(e) => update('cover', e.target.value)}
                />
              </Field>

              <label className="inline-flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={draft.featured}
                  onChange={(e) => update('featured', e.target.checked)}
                  className="h-4 w-4 accent-[var(--accent)]"
                />
                设为精选项目（首页优先展示）
              </label>

              <MarkdownEditor
                id="pj-content"
                label="正文（Markdown）"
                value={draft.content}
                onChange={(value) => update('content', value)}
                error={errors.content}
              />
            </div>
          </AdminCard>
        </form>
      ) : null}

      <div className="mt-5">
        <AdminCard title="项目列表" description={`共 ${data.projects.length} 个`}>
          {data.projects.length === 0 ? (
            <p className="text-sm text-muted">还没有项目，点击右上角「新建项目」开始。</p>
          ) : (
            <ul className="grid gap-3">
              {data.projects.map((project) => (
                <li
                  key={project.id}
                  className="flex flex-wrap items-center gap-3 rounded-btn border border-line bg-base/40 p-3"
                >
                  <img
                    src={project.cover}
                    alt=""
                    className="h-12 w-20 shrink-0 rounded-btn border border-line object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">
                      {project.title}
                      {project.featured ? (
                        <span className="ml-2 rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[10px] text-accent">
                          精选
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 truncate font-mono text-[11px] text-muted">
                      /projects/{project.slug} · {formatDate(project.date)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(project)}
                      className="inline-flex items-center gap-1 rounded-btn border border-line px-2.5 py-1.5 text-xs text-muted transition hover:border-accent/60 hover:text-accent"
                    >
                      <IconEdit className="h-3.5 w-3.5" />
                      编辑
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(project)}
                      className="inline-flex items-center gap-1 rounded-btn border border-line px-2.5 py-1.5 text-xs text-muted transition hover:border-danger/50 hover:text-danger"
                    >
                      <IconTrash className="h-3.5 w-3.5" />
                      删除
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </AdminCard>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`确认删除项目「${pendingDelete?.title ?? ''}」？`}
        description="删除后该项目及其详情页将不可访问，操作不可撤销。"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            const result = removeProject(pendingDelete.id)
            setStatus(
              result.ok
                ? { kind: 'ok', text: `已删除项目「${pendingDelete.title}」` }
                : { kind: 'error', text: result.error ?? '删除失败' },
            )
          }
          setPendingDelete(null)
        }}
      />
    </>
  )
}
