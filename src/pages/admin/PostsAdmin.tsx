import { useMemo, useState } from 'react'
import { artwork } from '../../api/seed'
import { getPosts, makeSlug, removePost, upsertPost } from '../../api/adminApi'
import type { Post } from '../../api/types'
import ConfirmDialog from '../../components/ConfirmDialog'
import { Button, Field, Input, Notice, Textarea } from '../../components/Form'
import { IconEdit, IconPlus, IconTrash } from '../../components/Icons'
import { useSiteData } from '../../hooks/useSiteData'
import { fieldErrors, postSchema } from '../../lib/validate'
import { estimateReadingMinutes, formatDate, todayIso } from '../../lib/format'
import { AdminCard, AdminPageHeader } from './AdminUI'
import MarkdownEditor from './MarkdownEditor'

function emptyPost(): Post {
  return {
    id: `po-${Date.now().toString(36)}`,
    slug: '',
    title: '',
    excerpt: '',
    cover: artwork({ from: '#1d4ed8', to: '#0ea5e9' }, { width: 900, height: 420, label: 'New Post', sub: 'BLOG' }),
    tags: [],
    date: todayIso(),
    content: '## 背景\n\n## 做法\n\n## 结论\n',
  }
}

/** 博客管理：列表 + 新建 / 编辑 / 删除 + Markdown 实时预览（FR-37 / FR-39） */
export default function PostsAdmin() {
  const { data } = useSiteData()
  const [editing, setEditing] = useState<Post | null>(null)
  const [draft, setDraft] = useState<Post>(emptyPost())
  const [tagText, setTagText] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Post | null>(null)

  const takenSlugs = useMemo(() => getPosts().map((item) => item.slug), [])

  function startCreate() {
    const next = emptyPost()
    setEditing(next)
    setDraft(next)
    setTagText('')
    setErrors({})
    setStatus(null)
  }

  function startEdit(post: Post) {
    setEditing(post)
    setDraft(post)
    setTagText(post.tags.join(', '))
    setErrors({})
    setStatus(null)
  }

  function update<K extends keyof Post>(key: K, value: Post[K]) {
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

    const payload: Post = {
      ...draft,
      slug: draft.slug.trim() || makeSlug(draft.title, takenSlugs, editing?.slug),
      tags,
      readingMinutes: draft.readingMinutes ?? estimateReadingMinutes(draft.content),
    }

    const parsed = postSchema.safeParse(payload)
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      setStatus({ kind: 'error', text: '请先修正标红的字段' })
      return
    }

    const result = upsertPost(payload)
    if (!result.ok) {
      setStatus({ kind: 'error', text: result.error ?? '保存失败' })
      return
    }
    setStatus({ kind: 'ok', text: `已保存文章「${payload.title}」` })
    setEditing(null)
  }

  return (
    <>
      <AdminPageHeader
        title="博客管理"
        description="支持 Markdown 与实时预览，保存后前台列表与详情页即时更新。"
        action={
          <Button type="button" size="sm" onClick={startCreate}>
            <IconPlus className="h-3.5 w-3.5" />
            新建文章
          </Button>
        }
      />

      {status ? (
        <div className="mb-5">
          <Notice kind={status.kind}>{status.text}</Notice>
        </div>
      ) : null}

      {editing ? (
        <form onSubmit={onSave} noValidate>
          <AdminCard
            title={editing.slug ? `编辑文章：${editing.title || '未命名'}` : '新建文章'}
            description="slug 用于访问地址 /blog/<slug>，留空会自动生成。"
            action={
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(null)}>
                  取消
                </Button>
                <Button type="submit" size="sm">
                  保存文章
                </Button>
              </div>
            }
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="标题" htmlFor="po-title" required error={errors.title}>
                <Input
                  id="po-title"
                  value={draft.title}
                  onChange={(e) => {
                    const title = e.target.value
                    setDraft((prev) => ({
                      ...prev,
                      title,
                      slug: editing.slug ? prev.slug : makeSlug(title, takenSlugs),
                    }))
                  }}
                  error={errors.title}
                  maxLength={80}
                />
              </Field>
              <Field label="slug" htmlFor="po-slug" error={errors.slug} hint="只允许字母、数字、中文与连字符">
                <Input
                  id="po-slug"
                  value={draft.slug}
                  onChange={(e) => update('slug', e.target.value)}
                  error={errors.slug}
                />
              </Field>
              <Field label="日期" htmlFor="po-date" required error={errors.date}>
                <Input
                  id="po-date"
                  type="date"
                  value={draft.date}
                  onChange={(e) => update('date', e.target.value)}
                  error={errors.date}
                />
              </Field>
              <Field label="标签" htmlFor="po-tags" error={errors.tags} hint="英文逗号分隔，最多 8 个">
                <Input
                  id="po-tags"
                  value={tagText}
                  onChange={(e) => setTagText(e.target.value)}
                  placeholder="React, 部署"
                />
              </Field>
            </div>

            <div className="mt-5 grid gap-5">
              <Field
                label="摘要"
                htmlFor="po-excerpt"
                required
                error={errors.excerpt}
                hint={`${draft.excerpt.length}/200，显示在列表卡片`}
              >
                <Textarea
                  id="po-excerpt"
                  rows={3}
                  value={draft.excerpt}
                  onChange={(e) => update('excerpt', e.target.value)}
                  error={errors.excerpt}
                  maxLength={200}
                />
              </Field>

              <Field label="封面图地址" htmlFor="po-cover" hint="留空时使用内置渐变封面">
                <Input
                  id="po-cover"
                  value={draft.cover ?? ''}
                  onChange={(e) => update('cover', e.target.value)}
                />
              </Field>

              <p className="text-xs text-muted">
                预计阅读时长：
                <span className="ml-1 font-mono text-accent">
                  {estimateReadingMinutes(draft.content)} 分钟
                </span>
                （按正文字数自动估算）
              </p>

              <MarkdownEditor
                id="po-content"
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
        <AdminCard title="文章列表" description={`共 ${data.posts.length} 篇`}>
          {data.posts.length === 0 ? (
            <p className="text-sm text-muted">还没有文章，点击右上角「新建文章」开始。</p>
          ) : (
            <ul className="grid gap-3">
              {data.posts.map((post) => (
                <li
                  key={post.id}
                  className="flex flex-wrap items-center gap-3 rounded-btn border border-line bg-base/40 p-3"
                >
                  {post.cover ? (
                    <img
                      src={post.cover}
                      alt=""
                      className="h-12 w-20 shrink-0 rounded-btn border border-line object-cover"
                    />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{post.title}</p>
                    <p className="mt-0.5 truncate font-mono text-[11px] text-muted">
                      /blog/{post.slug} · {formatDate(post.date)} ·{' '}
                      {post.readingMinutes ?? estimateReadingMinutes(post.content)} 分钟
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(post)}
                      className="inline-flex items-center gap-1 rounded-btn border border-line px-2.5 py-1.5 text-xs text-muted transition hover:border-accent/60 hover:text-accent"
                    >
                      <IconEdit className="h-3.5 w-3.5" />
                      编辑
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDelete(post)}
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
        title={`确认删除文章「${pendingDelete?.title ?? ''}」？`}
        description="删除后该文章及其详情页将不可访问，操作不可撤销。"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            const result = removePost(pendingDelete.id)
            setStatus(
              result.ok
                ? { kind: 'ok', text: `已删除文章「${pendingDelete.title}」` }
                : { kind: 'error', text: result.error ?? '删除失败' },
            )
          }
          setPendingDelete(null)
        }}
      />
    </>
  )
}
