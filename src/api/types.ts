/**
 * 站点数据模型 —— 全站唯一类型来源（AGENTS.md §2 规则 4）。
 * 其他文件一律 `import type` 复用，禁止重复声明同名字段结构。
 */

/** 社交链接 */
export interface SocialLink {
  label: string
  url: string
  icon: 'github' | 'mail' | 'link' | 'wechat'
}

/** 个人信息 */
export interface Profile {
  name: string
  title: string
  tagline: string
  avatar: string
  bio: string[]
  email: string
  location: string
  resumeUrl: string
  socials: SocialLink[]
}

/** 经历 / 教育时间线条目 */
export interface Experience {
  id: string
  period: string
  org: string
  role: string
  description: string
  kind: 'work' | 'education'
}

export type SkillCategory = 'frontend' | 'backend' | 'tooling' | 'other'

/** 技能 */
export interface Skill {
  id: string
  name: string
  category: SkillCategory
  /** 熟练度 0–100 */
  level: number
}

/** 项目 */
export interface Project {
  id: string
  slug: string
  title: string
  summary: string
  cover: string
  tags: string[]
  repoUrl?: string
  demoUrl?: string
  featured: boolean
  /** ISO 日期 YYYY-MM-DD */
  date: string
  content: string
}

/** 博客文章 */
export interface Post {
  id: string
  slug: string
  title: string
  excerpt: string
  cover?: string
  tags: string[]
  date: string
  readingMinutes?: number
  content: string
}

/** 站点设置 */
export interface SiteSettings {
  siteName: string
  accent: string
  starDensity: 'low' | 'medium' | 'high'
  footerNote: string
  icp?: string
}

/** 聚合站点数据（一次读取，全局消费） */
export interface SiteData {
  profile: Profile
  experiences: Experience[]
  skills: Skill[]
  projects: Project[]
  posts: Post[]
  settings: SiteSettings
}

/** 联系表单提交体 */
export interface ContactMessage {
  name: string
  email: string
  message: string
}
