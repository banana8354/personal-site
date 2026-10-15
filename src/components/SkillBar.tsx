import { useEffect, useRef, useState } from 'react'
import type { Skill } from '../api/types'

interface SkillBarProps {
  skill: Skill
  delay?: number
}

/** 技能条：进入视口后从 0 动画到目标熟练度（FR-10） */
export default function SkillBar({ skill, delay = 0 }: SkillBarProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [filled, setFilled] = useState(false)
  const level = Math.min(100, Math.max(0, skill.level))

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || typeof IntersectionObserver === 'undefined') {
      setFilled(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setFilled(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.3 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="group">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="text-sm text-ink">{skill.name}</span>
        <span className="font-mono text-xs text-muted transition group-hover:text-accent">
          {level}%
        </span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-line"
        role="progressbar"
        aria-label={`${skill.name} 熟练度`}
        aria-valuenow={level}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-accent transition-[width] duration-1000 ease-out"
          style={{
            width: filled ? `${level}%` : '0%',
            transitionDelay: `${delay}ms`,
          }}
        />
      </div>
    </div>
  )
}
