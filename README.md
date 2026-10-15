# 星空个人网站（personal-site）

深色星空主题的个人品牌站：**个人介绍 / 技能展示 / 项目展示 / 博客 / 联系**，并内置 `/admin` 后台管理内容。
技术栈为 React 19 + TypeScript + Vite + Tailwind CSS 4，纯静态产物，可托管于 GitHub Pages / Cloudflare Pages / Vercel。

## 在线地址

- 站点：https://banana8354.github.io/personal-site/
- 仓库：https://github.com/banana8354/personal-site

## 文档（开发流程三件套）

| 文档 | 作用 |
| --- | --- |
| [PRD.md](./PRD.md) | 产品需求文档：目标用户、功能清单（FR-01 ~ FR-41）、界面规范、验收标准 |
| [TECH_DESIGN.md](./TECH_DESIGN.md) | 技术设计：技术栈选型、目录结构、数据模型、关键技术点、部署方案 |
| [AGENTS.md](./AGENTS.md) | AI 代理开发指令：分层契约、编码规范、安全规范、测试与自查要求 |

## 功能一览

**前台**

- 首页 Hero：头像、姓名职位、一句话介绍、CTA（看项目 / 简历 / 联系）
- 关于我：简介 + 工作经历与教育背景时间线
- 技能展示：四类分组 + 熟练度进度条（进入视口动画）
- 项目展示：卡片列表 + 标签筛选 + Markdown 详情页（背景/方案/成果）
- 博客：列表 + 标签筛选 + Markdown 详情（代码高亮、TOC 随滚动高亮、上下篇）
- 联系：邮箱一键复制、社交链接、留言表单（Zod 校验 + 成功/失败反馈）
- 全局：吸顶毛玻璃导航、移动端汉堡菜单、页脚、回到顶部、404 页面

**后台 `/admin`**

- `/admin/login` 登录（口令以 SHA-256 常量比对，localStorage 只存 token）
- `/admin` 仪表盘：项目 / 文章 / 技能 / 留言统计概览
- `/admin/profile` 个人信息（含多段简介、社交链接增删）
- `/admin/skills` 技能增删改 + 熟练度滑杆
- `/admin/projects` 项目列表 + 新建 / 编辑 / 删除
- `/admin/posts` 博客管理 + Markdown 实时预览
- `/admin/settings` 站名、主题强调色、星空密度、数据导出 / 导入 / 恢复默认

> 演示账号：`admin` / `admin123`
> ⚠️ 后台为前端演示实现，仅用于本地内容管理，**不是真实安全边界**；接入后端后必须改为服务端签发 JWT。

## 设计要点

- **深色主题**：背景 `#0B0F1A`、正文 `#E6EAF2`，强调色可在后台一键更换（注入 `--accent` CSS 变量）
- **星空背景**：Canvas 粒子漂移 + 呼吸闪烁 + 鼠标视差；移动端降粒子数、`dpr` 上限 2、尊重 `prefers-reduced-motion`
- **响应式**：`<640` 单列 / `640–1024` 两列 / `>1024` 三列，内容区最大宽 1200px
- **零外部图片**：封面与头像均由 data-URI SVG 生成，离线可看、无网络抖动
- **数据层隔离**：组件永不直接访问 localStorage，全部经 `src/api/` 统一接口层

## 本地运行

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # 类型检查 + 生产构建 → dist/
npm run preview    # 预览生产产物
```

## 部署

### GitHub Pages（本仓库采用）

推送到 `main` 分支后，`.github/workflows/deploy.yml` 自动构建并发布：

1. 注入 `VITE_BASE=/<repo>/`（项目站子路径，缺失会导致静态资源 404）
2. 上传 `dist` 为 Pages 产物并部署

### Cloudflare Pages / Vercel

| 平台 | 配置 |
| --- | --- |
| Cloudflare Pages | Build command `npm run build`，Output directory `dist`，框架预设 Vite |
| Vercel | Framework Preset `Vite`，Build `npm run build`，Output `dist` |
| Netlify | Build `npm run build`，Publish `dist` |

路由采用 **HashRouter**，因此三个平台都无需额外重写规则，刷新子路由不会 404。

## 质量自查

| 检查项 | 结果 |
| --- | --- |
| `npx tsc -b --noEmit` | 通过，0 error（`strict: true`） |
| `npm run build` | 通过，产物 `dist/`，首屏 JS gzip 约 98KB |
| 响应式 | 375 / 834 / 1440 三档无横向滚动 |
| 后台链路 | 登录 → 新建文章 → 前台即时可见 → 删除二次确认 |
| 无障碍 | 跳到主内容、焦点可见、图标按钮 aria-label、尊重 reduce-motion |
