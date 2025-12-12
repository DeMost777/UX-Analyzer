import type { AnalysisResult } from "./types"

interface ProfessionalIssue {
  id: string
  type: "contrast" | "spacing" | "alignment" | "hierarchy" | "accessibility" | "cognitive_load" | "consistency"
  severity: 0 | 1 | 2 | 3 | 4 // 0=minor, 1=low, 2=medium, 3=high, 4=critical
  coordinates: [number, number, number, number] // [x1, y1, x2, y2] bounding box
  description: string
  recommendation: string
}

interface ProfessionalAuditResult {
  issues: ProfessionalIssue[]
  scores: {
    accessibility: number // 0-100
    hierarchy: number // 0-100
    consistency: number // 0-100
    cognitive_load: number // 0-100
  }
}

interface AnalysisContext {
  imageData: ImageData
  width: number
  height: number
}

/**
 * Professional UX Audit based on:
 * - Nielsen Heuristics
 * - WCAG 2.2 AA accessibility rules
 * - Visual hierarchy (contrast, typography, spacing)
 * - Cognitive load principles (Hick's Law, Miller's Law, Gestalt)
 * - Component consistency and interaction logic
 */
export async function performProfessionalAudit(file: File): Promise<ProfessionalAuditResult> {
  console.log("Starting professional UX audit for file:", file.name)
  const ctx = await getImageContext(file)
  if (!ctx) {
    console.warn("Failed to get image context")
    return {
      issues: [],
      scores: { accessibility: 0, hierarchy: 0, consistency: 0, cognitive_load: 0 },
    }
  }

  console.log("Image context loaded, dimensions:", ctx.width, "x", ctx.height)
  const issues: ProfessionalIssue[] = []
  let accessibilityScore = 100
  let hierarchyScore = 100
  let consistencyScore = 100
  let cognitiveLoadScore = 100

  // 1. WCAG 2.2 AA - Contrast Analysis
  const contrastIssues = analyzeWCAGContrast(ctx)
  issues.push(...contrastIssues)
  accessibilityScore -= contrastIssues.length * 15
  hierarchyScore -= contrastIssues.length * 10

  // 2. WCAG 2.2 AA - Touch Target Sizes (2.5.5 Target Size)
  const touchTargetIssues = analyzeTouchTargetsWCAG(ctx)
  issues.push(...touchTargetIssues)
  accessibilityScore -= touchTargetIssues.length * 12

  // 3. Nielsen Heuristic #4 - Consistency and Standards
  const consistencyIssues = analyzeConsistency(ctx)
  issues.push(...consistencyIssues)
  consistencyScore -= consistencyIssues.length * 15

  // 4. Visual Hierarchy - Gestalt Principles (Proximity, Similarity)
  const hierarchyIssues = analyzeVisualHierarchy(ctx)
  issues.push(...hierarchyIssues)
  hierarchyScore -= hierarchyIssues.length * 12

  // 5. Spacing - Gestalt Principle of Proximity
  const spacingIssues = analyzeSpacingGestalt(ctx)
  issues.push(...spacingIssues)
  consistencyScore -= spacingIssues.length * 10
  cognitiveLoadScore -= spacingIssues.length * 8

  // 6. Cognitive Load - Miller's Law (7±2 items)
  const cognitiveLoadIssues = analyzeCognitiveLoad(ctx)
  issues.push(...cognitiveLoadIssues)
  cognitiveLoadScore -= cognitiveLoadIssues.length * 15

  // 7. Alignment - Gestalt Principle of Continuity
  const alignmentIssues = analyzeAlignment(ctx)
  issues.push(...alignmentIssues)
  hierarchyScore -= alignmentIssues.length * 8

  // Ensure scores don't go below 0
  accessibilityScore = Math.max(0, accessibilityScore)
  hierarchyScore = Math.max(0, hierarchyScore)
  consistencyScore = Math.max(0, consistencyScore)
  cognitiveLoadScore = Math.max(0, cognitiveLoadScore)

  return {
    issues,
    scores: {
      accessibility: Math.round(accessibilityScore),
      hierarchy: Math.round(hierarchyScore),
      consistency: Math.round(consistencyScore),
      cognitive_load: Math.round(cognitiveLoadScore),
    },
  }
}

// WCAG 2.2 AA - Contrast Ratio (1.4.3)
function analyzeWCAGContrast(ctx: AnalysisContext): ProfessionalIssue[] {
  const issues: ProfessionalIssue[] = []
  const { imageData, width, height } = ctx
  const data = imageData.data

  // Sample text-like regions
  const regions = sampleTextRegions(imageData.width, imageData.height, 12)

  for (const region of regions) {
    const colors = getRegionColors(data, imageData.width, region)
    const contrast = calculateContrastRatio(colors)

    // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
    if (contrast < 4.5) {
      const scaleX = width / imageData.width
      const scaleY = height / imageData.height
      const x1 = Math.floor(region.x * scaleX)
      const y1 = Math.floor(region.y * scaleY)
      const x2 = Math.floor((region.x + region.size) * scaleX)
      const y2 = Math.floor((region.y + region.size) * scaleY)

      const severity: 0 | 1 | 2 | 3 | 4 =
        contrast < 2 ? 4 : contrast < 3 ? 3 : contrast < 3.5 ? 2 : contrast < 4 ? 1 : 0

      issues.push({
        id: `wcag-contrast-${region.x}-${region.y}`,
        type: "contrast",
        severity,
        coordinates: [x1, y1, x2, y2],
        description: `WCAG 2.2 AA violation: Contrast ratio ${contrast.toFixed(1)}:1 is below required 4.5:1 for normal text`,
        recommendation: `Increase contrast to at least 4.5:1 (WCAG 2.2 AA). For large text (18pt+), minimum is 3:1. Use tools like WebAIM Contrast Checker to verify.`,
      })
    }
  }

  return issues.slice(0, 3) // Limit to 3 most critical
}

// WCAG 2.2 AA - Target Size (2.5.5)
function analyzeTouchTargetsWCAG(ctx: AnalysisContext): ProfessionalIssue[] {
  const issues: ProfessionalIssue[] = []
  const { imageData, width, height } = ctx

  const clusters = findInteractiveElements(imageData)
  const scaleX = width / imageData.width
  const scaleY = height / imageData.height

  for (const cluster of clusters) {
    const targetWidth = cluster.width * scaleX
    const targetHeight = cluster.height * scaleY

    // WCAG 2.5.5 requires at least 24x24 CSS pixels (44x44 physical pixels recommended)
    if (targetWidth < 44 || targetHeight < 44) {
      const x1 = Math.floor(cluster.x * scaleX)
      const y1 = Math.floor(cluster.y * scaleY)
      const x2 = Math.floor((cluster.x + cluster.width) * scaleX)
      const y2 = Math.floor((cluster.y + cluster.height) * scaleY)

      const severity: 0 | 1 | 2 | 3 | 4 = targetWidth < 24 || targetHeight < 24 ? 4 : 3

      issues.push({
        id: `wcag-target-${cluster.x}-${cluster.y}`,
        type: "accessibility",
        severity,
        coordinates: [x1, y1, x2, y2],
        description: `WCAG 2.2 AA violation (2.5.5): Touch target ${Math.round(targetWidth)}x${Math.round(targetHeight)}px is below 44x44px minimum`,
        recommendation: `Increase touch target to at least 44x44 pixels. WCAG 2.5.5 requires minimum 24x24 CSS pixels, but 44x44 provides better usability.`,
      })
    }
  }

  return issues.slice(0, 2)
}

// Nielsen Heuristic #4 - Consistency and Standards
function analyzeConsistency(ctx: AnalysisContext): ProfessionalIssue[] {
  const issues: ProfessionalIssue[] = []
  const { imageData, width, height } = ctx

  // Detect similar elements and check for inconsistent styling
  const elements = detectUIElements(imageData)
  const buttonStyles = groupByStyle(elements.filter((e) => e.type === "button"))
  const textStyles = groupByStyle(elements.filter((e) => e.type === "text"))

  // Check button consistency
  if (buttonStyles.size > 3) {
    const scaleX = width / imageData.width
    const scaleY = height / imageData.height
    const firstButton = elements.find((e) => e.type === "button")
    if (firstButton) {
      issues.push({
        id: `nielsen-consistency-buttons`,
        type: "consistency",
        severity: 2,
        coordinates: [
          Math.floor(firstButton.x * scaleX),
          Math.floor(firstButton.y * scaleY),
          Math.floor((firstButton.x + firstButton.width) * scaleX),
          Math.floor((firstButton.y + firstButton.height) * scaleY),
        ],
        description: `Nielsen Heuristic #4 violation: ${buttonStyles.size} different button styles detected, violating consistency principle`,
        recommendation: `Standardize button styles. Use a design system with consistent colors, sizes, and spacing. Follow platform conventions (Material Design, iOS HIG).`,
      })
    }
  }

  // Check text style consistency
  if (textStyles.size > 4) {
    const scaleX = width / imageData.width
    const scaleY = height / imageData.height
    const firstText = elements.find((e) => e.type === "text")
    if (firstText) {
      issues.push({
        id: `nielsen-consistency-text`,
        type: "consistency",
        severity: 1,
        coordinates: [
          Math.floor(firstText.x * scaleX),
          Math.floor(firstText.y * scaleY),
          Math.floor((firstText.x + firstText.width) * scaleX),
          Math.floor((firstText.y + firstText.height) * scaleY),
        ],
        description: `Nielsen Heuristic #4 violation: Too many text style variations (${textStyles.size}) create inconsistency`,
        recommendation: `Limit to 3-4 text styles (heading, subheading, body, caption). Use a typography scale (e.g., 12, 14, 16, 20, 24px) for consistency.`,
      })
    }
  }

  return issues
}

// Visual Hierarchy - Gestalt Principles
function analyzeVisualHierarchy(ctx: AnalysisContext): ProfessionalIssue[] {
  const issues: ProfessionalIssue[] = []
  const { imageData, width, height } = ctx

  // Analyze font sizes and weights to detect hierarchy issues
  const textElements = detectTextElements(imageData)
  const sizes = textElements.map((e) => e.size).sort((a, b) => b - a)

  // Check if hierarchy is clear (should have distinct size levels)
  const distinctSizes = new Set(sizes.map((s) => Math.round(s / 4) * 4)) // Round to 4px increments
  if (distinctSizes.size < 2 && sizes.length > 3) {
    const scaleX = width / imageData.width
    const scaleY = height / imageData.height
    const firstText = textElements[0]
    if (firstText) {
      issues.push({
        id: `hierarchy-size`,
        type: "hierarchy",
        severity: 2,
        coordinates: [
          Math.floor(firstText.x * scaleX),
          Math.floor(firstText.y * scaleY),
          Math.floor((firstText.x + firstText.width) * scaleX),
          Math.floor((firstText.y + firstText.height) * scaleY),
        ],
        description: `Gestalt Principle violation: Insufficient visual hierarchy. Text sizes are too similar, making it hard to distinguish importance`,
        recommendation: `Establish clear hierarchy using size contrast (e.g., 24px headings, 16px body, 12px captions). Use 1.5-2x size difference between levels.`,
      })
    }
  }

  return issues
}

// Spacing - Gestalt Principle of Proximity
function analyzeSpacingGestalt(ctx: AnalysisContext): ProfessionalIssue[] {
  const issues: ProfessionalIssue[] = []
  const { imageData, width, height } = ctx

  const edges = detectEdges(imageData)
  const gaps = findGaps(edges, imageData.width, imageData.height)

  if (gaps.length > 3) {
    const avgGap = gaps.reduce((a, b) => a + b.size, 0) / gaps.length
    const inconsistent = gaps.filter((g) => Math.abs(g.size - avgGap) > avgGap * 0.4)

    if (inconsistent.length > 2) {
      const scaleX = width / imageData.width
      const scaleY = height / imageData.height
      const first = inconsistent[0]

      issues.push({
        id: `gestalt-spacing-${first.x}-${first.y}`,
        type: "spacing",
        severity: 2,
        coordinates: [
          Math.floor(first.x * scaleX),
          Math.floor(first.y * scaleY),
          Math.floor((first.x + first.size) * scaleX),
          Math.floor((first.y + 20) * scaleY),
        ],
        description: `Gestalt Principle of Proximity violation: Inconsistent spacing (${inconsistent.length} variations) breaks visual grouping`,
        recommendation: `Apply consistent spacing using 8px grid system. Related items should be closer (8-16px), unrelated items further (24-32px). Use spacing scale: 4, 8, 12, 16, 24, 32, 48px.`,
      })
    }
  }

  return issues.slice(0, 1)
}

// Cognitive Load - Miller's Law (7±2 items)
function analyzeCognitiveLoad(ctx: AnalysisContext): ProfessionalIssue[] {
  const issues: ProfessionalIssue[] = []
  const { imageData, width, height } = ctx

  // Count distinct interactive elements
  const elements = detectUIElements(imageData)
  const interactiveCount = elements.filter((e) => e.type === "button" || e.type === "link").length

  // Miller's Law: humans can hold 7±2 items in working memory
  if (interactiveCount > 9) {
    issues.push({
      id: `cognitive-load-miller`,
      type: "cognitive_load",
      severity: 3,
      coordinates: [Math.floor(width * 0.1), Math.floor(height * 0.1), Math.floor(width * 0.9), Math.floor(height * 0.5)],
      description: `Miller's Law violation: ${interactiveCount} interactive elements exceed the 7±2 cognitive limit, increasing decision time`,
      recommendation: `Reduce to 5-7 primary actions. Group related items, use progressive disclosure, and prioritize actions by frequency. Apply Hick's Law: fewer choices = faster decisions.`,
    })
  }

  // Check for information density
  const density = calculateInformationDensity(imageData)
  if (density > 0.5) {
    issues.push({
      id: `cognitive-load-density`,
      type: "cognitive_load",
      severity: 2,
      coordinates: [Math.floor(width * 0.2), Math.floor(height * 0.2), Math.floor(width * 0.8), Math.floor(height * 0.8)],
      description: `High information density detected. Too many visual elements compete for attention, violating Gestalt Principle of Figure-Ground`,
      recommendation: `Increase whitespace, use visual grouping (cards, sections), and apply progressive disclosure. Follow 60-30-10 rule: 60% whitespace, 30% secondary, 10% accent.`,
    })
  }

  return issues
}

// Alignment - Gestalt Principle of Continuity
function analyzeAlignment(ctx: AnalysisContext): ProfessionalIssue[] {
  const issues: ProfessionalIssue[] = []
  const { imageData, width, height } = ctx

  const edges = detectVerticalEdges(imageData)
  const centerX = imageData.width / 2

  // Check for elements that should be aligned but aren't
  const nearCenter = edges.filter((e) => Math.abs(e.x - centerX) < centerX * 0.15 && Math.abs(e.x - centerX) > 3)

  if (nearCenter.length > 3) {
    const scaleX = width / imageData.width
    const scaleY = height / imageData.height
    const first = nearCenter[0]

    issues.push({
      id: `gestalt-alignment-${first.x}`,
      type: "alignment",
      severity: 1,
      coordinates: [
        Math.floor(first.x * scaleX - 10),
        Math.floor(first.y * scaleY),
        Math.floor(first.x * scaleX + 10),
        Math.floor((first.y + 100) * scaleY),
      ],
      description: `Gestalt Principle of Continuity violation: ${nearCenter.length} elements are near-center but misaligned, breaking visual flow`,
      recommendation: `Align elements to a consistent grid. Use 8px or 12px grid system. Center-aligned content should be perfectly centered (±1px tolerance).`,
    })
  }

  return issues
}

// Helper functions (reuse from existing analyzer)
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
        })
      } catch {
        resolve(null)
      }
      URL.revokeObjectURL(img.src)
    }
    img.onerror = () => resolve(null)
    img.src = URL.createObjectURL(file)
  })
}

function sampleTextRegions(width: number, height: number, count: number) {
  const regions: Array<{ x: number; y: number; size: number }> = []
  const cols = Math.ceil(Math.sqrt(count))
  const rows = Math.ceil(count / cols)
  const size = Math.min(width / cols, height / rows) * 0.5

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
  if (colors.length < 2) return 21

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

function findInteractiveElements(imageData: ImageData) {
  // Reuse from existing analyzer
  return findColorClusters(imageData)
}

function findColorClusters(imageData: ImageData) {
  const clusters: Array<{ x: number; y: number; width: number; height: number }> = []
  const { data, width, height } = imageData
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

      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      const saturation = max > 0 ? (max - min) / max : 0
      const brightness = (r + g + b) / 3

      if (saturation > 0.3 && brightness > 50 && brightness < 220) {
        let w = step,
          h = step

        for (let dx = step; x + dx < width; dx += step) {
          const ni = (y * width + x + dx) * 4
          if (Math.abs(data[ni] - r) + Math.abs(data[ni + 1] - g) + Math.abs(data[ni + 2] - b) < 50) {
            w = dx + step
            visited.add(`${x + dx},${y}`)
          } else break
        }

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

  return clusters.slice(0, 10)
}

function detectUIElements(imageData: ImageData) {
  // Simplified detection - in real implementation, use ML or more sophisticated algorithms
  const clusters = findColorClusters(imageData)
  return clusters.map((c) => ({
    ...c,
    type: c.width > 60 && c.height > 30 ? "button" : "text",
  }))
}

function groupByStyle(elements: Array<{ width: number; height: number; x: number; y: number }>) {
  const groups = new Map<string, number>()
  for (const el of elements) {
    const key = `${Math.round(el.width / 5) * 5}-${Math.round(el.height / 5) * 5}`
    groups.set(key, (groups.get(key) || 0) + 1)
  }
  return groups
}

function detectTextElements(imageData: ImageData) {
  // Simplified - detect regions with high edge density (likely text)
  const edges = detectEdges(imageData)
  const textRegions: Array<{ x: number; y: number; width: number; height: number; size: number }> = []

  // Group edges into potential text blocks
  const rows = new Map<number, number[]>()
  for (const edge of edges) {
    const rowKey = Math.floor(edge.y / 10) * 10
    if (!rows.has(rowKey)) rows.set(rowKey, [])
    rows.get(rowKey)!.push(edge.x)
  }

  rows.forEach((xPositions, y) => {
    if (xPositions.length > 3) {
      const sorted = Array.from(new Set(xPositions)).sort((a, b) => a - b)
      const width = sorted[sorted.length - 1] - sorted[0]
      if (width > 20) {
        textRegions.push({
          x: sorted[0],
          y,
          width,
          height: 20,
          size: width / 10, // Estimate font size
        })
      }
    }
  })

  return textRegions.slice(0, 10)
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
  const rows = new Map<number, number[]>()

  for (const edge of edges) {
    const rowKey = Math.floor(edge.y / 10) * 10
    if (!rows.has(rowKey)) rows.set(rowKey, [])
    rows.get(rowKey)!.push(edge.x)
  }

  rows.forEach((xPositions, y) => {
    const sorted = Array.from(new Set(xPositions)).sort((a, b) => a - b)
    for (let i = 1; i < sorted.length; i++) {
      const gap = sorted[i] - sorted[i - 1]
      if (gap > 10 && gap < width / 2) {
        gaps.push({ x: sorted[i - 1], y, size: gap })
      }
    }
  })

  return gaps
}

function calculateInformationDensity(imageData: ImageData) {
  const { data, width, height } = imageData
  let transitions = 0
  const sampleStep = 4

  for (let y = 0; y < height; y += sampleStep) {
    for (let x = 1; x < width; x += sampleStep) {
      const i = (y * width + x) * 4
      const iPrev = (y * width + x - 1) * 4

      const diff =
        Math.abs(data[i] - data[iPrev]) +
        Math.abs(data[i + 1] - data[iPrev + 1]) +
        Math.abs(data[i + 2] - data[iPrev + 2])

      if (diff > 50) transitions++
    }
  }

  return transitions / ((width / sampleStep) * (height / sampleStep))
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

