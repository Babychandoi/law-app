---
name: Luật Poip Legal
description: Bright, friendly legal guidance that turns uncertainty into consultation.
colors:
  ink: "#1b2a3a"
  muted: "#4b5b6b"
  primary: "#0f766e"
  primary-dark: "#115e59"
  accent: "#f5b32d"
  accent-soft: "#fff1cc"
  line: "#d8e6e1"
  surface: "#f1f8f6"
  white: "#ffffff"
typography:
  display: {fontFamily: "Be Vietnam Pro, system-ui, sans-serif", fontSize: "clamp(2.25rem, 5vw, 3.75rem)", fontWeight: 600, lineHeight: 1.15, letterSpacing: "-0.02em"}
  headline: {fontFamily: "Be Vietnam Pro, system-ui, sans-serif", fontSize: "clamp(1.875rem, 3vw, 2.25rem)", fontWeight: 600, lineHeight: 1.2}
  title: {fontFamily: "Be Vietnam Pro, system-ui, sans-serif", fontSize: "1.125rem", fontWeight: 600, lineHeight: 1.5}
  body: {fontFamily: "Be Vietnam Pro, system-ui, sans-serif", fontSize: "1rem", fontWeight: 400, lineHeight: 1.75}
  label: {fontFamily: "Be Vietnam Pro, system-ui, sans-serif", fontSize: "0.875rem", fontWeight: 600, lineHeight: 1.5}
rounded:
  control: "12px"
  card: "16px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
---

# Design System: Luật Poip Legal

## 1. Overview

**Creative North Star: "Clear Counsel"**

Luật Poip Legal should feel like a focused consultation with a trusted legal expert: composed, direct, and easy to follow. The dominant public-site system uses deep near-black, teal and sunny yellow, white, and a quiet off-white surface to establish authority without making the experience severe or distant.

Hierarchy and plain-language content do the persuasive work. Imagery demonstrates real legal and business contexts; color marks important actions and navigation states. The system explicitly rejects flashy gradients, excessive animations, generic corporate templates, and dense legal jargon.

**Key Characteristics:**

- Restrained black, gold, white, and quiet off-white palette.
- Clear information hierarchy with practical Vietnamese copy.
- Compact, reachable consultation actions for forms, calls, and Zalo.
- Gently curved components with visible borders and restrained elevation.
- Real imagery used as evidence and context, not decoration.

## 2. Colors

The palette pairs professional near-black with a focused gold accent and quiet neutral surfaces.

### Primary

- **Sunny Accent:** The sole brand accent for primary consultation actions, important icons, active navigation states, and high-value highlights.
- **Primary Teal:** The interaction and high-contrast companion to Sunny Accent, used for hover states and gold text on light surfaces.

### Neutral

- **Ink:** The primary dark surface and strongest text color.
- **Counsel Muted:** Supporting text that remains readable and subordinate.
- **Mint Surface:** A quiet off-white used to separate service and consultation sections from white.
- **Line:** Borders and dividers that organize without adding visual noise.
- **White:** Primary content surfaces and text on dark or gold backgrounds.

### Named Rules

**The One Accent Rule.** Sunny Accent is the only decorative accent (teal is the action color) on the public brand surface; do not introduce unrelated blue, purple, orange, or red accents for ordinary content.

**The No Spectacle Rule.** Gradients are forbidden as text fills, generic section backgrounds, button fills, and decorative glow fields.

## 3. Typography

**Display Font:** System sans-serif stack  
**Body Font:** System sans-serif stack  
**Label Font:** System sans-serif stack

**Character:** The current single-family system is direct and familiar. Authority comes from weight, spacing, and concise language rather than ornamental legal typography.

### Hierarchy

- **Display** (600, fluid 36-60px, 1.15): Hero messages and the primary promise on major service pages.
- **Headline** (600, fluid 30-36px, 1.2): Major section introductions and conversion sections.
- **Title** (600, 18px, 1.5): Cards, process steps, and compact content groups.
- **Body** (400, 16px, 1.75): Explanations and guidance; keep long-form lines within 65-75 characters.
- **Label** (600, 14px, 1.5): Buttons, field labels, navigation, and short metadata.

### Named Rules

**The Plain-Language Rule.** Headings state the visitor benefit or next step; never use dense legal jargon as a substitute for hierarchy.

**The Limited Label Rule.** Uppercase tracked labels may identify a small number of navigation or footer groups, but must not appear above every section heading.

## 4. Elevation

The system is flat by default and uses borders and surface contrast for structure. The existing soft ambient shadow is reserved for floating menus, focused conversion containers, and hover confirmation on interactive cards.

### Shadow Vocabulary

- **Soft Lift** (`0 18px 45px rgba(23, 23, 23, 0.08)`): Dropdowns, consultation containers, and interactive cards that need temporary emphasis.
- **Resting Card** (`0 1px 2px rgba(0, 0, 0, 0.05)`): Low-key separation for reusable white cards.

### Named Rules

**The Flat-by-Default Rule.** A static content section must use spacing, borders, and tonal surfaces before using a shadow.

## 5. Components

### Buttons

- **Shape:** Gently curved rectangle (6px radius) with a compact, reachable target.
- **Primary:** Primary Teal with a white semibold label and 12px by 20px padding.
- **Hover / Focus:** Shift to Ink; always show a visible keyboard focus ring with sufficient contrast.
- **Secondary:** White or transparent with a full Line border and Ink label.

### Cards / Containers

- **Corner Style:** Gently curved (8px radius) for public service cards.
- **Background:** White on Mint Surface or white page backgrounds.
- **Shadow Strategy:** Flat at rest or Resting Card; Soft Lift only on hover or for focused conversion content.
- **Border:** One-pixel Line border.
- **Internal Padding:** 20-24px.

### Inputs / Fields

- **Style:** White field, full neutral border, readable text, and a 12px radius where existing consultation forms use the softer field style.
- **Focus:** Strong border or ring using Primary Teal; focus must never rely on color alone when an error is present.
- **Error / Disabled:** Pair state color with concise text. Disabled controls retain readable labels.

### Navigation

Public navigation uses compact semibold labels, a white surface, and restrained active-state tinting. Desktop submenus use a bordered white popup with Soft Lift; mobile navigation uses full-width targets and explicit submenu controls. Consultation actions use Sunny Accent and remain visually distinct from ordinary links.

### Consultation Actions

Forms, call links, and Zalo contacts are primary conversion paths. Keep at least one appropriate action easy to find on service pages, but never let repeated floating prompts obscure reading or keyboard navigation.

## 6. Do's and Don'ts

### Do:

- **Do** use Ink, Sunny Accent, white, and Mint Surface as the dominant public-site palette.
- **Do** explain legal services in plain Vietnamese and make the next consultation step explicit.
- **Do** use full borders, spacing, and tonal surfaces to organize content.
- **Do** maintain WCAG 2.1 AA contrast, keyboard navigation, visible focus, and reduced-motion support.
- **Do** use real project imagery to establish context and credibility.

### Don't:

- **Don't** use flashy gradients, including gradient text, generic gradient backgrounds, or decorative glow fields.
- **Don't** use excessive animations; movement must clarify state and include a reduced-motion alternative.
- **Don't** build generic corporate templates made from endless identical icon cards.
- **Don't** use dense legal jargon when plain Vietnamese can explain the same decision.
- **Don't** introduce unrelated accent colors where Sunny Accent or a neutral communicates the role.
- **Don't** use colored side-stripe borders or glassmorphism as decorative defaults.

## 7. Bright & friendly refresh

- Primary action color is Primary Teal `#0f766e` (white text 5.5:1; hover Primary Dark `#115e59`, 7.6:1). Sunny Accent `#f5b32d` is for icons, rules and highlights, and for text on Ink; never put white text on it.
- Typeface: Be Vietnam Pro (Google Fonts), system sans as fallback. Rounder corners: controls 12px, cards 16px.
- Surfaces use the mint Surface `#f1f8f6`; borders use Line `#d8e6e1`.
- Tailwind tokens: `brand-primary`, `brand-primaryDark`, `brand-accent`, `brand-accentSoft`, `brand-ink`, `brand-muted`, `brand-line`, `brand-surface`.
