import { useEffect, useState } from 'react'
import { Button, Field, Input, Notice, Textarea } from '../../components/Form'
import { IconPlus, IconTrash } from '../../components/Icons'
import { saveProfile } from '../../api/adminApi'
import type { Profile, SocialLink } from '../../api/types'
import { useSiteData } from '../../hooks/useSiteData'
import { artwork } from '../../api/seed'
import { fieldErrors, profileSchema } from '../../lib/validate'
import { AdminCard, AdminPageHeader } from './AdminUI'

const ICON_OPTIONS: SocialLink['icon'][] = ['github', 'mail', 'link', 'wechat']

/** 个人信息管理：头像、简介、社交链接（FR-34） */
export default function ProfileAdmin() {
  const { data } = useSiteData()
  const [form, setForm] = useState<Profile>(data.profile)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)

  // 站点数据变化（例如重置）时同步表单
  useEffect(() => {
    setForm(data.profile)
  }, [data.profile])

  function update<K extends keyof Profile>(key: K, value: Profile[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key as string]) setErrors((prev) => ({ ...prev, [key as string]: '' }))
  }

  function updateBio(index: number, value: string) {
    setForm((prev) => ({
      ...prev,
      bio: prev.bio.map((item, i) => (i === index ? value : item)),
    }))
  }

  function addBio() {
    setForm((prev) => ({ ...prev, bio: [...prev.bio, ''] }))
  }

  function removeBio(index: number) {
    setForm((prev) => ({ ...prev, bio: prev.bio.filter((_, i) => i !== index) }))
  }

  function updateSocial(index: number, patch: Partial<SocialLink>) {
    setForm((prev) => ({
      ...prev,
      socials: prev.socials.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }))
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus(null)
    const parsed = profileSchema.safeParse(form)
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      setStatus({ kind: 'error', text: '请先修正标红的字段' })
      return
    }
    setErrors({})
    const result = saveProfile({ ...form, bio: form.bio.filter((line) => line.trim() !== '') })
    setStatus(
      result.ok
        ? { kind: 'ok', text: '已保存，前台刷新即可看到最新信息' }
        : { kind: 'error', text: result.error ?? '保存失败' },
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <AdminPageHeader
        title="个人信息"
        description="这里的内容会显示在首页 Hero、关于我与页脚。"
        action={
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() =>
                update(
                  'avatar',
                  artwork({ from: '#0ea5e9', to: '#7c3aed' }, { width: 320, height: 320, label: form.name.slice(0, 1) || '星', radius: 160 }),
                )
              }
            >
              重新生成头像
            </Button>
            <Button type="submit" size="sm">
              保存
            </Button>
          </div>
        }
      />

      {status ? (
        <div className="mb-5">
          <Notice kind={status.kind}>{status.text}</Notice>
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-5">
          <AdminCard title="基本信息">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="姓名" htmlFor="p-name" required error={errors.name}>
                <Input
                  id="p-name"
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  error={errors.name}
                  maxLength={30}
                />
              </Field>
              <Field label="职位头衔" htmlFor="p-title" required error={errors.title}>
                <Input
                  id="p-title"
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                  error={errors.title}
                  maxLength={60}
                />
              </Field>
              <Field label="邮箱" htmlFor="p-email" required error={errors.email}>
                <Input
                  id="p-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  error={errors.email}
                />
              </Field>
              <Field label="所在地" htmlFor="p-location" error={errors.location}>
                <Input
                  id="p-location"
                  value={form.location}
                  onChange={(e) => update('location', e.target.value)}
                  error={errors.location}
                  maxLength={40}
                />
              </Field>
            </div>

            <div className="mt-5 grid gap-5">
              <Field
                label="一句话介绍"
                htmlFor="p-tagline"
                required
                error={errors.tagline}
                hint={`${form.tagline.length}/120，显示在首屏与页脚`}
              >
                <Textarea
                  id="p-tagline"
                  rows={2}
                  value={form.tagline}
                  onChange={(e) => update('tagline', e.target.value)}
                  error={errors.tagline}
                  maxLength={120}
                />
              </Field>
              <Field label="简历链接" htmlFor="p-resume" hint="留空或填 # 时首屏显示「获取简历」引导到联系区">
                <Input
                  id="p-resume"
                  value={form.resumeUrl}
                  onChange={(e) => update('resumeUrl', e.target.value)}
                  placeholder="https://example.com/resume.pdf"
                />
              </Field>
            </div>
          </AdminCard>

          <AdminCard
            title="个人简介"
            description="每段一条，显示在「关于我」区块"
            action={
              <Button type="button" variant="ghost" size="sm" onClick={addBio}>
                <IconPlus className="h-3.5 w-3.5" />
                增加一段
              </Button>
            }
          >
            {errors.bio ? <p className="mb-3 text-xs text-danger">{errors.bio}</p> : null}
            <div className="grid gap-3">
              {form.bio.map((paragraph, index) => (
                <div key={`bio-${index}`} className="flex items-start gap-2">
                  <Textarea
                    rows={3}
                    value={paragraph}
                    onChange={(e) => updateBio(index, e.target.value)}
                    placeholder={`第 ${index + 1} 段简介`}
                  />
                  <button
                    type="button"
                    aria-label={`删除第 ${index + 1} 段简介`}
                    onClick={() => removeBio(index)}
                    disabled={form.bio.length <= 1}
                    className="mt-1 rounded-btn border border-line p-2 text-muted transition hover:border-danger/50 hover:text-danger disabled:opacity-40"
                  >
                    <IconTrash className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </AdminCard>

          <AdminCard
            title="社交链接"
            description="显示在首屏名片、联系区与页脚"
            action={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  update('socials', [...form.socials, { label: '新链接', url: 'https://', icon: 'link' }])
                }
              >
                <IconPlus className="h-3.5 w-3.5" />
                添加
              </Button>
            }
          >
            <div className="grid gap-3">
              {form.socials.map((social, index) => (
                <div key={`social-${index}`} className="grid gap-2 sm:grid-cols-[140px_1fr_120px_auto]">
                  <Input
                    value={social.label}
                    onChange={(e) => updateSocial(index, { label: e.target.value })}
                    placeholder="名称"
                    aria-label={`第 ${index + 1} 个链接的名称`}
                  />
                  <Input
                    value={social.url}
                    onChange={(e) => updateSocial(index, { url: e.target.value })}
                    placeholder="https://"
                    aria-label={`第 ${index + 1} 个链接的地址`}
                  />
                  <select
                    value={social.icon}
                    onChange={(e) =>
                      updateSocial(index, { icon: e.target.value as SocialLink['icon'] })
                    }
                    aria-label={`第 ${index + 1} 个链接的图标`}
                    className="w-full rounded-btn border border-line bg-base/60 px-3 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
                  >
                    {ICON_OPTIONS.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    aria-label={`删除链接 ${social.label}`}
                    onClick={() =>
                      update(
                        'socials',
                        form.socials.filter((_, i) => i !== index),
                      )
                    }
                    className="rounded-btn border border-line px-3 text-muted transition hover:border-danger/50 hover:text-danger"
                  >
                    <IconTrash className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </AdminCard>
        </div>

        <div className="grid gap-5">
          <AdminCard title="头像预览">
            <div className="flex flex-col items-center">
              <img
                src={form.avatar}
                alt="头像预览"
                className="h-32 w-32 rounded-full border border-line object-cover"
              />
              <p className="mt-3 text-[11px] text-muted">
                当前使用内置生成头像（data-URI SVG），可粘贴外部图片地址替换。
              </p>
              <Input
                className="mt-3"
                value={form.avatar}
                onChange={(e) => update('avatar', e.target.value)}
                placeholder="https://... 或留空"
                aria-label="头像地址"
              />
            </div>
          </AdminCard>

          <AdminCard title="保存说明">
            <ul className="grid gap-2 text-xs leading-relaxed text-muted">
              <li>· 数据保存在本机 localStorage，清除浏览器数据会回到默认内容。</li>
              <li>· 建议在「站点设置」导出备份，换设备时再导入。</li>
              <li>· 保存后前台无需重新构建，刷新即为最新内容。</li>
            </ul>
          </AdminCard>
        </div>
      </div>
    </form>
  )
}
