import { useState } from 'react'
import Markdown from '../../components/Markdown'
import { Field, Textarea } from '../../components/Form'

interface MarkdownEditorProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  rows?: number
  hint?: string
}

/**
 * Markdown 编辑器：左编辑 / 右实时预览（桌面对照，移动端切换）。
 * 预览复用前台渲染组件，保证所见即所得（FR-37）。
 */
export default function MarkdownEditor({
  id,
  label,
  value,
  onChange,
  error,
  rows = 18,
  hint,
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')

  return (
    <Field label={label} htmlFor={id} error={error} hint={hint}>
      <div className="mb-2 flex gap-1 lg:hidden">
        {(['edit', 'preview'] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            aria-pressed={tab === item}
            className={`rounded-btn border px-3 py-1.5 text-xs transition ${
              tab === item
                ? 'border-accent/60 bg-accent/10 text-accent'
                : 'border-line text-muted'
            }`}
          >
            {item === 'edit' ? '编辑' : '预览'}
          </button>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Textarea
          id={id}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          error={error}
          spellCheck={false}
          className={`font-mono text-[13px] ${tab === 'preview' ? 'hidden lg:block' : ''}`}
          placeholder={'## 小标题\n\n正文支持 **加粗**、`代码`、表格与列表。\n\n```ts\nconst hello = "world"\n```'}
        />
        <div
          className={`max-h-[520px] overflow-y-auto rounded-btn border border-line bg-base/40 p-4 ${
            tab === 'edit' ? 'hidden lg:block' : ''
          }`}
        >
          {value.trim() === '' ? (
            <p className="text-xs text-muted">在左侧输入 Markdown，这里会实时预览。</p>
          ) : (
            <Markdown content={value} className="prose-sm" />
          )}
        </div>
      </div>
    </Field>
  )
}
