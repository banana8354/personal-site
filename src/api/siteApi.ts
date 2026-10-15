import type { Post, Project, SiteData } from './types'
import {
  STORAGE_KEYS,
  read,
  write,
  writeSchemaVersion,
  readSchemaVersion,
  SCHEMA_VERSION,
} from './storage'
import {
  seedExperiences,
  seedPosts,
  seedProfile,
  seedProjects,
  seedSettings,
  seedSkills,
} from './seed'

/**
 * 前台只读数据接口。
 * 首次调用会把默认内容写入 localStorage 作为初值；之后以 localStorage 为准。
 * 将来切换真实后端时，只需替换本文件与 adminApi 的实现，组件层零改动。
 */

let seeded = false

/** 首次访问时把默认内容落地，保证后台能拿到可编辑的完整数据 */
export function ensureSeeded(): void {
  if (seeded) return
  seeded = true
  if (readSchemaVersion() === SCHEMA_VERSION) return

  write(STORAGE_KEYS.profile, seedProfile)
  write(STORAGE_KEYS.experiences, seedExperiences)
  write(STORAGE_KEYS.skills, seedSkills)
  write(STORAGE_KEYS.projects, seedProjects)
  write(STORAGE_KEYS.posts, seedPosts)
  write(STORAGE_KEYS.settings, seedSettings)
  writeSchemaVersion()
}

export function getProfile() {
  ensureSeeded()
  return read(STORAGE_KEYS.profile, seedProfile)
}

export function getExperiences() {
  ensureSeeded()
  return read(STORAGE_KEYS.experiences, seedExperiences)
}

export function getSkills() {
  ensureSeeded()
  return read(STORAGE_KEYS.skills, seedSkills)
}

export function getProjects(): Project[] {
  ensureSeeded()
  return read(STORAGE_KEYS.projects, seedProjects)
}

export function getPosts(): Post[] {
  ensureSeeded()
  return read(STORAGE_KEYS.posts, seedPosts)
}

export function getSettings() {
  ensureSeeded()
  return read(STORAGE_KEYS.settings, seedSettings)
}

/** 按日期倒序（新的在前） */
function byDateDesc<T extends { date: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
}

/** 首页需要的聚合数据；精选项目置顶，其余按日期倒序 */
export function getSiteData(): SiteData {
  return {
    profile: getProfile(),
    experiences: getExperiences(),
    skills: getSkills(),
    projects: byDateDesc(getProjects()).sort(
      (a, b) => Number(b.featured) - Number(a.featured),
    ),
    posts: byDateDesc(getPosts()),
    settings: getSettings(),
  }
}

export function getProject(slug: string): Project | undefined {
  return getProjects().find((item) => item.slug === slug)
}

export function getPost(slug: string): Post | undefined {
  return getPosts().find((item) => item.slug === slug)
}

/** 上一篇 / 下一篇（按日期倒序后的相邻项） */
export function getAdjacentPosts(slug: string): { prev?: Post; next?: Post } {
  const list = byDateDesc(getPosts())
  const index = list.findIndex((item) => item.slug === slug)
  if (index < 0) return {}
  return { prev: list[index - 1], next: list[index + 1] }
}

/** 全站标签聚合（项目 + 文章） */
export function getAllTags(): string[] {
  const tags = new Set<string>()
  getProjects().forEach((p) => p.tags.forEach((t) => tags.add(t)))
  getPosts().forEach((p) => p.tags.forEach((t) => tags.add(t)))
  return [...tags].sort()
}
