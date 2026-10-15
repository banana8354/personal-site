import { useState } from 'react'
import ConfirmDialog from '../../components/ConfirmDialog'
import { Button, Field, Input, Notice } from '../../components/Form'
import { IconPlus, IconTrash } from '../../components/Icons'
import { saveSkills } from '../../api/adminApi'
import type { Skill, SkillCategory } from '../../api/types'
import { useSiteData } from '../../hooks/useSiteData'
import { AdminCard, AdminPageHeader } from './AdminUI'

const CATEGORY_LABEL: Record<SkillCategory, string> = {
  frontend: '前端',
  backend: '后端',
  tooling: '工程与工具',
  other: '其他能力',
}

const CATEGORIES: SkillCategory[] = ['frontend', 'backend', 'tooling', 'other']

/** 技能管理：增删改 + 熟练度调整（FR-35） */
export default function SkillsAdmin() {
  const { data } = useSiteData()
  const [list, setList] = useState<Skill[]>(data.skills)
  const [status, setStatus] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Skill | null>(null)

  function commit(next: Skill[]) {
    setList(next)
    const result = saveSkills(next)
    setStatus(
      result.ok
        ? { kind: 'ok', text: '已保存，前台刷新即可看到最新技能列表' }
        : { kind: 'error', text: result.error ?? '保存失败' },
    )
  }

  function patch(id: string, changes: Partial<Skill>) {
    setList((prev) => prev.map((item) => (item.id === id ? { ...item, ...changes } : item)))
  }

  function addSkill(category: SkillCategory) {
    const skill: Skill = {
      id: `sk-${Date.now().toString(36)}`,
      name: '新技能',
      category,
      level: 60,
    }
    commit([...list, skill])
  }

  function normalize() {
    commit(
      list.map((item) => ({
        ...item,
        name: item.name.trim() || '未命名技能',
        level: Math.min(100, Math.max(0, Math.round(Number(item.level) || 0))),
      })),
    )
  }

  return (
    <>
      <AdminPageHeader
        title="技能管理"
        description="按分类维护技能与熟练度，前台以进度条动画展示。"
        action={
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={normalize}>
              整理数据
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => addSkill('frontend')}
            >
              <IconPlus className="h-3.5 w-3.5" />
              新增技能
            </Button>
          </div>
        }
      />

      {status ? (
        <div className="mb-5">
          <Notice kind={status.kind}>{status.text}</Notice>
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        {CATEGORIES.map((category) => {
          const items = list.filter((item) => item.category === category)
          return (
            <AdminCard
              key={category}
              title={CATEGORY_LABEL[category]}
              description={`${items.length} 项`}
              action={
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addSkill(category)}
                >
                  <IconPlus className="h-3.5 w-3.5" />
                  添加
                </Button>
              }
            >
              {items.length === 0 ? (
                <p className="text-sm text-muted">这个分类下还没有技能。</p>
              ) : (
                <div className="grid gap-3">
                  {items.map((skill) => (
                    <div
                      key={skill.id}
                      className="grid gap-2 rounded-btn border border-line bg-base/40 p-3 sm:grid-cols-[1fr_96px_44px_auto] sm:items-center"
                    >
                      <Field label="名称" htmlFor={`skill-name-${skill.id}`} className="sm:hidden">
                        <Input
                          id={`skill-name-${skill.id}`}
                          value={skill.name}
                          onChange={(e) => patch(skill.id, { name: e.target.value })}
                          maxLength={30}
                        />
                      </Field>
                      <Input
                        value={skill.name}
                        onChange={(e) => patch(skill.id, { name: e.target.value })}
                        maxLength={30}
                        aria-label={`技能名称 ${skill.name}`}
                        className="hidden sm:block"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={skill.level}
                          onChange={(e) => patch(skill.id, { level: Number(e.target.value) })}
                          aria-label={`${skill.name} 熟练度`}
                          className="w-full accent-[var(--accent)]"
                        />
                      </div>
                      <span className="font-mono text-xs text-muted">{skill.level}%</span>
                      <button
                        type="button"
                        aria-label={`删除技能 ${skill.name}`}
                        onClick={() => setPendingDelete(skill)}
                        className="justify-self-end rounded-btn border border-line p-2 text-muted transition hover:border-danger/50 hover:text-danger"
                      >
                        <IconTrash className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </AdminCard>
          )
        })}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title={`确认删除技能「${pendingDelete?.name ?? ''}」？`}
        description="删除后需要重新添加，操作不可撤销。"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            commit(list.filter((item) => item.id !== pendingDelete.id))
          }
          setPendingDelete(null)
        }}
      />
    </>
  )
}
