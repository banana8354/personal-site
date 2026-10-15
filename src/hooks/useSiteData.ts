/**
 * 订阅站点数据：数据变更或跨标签页改动时重新读取。
 * 组件层通过本 Hook 访问数据，永不直接触碰 localStorage（AGENTS.md §2）。
 */
import { useCallback, useSyncExternalStore } from 'react'
import { DATA_CHANGED_EVENT } from '../api/storage'
import { getSiteData } from '../api/siteApi'
import type { SiteData } from '../api/types'

let revision = 0
const listeners = new Set<() => void>()

function emit() {
  revision += 1
  listeners.forEach((fn) => fn())
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)

  const onDataChanged = () => emit()
  // storage 事件只在其他标签页修改时触发，用于多标签同步
  const onStorage = (event: StorageEvent) => {
    if (!event.key || event.key.startsWith('ps.')) emit()
  }

  window.addEventListener(DATA_CHANGED_EVENT, onDataChanged)
  window.addEventListener('storage', onStorage)

  return () => {
    listeners.delete(listener)
    window.removeEventListener(DATA_CHANGED_EVENT, onDataChanged)
    window.removeEventListener('storage', onStorage)
  }
}

function getSnapshot(): number {
  return revision
}

export interface UseSiteDataResult {
  data: SiteData
  /** 手动触发重新读取（一般无需调用，写操作会自动派发事件） */
  refresh: () => void
}

export function useSiteData(): UseSiteDataResult {
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const data = getSiteData()
  const refresh = useCallback(() => emit(), [])
  return { data, refresh }
}
