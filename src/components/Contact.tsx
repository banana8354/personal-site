import { useState } from 'react'
import type { ContactInput } from '../lib/validate'
import { contactSchema, fieldErrors } from '../lib/validate'
import type { Profile } from '../api/types'
import { Button, Field, Input, Notice, Textarea } from './Form'
import { IconCheck, IconCopy, IconMail, socialIcon } from './Icons'
import Reveal from './Reveal'
import SectionTitle from './SectionTitle'

interface ContactProps {
  profile: Profile
}

type Status = { kind: 'ok' | 'error'; text: string } | null

/**
 * 联系区块：邮箱一键复制、社交链接、留言表单（FR-23 ~ FR-26）。
 *
 * 说明：本期无后端，表单校验通过后将留言内容写入本机 localStorage（仅站主可见于浏览器），
 * 同时给出明确的成功反馈；接入真实后端后改为 POST 提交即可。
 */
export default function Contact({ profile }: ContactProps) {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<Status>(null)
  const [sending, setSending] = useState(false)
  const [copied, setCopied] = useState(false)

  function update<K extends keyof ContactInput>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }))
  }

  function validateField(key: keyof ContactInput) {
    const result = contactSchema.safeParse(form)
    if (!result.success) {
      const all = fieldErrors(result.error)
      setErrors((prev) => ({ ...prev, [key]: all[key] ?? '' }))
    }
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setStatus({ kind: 'error', text: '复制失败，请手动选择邮箱地址复制' })
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const result = contactSchema.safeParse(form)
    if (!result.success) {
      setErrors(fieldErrors(result.error))
      setStatus({ kind: 'error', text: '请先修正表单中标红的字段' })
      return
    }

    setSending(true)
    setStatus(null)
    try {
      // 本地留存留言，便于站主在浏览器中查看
      const key = 'ps.messages'
      const list = JSON.parse(window.localStorage.getItem(key) ?? '[]') as unknown[]
      list.unshift({ ...result.data, at: new Date().toISOString() })
      window.localStorage.setItem(key, JSON.stringify(list.slice(0, 50)))
      setStatus({
        kind: 'ok',
        text: `收到啦，${result.data.name}！我会尽快通过邮件回复你。`,
      })
      setForm({ name: '', email: '', message: '' })
      setErrors({})
    } catch {
      setStatus({ kind: 'error', text: '提交失败：浏览器存储不可用，请直接发邮件联系我' })
    } finally {
      setSending(false)
    }
  }

  return (
    <section id="contact" className="scroll-mt-24">
      <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20">
        <SectionTitle
          eyebrow="Contact"
          title="联系我"
          description="有项目想聊、有岗位想推，或者只是想说句话，都可以直接联系。"
        />

        <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr]">
          <Reveal>
            <div className="rounded-card border border-line bg-surface/60 p-6">
              <h3 className="text-sm font-semibold text-ink">直接联系</h3>

              <div className="mt-5 flex items-center gap-3 rounded-btn border border-line bg-base/50 p-3">
                <IconMail className="h-4 w-4 shrink-0 text-accent" />
                <span className="flex-1 truncate font-mono text-sm text-ink">{profile.email}</span>
                <button
                  type="button"
                  onClick={copyEmail}
                  className="inline-flex items-center gap-1 rounded-btn border border-line px-2.5 py-1.5 text-xs text-muted transition hover:border-accent/60 hover:text-accent"
                >
                  {copied ? <IconCheck className="h-3.5 w-3.5" /> : <IconCopy className="h-3.5 w-3.5" />}
                  {copied ? '已复制' : '复制'}
                </button>
              </div>
              <p className="mt-2 text-xs text-muted">
                通常 1 个工作日内回复；如果是紧急事项，建议在邮件标题标注「紧急」。
              </p>

              <h3 className="mt-8 text-sm font-semibold text-ink">在这些地方也能找到我</h3>
              <ul className="mt-4 grid gap-2">
                {profile.socials.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-btn border border-line bg-base/40 px-3.5 py-2.5 text-sm text-muted transition hover:border-accent/60 hover:text-accent"
                    >
                      {socialIcon(social.icon, 'h-4 w-4')}
                      <span className="flex-1">{social.label}</span>
                      <span className="truncate font-mono text-[11px] text-muted/80">
                        {social.url.replace(/^https?:\/\//, '')}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <form
              onSubmit={onSubmit}
              noValidate
              className="rounded-card border border-line bg-surface/60 p-6"
            >
              <h3 className="text-sm font-semibold text-ink">给我留言</h3>
              <p className="mt-1.5 text-xs text-muted">
                三个字段都必填，内容不少于 10 个字，方便我理解你的需求。
              </p>

              <div className="mt-6 grid gap-5">
                <Field label="称呼" htmlFor="contact-name" required error={errors.name}>
                  <Input
                    id="contact-name"
                    name="name"
                    value={form.name}
                    onChange={(e) => update('name', e.target.value)}
                    onBlur={() => validateField('name')}
                    error={errors.name}
                    placeholder="怎么称呼你？"
                    autoComplete="name"
                    maxLength={30}
                  />
                </Field>

                <Field label="邮箱" htmlFor="contact-email" required error={errors.email}>
                  <Input
                    id="contact-email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => update('email', e.target.value)}
                    onBlur={() => validateField('email')}
                    error={errors.email}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </Field>

                <Field
                  label="留言内容"
                  htmlFor="contact-message"
                  required
                  error={errors.message}
                  hint={`${form.message.length}/600`}
                >
                  <Textarea
                    id="contact-message"
                    name="message"
                    rows={6}
                    value={form.message}
                    onChange={(e) => update('message', e.target.value)}
                    onBlur={() => validateField('message')}
                    error={errors.message}
                    placeholder="想聊的项目、岗位或者问题…"
                    maxLength={600}
                  />
                </Field>

                {status ? <Notice kind={status.kind}>{status.text}</Notice> : null}

                <div className="flex items-center gap-3">
                  <Button type="submit" loading={sending} disabled={sending}>
                    {sending ? '发送中…' : '发送留言'}
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ name: '', email: '', message: '' })
                      setErrors({})
                      setStatus(null)
                    }}
                    className="text-xs text-muted transition hover:text-ink"
                  >
                    清空表单
                  </button>
                </div>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
