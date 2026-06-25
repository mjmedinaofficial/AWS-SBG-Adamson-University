---
inclusion: always
---

# 🎨 Design Token System

Anchor every decision to these tokens — no ad-hoc color or spacing values.

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg-deep` | `#0D0B1A` | Page base, darkest layer |
| `--color-bg-surface` | `#1A1530` | Card and section backgrounds |
| `--color-bg-elevated` | `#241D45` | Hover states, active cards |
| `--color-brand-purple` | `#5B3FD9` | Primary interactive color |
| `--color-accent-orange` | `#F5A623` | CTA buttons, highlight text only (use sparingly) |
| `--color-text-primary` | `#F0EEFF` | Headings |
| `--color-text-secondary` | `#A89FC5` | Body copy, labels |
| `--color-border-subtle` | `rgba(255,255,255,0.08)` | Card borders |

### Rules

- `--color-accent-orange` is for CTAs and highlights ONLY — never section backgrounds.
- No competing CTAs in the same visual section.

## Typography

| Role | Font | Notes |
|------|------|-------|
| Display / Headings | **Space Grotesk** | Bold, modern, technical without being cold |
| Body | **Inter** | Legible, neutral, pairs cleanly with Space Grotesk |
| Mono / Labels | **JetBrains Mono** | Use only for data labels, stats, tags like "PAST EVENT" |

### Rules

- No element should use more than 2 typefaces (Space Grotesk + Inter).
- JetBrains Mono is reserved for: stats, dates, labels, badges only.
- Base size: `16px`
- Type scale: `12 / 14 / 16 / 20 / 28 / 40 / 56px`

## Spacing

- Base unit: `4px` — all padding/margin in multiples of 4.

## Border Radius

| Element | Radius |
|---------|--------|
| Cards | `12px` |
| Buttons | `8px` |
| Pill badges / nav | `999px` |

## Component Constraints

- All cards: `border-radius: 12px`, `border: 1px solid rgba(255,255,255,0.08)`
- All profile images: `object-fit: cover`, `object-position: center top`
- The mascot character appears only in the hero, bottom-right, at max `80px`
- Mobile-first: all layouts collapse to single column at `<768px` breakpoint
