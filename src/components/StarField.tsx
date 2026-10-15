/**
 * 星空背景：Canvas 粒子缓慢漂移 + 呼吸闪烁 + 鼠标视差。
 *
 * 性能与无障碍（TECH_DESIGN §4.1 / AGENTS.md §9）：
 *  - 粒子数按视口宽度与密度设置分级，移动端大幅下调
 *  - devicePixelRatio 上限 2，避免高分屏像素填充爆炸
 *  - prefers-reduced-motion 时只绘制一帧静态星空
 *  - 组件卸载时取消 rAF、移除全部监听、断开 ResizeObserver
 *  - pointer-events: none + z-index: -1，绝不遮挡交互
 */
import { useEffect, useRef } from 'react'

export type StarDensity = 'low' | 'medium' | 'high'

interface StarFieldProps {
  /** 粒子密度档位，来自站点设置 */
  density?: StarDensity
  /** 强调色，用于少量高亮星点 */
  accent?: string
}

interface Particle {
  x: number
  y: number
  r: number
  vx: number
  vy: number
  alpha: number
  phase: number
  speed: number
  accent: boolean
}

const DENSITY_FACTOR: Record<StarDensity, number> = {
  low: 0.45,
  medium: 0.7,
  high: 1,
}

/** 依据视口与密度算出粒子数：桌面最多 140，移动端最多 60 */
function particleCount(width: number, density: StarDensity): number {
  const isMobile = width < 640
  const base = isMobile ? 60 : width < 1024 ? 100 : 140
  return Math.max(24, Math.round(base * DENSITY_FACTOR[density]))
}

function createParticles(count: number, width: number, height: number, accent: string): Particle[] {
  const accentRgb = hexToRgb(accent)
  return Array.from({ length: count }, (_, index) => {
    const isAccent = index % 11 === 0 && accentRgb !== null
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.2 + 0.4,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      alpha: Math.random() * 0.5 + 0.25,
      phase: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.0016 + 0.0006,
      accent: isAccent,
    }
  })
}

function hexToRgb(hex: string): [number, number, number] | null {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  if (!match) return null
  const value = Number.parseInt(match[1], 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

export default function StarField({ density = 'high', accent = '#38bdf8' }: StarFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvasEl = canvasRef.current
    if (!canvasEl) return
    const context = canvasEl.getContext('2d')
    if (!context) return
    // 用常量持有引用，避免闭包内被推断为可能为 null
    const canvas: HTMLCanvasElement = canvasEl
    const ctx: CanvasRenderingContext2D = context

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const accentRgb = hexToRgb(accent)

    let width = window.innerWidth
    let height = window.innerHeight
    let particles: Particle[] = []
    // 视差偏移目标值与当前值，用插值平滑
    let targetX = 0
    let targetY = 0
    let offsetX = 0
    let offsetY = 0
    let frame = 0
    let disposed = false

    function resize() {
      width = window.innerWidth
      height = window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      // 用 setTransform 而不是 scale，重设尺寸后不会累乘
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      particles = createParticles(particleCount(width, density), width, height, accent)
    }

    function draw(delta: number) {
      ctx.clearRect(0, 0, width, height)

      // 缓慢的视差插值
      offsetX += (targetX - offsetX) * 0.045
      offsetY += (targetY - offsetY) * 0.045

      for (const p of particles) {
        if (!reduceMotion) {
          p.x += p.vx * delta
          p.y += p.vy * delta
          p.phase += p.speed * delta
          // 越界回绕，保证星空始终铺满
          if (p.x < -2) p.x = width + 2
          if (p.x > width + 2) p.x = -2
          if (p.y < -2) p.y = height + 2
          if (p.y > height + 2) p.y = -2
        }
        const twinkle = reduceMotion ? 0.75 : 0.62 + Math.sin(p.phase) * 0.32
        const alpha = Math.min(1, Math.max(0.08, p.alpha * twinkle))
        ctx.globalAlpha = alpha
        ctx.fillStyle =
          p.accent && accentRgb ? `rgb(${accentRgb[0]} ${accentRgb[1]} ${accentRgb[2]})` : '#E6EAF2'
        ctx.beginPath()
        ctx.arc(p.x + offsetX, p.y + offsetY, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1
    }

    function loop(time: number) {
      if (disposed) return
      const delta = Math.min(time - (loop.last ?? time), 32)
      loop.last = time
      draw(delta)
      frame = window.requestAnimationFrame(loop)
    }
    loop.last = 0

    function onPointerMove(event: PointerEvent) {
      targetX = (event.clientX - width / 2) * 0.012
      targetY = (event.clientY - height / 2) * 0.012
    }

    let resizeTimer = 0
    function onResize() {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(resize, 160)
    }

    resize()
    if (reduceMotion) {
      // 只绘制一帧静态星空，不进入动画循环
      draw(16)
    } else {
      frame = window.requestAnimationFrame(loop)
      window.addEventListener('pointermove', onPointerMove, { passive: true })
    }
    window.addEventListener('resize', onResize)
    // 依据密度与视口比例均匀铺开
    window.addEventListener('orientationchange', onResize)

    return () => {
      disposed = true
      window.cancelAnimationFrame(frame)
      window.clearTimeout(resizeTimer)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
    }
  }, [density, accent])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  )
}
