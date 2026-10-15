/**
 * 默认站点内容 —— 首次访问时写入 localStorage 作为初值。
 * 后台修改后以 localStorage 为准；清空浏览器数据会回落到这里。
 */
import type { Experience, Post, Profile, Project, SiteSettings, Skill } from './types'

/* ------------------------------------------------------------------
 * 内置插画：全部用 data-URI SVG 生成，不依赖任何外部图片与网络请求，
 * 既能离线展示，也保证线上加载零抖动（TECH_DESIGN §4.7 首屏性能）。
 * ------------------------------------------------------------------ */

interface GradientSpec {
  from: string
  to: string
}

interface ArtworkOptions {
  width?: number
  height?: number
  label?: string
  sub?: string
  radius?: number
}

/** 生成渐变插画（封面 / 头像），字符经 encodeURIComponent 处理，中文安全 */
export function artwork(gradient: GradientSpec, options: ArtworkOptions = {}): string {
  const { width = 640, height = 400, label = '', sub = '', radius = 0 } = options
  const cx = width / 2
  const labelSize = Math.round(Math.min(width, height) * (sub ? 0.2 : 0.26))
  const subSize = Math.round(labelSize * 0.42)
  const circles = sub
    ? `<circle cx="${width * 0.84}" cy="${height * 0.2}" r="${height * 0.16}" fill="#fff" opacity="0.07"/>
       <circle cx="${width * 0.16}" cy="${height * 0.82}" r="${height * 0.1}" fill="#fff" opacity="0.05"/>`
    : ''
  const text = sub
    ? `<text x="${cx}" y="${height / 2 - labelSize * 0.15}" fill="#f8fafc" font-size="${labelSize}"
             font-family="'PingFang SC','Microsoft YaHei',sans-serif" font-weight="700"
             text-anchor="middle" dominant-baseline="middle">${label}</text>
       <text x="${cx}" y="${height / 2 + labelSize * 0.68}" fill="#e2e8f0" opacity="0.8"
             font-size="${subSize}" font-family="ui-sans-serif,sans-serif" letter-spacing="2"
             text-anchor="middle" dominant-baseline="middle">${sub}</text>`
    : `<text x="${cx}" y="${height / 2}" fill="#f8fafc" font-size="${labelSize}"
             font-family="'PingFang SC','Microsoft YaHei',sans-serif" font-weight="700"
             text-anchor="middle" dominant-baseline="middle">${label}</text>`

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${gradient.from}"/>
      <stop offset="1" stop-color="${gradient.to}"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" rx="${radius}" fill="url(#g)"/>
  ${circles}
  ${text}
</svg>`

  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

/** 默认强调色，与 styles/index.css 的 --accent 保持一致 */
export const DEFAULT_ACCENT = '#38bdf8'

export const seedSettings: SiteSettings = {
  siteName: '星空个人网站',
  accent: DEFAULT_ACCENT,
  starDensity: 'high',
  footerNote: '本站为个人学习与作品展示用途，内容原创，转载请注明出处。',
}

export const seedProfile: Profile = {
  name: '韩雄霖',
  title: '计算机科学与技术 · 大四学生 / 前端与全栈开发方向',
  tagline: '把课堂上学到的原理，做成能跑起来、能给别人用的产品。',
  avatar: artwork(
    { from: '#0ea5e9', to: '#7c3aed' },
    { width: 320, height: 320, label: '韩', radius: 160 },
  ),
  bio: [
    '你好，我是韩雄霖，大连海事大学计算机科学与技术专业 2 班的大四学生，目前在前端与全栈开发方向做项目实践，正在准备 2026 届校园招聘。',
    '我的学习路径是「先跑通、再打磨」：用一个完整的小项目把知识点串起来，然后回头补工程化、性能与可维护性。React + TypeScript 是我最熟悉的技术栈，也写过 Node.js 服务端与 Chrome 扩展。',
    '除此之外我会把踩过的坑整理成技术文章，做项目时习惯用 Git 管理每一次改动，也喜欢把重复劳动交给脚本，让流程本身更可靠。',
  ],
  email: '3081663228@qq.com',
  location: '辽宁 · 大连',
  resumeUrl: '#',
  socials: [
    { label: 'GitHub', url: 'https://github.com/banana8354', icon: 'github' },
    { label: 'Email', url: 'mailto:3081663228@qq.com', icon: 'mail' },
    { label: '掘金', url: 'https://juejin.cn', icon: 'link' },
  ],
}

export const seedExperiences: Experience[] = [
  {
    id: 'exp-1',
    period: '2022.09 – 2026.06',
    org: '大连海事大学 · 计算机科学与技术专业 2 班',
    role: '本科在读（大四）',
    description:
      '系统学习数据结构、算法、计算机网络、数据库、操作系统与软件工程；GPA 位于专业前列，多次参与校级科技竞赛与课程项目开发。',
    kind: 'education',
  },
  {
    id: 'exp-2',
    period: '2026.03 – 至今',
    org: '课程项目与个人项目实践',
    role: '前端 / 全栈开发',
    description:
      '独立完成「图提取 ImageGrab」浏览器扩展与「星空个人网站」，负责需求文档、技术方案、编码实现与部署上线全流程，技术栈为 React + TypeScript + Vite。',
    kind: 'work',
  },
  {
    id: 'exp-3',
    period: '2026.07 – 2026.09',
    org: '暑期项目实训（Web 前端方向）',
    role: '前端开发实习生',
    description:
      '参与企业官网与管理后台的页面开发，负责响应式适配、组件拆分与接口联调，实习期间完成 10+ 个功能页面。',
    kind: 'work',
  },
]

export const seedSkills: Skill[] = [
  { id: 'sk-1', name: 'React', category: 'frontend', level: 92 },
  { id: 'sk-2', name: 'TypeScript', category: 'frontend', level: 90 },
  { id: 'sk-3', name: 'CSS / Tailwind', category: 'frontend', level: 88 },
  { id: 'sk-4', name: 'Vite / 工程化', category: 'frontend', level: 85 },
  { id: 'sk-5', name: 'Node.js', category: 'backend', level: 78 },
  { id: 'sk-6', name: 'RESTful API 设计', category: 'backend', level: 74 },
  { id: 'sk-7', name: 'SQL / 数据建模', category: 'backend', level: 68 },
  { id: 'sk-8', name: 'Git / GitHub Actions', category: 'tooling', level: 86 },
  { id: 'sk-9', name: 'Chrome DevTools 调优', category: 'tooling', level: 82 },
  { id: 'sk-10', name: 'Docker 基础', category: 'tooling', level: 62 },
  { id: 'sk-11', name: '技术写作', category: 'other', level: 80 },
  { id: 'sk-12', name: '交互与视觉感知', category: 'other', level: 76 },
]

export const seedProjects: Project[] = [
  {
    id: 'pj-1',
    slug: 'imagegrab',
    title: '图提取 ImageGrab',
    summary:
      'Chrome 扩展（Manifest V3）：在电商详情页一键提取全部商品图，集中预览、勾选并批量下载为 PNG。',
    cover: artwork({ from: '#0ea5e9', to: '#4f46e5' }, { label: 'ImageGrab', sub: 'CHROME EXTENSION' }),
    tags: ['Chrome MV3', 'TypeScript', 'OffscreenCanvas', 'fflate'],
    repoUrl: 'https://github.com/banana8354/imagegrab',
    demoUrl: 'https://banana8354.github.io/imagegrab/',
    featured: true,
    date: '2026-10-14',
    content: `## 背景

电商运营与美工经常需要收集商品图，但逐张右键保存效率极低，且常拿到的是缩略图；第三方工具又存在收费、水印与隐私风险。

## 目标

- 一键提取页面所有商品图（含懒加载与背景图）
- 新标签页集中预览、勾选、批量下载
- 统一输出 PNG 格式，本地处理、不上传任何数据

## 技术方案

| 模块 | 选型 | 说明 |
| --- | --- | --- |
| 扩展规范 | Manifest V3 | Service Worker 常驻后台 |
| 图片抓取 | Content Script | 扫描 \`img\`、\`srcset\`、\`data-src\`、\`background-image\` |
| 格式转换 | OffscreenCanvas | 在 Worker 中跨域转码为 PNG |
| 打包下载 | fflate | 体积小、速度快 |

### 跨域图片转 PNG 的关键点

Canvas 读取跨域图片会被污染，无法 \`toBlob\`。解决方案是在 Service Worker 中先 \`fetch\` 拿到 \`ArrayBuffer\`，再 \`createImageBitmap\` + \`OffscreenCanvas\` 转码：

\`\`\`ts
const res = await fetch(url)
const bitmap = await createImageBitmap(await res.blob())
const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
canvas.getContext('2d')!.drawImage(bitmap, 0, 0)
const png = await canvas.convertToBlob({ type: 'image/png' })
\`\`\`

## 成果

- 提取 100 张图耗时 < 3s（不含网络加载）
- 支持淘宝 / 天猫 / 京东 / 拼多多商家版四个平台
- 全部处理在浏览器本地完成，无服务器成本`,
  },
  {
    id: 'pj-2',
    slug: 'star-portfolio',
    title: '星空个人网站',
    summary:
      '深色星空主题的个人品牌站：个人介绍、技能矩阵、项目与博客，内置 /admin 后台管理内容。',
    cover: artwork({ from: '#7c3aed', to: '#0ea5e9' }, { label: 'Star Portfolio', sub: 'REACT + VITE' }),
    tags: ['React 19', 'TypeScript', 'Tailwind CSS 4', 'Canvas'],
    repoUrl: 'https://github.com/banana8354/personal-site',
    demoUrl: 'https://banana8354.github.io/personal-site/',
    featured: true,
    date: '2026-10-15',
    content: `## 背景

需要一个能长期维护的个人门面：既能好看地展示项目与文章，又能让非开发的自己随时改内容，而不用重新构建部署。

## 设计要点

- **深色主题**：背景 \`#0B0F1A\`，正文 \`#E6EAF2\`，强调色可配置
- **星空背景**：Canvas 粒子缓慢漂移 + 呼吸闪烁 + 鼠标视差；移动端降粒子数，尊重 \`prefers-reduced-motion\`
- **简洁现代**：留白充足、层级清晰、圆角 12–16px、动效统一缓动
- **响应式**：\`<640\` 单列 / \`640–1024\` 两列 / \`>1024\` 三列，内容宽 1200px

## 架构决策

1. **数据层隔离**：组件永不直接碰 \`localStorage\`，全部经 \`src/api/\` 统一接口层，将来换真实后端时组件零改动。
2. **HashRouter**：同一份产物同时适配 GitHub Pages / Cloudflare Pages / Vercel，刷新子路由不 404。
3. **零外部图片**：封面与头像用 data-URI SVG 生成，离线可看、无网络抖动。
4. **后台独立布局**：\`/admin\` 使用侧边栏 + 顶栏，与前台导航完全隔离。

## 成果

- 首屏 JS（gzip）控制在 250KB 以内
- 375px 宽度无横向滚动
- 后台改一篇 Markdown 文章，前台刷新即时可见`,
  },
  {
    id: 'pj-3',
    slug: 'web-summarizer',
    title: '网页摘要助手',
    summary: '输入链接即可生成结构化摘要的工具站，用于快速判断一篇文章是否值得细读。',
    cover: artwork({ from: '#0891b2', to: '#16a34a' }, { label: 'Summarizer', sub: 'NODE + UI' }),
    tags: ['Node.js', 'Express', '原生 JS', 'REST API'],
    repoUrl: 'https://github.com/banana8354',
    featured: false,
    date: '2026-10-13',
    content: `## 背景

每天打开的链接远多于能读完的文章。需要一个"先扫一眼再决定要不要精读"的工具。

## 实现

- 后端：Node.js + Express，负责抓取正文、去广告、切分段落
- 前端：原生 HTML/CSS/JS，无框架、无 CDN 依赖，首屏体积极小
- 输出：要点列表 + 关键句 + 阅读时长估算

## 收获

把"框架不是必需品"这件事又验证了一次：当需求足够简单时，原生三件套的启动成本与可维护性反而更好。`,
  },
]

export const seedPosts: Post[] = [
  {
    id: 'po-1',
    slug: 'why-hash-router-for-gh-pages',
    title: '为什么静态托管上的 SPA 要用 HashRouter',
    excerpt:
      '直接访问 /blog/hello 刷新就 404？问题不在代码，而在静态托管的文件寻址方式。本文用一张链路图讲清楚原因，并给出三个平台的解法。',
    cover: artwork({ from: '#1d4ed8', to: '#0ea5e9' }, { width: 900, height: 420, label: 'HashRouter', sub: 'STATIC HOSTING' }),
    tags: ['React', '路由', '部署'],
    date: '2026-10-15',
    content: `## 先看现象

本地 \`npm run dev\` 一切正常，点了导航也能跳；但部署到 GitHub Pages 后，**在子路由上刷新页面**就变成 404。

## 原因：静态托管只认识"真实存在的文件"

\`\`\`
浏览器请求 https://user.github.io/repo/blog/hello
        │
        ▼
静态托管：在产物里找 blog/hello 这个文件 → 找不到 → 404
\`\`\`

SPA 的路由是**浏览器端**的：服务器只需要把 \`index.html\` 交出去，剩下的由 JS 接管。可静态托管并不知道这件事，它只会老实找文件。

## 三种解法

| 方案 | 做法 | 适用 |
| --- | --- | --- |
| HashRouter | 地址变成 \`/#/blog/hello\`，# 之后的内容不会发给服务器 | 所有静态托管，零配置 |
| 404 回退 | 复制 \`index.html\` 为 \`404.html\` | GitHub Pages |
| 平台重写规则 | \`_redirects\` / \`vercel.json\` 把 \`/*\` 重写到 \`/index.html\` | Cloudflare Pages、Vercel、Netlify |

## 我的选择

这个站点会同时往三个平台部署，为了**避免平台差异导致的偶发 404**，我选了 HashRouter：一份产物，哪里都能跑。

代价是 URL 里多了一个 \`#\`。对个人站来说，这个代价可以接受；如果对 SEO 与 URL 美观有更高要求，那就应该上 404 回退或平台重写。

## 顺带一提 base 路径

GitHub Pages 项目站跑在子路径下：

\`\`\`ts
// vite.config.ts
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
})
\`\`\`

构建时注入 \`VITE_BASE=/repo-name/\`，否则 \`/assets/index-xxx.js\` 会 404 —— 页面白屏，控制台一堆红字，这是新手最容易踩的坑。`,
  },
  {
    id: 'po-2',
    slug: 'canvas-starfield-performance',
    title: 'Canvas 星空背景的性能账单：如何让低端机也不掉帧',
    excerpt:
      '一个全屏 Canvas 粒子动画，桌面 140 个粒子很流畅，到了手机就掉到 30fps。记录一次从"能用"到"不卡"的调优过程。',
    cover: artwork({ from: '#4c1d95', to: '#0ea5e9' }, { width: 900, height: 420, label: 'StarField', sub: 'CANVAS PERF' }),
    tags: ['Canvas', '性能优化', '动效'],
    date: '2026-10-15',
    content: `## 第一版：能跑，但手机很烫

思路很直白：粒子数组 + \`requestAnimationFrame\` 循环，每帧 \`clearRect\` 后重绘。

\`\`\`ts
function frame() {
  ctx.clearRect(0, 0, w, h)
  for (const p of particles) {
    p.x += p.vx
    p.y += p.vy
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fill()
  }
  requestAnimationFrame(frame)
}
\`\`\`

问题：**每个粒子一次 \`beginPath\` + \`arc\` + \`fill\`**，粒子上到几百个时，绘制调用次数直接爆炸。

## 优化一：按设备能力分级

\`\`\`ts
const MAX_PARTICLES = window.innerWidth < 640 ? 60 : 140
const dpr = Math.min(window.devicePixelRatio, 2)
\`\`\`

\`dpr\` 不设上限的话，3x 屏意味着 9 倍像素要填充 —— 这是移动端最隐蔽的性能杀手。

## 优化二：合并同色绘制

把透明度接近的粒子归成一批，用一次路径 + 一次 \`fill\` 画完；星星本质上只是圆点，用 \`fillRect\` 画 1px 方块在视觉上几乎无差，但快得多。

## 优化三：尊重用户的系统偏好

\`\`\`ts
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  drawStaticOnce()   // 只画一帧，不做动画
  return
}
\`\`\`

这既是无障碍要求，也顺手解决了"部分设备上动画耗电"的抱怨。

## 优化四：内存与监听器要还回去

组件卸载时必须 \`cancelAnimationFrame\`、\`removeEventListener\`、断开 \`ResizeObserver\`，否则在 SPA 里反复进入离开页面会持续泄漏。

## 结果

| 指标 | 优化前 | 优化后 |
| --- | --- | --- |
| 移动端帧率 | ~30fps | ≥ 50fps |
| 桌面粒子数 | 全量 400+ | 140 |
| 减弱动效下 CPU | 持续占用 | 单帧后归零 |

## 结论

背景特效的性能预算，应该像对待一张 hero 图片那样认真：它决定了用户对"这个站点快不快"的第一印象。`,
  },
  {
    id: 'po-3',
    slug: 'api-layer-before-backend',
    title: '还没有后端的时候，先写一个 API 层',
    excerpt:
      '先用 localStorage 把产品跑起来，但组件里一行 localStorage 都不要出现。这个约束让后来接真实后端只花了改两个文件的时间。',
    cover: artwork({ from: '#0f766e', to: '#65a30d' }, { width: 900, height: 420, label: 'API Layer', sub: 'ARCHITECTURE' }),
    tags: ['架构', 'TypeScript', '重构'],
    date: '2026-10-14',
    content: `## 诱惑：先能跑就行

做个人站时最省事的写法是：组件里直接 \`localStorage.getItem('posts')\`，反正是自己的项目，能跑就行。

代价很快就会显现：

- 想换后端时，改动散落在十几个组件里
- 数据结构一变，所有读取点都要跟着改
- 没法统一处理解析失败、隐私模式不可写这些边界情况

## 约束：组件不许碰存储

我给这个项目定了一条硬规则（写进了 \`AGENTS.md\`）：

> \`components/\` 与 \`pages/\` 禁止直接调用 \`localStorage\`，必须经 \`api/\` 层。

于是结构变成：

\`\`\`
pages/ → hooks/ → api/ → storage(localStorage)
\`\`\`

\`api/\` 只暴露业务语义的方法：

\`\`\`ts
export const siteApi = {
  getSiteData(): SiteData { /* 读 + 回落默认值 */ },
  getPost(slug: string): Post | undefined { /* ... */ },
}

export const adminApi = {
  login(password: string): boolean { /* ... */ },
  savePost(input: PostInput): Result { /* ... */ },
  removePost(id: string): Result { /* ... */ },
}
\`\`\`

## 顺带解决的两个真问题

1. **读取失败不再抛出**：\`read()\` 内部 \`try/catch\` + \`JSON.parse\` 兜底，坏数据回落默认值，页面永远能渲染。
2. **跨页面即时生效**：写入成功后派发一个自定义事件，\`useSiteData()\` 订阅它重新读取 —— 后台保存，前台立刻可见。

\`\`\`ts
window.dispatchEvent(new CustomEvent('ps:data-changed'))
\`\`\`

## 收益

后来要给文章加"标签筛选"字段时，我只改了 \`types.ts\`、\`seed.ts\` 和后台表单三处，前台读取逻辑一行没动。

如果哪天真要接后端，把 \`api/\` 里的实现换成 \`fetch\` 即可，组件层零改动 —— 这就是那层"看起来多余"的抽象换来的东西。`,
  },
]
