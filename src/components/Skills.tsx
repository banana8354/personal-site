import type { Skill, SkillCategory } from '../api/types'
import Reveal from './Reveal'
import SectionTitle from './SectionTitle'
import SkillBar from './SkillBar'

interface SkillsProps {
  skills: Skill[]
}

const CATEGORY_LABEL: Record<SkillCategory, string> = {
  frontend: '前端',
  backend: '后端',
  tooling: '工程与工具',
  other: '其他能力',
}

const CATEGORY_ORDER: SkillCategory[] = ['frontend', 'backend', 'tooling', 'other']

/** 技能展示：按分类分组 + 熟练度进度条（FR-08 ~ FR-10） */
export default function Skills({ skills }: SkillsProps) {
  const groups = CATEGORY_ORDER.map((category) => ({
    category,
    items: skills.filter((skill) => skill.category === category),
  })).filter((group) => group.items.length > 0)

  return (
    <section id="skills" className="scroll-mt-24">
      <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20">
        <SectionTitle
          eyebrow="Skills"
          title="技能展示"
          description="按熟练度标注，只在真正写过生产代码的方向上给高分。"
        />

        <div className="grid gap-6 sm:grid-cols-2">
          {groups.map((group, groupIndex) => (
            <Reveal key={group.category} delay={groupIndex * 60}>
              <div className="h-full rounded-card border border-line bg-surface/60 p-6">
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-ink">
                    {CATEGORY_LABEL[group.category]}
                  </h3>
                  <span className="font-mono text-xs text-muted">
                    {group.items.length} 项
                  </span>
                </div>
                <div className="grid gap-4">
                  {group.items.map((skill, index) => (
                    <SkillBar key={skill.id} skill={skill} delay={index * 80} />
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
