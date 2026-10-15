# TECH_DESIGN.md — 星空个人网站技术设计

> 配套文档：[PRD.md](./PRD.md)（需求）、[AGENTS.md](./AGENTS.md)（开发规范）
> 文档版本：v1.0 ｜ 更新日期：2026-10-15

---

## 1. 技术栈选择

### 1.1 总览

| 层次 | 选型 | 版本 | 选择理由 |
| --- | --- | --- | --- |
| 前端框架 | React | 19.x | 组件化、生态成熟、社区资料多 |
| 语言 | TypeScript | 5.x / 6.x | 类型安全，重构与协作成本低 |
| 构建工具 | Vite | 8.x / 7.x | 冷启动快、HMR 秒级、产物精简 |
| 样式方案 | Tailwind CSS | 4.x | 原子类 + 设计令牌统一管理深色主题 |
| 路由 | React Router | 7.x | 嵌套路由 + 路由守卫实现成本低 |
| 内容渲染 | react-markdown + remark-gfm + rehype-highlight | — | 纯前端 Markdown 渲染，支持 GFM 表格与代码高亮 |
| 表单校验 | Zod | 4.x | 一份 schema 同时驱动校验与类型推导 |
| 图标 | 内联 SVG 组件 | — | 免依赖、可随主题变色、体积可控 |
| 状态管理 | React Context + 自定义 Hook | — | 站点数据规模小，无需引入 Redux/Zustand |
| 持久化 | localStorage（经统一 API 层） | — | 本期无后端；API 层隔离，便于后续替换 |
| 构建产物托管 | GitHub Pages / Cloudflare Pages / Vercel | — | 纯静态，全球 CDN，免费 |
| 包管理 | npm | 11.x | 环境自带，零额外安装成本 |

### 1.2 明确不选用的技术及原因

| 技术 | 不选原因 |
| --- | --- |
| Next.js / SSR | 本站无 SEO 之外的动态需求，SSR 带来部署复杂度，收益不匹配 |
| 重型 UI 库（Ant Design / MUI） | 与"简洁现代 + 深色定制"目标冲突，且体积远超需求 |
| Redux / Zustand | 全局状态只有"站点数据 + 登录态"两块，Context 足够 |
| 数据库 | 本期为静态展示站，站长单人维护，localStorage + JSON 导出已满足 |
| 真实后端服务 | 无账号体系与多人协作需求，引入后端只增加成本与攻击面 |

### 1.3 后端与数据库策略（分阶段）

| 阶段 | 数据来源 | 说明 |
| --- | --- | --- |
| 本期（v1.0） | 默认数据常量 + localStorage 覆盖层 | 前台读取优先取 localStorage，没有则回落默认数据 |
| v1.2 预留 | Serverless Functions + Postgres / SQLite | 仅需替换 `src/api/*` 的实现，组件层零改动 |

> 设计要点：**所有读写都经过 `src/api/` 统一接口层**，组件永不直接触碰 `localStorage`。

---

## 2. 项目结构

```
personal-site/
├── public/                     # 静态资源（favicon、简历 PDF 等）
├── src/
│   ├── main.tsx                # 应用入口，挂载路由
│   ├── App.tsx                 # 路由表 + 全局 Provider
│   │
│   ├── api/                    # ★ 统一数据层（本期 localStorage 实现）
│   │   ├── storage.ts          #   localStorage 读写 + JSON 安全解析
│   │   ├── seed.ts             #   默认内容（首次访问时作为初值）
│   │   ├── types.ts            #   Post / Project / Skill / Profile / Settings
│   │   ├── siteApi.ts          #   前台只读接口
│   │   └── adminApi.ts         #   后台读写接口（含登录态与 CRUD）
│   │
│   ├── components/             # 通用展示组件
│   │   ├── StarField.tsx       #   Canvas 星空背景
│   │   ├── Navbar.tsx          #   吸顶毛玻璃导航 + 汉堡菜单
│   │   ├── Footer.tsx
│   │   ├── SectionTitle.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── PostCard.tsx
│   │   ├── SkillBar.tsx
│   │   ├── Markdown.tsx        #   Markdown 渲染 + 代码高亮封装
│   │   ├── Tag.tsx
│   │   └── Icons.tsx           #   内联 SVG 图标集
│   │
│   ├── layouts/
│   │   ├── SiteLayout.tsx      #   前台布局（导航 + 内容 + 页脚）
│   │   └── AdminLayout.tsx     #   后台布局（侧边栏 + 顶栏）
│   │
│   ├── pages/                  # 前台页面
│   │   ├── Home.tsx
│   │   ├── Projects.tsx
│   │   ├── ProjectDetail.tsx
│   │   ├── Blog.tsx
│   │   ├── PostDetail.tsx
│   │   └── NotFound.tsx
│   │
│   ├── pages/admin/            # 后台页面
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── ProfileAdmin.tsx
│   │   ├── SkillsAdmin.tsx
│   │   ├── ProjectsAdmin.tsx
│   │   ├── PostsAdmin.tsx
│   │   └── SettingsAdmin.tsx
│   │
│   ├── hooks/
│   │   ├── useSiteData.ts      #   读取站点数据并订阅变更
│   │   ├── useAuth.ts          #   登录态
│   │   └── useReveal.ts        #   进入视口触发动画
│   │
│   ├── lib/
│   │   ├── auth.ts             #   token 生成/校验
│   │   ├── validate.ts         #   Zod schema（联系表单 / 后台表单）
│   │   └── format.ts           #   日期、阅读时长等格式化
│   │
│   ├── styles/index.css        # Tailwind 入口 + 主题令牌 + 全局样式
│   └── vite-env.d.ts
│
├── index.html
├── vite.config.ts              # React 插件 + Tailwind 插件 + base 路径
├── tsconfig*.json
├── package.json
├── PRD.md                      # ← 需求文档
├── TECH_DESIGN.md              # ← 本文档
├── AGENTS.md                   # ← 开发规范
└── .github/workflows/deploy.yml# GitHub Pages 自动部署
```

### 2.1 分层约定

| 层 | 职责 | 禁止 |
| --- | --- | --- |
| `pages/` | 页面编排、路由参数解析 | 直接写业务数据读写、直接操作 localStorage |
| `components/` | 纯展示 + 受控交互，props 进事件出 | 直接读全局数据、写业务逻辑 |
| `api/` | 唯一数据出入口、类型定义 | 依赖任何 React 组件 |
| `hooks/` | 复用有状态逻辑，桥接 api 与组件 | 含 JSX 渲染逻辑 |
| `lib/` | 纯函数工具 | 产生副作用 |

---

## 3. 数据模型

所有类型集中定义于 `src/api/types.ts`。

```ts
/** 个人信息 */
export interface Profile {
  name: string;            // 姓名
  title: string;           // 职位头衔
  tagline: string;         // 一句话介绍（Hero 副标题）
  avatar: string;          // 头像地址
  bio: string[];           // 简介段落（多段）
  email: string;
  location: string;
  resumeUrl: string;       // 简历下载地址
  socials: SocialLink[];
}

export interface SocialLink {
  label: string;           // 展示名，如 GitHub
  url: string;
  icon: 'github' | 'mail' | 'link' | 'wechat';
}

/** 经历时间线 */
export interface Experience {
  id: string;
  period: string;          // 如 2023.07 – 至今
  org: string;             // 公司 / 学校
  role: string;            // 角色 / 专业
  description: string;
  kind: 'work' | 'education';
}

/** 技能 */
export interface Skill {
  id: string;
  name: string;
  category: 'frontend' | 'backend' | 'tooling' | 'other';
  level: number;           // 0–100
  icon?: string;
}

/** 项目 */
export interface Project {
  id: string;
  slug: string;            // URL 标识，唯一
  title: string;
  summary: string;         // 卡片摘要
  cover: string;           // 封面图
  tags: string[];
  repoUrl?: string;
  demoUrl?: string;
  featured: boolean;       // 是否精选（置顶）
  date: string;            // ISO 日期
  content: string;         // Markdown 正文
}

/** 博客文章 */
export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover?: string;
  tags: string[];
  date: string;            // ISO 日期
  readingMinutes?: number; // 缺省时由正文字数估算
  content: string;         // Markdown 正文
}

/** 站点设置 */
export interface SiteSettings {
  siteName: string;
  accent: string;          // 强调色，如 #38BDF8
  starDensity: 'low' | 'medium' | 'high';
  footerNote: string;
  icp?: string;
}

/** 聚合后的站点数据（一次读取，全局消费） */
export interface SiteData {
  profile: Profile;
  experiences: Experience[];
  skills: Skill[];
  projects: Project[];
  posts: Post[];
  settings: SiteSettings;
}
```

### 3.1 存储键设计

| key | 内容 | 说明 |
| --- | --- | --- |
| `ps.profile` | `Profile` | JSON |
| `ps.experiences` | `Experience[]` | JSON |
| `ps.skills` | `Skill[]` | JSON |
| `ps.projects` | `Project[]` | JSON |
| `ps.posts` | `Post[]` | JSON |
| `ps.settings` | `SiteSettings` | JSON |
| `ps.token` | `string` | 后台登录 token（**不放密码明文**） |
| `ps.version` | `string` | 数据结构版本，用于将来迁移 |

### 3.2 数据流

```
默认数据 seed.ts ──┐
                  ├─→ storage.read(key) ─→ api（siteApi / adminApi） ─→ hooks ─→ 组件
用户后台编辑 ──────┘                                   ↑
                                           write() 后派发事件通知订阅者刷新
```

- 读取：`storage.read(key, fallback)` 解析失败或不存在时回落 `seed`。
- 写入：`storage.write(key, value)` 后触发 `window.dispatchEvent(new CustomEvent('ps:data-changed'))`。
- 订阅：`useSiteData()` 监听该事件并重新读取，实现"后台保存 → 前台即时生效"。

---

## 4. 关键技术点

### 4.1 星空背景（Canvas 粒子）

| 项 | 方案 |
| --- | --- |
| 渲染 | `requestAnimationFrame` 单循环，`clearRect` 后重绘全部粒子 |
| 粒子模型 | `{x, y, r, vx, vy, alpha, phase}`，半径 0.4–1.6px，透明度呼吸 |
| 视差 | 监听 `pointermove`，按 `(x - cx) * 0.012` 做整体偏移，用插值平滑 |
| 性能 | 粒子数按视口宽度分级（<640px 用 60，桌面 140）；`dpr` 上限 2 |
| 自适应 | `ResizeObserver` 重建粒子分布，避免拉伸 |
| 无障碍 | `prefers-reduced-motion: reduce` 时只绘制一帧静态星空 |
| 内存 | 组件卸载取消 `rAF`、移除全部监听 |

### 4.2 SPA 在静态托管上的刷新 404

静态托管只识别真实文件，直接访问 `/blog/xxx` 会 404。方案：

1. **GitHub Pages**：使用 `HashRouter`（地址形如 `/#/blog/xxx`），零配置、零 404；或使用 `BrowserRouter` + 复制 `index.html` 为 `404.html` 的回退方案。
2. **Cloudflare Pages / Vercel**：使用 `BrowserRouter`，配合 `public/_redirects`（`/* /index.html 200`）或 `vercel.json` 的 rewrites。

> 本期采用 **HashRouter**：单仓库同时适配三个平台，避免平台差异带来的偶发 404。

### 4.3 Vite `base` 路径

GitHub Pages 项目站的访问路径是 `https://<user>.github.io/<repo>/`，资源必须带前缀。
方案：`vite.config.ts` 中 `base: process.env.VITE_BASE ?? '/'`，部署工作流里注入 `VITE_BASE=/<repo>/`。

### 4.4 路由守卫

```tsx
<Route element={<RequireAuth />}>
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<Dashboard />} />
    ...
  </Route>
</Route>
```

`RequireAuth` 读取 `ps.token`；无 token 时 `<Navigate to="/admin/login" replace state={{ from: location }} />`。
登录成功后回跳 `state.from`，保证"点进后台 → 登录 → 回到原来想去的页面"。

### 4.5 登录态与安全边界

- 前端演示版口令以哈希形式常量内置于 `lib/auth.ts`，登录成功签发随机 token 存 `localStorage`。
- **明确声明**：前端校验只用于演示与防误触，不能作为真实安全边界；接入后端后必须改为服务端签发 JWT。
- 所有删除操作走 `ConfirmDialog` 二次确认。

### 4.6 Markdown 渲染与安全

- `react-markdown` 默认不启用 `rehype-raw`，天然不解析原始 HTML，规避 XSS。
- GFM 支持表格、任务列表、删除线（`remark-gfm`）。
- 代码高亮用 `rehype-highlight` + `highlight.js` 主题样式，样式随深色主题定制。
- 代码块向右横向滚动，不撑破布局。

### 4.7 首屏性能

| 手段 | 效果 |
| --- | --- |
| 路由级 `React.lazy` + `Suspense` | 首页不加载后台与详情页代码 |
| Tailwind 内容扫描 | 只产出实际用到的原子类 |
| 头像与封面 `loading="lazy"` + 固定宽高比 | 避免 CLS |
| 字体使用系统栈 | 零字体网络请求 |
| 生产构建开启压缩与哈希文件名 | 长缓存 |

### 4.8 深浅色与设计令牌

- Tailwind v4 在 `src/styles/index.css` 用 `@theme` 声明颜色、圆角、间距令牌。
- 组件只使用令牌类名（如 `bg-surface`、`text-muted`、`rounded-card`），不写死色值。
- 强调色由 `settings.accent` 注入 CSS 变量 `--accent`，实现"后台一键换主色"。

### 4.9 无障碍

- 页面顶部提供"跳到主内容"链接。
- 全部交互元素可 Tab 到达，`:focus-visible` 有 2px 强调色外环。
- 图标按钮带 `aria-label`；装饰性 Canvas 带 `aria-hidden="true"`。
- 动效遵循 `prefers-reduced-motion`。

---

## 5. 构建与部署

### 5.1 本地命令

| 命令 | 作用 |
| --- | --- |
| `npm install` | 安装依赖 |
| `npm run dev` | 本地开发（默认 http://localhost:5173） |
| `npm run build` | 类型检查 + 生产构建，产物在 `dist/` |
| `npm run preview` | 本地预览生产产物 |

### 5.2 部署架构

```
GitHub 仓库（main）
   │  push 触发
   ▼
GitHub Actions: npm ci → npm run build（注入 VITE_BASE）→ upload-pages-artifact
   │
   ▼
GitHub Pages CDN  ──→  https://<user>.github.io/<repo>/
```

### 5.3 其他平台（同一份产物）

| 平台 | 配置 |
| --- | --- |
| Cloudflare Pages | Build command `npm run build`，Output `dist`，框架预设 Vite |
| Vercel | Framework Preset: Vite，Build `npm run build`，Output `dist` |
| Netlify | Build `npm run build`，Publish `dist` |

### 5.4 环境变量

| 变量 | 用途 | 示例 |
| --- | --- | --- |
| `VITE_BASE` | 子路径部署前缀 | `/personal-site/` |

---

## 6. 测试策略

| 层次 | 手段 | 覆盖 |
| --- | --- | --- |
| 类型 | `tsc -b --noEmit` | 全量类型正确性 |
| 构建 | `npm run build` 必须零错误零警告 | 产物可生成 |
| 手工 | 响应式三断点 + 键盘导航 + 表单异常流 | 关键路径 |
| 数据 | 后台增删改后前台即时生效、刷新后持久 | API 层 |
| 部署 | 线上地址直接访问子路由、刷新不 404 | 路由与 base |
