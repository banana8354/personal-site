import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Button, Field, Input, Notice } from '../../components/Form'
import { IconLock, IconSparkle } from '../../components/Icons'
import { useAuth } from '../../hooks/useAuth'
import { fieldErrors, loginSchema } from '../../lib/validate'

interface LocationState {
  from?: string
}

/**
 * 后台登录页。
 * 演示账号：admin / admin123（口令以 SHA-256 常量比对，localStorage 只存 token）。
 * ⚠️ 前端校验仅为演示，非真实安全边界；接入后端后必须改为服务端校验。
 */
export default function Login() {
  const { authenticated, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as LocationState | null)?.from ?? '/admin'

  const [form, setForm] = useState({ username: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<string>('')
  const [loading, setLoading] = useState(false)

  if (authenticated) return <Navigate to={from} replace />

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    const parsed = loginSchema.safeParse(form)
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error))
      return
    }
    setErrors({})
    setLoading(true)
    const result = await login(parsed.data.username, parsed.data.password)
    setLoading(false)
    if (!result.ok) {
      setMessage(result.error ?? '登录失败，请重试')
      return
    }
    navigate(from, { replace: true })
  }

  function fillDemo() {
    setForm({ username: 'admin', password: 'admin123' })
    setErrors({})
    setMessage('')
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted hover:text-accent">
          <IconSparkle className="h-5 w-5 text-accent" />
          返回前台网站
        </Link>

        <div className="rounded-card border border-line bg-surface/80 p-7 backdrop-blur">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-btn border border-line bg-surface-2 text-accent">
            <IconLock />
          </div>
          <h1 className="mt-5 text-xl font-semibold text-ink">内容管理后台</h1>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            登录后可管理个人信息、技能、项目与博客文章。数据保存在本机浏览器。
          </p>

          <form onSubmit={onSubmit} noValidate className="mt-7 grid gap-5">
            <Field label="账号" htmlFor="username" required error={errors.username}>
              <Input
                id="username"
                name="username"
                value={form.username}
                onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                error={errors.username}
                placeholder="admin"
                autoComplete="username"
                autoFocus
              />
            </Field>

            <Field label="密码" htmlFor="password" required error={errors.password}>
              <Input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                error={errors.password}
                placeholder="••••••"
                autoComplete="current-password"
              />
            </Field>

            {message ? <Notice kind="error">{message}</Notice> : null}

            <Button type="submit" loading={loading} disabled={loading}>
              {loading ? '登录中…' : '登录'}
            </Button>
          </form>

          <div className="mt-6 rounded-btn border border-dashed border-line bg-base/40 p-3.5">
            <p className="text-[11px] leading-relaxed text-muted">
              演示账号：<span className="font-mono text-accent">admin</span> / 密码：
              <span className="font-mono text-accent">admin123</span>
              <button
                type="button"
                onClick={fillDemo}
                className="ml-2 text-accent underline decoration-dotted hover:no-underline"
              >
                一键填入
              </button>
            </p>
          </div>
        </div>

        <p className="mt-5 text-center text-[11px] leading-relaxed text-muted/80">
          提示：本登录为前端演示实现，口令以哈希常量比对、不落明文。
          <br />
          真实上线请接入服务端签发 JWT 与权限校验。
        </p>
      </div>
    </div>
  )
}
