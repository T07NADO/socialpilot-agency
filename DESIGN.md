---
name: SocialPilot Agency
description: Warm, precise agency tool for LinkedIn content management.
colors:
  paper: "#FFFCF6"
  cream: "#FAF6EE"
  sand: "#F1ECE0"
  fog: "#E4DECF"
  ink: "#0E1014"
  ink-2: "#2A2D33"
  ink-3: "#5C616A"
  ink-4: "#8C9099"
  ink-5: "#B7BAC1"
  ink-on-accent: "#FFFCF6"
  ink-on-yellow: "#1A1306"
  gold-cta: "#FFEA00"
  gold-cta-press: "#E6D200"
  gold-cta-soft: "#FFF7B0"
  sky: "#2E6FE6"
  sky-soft: "#DCE7FB"
  sky-ink: "#0E2E69"
  sage: "#2F7D5C"
  sage-soft: "#D5E7DC"
  sage-ink: "#143626"
  rust: "#B0381C"
  rust-soft: "#F4D8CD"
  rust-ink: "#561508"
  gold: "#B68A1C"
  gold-soft: "#F1E5C0"
  gold-ink: "#4A370A"
  plum: "#A33A8E"
  plum-soft: "#F1DAEC"
  plum-ink: "#4A1641"
  linkedin: "#0A66C2"
typography:
  display:
    fontFamily: "'Bricolage Grotesque', 'Times New Roman', serif"
    fontSize: "56px"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.025em"
  h1:
    fontFamily: "'Bricolage Grotesque', 'Times New Roman', serif"
    fontSize: "40px"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.022em"
  h2:
    fontFamily: "'Bricolage Grotesque', 'Times New Roman', serif"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: 1.16
    letterSpacing: "-0.018em"
  h3:
    fontFamily: "'Bricolage Grotesque', 'Times New Roman', serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.22
    letterSpacing: "-0.012em"
  body:
    fontFamily: "'Geist', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'Geist', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    letterSpacing: "0.08em"
  mono:
    fontFamily: "'Geist Mono', ui-monospace, 'SF Mono', Menlo, monospace"
    fontSize: "13px"
    fontWeight: 400
    letterSpacing: "-0.01em"
rounded:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  pill: "999px"
spacing:
  1: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  5: "24px"
  6: "32px"
  7: "48px"
  8: "64px"
  9: "96px"
components:
  button-accent:
    backgroundColor: "{colors.gold-cta}"
    textColor: "{colors.ink-on-yellow}"
    rounded: "{rounded.sm}"
    padding: "0 14px"
    height: "36px"
  button-accent-hover:
    backgroundColor: "{colors.gold-cta-press}"
    textColor: "{colors.ink-on-accent}"
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ink-on-accent}"
    rounded: "{rounded.sm}"
    padding: "0 14px"
    height: "36px"
  button-primary-hover:
    backgroundColor: "#1A1D24"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 14px"
    height: "36px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 14px"
    height: "36px"
  button-danger:
    backgroundColor: "{colors.rust}"
    textColor: "{colors.ink-on-accent}"
    rounded: "{rounded.sm}"
    padding: "0 14px"
    height: "36px"
  chip-draft:
    backgroundColor: "{colors.sand}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.pill}"
    padding: "0 10px"
    height: "22px"
  chip-pending:
    backgroundColor: "{colors.gold-soft}"
    textColor: "{colors.gold-ink}"
    rounded: "{rounded.pill}"
    padding: "0 10px"
    height: "22px"
  chip-approved:
    backgroundColor: "{colors.sky-soft}"
    textColor: "{colors.sky-ink}"
    rounded: "{rounded.pill}"
    padding: "0 10px"
    height: "22px"
  chip-published:
    backgroundColor: "{colors.sage-soft}"
    textColor: "{colors.sage-ink}"
    rounded: "{rounded.pill}"
    padding: "0 10px"
    height: "22px"
  chip-failed:
    backgroundColor: "{colors.rust-soft}"
    textColor: "{colors.rust-ink}"
    rounded: "{rounded.pill}"
    padding: "0 10px"
    height: "22px"
  card:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "20px"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xs}"
    padding: "8px 12px"
    height: "36px"
---

# Design System: SocialPilot Agency

## 1. Overview

**Creative North Star: "The Agency Workbench"**

SocialPilot is a workbench, not a brochure. Every surface is warm, functional, and unhurried. The palette is derived from old paper and natural linen — cream grounds, parchment whites, sand fills — with a single sharp signal in citrus yellow for the one action that matters most on any given screen. It is the visual equivalent of a well-organized desk: nothing demands attention, everything is exactly where it should be.

The system is built for sustained focus. Freelancers spending hours inside this tool should feel calm, not stimulated. Agency teams with competing priorities should be able to scan quickly and act without hunting. Density is managed by generous internal whitespace and a strict typographic hierarchy — the eye is guided, never pushed. Motion is minimal and state-driven; nothing animates unless it communicates a change.

This system explicitly rejects: cluttered dashboards with metric cards stacked everywhere, colored gradients on primary surfaces, generic SaaS UI with identical card grids and sparkline stats, anything that manufactures urgency where there is none, and interfaces that make a freelancer feel like they need an onboarding checklist to start working.

**Key Characteristics:**
- Warm cream-to-parchment surface stack with a single yellow accent
- Bricolage Grotesque display headings (variable width) contrasted with Geist body text
- Shadows cast warm, not cold: all shadows use `rgba(20, 14, 6, ...)` — brown-tinted, never grey
- Status chips carry semantic color; everything else is ink on warm neutral
- Buttons have a strict three-tier hierarchy: yellow CTA, ink primary, sand secondary

## 2. Colors: The Parchment Palette

A warm neutral stack with a single saturated CTA and fully semantic signal colors. Every surface is tinted toward warm amber; no pure whites or pure blacks exist in the system.

### Primary
- **Citrus Signal Yellow** (`#FFEA00`): The primary call-to-action. Used on the single most important button per screen (Approve, Generate, Submit). Never used decoratively. Its rarity is the point.
- **Almost-Black Ink** (`#0E1014`): Active navigation states, primary buttons (secondary tier), all main body text. Tinted slightly warm-blue, never a pure black.

### Secondary
- **Cobalt Sky** (`#2E6FE6`): Scheduled and Approved states; LinkedIn-coded UI. Also used for informational inline links. Soft version (`#DCE7FB`) for chip and badge backgrounds.
- **Forest Sage** (`#2F7D5C`): Published state; all positive signals. Soft version (`#D5E7DC`) for backgrounds.
- **Terra Rust** (`#B0381C`): Failed state, destructive actions, error text. Soft version (`#F4D8CD`) for backgrounds.
- **Amber Gold** (`#B68A1C`): Pending approval state only. Distinct from the CTA yellow — this is muted, warm amber versus sharp citrus.

### Tertiary
- **Deep Plum** (`#A33A8E`): Analytics contexts and reserved for future platform use. Not used in primary flows.
- **LinkedIn Blue** (`#0A66C2`): Appears exclusively in LinkedIn platform badges and OAuth connect buttons. Never used as a generic accent.

### Neutral
- **Antique Paper White** (`#FFFCF6`): Lightest surface. Modal sheets, card faces, input backgrounds. Warm off-white, never pure white.
- **Warm Cream Canvas** (`#FAF6EE`): Default page canvas. The background most users see for most of their session.
- **Linen Sand** (`#F1ECE0`): Card inner highlights, secondary fills, input resting backgrounds, hover row tint. One step darker than cream.
- **Warm Fog** (`#E4DECF`): Dividers on cream, hairlines on hover surfaces. The strongest neutral border tone.
- **Hairline** (`rgba(14, 16, 20, 0.14)`): Primary divider and card border. Semi-transparent so it adapts to any surface temperature.
- **Ink Scale** (`#2A2D33` / `#5C616A` / `#8C9099` / `#B7BAC1`): Secondary, tertiary, placeholder, and very dim text respectively. Four stops of ink fading toward the surface.

### Named Rules
**The Ten Percent Rule.** The citrus yellow (`#FFEA00`) appears on no more than 10% of any given screen surface. It is used only for the single primary action per screen. Every other CTA uses ink. A screen with two yellow buttons has failed.

**The Warm Shadow Rule.** All shadows use `rgba(20, 14, 6, ...)` as their base — brown-warm, not grey-cold. The number `14, 16, 20` (the ink base) is used for semi-transparent overlays; `20, 14, 6` (warm sepia) is used for drop shadows. Never `rgba(0, 0, 0, ...)`.

## 3. Typography

**Display Font:** Bricolage Grotesque (variable: `opsz 12..96`, `wdth` axis), with Times New Roman serif fallback
**Body Font:** Geist 300–700, with Helvetica Neue and Arial fallback
**Mono Font:** Geist Mono 400–600, with SF Mono / Menlo fallback

**Character:** The Bricolage + Geist pairing is warm editorial meets technical precision. Bricolage uses its optical-size and width axes to feel different at each scale: compressed and grand in display, relaxed and readable in headings. Geist carries everything functional — dense tables, row labels, form fields — with the quiet authority of a well-made tool.

### Hierarchy
- **Display** (semibold 600, 56px, line-height 1.02, `letter-spacing: -0.025em`, `wdth 92 opsz 96`): Reserved for hero moments — page-level greetings, dashboard headlines. Used once per screen maximum.
- **H1 / Page Title** (semibold 600, 40px, line-height 1.08, `-0.022em`, `wdth 96 opsz 64`): Primary page title. One per route.
- **H2 / Section Head** (semibold 600, 28px, line-height 1.16, `-0.018em`): Named sections within a page. Used sparingly.
- **H3 / Card Title** (semibold 600, 20px, line-height 1.22, `-0.012em`): Card titles, panel headings, drawer headers.
- **Body** (regular 400, 15px, line-height 1.5): All paragraph text and description copy. Max line length 65–75ch for reading comfort in review panels.
- **Small** (regular 400, 13px, line-height 1.45, `var(--ink-2)`): Compact rows, metadata clusters, list item secondary lines, table cells.
- **Caption** (regular 400, 12px, line-height 1.4, `var(--ink-3)`): Timestamps, helper text, attribution. The smallest readable surface in the system.
- **Eyebrow** (medium 500, 11px, `letter-spacing: 0.12em`, uppercase, `var(--ink-3)`): Section labels, category markers. Adds hierarchy before a heading without competing with it.
- **Mono** (Geist Mono 400, 13px, `letter-spacing: -0.01em`, `font-feature-settings: 'tnum', 'zero'`): IDs, post slugs, scheduled times, status codes, keyboard shortcuts. Any value that needs to align in columns.

### Named Rules
**The Contrast Rule.** The minimum size jump between adjacent hierarchy levels is 1.25x. A 13px label next to a 13px body is invisible hierarchy. A 13px label next to a 20px H3 is not.

**The Mono Rule.** Times and IDs always render in Geist Mono with `font-variant-numeric: tabular-nums`. A post queue where scheduled times shift width as you scan is a broken queue.

## 4. Elevation

This system uses tonal surface layering as the primary depth signal, with warm drop shadows reserved for interactive state changes. The surface stack (cream canvas → paper card → sand fill) communicates containment without any shadow. Shadows emerge only when an element lifts out of its resting layer — on hover, in floating panels, and for modals.

### Shadow Vocabulary
- **Edge** (`inset 0 1px 0 rgba(255, 252, 246, 0.7)`): A top-edge inner highlight on card faces. Gives paper surfaces the subtle warmth of physical card stock. Applied to all `.card` elements at rest.
- **Shadow-1** (`0 1px 2px rgba(20, 14, 6, 0.05), 0 2px 6px rgba(20, 14, 6, 0.06)`): Sticky topbars, dropdown menus, row hover-lifted states. Low-profile ambient lift.
- **Shadow-2** (`0 2px 4px rgba(20, 14, 6, 0.06), 0 12px 28px rgba(20, 14, 6, 0.10)`): Floating panels, modals, sheet overlays. Communicates maximum separation from the canvas.
- **Inset** (`inset 0 1px 2px rgba(20, 14, 6, 0.10)`): Pressed button active state. The surface dents in — never pops up — on click.

### Named Rules
**The Flat-By-Default Rule.** Cards rest flat with only the edge highlight. No shadow at rest. Shadow-1 appears on hover for clickable cards. If a surface doesn't lift in response to an action, it doesn't get a shadow.

## 5. Components

### Buttons
Four-tier hierarchy. One yellow per screen maximum.

- **Shape:** Gently rounded (8px radius). Not pill. Not sharp.
- **Accent / Primary CTA:** Citrus yellow background (`#FFEA00`), dark brown ink text (`#1A1306`). `height: 36px`, `padding: 0 14px`, `font-weight: 600`. Hover: `#E6D200` background shifts to near-white text. One per screen; used for the action that progresses the user's primary job (Approve, Generate, Submit for approval).
- **Primary / Secondary CTA:** Almost-black ink background (`#0E1014`), paper-white text. Same sizing as accent. Used for the second-most important action (Save, Connect, Confirm). Multiple per screen allowed.
- **Secondary / Tertiary:** Paper background, hairline border (`var(--line)`). Neutral affordance for supporting actions (Cancel, Edit, Back). Hover: sand background.
- **Ghost:** No background, no border. Ink text. Used for inline actions (View all →, Disconnect) that should not compete visually.
- **Danger:** Terra rust background (`#B0381C`), paper-white text. Delete and disconnect actions only.
- **Sizes:** sm (`height: 28px`, `padding: 0 10px`, `font-size: 13px`, `border-radius: 6px`), default (36px), lg (`height: 44px`, `padding: 0 18px`, `font-size: 15px`).
- **Disabled:** `opacity: 0.45`, `cursor: not-allowed`. No color change.

### Chips
Status-only elements. Pills exclusively (`border-radius: 999px`). Never used as navigation filters.

- **Anatomy:** 22px height, `padding: 0 10px`, 12px text, 6px colored dot preceding the label.
- **Draft:** Linen sand background, ink-2 text. Dot: ink-4.
- **Pending:** Gold-soft background (`#F1E5C0`), gold-ink text. Dot: amber gold (`#B68A1C`).
- **Approved / Scheduled:** Sky-soft background (`#DCE7FB`), sky-ink text. Dot: cobalt sky.
- **Published:** Sage-soft background (`#D5E7DC`), sage-ink text. Dot: forest sage.
- **Failed:** Rust-soft background (`#F4D8CD`), rust-ink text. Dot: terra rust.
- **Live CTA:** Gold-CTA-soft background (`#FFF7B0`), gold-CTA-ink text. Dot: citrus yellow. Used for live/active notifications.

### Cards
The primary container. Used for client tiles, post rows, queue panels, and stat blocks.

- **Corner style:** Gently rounded (12px radius, `--r-md`).
- **Background:** Antique paper white (`#FFFCF6`) on the cream canvas.
- **Border:** Hairline `1px solid rgba(14, 16, 20, 0.14)`.
- **Shadow at rest:** Edge highlight only (`inset 0 1px 0 rgba(255, 252, 246, 0.7)`).
- **Shadow on hover (clickable):** Elevates to shadow-1.
- **Internal padding:** 20px default (`--s-5`). Dense list rows use 12–14px vertical padding.
- **Nested cards are prohibited.** A card inside a card is always a layout error. Use row dividers or internal sections instead.

### Inputs and Fields
- **Style:** Paper white background, hairline border, 4px radius (`--r-xs` for inputs, `--r-sm` for textareas). `height: 36px`, `padding: 8px 12px`, 14px body text.
- **Focus:** Border shifts to full ink (`#0E1014`). Soft focus ring: `0 0 0 3px rgba(14, 16, 20, 0.08)`. No color change — just structural emphasis.
- **Error state:** Border shifts to terra rust. Ring: `0 0 0 3px rgba(176, 56, 28, 0.10)`. Error text 11px in rust below the field.
- **Disabled:** `opacity: 0.6`, `cursor: default`.
- **Labels:** 12px, medium 500, uppercase, `letter-spacing: 0.08em`, `--ink-3`. Above the field, 6px gap.

### Navigation
- **Sidebar:** Paper white background, right hairline border. 240px fixed.
- **Nav items:** 14px Geist medium, `--ink-2` default. Gently rounded (6px). Gap 10px with 16px icon.
- **Hover:** `background: rgba(14, 16, 20, 0.04)` (row-hover), text shifts to `--ink`.
- **Active:** `background: #0E1014` (full ink), `color: #FFFCF6`. The active state is the darkest element on the sidebar — unambiguous, not tinted.
- **Section labels:** 11px, uppercase, `letter-spacing: 0.08em`, `--ink-3`. Sections separate functional clusters.
- **Pending badge:** Citrus yellow pill (`#FFEA00`), dark ink text, Geist Mono 11px. Appears on Approvals nav item when count > 0.
- **Footer:** User avatar + name + agency name at bottom, separated by a top hairline. Links to `/profile`.

### Status Chips (Signature Component)
The semantic color system communicates post lifecycle at a glance: Draft (neutral) → Pending (amber) → Approved/Scheduled (sky) → Published (sage) or Failed (rust). This sequence is a reading direction — left to right matches the content pipeline. The colored dot preceding the label is mandatory; do not use chips without the dot.

## 6. Do's and Don'ts

### Do:
- **Do** use citrus yellow (`#FFEA00`) for exactly one primary action per screen. Its power is its rarity.
- **Do** use the four-step surface stack (cream canvas → paper card → sand fill → fog divider) to communicate containment without shadows.
- **Do** render times, IDs, post slugs, and any tabular number in Geist Mono with `font-variant-numeric: tabular-nums`.
- **Do** use Bricolage Grotesque's variable axes: `wdth 92, opsz 96` at display size; relax to `wdth 96–100` at H1–H3. Let the variable font do the optical work.
- **Do** cast shadows in warm sepia (`rgba(20, 14, 6, ...)`), never in neutral grey (`rgba(0, 0, 0, ...)`).
- **Do** use the status chip color sequence to communicate post lifecycle: draft (neutral) → pending (amber) → approved/scheduled (sky) → published (sage) or failed (rust). The colors are a reading direction.
- **Do** keep row hover states to `rgba(14, 16, 20, 0.04)` — barely visible, just enough to confirm cursor position.
- **Do** limit body text blocks to 65–75ch max width in review and reading contexts.

### Don't:
- **Don't** use yellow on more than 10% of any screen surface. A screen with two yellow buttons, a yellow badge, and a yellow header is broken.
- **Don't** use busy metric cards stacked everywhere with colored gradients — this is the primary anti-reference. Stats should be quiet; they support decisions, not announce the product.
- **Don't** stack identical card grids with the same size, icon, heading, and body text pattern. This is the generic agency-dashboard template this system explicitly rejects.
- **Don't** use `rgba(0, 0, 0, ...)` for shadows. Only warm sepia (`rgba(20, 14, 6, ...)`) and ink-tinted overlays (`rgba(14, 16, 20, ...)`).
- **Don't** use side-stripe borders (colored `border-left` wider than 1px) as card or list-item accents. Use full borders, background tints, or leading status chips instead.
- **Don't** use gradient text (`background-clip: text`). Single solid ink color only.
- **Don't** nest cards. A card inside a card is always a layout error.
- **Don't** use glassmorphism decoratively. The topbar's `backdrop-filter: blur(12px)` is the only legitimate blur in the system, used because the topbar is sticky over live content.
- **Don't** manufacture visual urgency. Signal yellow is for action, not alarm. Rust is for errors, not warnings. Use amber gold (`#B68A1C`) for the pending state and nothing more urgent.
- **Don't** use `#000000` or `#FFFFFF`. Every black is `#0E1014` (warm-tinted ink). Every white is `#FFFCF6` (warm paper). Pure primaries read sterile against this palette.
- **Don't** make the freelancer feel like they need an onboarding checklist. Empty states should be calm and instructive, not apologetic or filled with animated mascots.
