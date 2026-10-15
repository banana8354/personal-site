import { z } from 'zod'

/**
 * 全部表单校验 schema（zod）—— 一份定义同时驱动校验与类型推导。
 * 长度上限遵循 AGENTS.md §5：标题 80、摘要 200、标签 8 个。
 */

export const contactSchema = z.object({
  name: z.string().trim().min(1, '请填写称呼').max(30, '称呼不超过 30 个字符'),
  email: z.string().trim().min(1, '请填写邮箱').email('邮箱格式不正确'),
  message: z
    .string()
    .trim()
    .min(10, '内容至少 10 个字，方便我理解你的需求')
    .max(600, '内容不超过 600 个字'),
})
export type ContactInput = z.infer<typeof contactSchema>

export const loginSchema = z.object({
  username: z.string().trim().min(1, '请输入账号'),
  password: z.string().min(6, '密码至少 6 位'),
})
export type LoginInput = z.infer<typeof loginSchema>

const slugSchema = z
  .string()
  .trim()
  .min(1, '请填写 slug')
  .regex(/^[a-z0-9\u4e00-\u9fa5-]+$/i, 'slug 只能包含字母、数字、中文与连字符')

const tagsSchema = z
  .array(z.string().trim().min(1))
  .max(8, '标签最多 8 个')
  .default([])

export const postSchema = z.object({
  title: z.string().trim().min(1, '请填写标题').max(80, '标题不超过 80 个字符'),
  slug: slugSchema,
  excerpt: z.string().trim().min(1, '请填写摘要').max(200, '摘要不超过 200 个字符'),
  tags: tagsSchema,
  date: z.string().trim().min(1, '请选择日期'),
  cover: z.string().trim().default(''),
  content: z.string().trim().min(1, '正文不能为空'),
})
export type PostInput = z.infer<typeof postSchema>

export const projectSchema = z.object({
  title: z.string().trim().min(1, '请填写标题').max(80, '标题不超过 80 个字符'),
  slug: slugSchema,
  summary: z.string().trim().min(1, '请填写简介').max(200, '简介不超过 200 个字符'),
  cover: z.string().trim().default(''),
  tags: tagsSchema,
  repoUrl: z.string().trim().url('源码地址格式不正确').or(z.literal('')).default(''),
  demoUrl: z.string().trim().url('在线地址格式不正确').or(z.literal('')).default(''),
  featured: z.boolean().default(false),
  date: z.string().trim().min(1, '请选择日期'),
  content: z.string().trim().min(1, '正文不能为空'),
})
export type ProjectInput = z.infer<typeof projectSchema>

export const skillSchema = z.object({
  name: z.string().trim().min(1, '请填写技能名称').max(30, '名称不超过 30 个字符'),
  category: z.enum(['frontend', 'backend', 'tooling', 'other']),
  level: z.coerce.number().int('熟练度必须是整数').min(0).max(100),
})
export type SkillInput = z.infer<typeof skillSchema>

export const profileSchema = z.object({
  name: z.string().trim().min(1, '请填写姓名').max(30),
  title: z.string().trim().min(1, '请填写职位头衔').max(60),
  tagline: z.string().trim().min(1, '请填写一句话介绍').max(120),
  email: z.string().trim().email('邮箱格式不正确'),
  location: z.string().trim().max(40).default(''),
  avatar: z.string().trim().default(''),
  resumeUrl: z.string().trim().default('#'),
  bio: z.array(z.string().trim().min(1)).min(1, '至少保留一段简介'),
})
export type ProfileInput = z.infer<typeof profileSchema>

export const settingsSchema = z.object({
  siteName: z.string().trim().min(1, '请填写站点名称').max(40),
  accent: z
    .string()
    .trim()
    .regex(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, '请填写合法的十六进制颜色，如 #38bdf8'),
  starDensity: z.enum(['low', 'medium', 'high']),
  footerNote: z.string().trim().max(200).default(''),
  icp: z.string().trim().max(60).default(''),
})
export type SettingsInput = z.infer<typeof settingsSchema>

/** 把 zod 的错误列表转成 { 字段: 文案 } 便于逐字段展示 */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form'
    if (!out[key]) out[key] = issue.message
  }
  return out
}
