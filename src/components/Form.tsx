import type { ReactNode } from 'react'

/**
 * 通用表单控件与按钮 —— 受控组件，样式统一走设计令牌。
 */

/* ------------------------------- 按钮 ------------------------------- */

type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'subtle'
type ButtonSize = 'sm' | 'md'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-base font-semibold hover:brightness-110 disabled:opacity-60 shadow-[0_6px_20px_rgb(var(--accent-rgb)/0.25)]',
  ghost: 'border border-line bg-surface-2/60 text-ink hover:border-accent/60 hover:text-accent',
  danger: 'border border-danger/50 bg-danger/10 text-danger hover:bg-danger/20',
  subtle: 'text-muted hover:text-ink hover:bg-surface-2',
}

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-btn transition duration-200 disabled:cursor-not-allowed ${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]} ${className}`}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  )
}

export function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

/* ------------------------------- 字段 ------------------------------- */

interface FieldProps {
  label: string
  htmlFor?: string
  error?: string
  hint?: string
  required?: boolean
  children: ReactNode
  className?: string
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required = false,
  children,
  className = '',
}: FieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink">
        {label}
        {required ? <span className="ml-1 text-danger">*</span> : null}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  )
}

const CONTROL_CLASS =
  'w-full rounded-btn border bg-base/60 px-3.5 py-2.5 text-sm text-ink placeholder:text-muted/60 transition focus:outline-none'

function controlClass(error?: string): string {
  return `${CONTROL_CLASS} ${error ? 'border-danger/70 focus:border-danger' : 'border-line focus:border-accent'}`
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export function Input({ error, className = '', ...rest }: InputProps) {
  return <input {...rest} className={`${controlClass(error)} ${className}`} />
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

export function Textarea({ error, className = '', ...rest }: TextareaProps) {
  return <textarea {...rest} className={`${controlClass(error)} leading-relaxed ${className}`} />
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
  children: ReactNode
}

export function Select({ error, className = '', children, ...rest }: SelectProps) {
  return (
    <select {...rest} className={`${controlClass(error)} ${className}`}>
      {children}
    </select>
  )
}

/* ------------------------------ 反馈条 ------------------------------ */

interface NoticeProps {
  kind?: 'ok' | 'error' | 'info'
  children: ReactNode
}

export function Notice({ kind = 'info', children }: NoticeProps) {
  const tone =
    kind === 'ok'
      ? 'border-ok/40 bg-ok/10 text-ok'
      : kind === 'error'
        ? 'border-danger/40 bg-danger/10 text-danger'
        : 'border-accent/40 bg-accent/10 text-accent'
  return (
    <div className={`rounded-btn border px-4 py-3 text-sm ${tone}`} role="status">
      {children}
    </div>
  )
}
