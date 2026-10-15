import { Link } from 'react-router-dom'

/** 404 页面 */
export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-[720px] flex-col items-center px-4 py-28 text-center sm:px-6">
      <p className="font-mono text-6xl font-bold text-accent">404</p>
      <h1 className="mt-6 text-2xl font-bold text-ink">这里没有星星，也没有页面</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        你访问的地址不存在，可能是链接输入有误，也可能是内容已被移动。
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="rounded-btn bg-accent px-5 py-2.5 text-sm font-semibold text-base transition hover:brightness-110"
        >
          回到首页
        </Link>
        <Link
          to="/projects"
          className="rounded-btn border border-line px-5 py-2.5 text-sm text-muted transition hover:border-accent/60 hover:text-accent"
        >
          浏览项目
        </Link>
      </div>
    </div>
  )
}
