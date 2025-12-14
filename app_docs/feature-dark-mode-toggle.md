# Dark Mode Toggle

**ADW ID:** N/A
**Date:** 2025-12-12
**Specification:** N/A

## Overview

A light/dark mode toggle system with three modes: light, dark, and system (follows OS preference). The feature includes a React context provider for global theme management, a toggle component with visual icons, and CSS variables that update based on the selected theme. Theme preference persists across sessions via localStorage.

This feature also includes a proxy/middleware update to ensure non-admin routes are publicly accessible without authentication redirects.

## What Was Built

- **ThemeProvider context** - Global React context for managing theme state
- **ThemeToggle component** - Clickable button that cycles through light/dark/system modes
- **Class-based dark mode CSS** - `:root.dark` selector in addition to media query fallback
- **Landing page navigation** - Client component with integrated toggle
- **Admin sidebar integration** - Theme toggle in the sidebar footer
- **Proxy update** - Only `/dashboard` routes are protected; all other routes are public

## Technical Implementation

### Files Created

- `src/components/theme-provider.tsx`: React context provider with localStorage persistence
- `src/components/ui/theme-toggle.tsx`: Toggle button with sun/moon/monitor icons
- `src/components/landing-nav.tsx`: Client navigation component for landing page

### Files Modified

- `src/app/globals.css`: Added `:root.dark` class-based dark mode (lines 33-46)
- `src/app/layout.tsx`: Wrapped app with ThemeProvider, added `suppressHydrationWarning`
- `src/app/page.tsx`: Uses new `LandingNav` component
- `src/components/admin/sidebar.tsx`: Added theme toggle in bottom section
- `src/proxy.ts`: Changed from whitelist (public routes) to blacklist (protected routes) approach

### Key Changes

- **Three-mode system**: Users can choose light, dark, or follow system preference
- **Class-based theming**: Dark mode applies via `.dark` class on `<html>` element, enabling manual override of system preference
- **Safe SSR handling**: `useTheme` hook returns safe defaults when context is undefined (prevents SSR errors)
- **localStorage persistence**: Theme preference saved and restored on page load
- **System preference listener**: When in "system" mode, theme updates automatically when OS preference changes
- **Proxy protection model**: Only `/dashboard` routes require authentication; home page (`/`), `/schedule`, `/project/*`, `/onboard/*`, etc. are publicly accessible

## How to Use

1. **Landing page**: Click the icon next to "Client login" in the top navigation
2. **Admin dashboard**: Find the theme toggle in the sidebar at the bottom, above the logout button
3. **Cycling modes**: Click the button to cycle through:
   - Sun icon = Light mode
   - Moon icon = Dark mode
   - Monitor icon = System mode (follows OS preference)

## Configuration

No configuration required. The feature uses:
- `localStorage.getItem('theme')` / `localStorage.setItem('theme', ...)` for persistence
- CSS custom properties defined in `globals.css` for colors
- `window.matchMedia('(prefers-color-scheme: dark)')` for system preference detection

## CSS Variables

The theme system updates these CSS custom properties:

| Variable | Light | Dark |
|----------|-------|------|
| `--background` | `#faf9f7` | `#0f0f0f` |
| `--foreground` | `#1a1a1a` | `#f5f5f4` |
| `--accent` | `#e85d04` | `#fb923c` |
| `--accent-hover` | `#dc4c00` | `#f97316` |
| `--accent-light` | `#fff4ed` | `#1c1917` |
| `--muted` | `#6b6b6b` | `#a1a1aa` |
| `--border` | `#f0ebe1` | `#27272a` |
| `--surface` | `#fffefd` | `#18181b` |

## Testing

1. Open the app at `http://localhost:3002`
2. Click the theme toggle to cycle through modes
3. Verify colors change appropriately for each mode
4. Refresh the page and confirm the theme persists
5. Change OS dark mode preference while in "system" mode to verify live updates

## Notes

- The theme toggle uses Heroicons-style SVG icons (sun, moon, monitor)
- The `suppressHydrationWarning` attribute on `<html>` prevents React hydration warnings when theme class is applied client-side
- System mode is the default when no preference is saved
