import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Scan,
  FileText,
  Layers,
  Eye,
  MousePointerClick,
  Gauge,
  Lock,
  Github,
  Twitter,
  Linkedin,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { MarketingHeader } from "@/components/marketing/marketing-header"
import { Reveal } from "@/components/marketing/reveal"
import { HeroParallaxBackdrop } from "@/components/marketing/hero-parallax"

export const metadata: Metadata = {
  title: "Flow UX AI — Marketing",
  description:
    "A premium, calm marketing page for Flow UX AI: cinematic hero, feature grid, strong CTA, and multi-column footer.",
}

const features = [
  {
    icon: Sparkles,
    title: "AI-first UX audits",
    description:
      "Surface usability, clarity, and accessibility issues with structured, actionable recommendations.",
  },
  {
    icon: Scan,
    title: "Hotspots & issue mapping",
    description:
      "Pinpoint problems with coordinates so fixes are easy to reproduce and verify.",
  },
  {
    icon: FileText,
    title: "Export-ready reports",
    description:
      "Generate shareable findings for stakeholders—clear sections, severity, and next steps.",
  },
  {
    icon: ShieldCheck,
    title: "WCAG-friendly checks",
    description:
      "Catch contrast and accessibility gaps early without slowing down delivery.",
  },
  {
    icon: Layers,
    title: "Multi-screen reviews",
    description:
      "Upload multiple screens and review issues across flows with consistent visual rhythm.",
  },
  {
    icon: Gauge,
    title: "Fast feedback loop",
    description:
      "Premium performance: fast uploads, resilient processing, and clear status feedback.",
  },
]

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingHeader />

      <main id="main">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <HeroParallaxBackdrop />
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="py-16 sm:py-20 lg:py-24">
              <Reveal>
                <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Calm, premium UX analysis for product teams
                </div>
              </Reveal>

              <Reveal className="mt-6" delayMs={80}>
                <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                  Ship clearer interfaces with AI-powered UX reviews.
                </h1>
              </Reveal>

              <Reveal className="mt-5" delayMs={140}>
                <p className="max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Upload your screens, get structured findings, and review issues on a visual canvas.
                  Designed for calm iteration: no noisy dashboards, just crisp feedback.
                </p>
              </Reveal>

              <Reveal className="mt-8" delayMs={220}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link href="/">
                    <Button className="group w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
                      Open app
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  </Link>
                  <a
                    href="#features"
                    className="inline-flex w-full items-center justify-center rounded-md border border-border bg-background/60 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5 sm:w-auto"
                  >
                    Explore features
                  </a>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <div className="inline-flex items-center gap-2">
                    <Lock className="h-3.5 w-3.5" />
                    No tracking pixels on this page
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <Eye className="h-3.5 w-3.5" />
                    Accessibility-friendly contrast
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <MousePointerClick className="h-3.5 w-3.5" />
                    Smooth micro-interactions
                  </div>
                </div>
              </Reveal>

              {/* Cinematic preview card */}
              <Reveal className="mt-12" delayMs={260}>
                <div className="relative rounded-2xl border border-border/60 bg-card/40 p-6 shadow-[0_12px_60px_-20px_rgba(0,0,0,0.55)] backdrop-blur">
                  <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(600px_260px_at_40%_0%,rgba(79,124,255,0.18),transparent_60%)]" />
                  <div className="relative grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="space-y-4">
                      <p className="text-sm font-semibold tracking-tight">What you get</p>
                      <ul className="space-y-3 text-sm text-muted-foreground">
                        <li className="flex gap-3">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          Issues grouped by severity and category—ready for product review.
                        </li>
                        <li className="flex gap-3">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          Visual hotspots with coordinates to speed up fixes.
                        </li>
                        <li className="flex gap-3">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                          Exportable reports for stakeholders and QA.
                        </li>
                      </ul>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-background/60 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-muted-foreground">Average review time</p>
                        <p className="text-xs font-semibold">~45 seconds</p>
                      </div>
                      <div className="mt-4 space-y-3">
                        <div className="h-2 w-full rounded-full bg-foreground/10">
                          <div className="h-2 w-[72%] rounded-full bg-primary" />
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                            <p className="text-muted-foreground">Clarity</p>
                            <p className="mt-1 text-sm font-semibold">8.6</p>
                          </div>
                          <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                            <p className="text-muted-foreground">A11y</p>
                            <p className="mt-1 text-sm font-semibold">7.9</p>
                          </div>
                          <div className="rounded-lg border border-border/60 bg-card/40 p-3">
                            <p className="text-muted-foreground">Flow</p>
                            <p className="mt-1 text-sm font-semibold">8.2</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Feature grid */}
        <section id="features" className="border-t border-border/60">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
            <Reveal>
              <div className="max-w-2xl">
                <p className="text-sm font-semibold text-primary">Features</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Everything you need for calm, repeatable UX reviews.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Clean structure, clear section separation, and tasteful motion—built for professional product workflows.
                </p>
              </div>
            </Reveal>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f, idx) => {
                const Icon = f.icon
                return (
                  <Reveal key={f.title} delayMs={idx * 60}>
                    <div className="group h-full rounded-2xl border border-border/60 bg-card/40 p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_-30px_rgba(0,0,0,0.65)]">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-background/60 transition-colors group-hover:bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold">{f.title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">{f.description}</p>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>

        {/* Workflow */}
        <section id="workflow" className="border-t border-border/60">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
            <Reveal>
              <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
                <div>
                  <p className="text-sm font-semibold text-primary">Workflow</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                    From upload to review in a single, focused flow.
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    No clutter. You stay in context while the analysis produces clear, actionable issues.
                  </p>

                  <ol className="mt-6 space-y-4">
                    <li className="flex gap-3">
                      <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        1
                      </span>
                      <div>
                        <p className="text-sm font-semibold">Upload multiple screens</p>
                        <p className="text-sm text-muted-foreground">
                          Drag & drop PNG/JPG/WebP exports—batch review whole flows.
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        2
                      </span>
                      <div>
                        <p className="text-sm font-semibold">Get structured findings</p>
                        <p className="text-sm text-muted-foreground">
                          Severity, category, cause, and fix—ready for product and design discussions.
                        </p>
                      </div>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        3
                      </span>
                      <div>
                        <p className="text-sm font-semibold">Review visually, export confidently</p>
                        <p className="text-sm text-muted-foreground">
                          Hotspots on canvas + exportable reports keep alignment crisp.
                        </p>
                      </div>
                    </li>
                  </ol>
                </div>

                <div className="rounded-2xl border border-border/60 bg-card/40 p-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-border/60 bg-background/60 p-4">
                      <p className="text-xs font-medium text-muted-foreground">Signal</p>
                      <p className="mt-1 text-lg font-semibold">Clear severity</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Critical, major, minor—prioritize work without debate.
                      </p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-background/60 p-4">
                      <p className="text-xs font-medium text-muted-foreground">Tone</p>
                      <p className="mt-1 text-lg font-semibold">Calm delivery</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Subtle motion, clean spacing, and accessible contrast.
                      </p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-background/60 p-4">
                      <p className="text-xs font-medium text-muted-foreground">Review</p>
                      <p className="mt-1 text-lg font-semibold">Visual hotspots</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Issues appear exactly where they occur.
                      </p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-background/60 p-4">
                      <p className="text-xs font-medium text-muted-foreground">Output</p>
                      <p className="mt-1 text-lg font-semibold">Shareable reports</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Keep stakeholders aligned with export-ready findings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Security */}
        <section id="security" className="border-t border-border/60">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
            <Reveal>
              <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
                <div>
                  <p className="text-sm font-semibold text-primary">Security</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                    Built with privacy and control in mind.
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    Your uploads are scoped per user and stored with predictable paths. Controls are explicit and designed for production.
                  </p>
                </div>

                <div className="rounded-2xl border border-border/60 bg-card/40 p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-background/60">
                        <Lock className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Scoped storage paths</p>
                        <p className="text-sm text-muted-foreground">
                          Files are organized by user and analysis, reducing accidental exposure.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-background/60">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">Explicit save actions</p>
                        <p className="text-sm text-muted-foreground">
                          Settings changes require a deliberate save—no surprise auto-sync.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Final CTA */}
        <section className="border-t border-border/60">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <Reveal>
              <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/40 p-8 sm:p-10">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(800px_320px_at_20%_0%,rgba(79,124,255,0.22),transparent_55%)]" />
                <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                      Ready to review your next flow with confidence?
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                      Open the app, upload your screens, and get calm, structured findings you can ship.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Link href="/">
                      <Button className="group w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
                        Get started
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </Button>
                    </Link>
                    <a
                      href="#features"
                      className="inline-flex w-full items-center justify-center rounded-md border border-border bg-background/60 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-foreground/5 sm:w-auto"
                    >
                      View features
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
            <div>
              <div className="flex items-center gap-2">
                <div className="rounded-xl border border-border/60 bg-background/60 p-2">
                  <div className="h-7 w-7">
                    {/* Logo renders SVG */}
                    <span className="sr-only">Flow UX AI</span>
                  </div>
                </div>
                <p className="text-sm font-semibold">Flow UX AI</p>
              </div>
              <p className="mt-3 max-w-sm text-sm text-muted-foreground">
                Premium UX analysis that stays calm—so teams can iterate faster with confidence.
              </p>
              <div className="mt-5 flex items-center gap-2">
                <a
                  href="#"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background/60 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
                  aria-label="GitHub"
                >
                  <Github className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background/60 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
                  aria-label="Twitter"
                >
                  <Twitter className="h-4 w-4" />
                </a>
                <a
                  href="#"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background/60 text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm font-semibold">Product</p>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li><a className="hover:text-foreground" href="#features">Features</a></li>
                  <li><a className="hover:text-foreground" href="#workflow">Workflow</a></li>
                  <li><a className="hover:text-foreground" href="#security">Security</a></li>
                  <li><Link className="hover:text-foreground" href="/">Open app</Link></li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold">Resources</p>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li><a className="hover:text-foreground" href="#">Documentation</a></li>
                  <li><a className="hover:text-foreground" href="#">Changelog</a></li>
                  <li><a className="hover:text-foreground" href="#">Status</a></li>
                  <li><a className="hover:text-foreground" href="#">Support</a></li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold">Company</p>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li><a className="hover:text-foreground" href="#">About</a></li>
                  <li><a className="hover:text-foreground" href="#">Careers</a></li>
                  <li><a className="hover:text-foreground" href="#">Press</a></li>
                  <li><a className="hover:text-foreground" href="#">Contact</a></li>
                </ul>
              </div>
              <div>
                <p className="text-sm font-semibold">Legal</p>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li><a className="hover:text-foreground" href="#">Privacy</a></li>
                  <li><a className="hover:text-foreground" href="#">Terms</a></li>
                  <li><a className="hover:text-foreground" href="#">Security policy</a></li>
                  <li><a className="hover:text-foreground" href="#">DPA</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Flow UX AI. All rights reserved.</p>
            <p className="text-muted-foreground">Built for calm iteration. No aggressive motion.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
