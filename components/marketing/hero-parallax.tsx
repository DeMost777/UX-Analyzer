"use client"

import { useEffect, useMemo, useState } from "react"

function prefersReducedMotion() {
  if (typeof window === "undefined") return true
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false
}

export function HeroParallaxBackdrop() {
  const [y, setY] = useState(0)
  const reduce = useMemo(() => prefersReducedMotion(), [])

  useEffect(() => {
    if (reduce) return

    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        setY(window.scrollY || 0)
      })
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("scroll", onScroll)
    }
  }, [reduce])

  const translate = reduce ? 0 : Math.min(48, y * 0.08)

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div
        className="absolute -top-32 left-1/2 h-[520px] w-[920px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(79,124,255,0.22),rgba(79,124,255,0)_55%)] blur-2xl"
        style={{ transform: `translate(-50%, ${translate}px)` }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(1200px_700px_at_50%_0%,rgba(255,255,255,0.10),transparent_60%)] dark:bg-[radial-gradient(1200px_700px_at_50%_0%,rgba(255,255,255,0.06),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.55))] dark:bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.75))]" />
    </div>
  )
}
