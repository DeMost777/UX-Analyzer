"use client"

import { useEffect, useRef, useState } from "react"

function prefersReducedMotion() {
  if (typeof window === "undefined") return true
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false
}

export function Reveal({
  children,
  className = "",
  delayMs = 0,
}: {
  children: React.ReactNode
  className?: string
  delayMs?: number
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion()) {
      setVisible(true)
      return
    }

    const el = ref.current
    if (!el) return

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true)
            obs.disconnect()
            break
          }
        }
      },
      { threshold: 0.15 },
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={
        `transition-all duration-700 ease-out will-change-transform ` +
        (visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4") +
        ` ${className}`
      }
      style={delayMs ? ({ transitionDelay: `${delayMs}ms` } as any) : undefined}
    >
      {children}
    </div>
  )
}
