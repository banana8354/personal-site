# AGENTS.md — AI 代理开发指令（星空个人网站）

> 本文档是给 AI 编码代理（Cursor / Claude Code / DeepSeek Harness 等）的**开发契约**。
> 开始任何编码前，必须按顺序阅读：[PRD.md](./PRD.md) → [TECH_DESIGN.md](./TECH_DESIGN.md) → 本文档。
> 三者冲突时，优先级为：**AGENTS.md（规范） > TECH_DESIGN.md（技术方案） > PRD.md（需求）**，并在 PR 说明中记录冲突点。

---

## 1. 项目概述

| 项 | 内容 |
| --- | --- |
| 项目名 | personal-site（星空个人展示网站） |
| 一句话 | 深色星空风格的个人品牌站：个人介绍 / 技能 / 项目 / 博客 / 后台管理 |
| 形态 | 纯静态 SPA，无服务端运行时 |
| 技术栈 | React 19 + TypeScript + Vite + Tailwind CSS 4 + React Router 7 + Zod + react-markdown |
| 数据来源 | 默认数据（`api/seed.ts`）+ localStorage 覆盖层，统一经 `api/` 层读写 |
| 部署 | 构建产物 `dist/` 托管到 GitHub Pages（兼容 Cloudflare Pages / Vercel） |
| 目标产物 | 可公开访问的线上站点 + 可用的后台内容管理 |

### 1.1 当前范围（v1.0 MVP）

**做**：首页五个区块、项目列表与详情、博客列表与详情、联系表单、`/admin` 七个后台页面、响应式与深色主题、星空背景。

**不做**：真实后端与数据库、多人账号体系、评论、RSS、全文搜索、多语言、图片上传服务。

---

## 2. 目录与分层契约

```
src/
├── api/          # 唯一数据出入口（storage / seed / types / siteApi / adminApi）
├── components/   # 纯展示组件，props 进事件出
├── layouts/      # SiteLayout / AdminLayout
├── pages/        # 前台页面
├── pages/admin/  # 后台页面
├── hooks/        # 复用有状态逻辑
├── lib/          # 纯函数（auth / validate / format）
└── styles/       # Tailwind 入口与主题令牌
```

**硬性规则**

1. `components/` 与 `pages/` **禁止**直接调用 `localStorage`，必须经 `api/` 层。
2. `components/` **禁止**导入 `api/adminApi`；写操作只允许出现在 `pages/admin/` 与 `hooks/`。
3. `api/` **禁止**导入任何 React 内容（react 组件、hooks）。
4. 类型只定义在 `api/types.ts`，其他文件一律 `import type` 复用，**不允许**重复声明同名字段结构。
5. 新页面必须进 `App.tsx` 路由表；后台页面必须包在 `RequireAuth` 内。

---

## 3. 开发规范

### 3.1 TypeScript

- `strict: true` 全量开启；提交前 `npx tsc -b --noEmit` 必须零错误。
- **禁止 `any`**；不确定类型用 `unknown` + 类型收窄，或定义精确接口。
- **禁止 `@ts-ignore`**；确需豁免使用 `@ts-expect-error` 并写明原因注释。
- 导出类型用 `export interface` / `export type`；组件 props 命名 `<组件名>Props`。
- 事件与函数返回值必须显式可推断，不写隐式 `any` 回调。
- 所有外部数据（localStorage、URL 参数）进入业务前必须校验或提供 fallback。

### 3.2 React

- 一律**函数组件 + Hook**，不使用 class 组件。
- 组件文件 `PascalCase.tsx`，每个文件**默认导出一个组件**，辅助子组件同文件内小写命名或单独拆分。
- 副作用集中在 `useEffect`，必须返回清理函数（取消 `rAF`、移除监听、清定时器）。
- 依赖数组必须完整；禁止为"消除告警"而删依赖。
- 列表渲染 `key` 用稳定业务 id（`post.id` / `project.slug`），**禁止用数组下标**。
- 派生状态用计算而非 `useState` 双写；跨页面共享数据走 `useSiteData()`。
- 受控表单：所有输入 `value + onChange` 受控，禁止非受控混用。

### 3.3 样式

- 只用 Tailwind 原子类；**禁止**新增 `.css` 文件（`styles/index.css` 为唯一入口）。
- **禁止**内联 `style={{}}` 写静态颜色/间距；只有动态值（如技能条宽度百分比、强调色变量）允许内联。
- 颜色/圆角/间距必须走 `@theme` 令牌：`bg-surface`、`text-muted`、`border-line`、`rounded-card`，禁止硬编码 `#111827` 之类色值。
- 强调色统一用 `var(--accent)` / `text-accent`，保证后台改主色全局生效。
- 类名排序遵循「布局 → 盒模型 → 排版 → 视觉 → 状态」，长类名串可用 `clsx` 风格拼接常量。
- 响应式按 `< 640` / `640–1024` / `> 1024` 三档写，内容区统一 `max-w-[1200px] mx-auto`。

### 3.4 命名

| 对象 | 规范 | 示例 |
| --- | --- | --- |
| 组件 / 类型 | PascalCase | `ProjectCard`、`SiteData` |
| 函数 / 变量 | camelCase | `readStorage`、`readingMinutes` |
| 常量 | UPPER_SNAKE_CASE | `STORAGE_KEYS`、`MAX_PARTICLES` |
| 文件名（组件） | PascalCase.tsx | `StarField.tsx` |
| 文件名（非组件） | camelCase.ts | `siteApi.ts` |
| 路由路径 | kebab-case | `/admin/posts`、`/blog/hello-world` |
| 存储键 | `ps.` 前缀 + 小写 | `ps.posts` |

### 3.5 Git 提交

- 采用 Conventional Commits：`feat:` / `fix:` / `docs:` / `style:` / `refactor:` / `chore:` / `test:`。
- 一个提交只做一件事；**禁止**把格式化与功能修改混在同一提交。
- 提交信息用中文描述具体改动，例：`feat: 新增星空背景 Canvas 粒子与减弱动效降级`。
- 每完成一个可运行的功能点就提交一次，保证任何时刻可回退。

---

## 4. 数据层规范

1. 所有键集中定义：

```ts
export const STORAGE_KEYS = {
  profile: 'ps.profile',
  experiences: 'ps.experiences',
  skills: 'ps.skills',
  projects: 'ps.projects',
  posts: 'ps.posts',
  settings: 'ps.settings',
  token: 'ps.token',
  version: 'ps.version',
} as const;
```

2. 读：`read<T>(key, fallback)` 内部 `try/catch` + `JSON.parse` 失败回落 fallback，**绝不抛出**。
3. 写：`write<T>(key, value)` 成功后就地派发 `ps:data-changed` 事件；写入失败（如隐私模式）返回 `false` 并提示，不静默吞掉。
4. `siteApi` 只读（`getSiteData` / `getPost` / `getProject`）；`adminApi` 负责登录与 CRUD。
5. 删除操作必须先过二次确认再调用 API。
6. slug 生成规则：标题转 kebab-case + 去重后缀（`-2`、`-3`），保证唯一。
7. 新增字段必须同步更新：`types.ts`、`seed.ts`、读写函数、后台表单，四处缺一不可。
8. 破坏性结构变更必须提升 `ps.version` 并写迁移逻辑。

---

## 5. 安全规范

- **禁止**把明文密码写进代码或 localStorage；登录口令以哈希常量比对，localStorage 只存 token。
- 注释中**必须**标明：前端校验仅为演示，非真实安全边界。
- **禁止** `dangerouslySetInnerHTML`；Markdown 渲染不得开启 `rehype-raw`。
- 所有外链加 `target="_blank" rel="noopener noreferrer"`。
- 所有用户输入在写入前经 Zod 校验；长度上限：标题 80、摘要 200、标签 8 个。
- 禁止引入任何第三方统计/追踪脚本。

---

## 6. 测试与自查要求

提交前**必须**全部通过：

| 检查项 | 命令 / 方法 | 通过标准 |
| --- | --- | --- |
| 类型检查 | `npx tsc -b --noEmit` | 0 error |
| 生产构建 | `npm run build` | 成功且无警告 |
| 本地预览 | `npm run preview` | 首页、项目详情、文章详情可直接访问且刷新不 404 |
| 响应式 | DevTools 375 / 834 / 1440 | 无横向滚动，无元素溢出 |
| 后台链路 | 登录 → 新建文章 → 前台刷新可见 → 删除需二次确认 | 全通过 |
| 无障碍 | 键盘 Tab 走完全站；Lighthouse Accessibility | 焦点可见，评分 ≥ 90 |
| 性能 | Lighthouse Performance（移动） | ≥ 90 |
| 减弱动效 | 系统开启"减少动态效果" | 星空静止且不报错 |

**禁止**在未执行上述检查的情况下声称"已完成/已修复"。

---

## 7. 变更流程（对 AI 代理的强制要求）

1. 动手前先读 `PRD.md` 对应需求编号（FR-xx）与 `TECH_DESIGN.md` 对应章节，确认改动落在既有设计内。
2. 一次只做一个功能点，改完立即自查（第 6 节），通过后再提交。
3. 若需求无法在不破坏既有设计的前提下实现，**先说明冲突与方案**，得到确认后再改文档、再改代码。
4. 修改面涉及 3 个以上文件或改变数据模型时，必须同步更新文档并在回复中列出变更清单。
5. 不擅自引入新依赖；确需引入时说明体积、维护状态与替代方案，并优先选择轻量库。
6. 不删除或注释掉他人的既有功能来"让构建通过"。
7. 不使用破坏性命令（`git reset --hard`、`rm -rf`、强推）清理现场；不修改 `.git` 历史。

---

## 8. 常用命令

```bash
npm install                 # 安装依赖
npm run dev                 # 本地开发 http://localhost:5173
npm run build               # 类型检查 + 生产构建 → dist/
npm run preview             # 预览生产产物 http://localhost:4173
npx tsc -b --noEmit         # 仅类型检查
```

---

## 9. 注意事项（易错清单）

- GitHub Pages 项目站部署在子路径，必须注入 `VITE_BASE=/<repo>/`，否则静态资源全 404。
- 采用 `HashRouter`，以保证三个托管平台刷新子路由都不 404；切换 `BrowserRouter` 需同时补 `404.html` / `_redirects`。
- 星空 Canvas 必须设 `pointer-events: none` 与 `z-index: -1`，不能挡住任何按钮点击。
- `prefers-reduced-motion` 与移动端粒子数降级**不可省略**，否则低端机会掉帧。
- 强调色改动只改 `--accent` 变量，不要逐处替换色值。
- 日期统一存 ISO 字符串（`YYYY-MM-DD`），展示层用 `lib/format.ts` 格式化。
- 阅读时长由正文字数估算（中文约 350 字/分钟），不手工填写。
- localStorage 在隐私模式下可能不可写，写入失败要有用户可见的降级提示。
