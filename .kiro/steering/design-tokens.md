---
inclusion: always
---

# 🎨 Design Token System (v2)

Anchor every decision to these tokens — no ad-hoc color or spacing values.

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg-deep` | `#0B0918` | Darkest layer, page base |
| `--color-bg-dark` | `#110E21` | Section alternate background |
| `--color-bg-surface` | `#1A1535` | Cards, elevated areas |
| `--color-bg-elevated` | `#241D45` | Hover states, active cards |
| `--color-brand-purple` | `#5B3FD9` | Primary interactive color |
| `--color-accent-orange` | `#F5A623` | CTA buttons, highlight text only |
| `--color-accent-glow` | `rgba(91,63,217,0.15)` | Subtle glow effects |
| `--color-text-primary` | `#F0EEFF` | Headings, primary text |
| `--color-text-secondary` | `#A89FC5` | Body copy, labels |
| `--color-text-muted` | `#6B6488` | Tertiary, captions |
| `--color-border-subtle` | `rgba(255,255,255,0.07)` | Card borders, dividers |
| `--color-border-active` | `rgba(255,255,255,0.15)` | Hover/active borders |

### Rules

- `--color-accent-orange` is for CTAs and highlights ONLY — never section backgrounds.
- No competing CTAs in the same visual section.
- No section should have the same background as the one before it — alternate between `--color-bg-deep` and `--color-bg-dark` minimum.

## Typography

| Role | Font | Variable |
|------|------|----------|
| Display / Headings | **Space Grotesk** | `--font-display` |
| Body | **Inter** | `--font-body` |
| Mono / Labels | **JetBrains Mono** | `--font-mono` |

### Rules

- No element should use more than 2 typefaces (Space Grotesk + Inter).
- JetBrains Mono is reserved for: stats, dates, labels, badges only.
- Type scale (all using `clamp()`):
  - `--text-xs`: 11–12px
  - `--text-sm`: 13–14px
  - `--text-base`: 14–16px
  - `--text-lg`: 16–20px
  - `--text-xl`: 20–28px
  - `--text-2xl`: 28–40px
  - `--text-3xl`: 36–56px
  - `--text-hero`: 32–64px

## Spacing

- Base unit: `4px` — all padding/margin in multiples of 4.
- Scale: 4 / 8 / 16 / 24 / 40 / 64 / 96px

## Border Radius

| Element | Radius | Variable |
|---------|--------|----------|
| Buttons, tags | `8px` | `--radius-sm` |
| Cards | `12px` | `--radius-md` |
| Large containers | `20px` | `--radius-lg` |
| Pills, badges, nav | `999px` | `--radius-pill` |

## Section Padding

| Breakpoint | Vertical | Horizontal |
|-----------|----------|------------|
| Desktop (>1024px) | 96px | 80px |
| Tablet (768–1024px) | 64px | 40px |
| Mobile (<768px) | 48px | 20px |

## Component Constraints

- All cards: `border-radius: 12px`, `border: 1px solid rgba(255,255,255,0.07)`
- All profile images: `object-fit: cover`, `object-position: center top`
- The mascot character: position fixed, bottom-right. Desktop 72px, tablet 56px, mobile 44px. z-index: 50, pointer-events: none.
- Mobile-first: all layouts collapse to single column at `<768px` breakpoint
- All interactive elements: `transition: 0.2s ease`
- Touch targets: minimum 44x44px on mobile
- The floating gear/cog cursor: REMOVED from all pages
- Transitions: all interactive elements 0.2s ease
