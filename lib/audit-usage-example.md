# Professional UX Audit - Usage

## API Endpoint

POST `/api/audit`

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (image file)

**Response:**
```json
{
  "issues": [
    {
      "id": "wcag-contrast-100-50",
      "type": "contrast",
      "severity": 4,
      "coordinates": [120, 80, 250, 120],
      "description": "WCAG 2.2 AA violation: Contrast ratio 2.3:1 is below required 4.5:1 for normal text",
      "recommendation": "Increase contrast to at least 4.5:1 (WCAG 2.2 AA)..."
    }
  ],
  "scores": {
    "accessibility": 75,
    "hierarchy": 82,
    "consistency": 88,
    "cognitive_load": 70
  }
}
```

## Usage in Code

```typescript
import { performProfessionalAudit } from "@/lib/professional-ux-audit"

const file = // your image file
const result = await performProfessionalAudit(file)
console.log(JSON.stringify(result, null, 2))
```

## Analysis Criteria

1. **WCAG 2.2 AA Compliance**
   - Contrast ratio (1.4.3): Minimum 4.5:1 for normal text
   - Target size (2.5.5): Minimum 44x44px for touch targets

2. **Nielsen Heuristics**
   - #4: Consistency and Standards
   - Detects inconsistent button/text styles

3. **Gestalt Principles**
   - Proximity: Spacing consistency
   - Similarity: Visual grouping
   - Continuity: Alignment

4. **Cognitive Load**
   - Miller's Law: 7±2 items limit
   - Information density analysis

5. **Visual Hierarchy**
   - Font size contrast
   - Typography scale

## Severity Levels

- 0: Minor (cosmetic)
- 1: Low (nice to fix)
- 2: Medium (should fix)
- 3: High (must fix soon)
- 4: Critical (blocking)

