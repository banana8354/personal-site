/**
 * 后台读写接口（本期 localStorage 实现）。
 * 所有写操作返回统一结果对象，失败原因可展示给用户。
 */
import type { Experience, Post, Profile, Project, SiteSettings, Skill } from './types'
import { STORAGE_KEYS, read, remove, write } from './storage'
import {
  seedExperiences,
  seedPosts,
  seedProfile,
  seedProjects,
  seedSettings,
  seedSkills,
} from './seed'
import { ensureSeeded } from './siteApi'
import { createToken } from '../lib/auth'

export interface Result<T = void> {
  ok: boolean
  data?: T
  error?: string
}

/** 统一的写入结果封装：失败时给出用户可见的提示（隐私模式等） */
function persist<T>(key: string, value: T): Result<void> {
  return write(key, value)
    ? { ok: true }
    : { ok: false, error: '保存失败：浏览器存储不可用（可能处于隐私模式）' }
}

/* ------------------------------ 登录 ------------------------------ */

export function saveToken(token: string): Result<void> {
  return persist(STORAGE_KEYS.token, token)
}

export function readToken(): string | null {
  return read<string | null>(STORAGE_KEYS.token, null)
}

export function clearToken(): Result<void> {
  return remove(STORAGE_KEYS.token) ? { ok: true } : { ok: false, error: '退出失败' }
}

/** 登录成功后签发 token（前端演示用，非真实安全边界） */
export function issueToken(): string {
  return createToken()
}

/* ---------------------------- 个人信息 ---------------------------- */

export function getProfile(): Profile {
  ensureSeeded()
  return read(STORAGE_KEYS.profile, seedProfile)
}

export function saveProfile(profile: Profile): Result<void> {
  return persist(STORAGE_KEYS.profile, profile)
}

/* ------------------------------ 经历 ------------------------------ */

export function getExperiences(): Experience[] {
  ensureSeeded()
  return read(STORAGE_KEYS.experiences, seedExperiences)
}

export function saveExperiences(items: Experience[]): Result<void> {
  return persist(STORAGE_KEYS.experiences, items)
}

/* ------------------------------ 技能 ------------------------------ */

export function getSkills(): Skill[] {
  ensureSeeded()
  return read(STORAGE_KEYS.skills, seedSkills)
}

export function saveSkills(items: Skill[]): Result<void> {
  return persist(STORAGE_KEYS.skills, items)
}

/* ------------------------------ 项目 ------------------------------ */

export function getProjects(): Project[] {
  ensureSeeded()
  return read(STORAGE_KEYS.projects, seedProjects)
}

export function saveProjects(items: Project[]): Result<void> {
  return persist(STORAGE_KEYS.projects, items)
}

/** 标题转 kebab-case slug，并在集合内去重（-2 / -3 …） */
export function makeSlug(title: string, taken: string[], selfSlug?: string): string {
  const base =
    title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'item'
  const used = new Set(taken.filter((s) => s !== selfSlug))
  if (!used.has(base)) return base
  let n = 2
  while (used.has(`${base}-${n}`)) n += 1
  return `${base}-${n}`
}

export function upsertProject(input: Project): Result<void> {
  const list = getProjects()
  const index = list.findIndex((item) => item.id === input.id)
  const next = index >= 0 ? list.map((item, i) => (i === index ? input : item)) : [input, ...list]
  return saveProjects(next)
}

export function removeProject(id: string): Result<void> {
  return saveProjects(getProjects().filter((item) => item.id !== id))
}

/* ------------------------------ 文章 ------------------------------ */

export function getPosts(): Post[] {
  ensureSeeded()
  return read(STORAGE_KEYS.posts, seedPosts)
}

export function savePosts(items: Post[]): Result<void> {
  return persist(STORAGE_KEYS.posts, items)
}

export function upsertPost(input: Post): Result<void> {
  const list = getPosts()
  const index = list.findIndex((item) => item.id === input.id)
  const next = index >= 0 ? list.map((item, i) => (i === index ? input : item)) : [input, ...list]
  return savePosts(next)
}

export function removePost(id: string): Result<void> {
  return savePosts(getPosts().filter((item) => item.id !== id))
}

/* ---------------------------- 站点设置 ---------------------------- */

export function getSettings(): SiteSettings {
  ensureSeeded()
  return read(STORAGE_KEYS.settings, seedSettings)
}

export function saveSettings(settings: SiteSettings): Result<void> {
  return persist(STORAGE_KEYS.settings, settings)
}

/* ---------------------------- 备份恢复 ---------------------------- */

/** 导出全部内容为 JSON 字符串（PRD 风险对策：防数据丢失） */
export function exportAll(): string {
  return JSON.stringify(
    {
      profile: getProfile(),
      experiences: getExperiences(),
      skills: getSkills(),
      projects: getProjects(),
      posts: getPosts(),
      settings: getSettings(),
    },
    null,
    2,
  )
}

export function importAll(json: string): Result<void> {
  try {
    const data = JSON.parse(json) as Record<string, unknown>
    if (data.profile) saveProfile(data.profile as Profile)
    if (Array.isArray(data.experiences)) saveExperiences(data.experiences as Experience[])
    if (Array.isArray(data.skills)) saveSkills(data.skills as Skill[])
    if (Array.isArray(data.projects)) saveProjects(data.projects as Project[])
    if (Array.isArray(data.posts)) savePosts(data.posts as Post[])
    if (data.settings) saveSettings(data.settings as SiteSettings)
    return { ok: true }
  } catch {
    return { ok: false, error: '导入失败：JSON 格式不正确' }
  }
}

/** 恢复出厂内容 */
export function resetAll(): Result<void> {
  return [saveProfile(seedProfile), saveExperiences(seedExperiences), saveSkills(seedSkills), saveProjects(seedProjects), savePosts(seedPosts), saveSettings(seedSettings)].every(
    (r) => r.ok,
  )
    ? { ok: true }
    : { ok: false, error: '重置失败' }
}
