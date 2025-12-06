"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { motion } from "framer-motion"
import { Upload, Zap, Target, FileCheck, Shield, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

interface LandingScreenProps {
  onFilesSelected: (files: File[]) => void
}

export function LandingScreen({ onFilesSelected }: LandingScreenProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const { theme, setTheme } = useTheme()

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFilesSelected(acceptedFiles.slice(0, 30))
      }
    },
    [onFilesSelected],
  )

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
    },
    maxFiles: 30,
    noClick: true,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => setIsDragActive(false),
  })

  const benefits = [
    {
      icon: Zap,
      title: "Instant Analysis",
      description: "Get comprehensive UX feedback in seconds, not hours of manual review.",
    },
    {
      icon: Target,
      title: "Pixel-Perfect Detection",
      description: "AI identifies contrast issues, spacing problems, and accessibility gaps.",
    },
    {
      icon: FileCheck,
      title: "Actionable Reports",
      description: "Export detailed findings to Markdown with precise coordinates.",
    },
    {
      icon: Shield,
      title: "WCAG Compliant",
      description: "Ensure your designs meet accessibility standards automatically.",
    },
  ]

  const logoCompanies = ["Vercel", "Linear", "Stripe", "Figma", "Notion"]

  return (
    <div className="min-h-screen bg-background relative overflow-hidden transition-colors duration-300">
      {/* Theme toggle */}
      <div className="absolute top-6 right-6 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="rounded-full bg-secondary/50 backdrop-blur-sm"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </div>

      {/* Background gradient effects - dark mode */}
      <div className="absolute inset-0 dark:block hidden">
        {/* Primary spotlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#4F7CFF]/20 rounded-full blur-[120px] opacity-60" />
        {/* Secondary glow */}
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-[#4F7CFF]/10 rounded-full blur-[100px]" />
        {/* Accent glow */}
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-[#4F7CFF]/5 rounded-full blur-[80px]" />
      </div>

      {/* Background gradient effects - light mode */}
      <div className="absolute inset-0 dark:hidden block">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#4F7CFF]/10 rounded-full blur-[120px] opacity-40" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="w-10 h-10" />
            <span className="text-xl font-semibold text-foreground">Flow UX AI</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              How it works
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-16 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight tracking-tight text-balance"
            >
              AI-powered UX analysis for <span className="text-[#4F7CFF]">flawless</span> product design.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty"
            >
              Upload your designs and get pixel-perfect UX insights and layout improvements — instantly.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="flex items-center justify-center gap-4"
            >
              <Button
                size="lg"
                className="bg-[#4F7CFF] hover:bg-[#4F7CFF]/90 text-white px-8 py-6 text-base font-medium rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                onClick={open}
              >
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 text-base font-medium rounded-xl border-border hover:bg-secondary/50 transition-all duration-200 bg-transparent"
              >
                <Play className="w-4 h-4 mr-2" />
                Watch demo
              </Button>
            </motion.div>
          </div>

          {/* Upload Component */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
            className="max-w-2xl mx-auto mb-20"
          >
            <div
              {...getRootProps()}
              className={`
                relative rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer
                transition-all duration-300 ease-out
                ${
                  isDragActive
                    ? "border-[#4F7CFF] bg-[#4F7CFF]/10 scale-[1.02]"
                    : "border-border hover:border-[#4F7CFF]/50 hover:bg-secondary/30"
                }
              `}
              onClick={open}
            >
              <input {...getInputProps()} />

              {/* Glow effect on drag */}
              {isDragActive && <div className="absolute inset-0 rounded-2xl bg-[#4F7CFF]/5 blur-xl -z-10" />}

              <div className="flex flex-col items-center gap-4">
                <div
                  className={`
                    w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300
                    ${isDragActive ? "bg-[#4F7CFF]/20" : "bg-secondary"}
                  `}
                >
                  <Upload
                    className={`w-8 h-8 transition-colors duration-300 ${
                      isDragActive ? "text-[#4F7CFF]" : "text-muted-foreground"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-foreground font-medium mb-1">
                    {isDragActive ? "Drop your screenshots here" : "Upload your screenshots to start analysis"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Drag & drop or click to browse • PNG, JPG, WebP • Max 30 images
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Floating UI Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="max-w-5xl mx-auto mb-24"
          >
            <div className="relative">
              {/* Window frame */}
              <div className="bg-[#0A0A0A] dark:bg-[#0A0A0A] rounded-2xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden">
                {/* Window header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-[#141414] border-b border-white/5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                    <div className="w-3 h-3 rounded-full bg-[#28CA41]" />
                  </div>
                  <div className="flex-1 text-center">
                    <span className="text-xs text-white/40">Flow UX AI — Review</span>
                  </div>
                </div>

                {/* Window content */}
                <div className="flex h-[400px]">
                  {/* Sidebar preview */}
                  <div className="w-64 bg-[#0F0F0F] border-r border-white/5 p-4">
                    <div className="text-xs text-white/60 mb-3">Issues Found</div>
                    <div className="space-y-2">
                      {[
                        { severity: "critical", text: "Low contrast text" },
                        { severity: "major", text: "Touch target too small" },
                        { severity: "major", text: "Inconsistent spacing" },
                        { severity: "minor", text: "Missing focus state" },
                      ].map((issue, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <div
                            className={`w-2 h-2 rounded-full ${
                              issue.severity === "critical"
                                ? "bg-red-500"
                                : issue.severity === "major"
                                  ? "bg-yellow-500"
                                  : "bg-blue-500"
                            }`}
                          />
                          <span className="text-xs text-white/80">{issue.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Canvas preview */}
                  <div className="flex-1 bg-[#0A0A0A] p-8 flex items-center justify-center">
                    <div className="relative">
                      {/* Screenshot placeholder */}
                      <div className="w-[200px] h-[300px] rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 overflow-hidden">
                        <div className="h-8 bg-white/5 border-b border-white/5" />
                        <div className="p-3 space-y-2">
                          <div className="h-3 w-3/4 rounded bg-white/10" />
                          <div className="h-3 w-1/2 rounded bg-white/10" />
                          <div className="h-20 rounded bg-white/5 mt-4" />
                          <div className="h-8 rounded bg-[#4F7CFF]/30 mt-4" />
                        </div>
                      </div>

                      {/* Issue markers */}
                      <div className="absolute top-12 left-4 w-5 h-5 rounded-full bg-red-500 border-2 border-white flex items-center justify-center animate-pulse">
                        <span className="text-[10px] text-white font-bold">!</span>
                      </div>
                      <div className="absolute top-32 right-2 w-5 h-5 rounded-full bg-yellow-500 border-2 border-white flex items-center justify-center">
                        <span className="text-[10px] text-white font-bold">!</span>
                      </div>
                      <div className="absolute bottom-24 left-8 w-5 h-5 rounded-full bg-yellow-500 border-2 border-white flex items-center justify-center">
                        <span className="text-[10px] text-white font-bold">!</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shadow/glow effect */}
              <div className="absolute -inset-4 bg-[#4F7CFF]/10 rounded-3xl blur-2xl -z-10 opacity-50" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="features" className="relative z-10 px-6 py-24 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything you need for UX excellence
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Automated analysis powered by proven UX heuristics and accessibility standards.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center p-6"
              >
                <div className="w-12 h-12 rounded-xl bg-[#4F7CFF]/10 flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-6 h-6 text-[#4F7CFF]" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="relative z-10 px-6 py-16 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <p className="text-sm text-muted-foreground mb-8">Trusted by teams at</p>
            <div className="flex items-center justify-center gap-12 flex-wrap opacity-40">
              {logoCompanies.map((company) => (
                <span key={company} className="text-xl font-semibold text-foreground">
                  {company}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
