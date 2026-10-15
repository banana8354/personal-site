/**
 * GitHub REST API 调用（Node 版）。
 * 走本地代理 127.0.0.1:7897，带指数退避重试以应对代理偶发 TLS 中断。
 * 用法：node scripts/gh.mjs <action>
 * 需要环境变量 GH_TOKEN。
 */
import process from 'node:process'
import { ProxyAgent, request } from 'undici'

const PROXY = 'http://127.0.0.1:7897'
const OWNER = 'banana8354'
const REPO = 'personal-site'
const TOKEN = process.env.GH_TOKEN ?? ''
const dispatcher = new ProxyAgent(PROXY)

async function call(method, path, payload) {
  const url = `https://api.github.com${path}`
  let lastError
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const res = await request(url, {
        method,
        dispatcher,
        headers: {
          authorization: `Bearer ${TOKEN}`,
          accept: 'application/vnd.github+json',
          'user-agent': 'personal-site-deployer',
          'x-github-api-version': '2022-11-28',
          ...(payload ? { 'content-type': 'application/json' } : {}),
        },
        body: payload ? JSON.stringify(payload) : undefined,
        headersTimeout: 30000,
        bodyTimeout: 30000,
      })
      const text = await res.body.text()
      let data = {}
      try {
        data = text ? JSON.parse(text) : {}
      } catch {
        data = { raw: text.slice(0, 400) }
      }
      return { status: res.statusCode, data }
    } catch (error) {
      lastError = error
      await new Promise((resolve) => setTimeout(resolve, 1200 * (attempt + 1)))
    }
  }
  throw new Error(`request failed: ${lastError?.message ?? 'unknown'}`)
}

const action = process.argv[2]

if (action === 'user') {
  const { status, data } = await call('GET', '/user')
  console.log('user:', status, data.login ?? data.message)
} else if (action === 'repo-info') {
  const { status, data } = await call('GET', `/repos/${OWNER}/${REPO}`)
  console.log('repo-info:', status)
  console.log('  full_name:', data.full_name)
  console.log('  default_branch:', data.default_branch)
  console.log('  has_pages:', data.has_pages)
  console.log('  size_kb:', data.size)
  console.log('  pushed_at:', data.pushed_at)
  if (data.message) console.log('  message:', data.message)
} else if (action === 'create-repo') {
  const existing = await call('GET', `/repos/${OWNER}/${REPO}`)
  if (existing.status === 200) {
    console.log('repo already exists:', existing.data.html_url)
  } else {
    const { status, data } = await call('POST', '/user/repos', {
      name: REPO,
      description:
        '星空个人网站：个人介绍 / 技能 / 项目 / 博客（React 19 + TypeScript + Vite + Tailwind CSS 4）',
      private: false,
      has_issues: true,
      has_wiki: false,
      auto_init: false,
    })
    console.log('create-repo:', status, data.html_url ?? data.message ?? JSON.stringify(data).slice(0, 300))
  }
} else if (action === 'enable-pages') {
  let res = await call('POST', `/repos/${OWNER}/${REPO}/pages`, { build_type: 'workflow' })
  if (res.status === 409 || res.status === 422) {
    res = await call('PUT', `/repos/${OWNER}/${REPO}/pages`, { build_type: 'workflow' })
  }
  console.log('enable-pages:', res.status, JSON.stringify(res.data).slice(0, 400))
} else if (action === 'pages-status') {
  const { status, data } = await call('GET', `/repos/${OWNER}/${REPO}/pages`)
  console.log('pages-status:', status, JSON.stringify(data).slice(0, 500))
} else if (action === 'runs') {
  const { status, data } = await call('GET', `/repos/${OWNER}/${REPO}/actions/runs?per_page=8`)
  console.log('runs:', status)
  for (const run of data.workflow_runs ?? []) {
    console.log(
      `  #${run.run_number} ${run.name} status=${run.status} conclusion=${run.conclusion} created=${run.created_at}`,
    )
  }
  if (data.message) console.log('  message:', data.message)
} else if (action === 'run-detail') {
  const runId = process.argv[3]
  const { status, data } = await call('GET', `/repos/${OWNER}/${REPO}/actions/runs/${runId}/jobs`)
  console.log('run-detail:', status)
  for (const job of data.jobs ?? []) {
    console.log(`  job ${job.name} status=${job.status} conclusion=${job.conclusion}`)
    for (const step of job.steps ?? []) {
      console.log(`    - ${step.name}: ${step.status}/${step.conclusion}`)
    }
  }
} else {
  console.log('unknown action:', action)
}
