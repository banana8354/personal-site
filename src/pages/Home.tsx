import { Link } from 'react-router-dom'
import About from '../components/About'
import Contact from '../components/Contact'
import Hero from '../components/Hero'
import { IconArrowRight } from '../components/Icons'
import PostCard from '../components/PostCard'
import ProjectCard from '../components/ProjectCard'
import Reveal from '../components/Reveal'
import SectionTitle from '../components/SectionTitle'
import Skills from '../components/Skills'
import { useSiteData } from '../hooks/useSiteData'

/** 首页：Hero / 关于 / 技能 / 项目 / 博客 / 联系 六个区块 */
export default function Home() {
  const { data } = useSiteData()
  const featuredProjects = data.projects.slice(0, 3)
  const latestPosts = data.posts.slice(0, 3)

  return (
    <>
      <Hero
        profile={data.profile}
        settings={data.settings}
        projectCount={data.projects.length}
        postCount={data.posts.length}
      />

      <About profile={data.profile} experiences={data.experiences} />

      <Skills skills={data.skills} />

      <section id="projects" className="scroll-mt-24">
        <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20">
          <SectionTitle
            eyebrow="Projects"
            title="项目展示"
            description="每个项目都写了背景、技术方案与踩过的坑，而不是只放一张截图。"
            action={
              <Link
                to="/projects"
                className="inline-flex items-center gap-1.5 text-sm text-accent transition hover:gap-2.5"
              >
                查看全部项目
                <IconArrowRight className="h-4 w-4" />
              </Link>
            }
          />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project, index) => (
              <Reveal key={project.id} delay={index * 70} className="h-full">
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="blog" className="scroll-mt-24">
        <div className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 sm:py-20">
          <SectionTitle
            eyebrow="Blog"
            title="博客"
            description="把踩过的坑写下来，让下一个遇到同样问题的人少绕一段路。"
            action={
              <Link
                to="/blog"
                className="inline-flex items-center gap-1.5 text-sm text-accent transition hover:gap-2.5"
              >
                查看全部文章
                <IconArrowRight className="h-4 w-4" />
              </Link>
            }
          />

          {latestPosts.length === 0 ? (
            <p className="rounded-card border border-dashed border-line px-6 py-12 text-center text-sm text-muted">
              还没有文章，去后台上传第一篇吧。
            </p>
          ) : (
            <div className="grid gap-6">
              <Reveal>
                <PostCard post={latestPosts[0]} featured />
              </Reveal>
              {latestPosts.length > 1 ? (
                <div className="grid gap-6 sm:grid-cols-2">
                  {latestPosts.slice(1).map((post, index) => (
                    <Reveal key={post.id} delay={index * 70} className="h-full">
                      <PostCard post={post} />
                    </Reveal>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>

      <Contact profile={data.profile} />
    </>
  )
}
