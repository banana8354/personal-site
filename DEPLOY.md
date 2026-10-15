# 部署说明（DEPLOY.md）

本项目是**纯静态站点**，构建产物即 `docs/` 目录，可直接托管在任意静态托管平台。

- 线上地址：https://banana8354.github.io/personal-site/
- 源码仓库：https://github.com/banana8354/personal-site

## 一、本仓库采用的部署方式：GitHub Pages（Deploy from a branch）

| 配置项 | 值 |
| --- | --- |
| 仓库 | `banana8354/personal-site` |
| 分支 | `main` |
| 目录 | `/docs` |
| 发布地址 | https://banana8354.github.io/personal-site/ |

`docs/` 是 `npm run build` 的产物（HTML + 带哈希的 JS/CSS + favicon），**不是手工维护的源码**。
根目录的 `src/` 才是源码，改完源码后重新构建并提交 `docs/` 即可更新线上站点。

### 重新发布步骤

```bash
# 1. 类型检查 + 构建到 docs（必须注入 VITE_BASE，否则静态资源会 404）
npm run build -- --outDir docs --emptyOutDir     # 本地开发时 VITE_BASE 用 /

# 2. 提交并推送，GitHub Pages 会自动重新发布
git add -A && git commit -m "chore: 重新构建并发布" && git push
```

> 关键点：GitHub Pages 项目站的访问路径是 `https://<user>.github.io/<repo>/`，
> 构建时必须注入 `VITE_BASE=/personal-site/`，`vite.config.ts` 已读取该环境变量：

```ts
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
})
```

Windows PowerShell 写法：

```powershell
$env:VITE_BASE = "/personal-site/"; npm run build -- --outDir docs --emptyOutDir
```

### 路由说明

站点使用 **HashRouter**，地址形如 `https://banana8354.github.io/personal-site/#/blog/xxx`。
这样在 GitHub Pages / Cloudflare Pages / Vercel 上直接访问子路由或刷新页面都不会 404，无需任何重写规则。

## 二、备选方式：GitHub Actions 自动部署

本次部署使用的是上面的分支发布方式，原因是：推送 `.github/workflows/` 下的工作流文件需要
Personal Access Token 具备 `workflow` scope，而本次使用的令牌只有 `Contents: write`，
GitHub 直接拒绝了该文件的推送（`refusing to allow a Personal Access Token to create or update
workflow ... without workflow scope`）。因此改为「本地构建 → 提交 `docs/` → 分支发布」，
效果与 Actions 部署完全一致。

若希望改用 Actions 自动部署，工作流内容如下（保存为 `.github/workflows/deploy.yml`）：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - name: Build
        env:
          VITE_BASE: /${{ github.event.repository.name }}/
        run: npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

启用步骤：仓库 **Settings → Pages → Source** 选择 **GitHub Actions**，
然后 push 到 `main`（或在 Actions 页面手动 Run workflow）。

## 三、其他静态托管平台

| 平台 | 配置 |
| --- | --- |
| Cloudflare Pages | Build command `npm run build`，Output directory `dist`，框架预设 Vite |
| Vercel | Framework Preset `Vite`，Build `npm run build`，Output `dist` |
| Netlify | Build `npm run build`，Publish `dist` |

三个平台的构建产物与 GitHub Pages 完全一致（根路径部署时不需要 `VITE_BASE`）。

## 四、部署后自查清单

- [x] 首屏可直接打开，无白屏、无控制台报错
- [x] 直接访问 `#/projects/star-portfolio`、`#/blog/xxx` 后刷新仍正常
- [x] 移动端（390px）无横向滚动，星空背景正常
- [x] 后台 `#/admin` 可打开登录页（演示账号 admin / admin123）
- [x] 静态资源全部 200（favicon、CSS、JS 均在 `/<repo>/assets/` 下）

## 五、后台与数据说明

后台内容保存在**访问者浏览器的 localStorage**，属于前端演示实现，不涉及服务器，也不构成真实安全边界。
接入真实后端时，只需替换 `src/api/` 下的实现（`siteApi.ts` / `adminApi.ts`），页面组件无需改动。
