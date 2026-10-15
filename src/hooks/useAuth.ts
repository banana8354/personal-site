/**
 * 登录态：读取 token 并校验有效性，提供登录 / 退出方法。
 * token 只存于 localStorage（不存口令明文，见 lib/auth.ts 安全声明）。
 */
import { useCallback, useSyncExternalStore } from 'react'
import { clearToken, readToken, saveToken } from '../api/adminApi'
import { DATA_CHANGED_EVENT } from '../api/storage'
import { createToken, isTokenValid, tokenUsername, verifyCredentials } from '../lib/auth'

let revision = 0
const listeners = new Set<() => void>()

function emit() {
  revision += 1
  listeners.forEach((fn) => fn())
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  const onChanged = () => emit()
  window.addEventListener(DATA_CHANGED_EVENT, onChanged)
  return () => {
    listeners.delete(listener)
    window.removeEventListener(DATA_CHANGED_EVENT, onChanged)
  }
}

function getSnapshot(): number {
  return revision
}

export interface LoginResult {
  ok: boolean
  error?: string
}

export interface UseAuthResult {
  authenticated: boolean
  username: string
  login: (username: string, password: string) => Promise<LoginResult>
  logout: () => void
}

export function useAuth(): UseAuthResult {
  useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const raw = readToken()
  const authenticated = isTokenValid(raw)

  const login = useCallback(async (username: string, password: string): Promise<LoginResult> => {
    const passed = await verifyCredentials(username, password)
    if (!passed) return { ok: false, error: '账号或密码不正确' }
    const result = saveToken(createToken(username))
    if (!result.ok) return { ok: false, error: result.error }
    return { ok: true }
  }, [])

  const logout = useCallback(() => {
    clearToken()
  }, [])

  return {
    authenticated,
    username: tokenUsername(raw),
    login,
    logout,
  }
}
