# UI Design Skill and Landing Page Redesign

**ADW ID:** N/A
**Date:** 2025-12-11
**Specification:** N/A

## Overview

Updated the UI design skill with clearer guidelines and completely redesigned the landing page with a distinctive, warm aesthetic featuring DM Sans and Cormorant Garamond typography, an orange accent color palette, sketch-style cards, and staggered reveal animations.

## What Was Built

- Restructured UI design skill with organized sections and clear anti-patterns
- New landing page with hero section, services grid, and CTA
- Custom typography system using DM Sans (body) and Cormorant Garamond (headings)
- Warm orange accent color scheme with light/dark mode support
- Sketch-style card component with hand-drawn border effect
- Dot grid background pattern with gradient overlays
- Staggered fade-in-up animations for page elements

## Technical Implementation

### Files Modified

- `.claude/skills/ui-design/SKILL.md`: Restructured skill file with frontmatter, organized sections for typography, color, motion, backgrounds, and explicit anti-patterns list
- `src/app/globals.css`: Added CSS custom properties, landing gradient styles, sketch-card component, animations, and hover effects
- `src/app/layout.tsx`: Replaced Geist fonts with DM Sans and Cormorant Garamond, updated metadata
- `src/app/page.tsx`: Complete redesign from redirect-only page to full landing page with navigation, hero, services grid, and footer

### Key Changes

- **Typography**: Introduced dual-font system with serif headings (Cormorant Garamond) and sans-serif body (DM Sans) for visual hierarchy
- **Color System**: Warm orange accent (`#e85d04`) with coordinated light/dark mode CSS variables
- **Background Effects**: Multi-layer radial gradients with dot grid pattern using CSS mask-image
- **Sketch Cards**: CSS-only hand-drawn effect using dashed borders and corner marks via pseudo-elements
- **Animation System**: CSS keyframes for fade-in-up with utility classes for staggered delays

## How to Use

1. View the landing page at the root URL (`/`)
2. The page showcases six service offerings in a responsive grid
3. Click "Book a consultation" or "Let's figure it out together" to navigate to scheduling
4. Client login link in header and footer for portal access

## Configuration

CSS variables in `globals.css` control the design system:

```css
:root {
  --background: #faf9f7;
  --accent: #e85d04;
  --accent-hover: #dc4c00;
  --muted: #6b6b6b;
  --border: #e5e3df;
  --surface: #ffffff;
  --sketch-line: rgba(0, 0, 0, 0.12);
  --dot-color: rgba(0, 0, 0, 0.12);
}
```

## Testing

1. Run `bun dev` to start the development server
2. Navigate to `http://localhost:3000`
3. Verify landing page renders with correct styling
4. Test dark mode by changing system preferences
5. Verify staggered animations play on page load
6. Test hover effects on service cards and buttons

## Notes

- The UI design skill now explicitly warns against Space Grotesk as an overused AI font choice
- Dark mode uses slightly adjusted orange tones (`#fb923c`) for better contrast
- The sketch-card effect is pure CSS with no images required
- Animation delays use 100ms increments (100ms to 500ms)
