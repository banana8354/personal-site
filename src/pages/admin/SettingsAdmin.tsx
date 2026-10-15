import { useState } from 'react'
import { exportAll, importAll, resetAll, saveSettings } from '../../api/adminApi'
import type { SiteSettings } from '../../api/types'
import ConfirmDialog from '../../components/ConfirmDialog'
import { Button, Field, Input, Notice, Textarea } from '../../components/Form'
import { IconAlert, IconCheck, IconCopy, IconDownload } from '../../components/Icons'
import { useSiteData } from '../../hooks/useSiteData'
import { fieldErrors, settingsSchema } from '../../lib/validate'
import { AdminCard, AdminPageHeader } from './AdminUI'

const ACCENT_PRESETS = ['#38bdf8', '#22d3ee', '#a78bfa', '#f472b6', '#34d399', '#fbbf24']

/** 站点设置：站名、强调色、星空密度、页脚与数据备份（FR-38 / PRD 风险对策） */
export default function SettingsAdmin() {
  const { data } = useSiteData()
  const [form, setForm] = useState<SiteSettings>(data.settings)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const [importText, setImportText] = useState('')
  const [copied, setCopied] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  function update<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key as string]) setErrors((prev) => ({ ...prev, [key as string]: '' }))
  }

  function onSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = settingsSchema.safeParse(form)
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      setStatus({ kind: 'error', text: '请先修正标红的字段' })
      return
    }
    const result = saveSettings(parsed.data as SiteSettings)
    setStatus(
      result.ok
        ? { kind: 'ok', text: '已保存站点设置，全站强调色与密度立即生效' }
        : { kind: 'error', text: result.error ?? '保存失败' },
    )
  }

  function downloadBackup() {
    try {
      const blob = new Blob([exportAll()], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `personal-site-backup-${new Date().toISOString().slice(0, 10)}.json`
      anchor.click()
      URL.revokeObjectURL(url)
      setStatus({ kind: 'ok', text: '备份文件已开始下载' })
    } catch {
      setStatus({ kind: 'error', text: '导出失败，请尝试用「复制 JSON」手动保存' })
    }
  }

  async function copyBackup() {
    try {
      await navigator.clipboard.writeText(exportAll())
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setStatus({ kind: 'error', text: '复制失败，请改用下载备份' })
    }
  }

  return (
    <form onSubmit={onSave} noValidate>
      <AdminPageHeader
        title="站点设置"
        description="调整站名、主题强调色、星空密度，并管理数据备份。"
        action={
          <Button type="submit" size="sm">
            保存设置
          </Button>
        }
      />

      {status ? (
        <div className="mb-5">
          <Notice kind={status.kind}>{status.text}</Notice>
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-5">
          <AdminCard title="基础信息">
            <div className="grid gap-5">
              <Field label="站点名称" htmlFor="s-name" required error={errors.siteName} hint="显示在导航左侧与页脚">
                <Input
                  id="s-name"
                  value={form.siteName}
                  onChange={(e) => update('siteName', e.target.value)}
                  error={errors.siteName}
                  maxLength={40}
                />
              </Field>

              <Field label="页脚说明" htmlFor="s-footer" hint={`${form.footerNote.length}/200`}>
                <Textarea
                  id="s-footer"
                  rows={3}
                  value={form.footerNote}
                  onChange={(e) => update('footerNote', e.target.value)}
                  maxLength={200}
                />
              </Field>

              <Field label="备案号（可选）" htmlFor="s-icp" hint="没有留空即可">
                <Input
                  id="s-icp"
                  value={form.icp ?? ''}
                  onChange={(e) => update('icp', e.target.value)}
                  maxLength={60}
                  placeholder="浙ICP备xxxxxxxx号"
                />
              </Field>
            </div>
          </AdminCard>

          <AdminCard title="主题与背景">
            <div className="grid gap-5">
              <Field label="强调色" htmlFor="s-accent" error={errors.accent} hint="影响按钮、链接、进度条与部分星点">
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    id="s-accent"
                    type="color"
                    value={/^#[0-9a-f]{6}$/i.test(form.accent) ? form.accent : '#38bdf8'}
                    onChange={(e) => update('accent', e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded-btn border border-line bg-base/60"
                    aria-label="选择强调色"
                  />
                  <Input
                    value={form.accent}
                    onChange={(e) => update('accent', e.target.value)}
                    error={errors.accent}
                    className="max-w-[160px] font-mono"
                    aria-label="强调色十六进制值"
                  />
                  <div className="flex gap-2">
                    {ACCENT_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => update('accent', preset)}
                        aria-label={`使用预设色 ${preset}`}
                        style={{ backgroundColor: preset }}
                        className={`h-7 w-7 rounded-full border transition ${
                          form.accent.toLowerCase() === preset ? 'border-ink' : 'border-line'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </Field>

              <Field label="星空密度" htmlFor="s-density" hint="低端设备建议使用「低」，可显著降低耗电">
                <select
                  id="s-density"
                  value={form.starDensity}
                  onChange={(e) => update('starDensity', e.target.value as SiteSettings['starDensity'])}
                  className="w-full rounded-btn border border-line bg-base/60 px-3.5 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
                >
                  <option value="low">低（移动端约 27 个粒子）</option>
                  <option value="medium">中</option>
                  <option value="high">高（默认，桌面最多 140 个粒子）</option>
                </select>
              </Field>
            </div>
          </AdminCard>
        </div>

        <div className="grid gap-5">
          <AdminCard title="效果预览">
            <div className="rounded-card border border-line bg-base/60 p-4">
              <p className="text-xs text-muted">当前强调色</p>
              <div className="mt-3 flex items-center gap-3">
                <span
                  className="inline-flex h-9 items-center rounded-btn px-4 text-sm font-semibold text-base"
                  style={{ backgroundColor: form.accent }}
                >
                  按钮
                </span>
                <span className="font-mono text-sm" style={{ color: form.accent }}>
                  {form.accent}
                </span>
              </div>
              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-line">
                <div className="h-full w-2/3 rounded-full" style={{ backgroundColor: form.accent }} />
              </div>
              <p className="mt-3 text-[11px] text-muted">
                站点名称：{form.siteName || '（未填写）'}
              </p>
            </div>
          </AdminCard>

          <AdminCard
            title="数据备份"
            description="内容保存在本机浏览器，建议定期导出备份"
          >
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={downloadBackup}>
                <IconDownload className="h-3.5 w-3.5" />
                下载备份
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={copyBackup}>
                {copied ? <IconCheck className="h-3.5 w-3.5" /> : <IconCopy className="h-3.5 w-3.5" />}
                {copied ? '已复制' : '复制 JSON'}
              </Button>
            </div>

            <div className="mt-4">
              <Field label="导入备份" htmlFor="s-import" hint="粘贴之前导出的 JSON 内容">
                <Textarea
                  id="s-import"
                  rows={5}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="font-mono text-[12px]"
                  placeholder='{"profile":{...},"posts":[...]}'
                />
              </Field>
              <div className="mt-2 flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const result = importAll(importText)
                    setStatus(
                      result.ok
                        ? { kind: 'ok', text: '导入成功，已覆盖对应内容' }
                        : { kind: 'error', text: result.error ?? '导入失败' },
                    )
                    if (result.ok) setImportText('')
                  }}
                >
                  导入
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => setConfirmReset(true)}
                >
                  <IconAlert className="h-3.5 w-3.5" />
                  恢复默认内容
                </Button>
              </div>
            </div>
          </AdminCard>
        </div>
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="确认恢复默认内容？"
        description="所有自定义的个人信息、技能、项目与文章都会被默认内容覆盖，操作不可撤销。"
        confirmText="确认恢复"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          const result = resetAll()
          setStatus(
            result.ok
              ? { kind: 'ok', text: '已恢复默认内容' }
              : { kind: 'error', text: result.error ?? '重置失败' },
          )
          setConfirmReset(false)
        }}
      />
    </form>
  )
}
