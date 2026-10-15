/**
 * 后台登录校验（前端演示实现）。
 *
 * ⚠️ 安全声明：前端校验只用于演示与防误触，**不能作为真实安全边界**。
 * 站点本期的数据全部存放于访问者自己的浏览器（localStorage），不涉及服务端资源；
 * 接入真实后端后，必须改为服务端签发 JWT 并做权限校验。
 *
 * 约束（AGENTS.md §5）：口令不以明文出现在代码与 localStorage 中。
 */

const DEMO_USER = 'admin'

/** 口令 "admin123" 的 SHA-256（十六进制）。仅用于演示，请在上线前替换。 */
const DEMO_PASSWORD_SHA256 =
  '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'

const TOKEN_TTL_MS = 1000 * 60 * 60 * 8 // 8 小时

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** 校验账号口令 */
export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  if (username.trim().toLowerCase() !== DEMO_USER) return false
  const hashed = await sha256Hex(password)
  return hashed === DEMO_PASSWORD_SHA256
}

/** 登录态 token 结构 */
export interface SessionToken {
  value: string
  username: string
  /** 过期时间戳（毫秒） */
  expiresAt: number
}

/** 签发随机 token（不包含任何口令信息） */
export function createToken(username = DEMO_USER): string {
  const random = crypto.getRandomValues(new Uint8Array(16))
  const payload: SessionToken = {
    value: [...random].map((b) => b.toString(16).padStart(2, '0')).join(''),
    username,
    expiresAt: Date.now() + TOKEN_TTL_MS,
  }
  return JSON.stringify(payload)
}

/** token 是否有效（结构合法且未过期） */
export function isTokenValid(raw: string | null): boolean {
  if (!raw) return false
  try {
    const parsed = JSON.parse(raw) as Partial<SessionToken>
    return (
      typeof parsed.value === 'string' &&
      parsed.value.length > 0 &&
      typeof parsed.expiresAt === 'number' &&
      parsed.expiresAt > Date.now()
    )
  } catch {
    return false
  }
}

/** 读取 token 中的用户名（用于顶栏展示） */
export function tokenUsername(raw: string | null): string {
  if (!raw) return DEMO_USER
  try {
    const parsed = JSON.parse(raw) as Partial<SessionToken>
    return parsed.username ?? DEMO_USER
  } catch {
    return DEMO_USER
  }
}
