import type { UXIssue } from "@/lib/types"
import { performProfessionalAudit } from "./professional-ux-audit"

interface AnalysisContext {
  imageData: ImageData
  width: number
  height: number
  screenshotId: string
}

/**
 * Analyze screenshot using professional UX audit based on:
 * - Nielsen Heuristics
 * - WCAG 2.2 AA accessibility rules
 * - Visual hierarchy (contrast, typography, spacing)
 * - Cognitive load principles (Hick's Law, Miller's Law, Gestalt)
 * - Component consistency and interaction logic
 */
export async function analyzeScreenshot(file: File, screenshotId: string): Promise<UXIssue[]> {
  try {
    // Use professional audit instead of basic mock analysis
    const auditResult = await performProfessionalAudit(file)

    // Map issue types to categories
    const getCategory = (type: string): "visual" | "accessibility" | "logic" => {
      // Visual = spacing, alignment, hierarchy, readability, layout structure
      if (["spacing", "alignment", "hierarchy", "consistency", "cognitive_load"].includes(type)) {
        return "visual"
      }
      // Accessibility = contrast, tap targets, font size, WCAG issues
      if (["contrast", "accessibility"].includes(type)) {
        return "accessibility"
      }
      // Logic = misleading labels, unclear indicators, ambiguous meaning, incorrect UX patterns
      return "logic"
    }

    // Convert professional audit format to UXIssue format
    const issues: UXIssue[] = auditResult.issues.map((issue) => {
      // Convert severity 0-4 to critical/major/minor
      let severity: "critical" | "major" | "minor" = "minor"
      if (issue.severity >= 4) severity = "critical"
      else if (issue.severity >= 2) severity = "major"

      // Convert bounding box [x1, y1, x2, y2] to center point {x, y}
      const centerX = Math.floor((issue.coordinates[0] + issue.coordinates[2]) / 2)
      const centerY = Math.floor((issue.coordinates[1] + issue.coordinates[3]) / 2)

      return {
        id: issue.id,
        screenshotId,
        problem: issue.description,
        cause: getCauseFromType(issue.type, issue.description),
        fix: issue.recommendation,
        severity,
        category: getCategory(issue.type),
        coordinates: { x: centerX, y: centerY },
      }
    })

    // If no issues found, provide positive feedback
    if (issues.length === 0) {
      issues.push({
        id: `${screenshotId}-no-issues`,
        screenshotId,
        problem: "No critical UX issues detected",
        cause: "The screen follows WCAG 2.2 AA standards and UX best practices",
        fix: "Continue following accessibility guidelines and consider user testing for edge cases",
        severity: "minor",
        category: "visual",
        coordinates: { x: 0, y: 0 },
      })
    }

    return issues
  } catch (error) {
    console.error("Professional audit error, falling back to basic analysis:", error)
    // Fallback to basic analysis if professional audit fails
    return analyzeBasicFallback(file, screenshotId)
  }
}

function getCauseFromType(
  type: "contrast" | "spacing" | "alignment" | "hierarchy" | "accessibility" | "cognitive_load" | "consistency",
  description: string,
): string {
  const causes: Record<string, string> = {
    contrast: "WCAG 2.2 AA (1.4.3) requires minimum 4.5:1 contrast ratio for normal text",
    spacing: "Gestalt Principle of Proximity: Inconsistent spacing breaks visual grouping",
    alignment: "Gestalt Principle of Continuity: Misalignment disrupts visual flow",
    hierarchy: "Insufficient visual hierarchy makes it difficult to distinguish importance levels",
    accessibility: "WCAG 2.2 AA accessibility requirement not met",
    cognitive_load: "Miller's Law: Too many elements exceed the 7±2 cognitive limit",
    consistency: "Nielsen Heuristic #4: Inconsistent design patterns violate user expectations",
  }
  return causes[type] || description
}

// Fallback basic analysis if professional audit fails
async function analyzeBasicFallback(file: File, screenshotId: string): Promise<UXIssue[]> {
  const issues: UXIssue[] = []
  const ctx = await getImageContext(file)
  if (!ctx) return generateFallbackIssues(screenshotId, 375, 812)

  const { imageData, width, height } = ctx
  const contextWithId = { ...ctx, screenshotId }

  // Run all analysis checks
  const contrastIssues = analyzeContrast(contextWithId, screenshotId)
  const spacingIssues = analyzeSpacing(contextWithId, screenshotId)
  const touchTargetIssues = analyzeTouchTargets(contextWithId, screenshotId)
  const alignmentIssues = analyzeAlignment(contextWithId, screenshotId)
  const densityIssues = analyzeContentDensity(contextWithId, screenshotId)

  issues.push(...contrastIssues, ...spacingIssues, ...touchTargetIssues, ...alignmentIssues, ...densityIssues)

  if (issues.length === 0) {
    issues.push({
      id: `${screenshotId}-no-issues`,
      screenshotId,
      problem: "No critical UX issues detected",
      cause: "The screen follows basic UX principles",
      fix: "Consider user testing to identify edge cases",
      severity: "minor",
      category: "visual",
      coordinates: { x: Math.floor(width / 2), y: Math.floor(height / 2) },
    })
  }

  return issues
}

async function getImageContext(file: File): Promise<AnalysisContext | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          resolve(null)
          return
        }

        // Scale down for faster analysis
        const maxSize = 400
        const scale = Math.min(maxSize / img.width, maxSize / img.height, 1)
        canvas.width = img.width * scale
        canvas.height = img.height * scale

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        resolve({
          imageData,
          width: img.naturalWidth,
          height: img.naturalHeight,
          screenshotId: "",
        })
      } catch {
        resolve(null)
      }
      URL.revokeObjectURL(img.src)
    }
    img.onerror = () => {
      resolve(null)
    }
    img.src = URL.createObjectURL(file)
  })
}

// Analyze color contrast for text readability
function analyzeContrast(ctx: AnalysisContext, screenshotId: string): UXIssue[] {
  const issues: UXIssue[] = []
  const { imageData, width, height } = ctx
  const data = imageData.data

  // Sample regions and check for low contrast
  const regions = sampleRegions(imageData.width, imageData.height, 9)

  for (const region of regions) {
    const colors = getRegionColors(data, imageData.width, region)
    const contrast = calculateContrastRatio(colors)

    if (contrast < 3) {
      // Scale coordinates back to original image size
      const scaleX = width / imageData.width
      const scaleY = height / imageData.height

      issues.push({
        id: `${screenshotId}-contrast-${region.x}-${region.y}`,
        screenshotId,
        problem: "Low contrast detected in this area",
        cause: `Contrast ratio is approximately ${contrast.toFixed(1)}:1, below WCAG AA requirement of 4.5:1`,
        fix: "Increase contrast between text and background colors to at least 4.5:1 for normal text",
        severity: contrast < 2 ? "critical" : "major",
        category: "accessibility",
        coordinates: {
          x: Math.floor(region.x * scaleX + (region.size * scaleX) / 2),
          y: Math.floor(region.y * scaleY + (region.size * scaleY) / 2),
        },
      })
    }
  }

  return issues.slice(0, 2) // Limit to 2 contrast issues
}

// Analyze spacing consistency
function analyzeSpacing(ctx: AnalysisContext, screenshotId: string): UXIssue[] {
  const issues: UXIssue[] = []
  const { imageData, width, height } = ctx

  // Detect edges to find element boundaries
  const edges = detectEdges(imageData)
  const gaps = findGaps(edges, imageData.width, imageData.height)

  // Check for inconsistent gaps
  if (gaps.length > 3) {
    const avgGap = gaps.reduce((a, b) => a + b.size, 0) / gaps.length
    const inconsistent = gaps.filter((g) => Math.abs(g.size - avgGap) > avgGap * 0.5)

    if (inconsistent.length > 0) {
      const scaleX = width / imageData.width
      const scaleY = height / imageData.height
      const first = inconsistent[0]

      issues.push({
        id: `${screenshotId}-spacing-${first.x}-${first.y}`,
        screenshotId,
        problem: "Inconsistent spacing detected",
        cause: "Spacing values vary significantly across the layout",
        fix: "Apply consistent spacing using an 8px grid system (8, 16, 24, 32px)",
        severity: "major",
        category: "visual",
        coordinates: {
          x: Math.floor(first.x * scaleX),
          y: Math.floor(first.y * scaleY),
        },
      })
    }
  }

  return issues
}

// Analyze touch target sizes
function analyzeTouchTargets(ctx: AnalysisContext, screenshotId: string): UXIssue[] {
  const issues: UXIssue[] = []
  const { imageData, width, height } = ctx

  // Detect potential buttons/interactive elements by color clustering
  const clusters = findColorClusters(imageData)
  const scaleX = width / imageData.width
  const scaleY = height / imageData.height

  for (const cluster of clusters) {
    // Estimate touch target size in original dimensions
    const targetWidth = cluster.width * scaleX
    const targetHeight = cluster.height * scaleY

    if (targetWidth < 44 || targetHeight < 44) {
      issues.push({
        id: `${screenshotId}-touch-${cluster.x}-${cluster.y}`,
        screenshotId,
        problem: "Potential touch target too small",
        cause: `Estimated size ${Math.round(targetWidth)}x${Math.round(targetHeight)}px is below 44x44px minimum`,
        fix: "Increase touch target to at least 44x44 pixels for better accessibility",
        severity: "major",
        category: "accessibility",
        coordinates: {
          x: Math.floor(cluster.x * scaleX),
          y: Math.floor(cluster.y * scaleY),
        },
      })
    }
  }

  return issues.slice(0, 2) // Limit to 2 touch target issues
}

// Analyze visual alignment
function analyzeAlignment(ctx: AnalysisContext, screenshotId: string): UXIssue[] {
  const issues: UXIssue[] = []
  const { imageData, width, height } = ctx

  // Check for centered content that's slightly off-center
  const centerX = imageData.width / 2
  const edges = detectVerticalEdges(imageData)

  const nearCenter = edges.filter((e) => Math.abs(e.x - centerX) < centerX * 0.1 && Math.abs(e.x - centerX) > 5)

  if (nearCenter.length > 2) {
    const scaleX = width / imageData.width
    const scaleY = height / imageData.height
    const first = nearCenter[0]

    issues.push({
      id: `${screenshotId}-align-${first.x}`,
      screenshotId,
      problem: "Elements appear slightly misaligned",
      cause: "Content near center is offset by a few pixels",
      fix: "Use proper centering techniques (flexbox justify-center, margin auto)",
      severity: "minor",
      category: "visual",
      coordinates: {
        x: Math.floor(first.x * scaleX),
        y: Math.floor(first.y * scaleY),
      },
    })
  }

  return issues
}

// Analyze content density
function analyzeContentDensity(ctx: AnalysisContext, screenshotId: string): UXIssue[] {
  const issues: UXIssue[] = []
  const { imageData, width, height } = ctx
  const data = imageData.data

  // Calculate "busyness" by counting color transitions
  let transitions = 0
  const sampleStep = 4

  for (let y = 0; y < imageData.height; y += sampleStep) {
    for (let x = 1; x < imageData.width; x += sampleStep) {
      const i = (y * imageData.width + x) * 4
      const iPrev = (y * imageData.width + x - 1) * 4

      const diff =
        Math.abs(data[i] - data[iPrev]) +
        Math.abs(data[i + 1] - data[iPrev + 1]) +
        Math.abs(data[i + 2] - data[iPrev + 2])

      if (diff > 50) transitions++
    }
  }

  const density = transitions / ((imageData.width / sampleStep) * (imageData.height / sampleStep))

  if (density > 0.4) {
    issues.push({
      id: `${screenshotId}-density`,
      screenshotId,
      problem: "High visual density detected",
      cause: "Screen contains many elements competing for attention",
      fix: "Increase whitespace, group related elements, reduce cognitive load",
      severity: "major",
      category: "visual",
      coordinates: { x: Math.floor(width / 2), y: Math.floor(height / 3) },
    })
  }

  return issues
}

// Helper functions
function sampleRegions(width: number, height: number, count: number) {
  const regions: Array<{ x: number; y: number; size: number }> = []
  const cols = Math.ceil(Math.sqrt(count))
  const rows = Math.ceil(count / cols)
  const size = Math.min(width / cols, height / rows) * 0.6

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      regions.push({
        x: (col + 0.5) * (width / cols) - size / 2,
        y: (row + 0.5) * (height / rows) - size / 2,
        size,
      })
    }
  }

  return regions
}

function getRegionColors(data: Uint8ClampedArray, width: number, region: { x: number; y: number; size: number }) {
  const colors: Array<{ r: number; g: number; b: number }> = []
  const step = Math.max(1, Math.floor(region.size / 10))

  for (let dy = 0; dy < region.size; dy += step) {
    for (let dx = 0; dx < region.size; dx += step) {
      const x = Math.floor(region.x + dx)
      const y = Math.floor(region.y + dy)
      const i = (y * width + x) * 4

      if (i >= 0 && i < data.length - 2) {
        colors.push({ r: data[i], g: data[i + 1], b: data[i + 2] })
      }
    }
  }

  return colors
}

function calculateContrastRatio(colors: Array<{ r: number; g: number; b: number }>) {
  if (colors.length < 2) return 21 // Max contrast if not enough data

  // Find lightest and darkest colors
  const luminances = colors.map((c) => {
    const rs = c.r / 255,
      gs = c.g / 255,
      bs = c.b / 255
    const r = rs <= 0.03928 ? rs / 12.92 : Math.pow((rs + 0.055) / 1.055, 2.4)
    const g = gs <= 0.03928 ? gs / 12.92 : Math.pow((gs + 0.055) / 1.055, 2.4)
    const b = bs <= 0.03928 ? bs / 12.92 : Math.pow((bs + 0.055) / 1.055, 2.4)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  })

  const maxL = Math.max(...luminances)
  const minL = Math.min(...luminances)

  return (maxL + 0.05) / (minL + 0.05)
}

function detectEdges(imageData: ImageData) {
  const edges: Array<{ x: number; y: number; strength: number }> = []
  const { data, width, height } = imageData
  const step = 4

  for (let y = 1; y < height - 1; y += step) {
    for (let x = 1; x < width - 1; x += step) {
      const i = (y * width + x) * 4
      const iLeft = (y * width + x - 1) * 4
      const iTop = ((y - 1) * width + x) * 4

      const gx = Math.abs(data[i] - data[iLeft])
      const gy = Math.abs(data[i] - data[iTop])
      const strength = gx + gy

      if (strength > 30) {
        edges.push({ x, y, strength })
      }
    }
  }

  return edges
}

function findGaps(edges: Array<{ x: number; y: number; strength: number }>, width: number, height: number) {
  const gaps: Array<{ x: number; y: number; size: number }> = []

  // Group edges by rows and find gaps between them
  const rows = new Map<number, number[]>()
  for (const edge of edges) {
    const rowKey = Math.floor(edge.y / 10) * 10
    if (!rows.has(rowKey)) rows.set(rowKey, [])
    rows.get(rowKey)!.push(edge.x)
  }

  for (const [y, xPositions] of rows) {
    const sorted = [...new Set(xPositions)].sort((a, b) => a - b)
    for (let i = 1; i < sorted.length; i++) {
      const gap = sorted[i] - sorted[i - 1]
      if (gap > 10 && gap < width / 2) {
        gaps.push({ x: sorted[i - 1], y, size: gap })
      }
    }
  }

  return gaps
}

function findColorClusters(imageData: ImageData) {
  const clusters: Array<{ x: number; y: number; width: number; height: number }> = []
  const { data, width, height } = imageData

  // Find distinct colored regions that might be buttons
  const visited = new Set<string>()
  const step = 8

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const key = `${x},${y}`
      if (visited.has(key)) continue

      const i = (y * width + x) * 4
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2]

      // Check if this looks like a button color (saturated, not too dark/light)
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      const saturation = max > 0 ? (max - min) / max : 0
      const brightness = (r + g + b) / 3

      if (saturation > 0.3 && brightness > 50 && brightness < 220) {
        // Found a potential button - estimate its size
        let w = step,
          h = step

        // Expand right
        for (let dx = step; x + dx < width; dx += step) {
          const ni = (y * width + x + dx) * 4
          if (Math.abs(data[ni] - r) + Math.abs(data[ni + 1] - g) + Math.abs(data[ni + 2] - b) < 50) {
            w = dx + step
            visited.add(`${x + dx},${y}`)
          } else break
        }

        // Expand down
        for (let dy = step; y + dy < height; dy += step) {
          const ni = ((y + dy) * width + x) * 4
          if (Math.abs(data[ni] - r) + Math.abs(data[ni + 1] - g) + Math.abs(data[ni + 2] - b) < 50) {
            h = dy + step
          } else break
        }

        if (w > 15 && h > 10 && w < 200 && h < 100) {
          clusters.push({ x, y, width: w, height: h })
        }
      }

      visited.add(key)
    }
  }

  return clusters.slice(0, 5)
}

function detectVerticalEdges(imageData: ImageData) {
  const edges: Array<{ x: number; y: number }> = []
  const { data, width, height } = imageData
  const step = 4

  for (let x = 1; x < width - 1; x += step) {
    for (let y = 0; y < height; y += step * 2) {
      const i = (y * width + x) * 4
      const iLeft = (y * width + x - 1) * 4

      const diff =
        Math.abs(data[i] - data[iLeft]) +
        Math.abs(data[i + 1] - data[iLeft + 1]) +
        Math.abs(data[i + 2] - data[iLeft + 2])

      if (diff > 50) {
        edges.push({ x, y })
      }
    }
  }

  return edges
}

// Fallback issues if image analysis fails
function generateFallbackIssues(screenshotId: string, width: number, height: number): UXIssue[] {
  return [
    {
      id: `${screenshotId}-fallback-1`,
      screenshotId,
      problem: "Unable to analyze image automatically",
      cause: "Image format or loading prevented detailed analysis",
      fix: "Ensure image is a standard PNG or JPG format",
      severity: "minor",
      category: "visual",
      coordinates: { x: Math.floor(width / 2), y: Math.floor(height / 2) },
    },
  ]
}
