import type { Experience, Profile } from '../api/types'
import Reveal from './Reveal'
import SectionTitle from './SectionTitle'
import { IconChart, IconDoc, IconSparkle } from './Icons'

interface AboutProps {
  profile: Profile
  experiences: Experience[]
}

const KIND_LABEL: Record<Experience['kind'], string> = {
  work: '工作经历',
  education: '教育背景',
}

function kindIcon(kind: Experience['kind'], className: string) {
  return kind === 'education' ? (
    <IconDoc className={className} />
  ) : (
    <IconChart className={className} />
  )
}

/** 个人介绍：简介段落 + 经历时间线 + 教育背景（FR-05 ~ FR-07） */
export default function About({ profile, experiences }: AboutProps) {
  const work = experiences.filter((item) => item.kind === 'work')
  const education = experiences.filter((item) => item.kind === 'education')

  return (
    <section id="about" className="scroll-mt-24">
      <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20">
        <SectionTitle
          eyebrow="About Me"
          title="关于我"
          description="用三句话说明我是谁、我在意什么、以及我如何把事情做完。"
        />

        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <div className="space-y-4 text-sm leading-relaxed text-muted">
              {profile.bio.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>

            <dl className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-card border border-line bg-surface/60 p-4">
                <dt className="text-xs text-muted">所在地</dt>
                <dd className="mt-1 text-sm text-ink">{profile.location}</dd>
              </div>
              <div className="rounded-card border border-line bg-surface/60 p-4">
                <dt className="text-xs text-muted">邮箱</dt>
                <dd className="mt-1 truncate text-sm text-ink">{profile.email}</dd>
              </div>
            </dl>

            <ul className="mt-8 grid gap-3">
              {['组件与状态边界设计', '首屏性能与包体积控制', '把重复劳动交给脚本'].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-muted">
                  <IconSparkle className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>

          <div>
            {[
              { title: KIND_LABEL.work, items: work },
              { title: KIND_LABEL.education, items: education },
            ].map((group) =>
              group.items.length === 0 ? null : (
                <div key={group.title} className="mb-10 last:mb-0">
                  <h3 className="mb-5 text-sm font-semibold tracking-wide text-ink">
                    {group.title}
                  </h3>
                  <ol className="relative border-l border-line pl-6">
                    {group.items.map((item, index) => (
                      <li key={item.id} className="relative pb-8 last:pb-0">
                        <span className="absolute top-1 -left-[31px] flex h-6 w-6 items-center justify-center rounded-full border border-line bg-surface text-accent">
                          {kindIcon(item.kind, 'h-3.5 w-3.5')}
                        </span>
                        <Reveal delay={index * 60}>
                          <p className="font-mono text-xs text-accent">{item.period}</p>
                          <p className="mt-1.5 text-sm font-semibold text-ink">
                            {item.org}
                            <span className="ml-2 text-xs font-normal text-muted">{item.role}</span>
                          </p>
                          <p className="mt-2 text-sm leading-relaxed text-muted">
                            {item.description}
                          </p>
                        </Reveal>
                      </li>
                    ))}
                  </ol>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
