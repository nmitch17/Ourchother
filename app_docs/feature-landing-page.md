# Landing Page for Ourchother

**ADW ID:** N/A
**Date:** 2025-12-11
**Specification:** N/A

## Overview

A beautiful, organic-themed landing page for Ourchother, an AI-native agency. The page features an earth-tone color palette with fertile green accents, custom SVG illustrations, Clarity line icons, and animated service cards with organic blob shapes. The design evokes growth, nurturing, and natural abundance.

## What Was Built

- Full-page landing page at root route (`/`)
- Custom organic color system (soil browns, sand tans, leaf greens)
- Animated SVG plant illustrations
- Service cards with two-tone backgrounds and organic blob decorations
- Gradient text headline transitioning from brown to green
- Fixed navigation with frosted glass effect
- Hero section with CTA buttons
- Services section with 6 service offerings
- About section explaining the brand story
- Contact CTA section
- Footer with navigation links

## Technical Implementation

### Files Modified

- `src/app/page.tsx`: Complete landing page implementation (~525 lines)
- `src/app/layout.tsx`: Updated fonts (Cormorant Garamond + DM Sans) and metadata
- `src/app/globals.css`: Added organic color system and CSS animations
- `package.json`: Added `@iconify/react` dependency

### Key Changes

- **Color System**: Custom Tailwind v4 theme with 18 organic colors (soil-deep through morning-dew)
- **Typography**: Replaced default Geist fonts with Cormorant Garamond (display) and DM Sans (body)
- **Icons**: Integrated Iconify React with Clarity line icons (lightbulb-line, code-line, users-line, heart-line, etc.)
- **SVG Components**: Custom `GrowingPlant`, `SoilWave`, and `OrganicBlob` components
- **Animations**: CSS keyframe animations for grow-in, fade-up, sway effects

## How to Use

1. Navigate to `http://localhost:3002/` to view the landing page
2. Click "Explore Our Services" to scroll to services section
3. Click "Our Story" to scroll to about section
4. Click "Client Portal" to access admin dashboard
5. Click "Get in Touch" to open email client

## Configuration

### Color Palette

The color system is defined in both `globals.css` (CSS variables) and `page.tsx` (JS constants):

```typescript
const colors = {
  soilDeep: '#2c2416',    // Darkest brown
  soilRich: '#3d3222',
  soilWarm: '#5c4a32',
  soilLight: '#7a6548',
  sandDeep: '#a8916f',
  sandWarm: '#c4a882',
  sandLight: '#ddc9a3',
  sandPale: '#f0e6d3',
  sandCream: '#faf6ef',   // Lightest tan/cream
  leafDeep: '#2d4a2a',    // Darkest green
  leafRich: '#3d6439',
  leafVibrant: '#4d7c48',
  leafFresh: '#6b9b5d',
  leafYoung: '#8ab878',
  leafTender: '#b8d4a8',  // Lightest green
  growthGold: '#d4a855',
  sunlight: '#e8c97a',
  morningDew: '#c8e0c4',
}
```

### Service Cards

Each service card accepts:
- `title`: Service name
- `description`: Service description
- `icon`: Clarity icon name (e.g., "clarity:lightbulb-line")
- `blobVariant`: 1-6 for different organic blob shapes
- `accentColor`: Color for icon background and blob
- `bgColor`: Card background color (alternating sandCream/sandPale)

## Testing

1. Start dev server: `PORT=3002 bun dev`
2. Open `http://localhost:3002/`
3. Verify:
   - Gradient headline displays correctly (brown to green)
   - Plants animate with gentle sway
   - Service cards have visible organic blobs
   - Icons load from Iconify CDN
   - Navigation links work
   - Responsive on mobile

## Notes

- The page uses `'use client'` directive for Iconify icons
- Inline styles used for colors to ensure Tailwind v4 compatibility
- Organic blobs are SVG paths generated from a blob generator
- The gradient headline uses `background-clip: text` for the color effect
