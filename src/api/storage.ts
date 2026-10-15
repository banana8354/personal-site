/**
 * localStorage 读写封装 —— 全站唯一的存储出入口。
 * 规则（AGENTS.md §4）：读失败绝不抛出，写失败返回 false 由调用方提示。
 */

export const STORAGE_KEYS = {
  profile: 'ps.profile',
  experiences: 'ps.experiences',
  skills: 'ps.skills',
  projects: 'ps.projects',
  posts: 'ps.posts',
  settings: 'ps.settings',
  token: 'ps.token',
  version: 'ps.version',
} as const

/** 数据结构版本号：破坏性变更时提升并写迁移逻辑 */
export const SCHEMA_VERSION = '1.0.0'

/** 数据变更事件名：写入后派发，useSiteData 订阅刷新 */
export const DATA_CHANGED_EVENT = 'ps:data-changed'

/** storage 是否可用（隐私模式下可能被禁用） */
export function isStorageAvailable(): boolean {
  try {
    const probe = '__ps_probe__'
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}

/** 读取并解析；不存在 / 解析失败 / 存储不可用时回落 fallback */
export function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

/** 写入并派发变更事件；失败返回 false */
export function write<T>(key: string, value: T): boolean {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    window.dispatchEvent(new CustomEvent(DATA_CHANGED_EVENT))
    return true
  } catch {
    return false
  }
}

/** 删除键并派发变更事件 */
export function remove(key: string): boolean {
  try {
    window.localStorage.removeItem(key)
    window.dispatchEvent(new CustomEvent(DATA_CHANGED_EVENT))
    return true
  } catch {
    return false
  }
}

/** 当前存储版本，用于将来迁移 */
export function readSchemaVersion(): string {
  return read<string>(STORAGE_KEYS.version, '0')
}

export function writeSchemaVersion(): void {
  write(STORAGE_KEYS.version, SCHEMA_VERSION)
}
