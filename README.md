# Handoff: BEAT LAB — Bottom Tab Navigation Redesign

## Overview
BEAT LAB is a self-contained, on-device mobile beat maker (drum pads, polyphonic keys,
step sequencer, sampler, master FX). This handoff covers a **redesign of its primary
navigation**: the old flat top text-tab bar was replaced with a modern, slick **bottom
tab bar** featuring custom geometric icons, an animated sliding indicator, and an
amber-glow active state. The rest of the app (audio engine, pads, sequencer, FX) is
unchanged and included only for context.

## About the Design Files
The single file in this bundle — `pocket-beat-lab.html` — is a **design reference /
working prototype built in HTML/CSS/JS**. It demonstrates the intended look and behavior
of the navigation, not production code to paste in. The task is to **recreate this
navigation pattern inside your target codebase** (React Native, React, SwiftUI, Flutter,
etc.) using that environment's established components and animation primitives. If no app
environment exists yet, pick the framework most appropriate for the product and implement
there. The prototype is fully interactive — open it in a browser to feel the motion.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, icon geometry, and motion are all
specified below and should be reproduced precisely.

---

## The Navigation Component

### Purpose
Persistent bottom navigation switching between the app's five primary sections:
**PADS · KEYS · SEQ · SMPL · FX**. Always visible, thumb-reachable, never scrolls away.

### Layout
- Full-width bar pinned to the bottom of the app column (the app is a single
  `max-width: 560px` centered column, full viewport height).
- The bar is a flex row of 5 equal-width tab buttons (`flex: 1` each).
- Inner padding: `7px` on left/right/top; bottom padding is
  `calc(7px + env(safe-area-inset-bottom))` to clear the iOS home indicator.
- A single **sliding indicator** element sits behind the buttons (absolutely positioned,
  `z-index` below the buttons) and is moved horizontally to sit behind the active tab.
- Each tab button is a vertical flex stack: **icon on top, label below**, `gap: 5px`,
  centered, padding `9px 0 7px`.

### Visual spec (exact values)

**Bar container**
- Background: `linear-gradient(#1f1914, #100c07)`
- Top border: `1px solid #3a3026`
- Shadow: `0 -10px 26px rgba(0,0,0,.55)`, plus inset `0 1px 0 rgba(255,255,255,.045)`

**Sliding indicator (the "pill")**
- Position: absolute, `top: 7px`, `left: 7px`, height = bar height minus padding
  (`calc(100% - 14px - safe-area)`).
- Width: equal to one tab button's width (set dynamically to the active button's width).
- Border radius: `13px`
- Background: `linear-gradient(#352c21, #1d1610)`
- Border: `1px solid #4d3f2c`
- Shadow: inset `0 1px 0 rgba(255,255,255,.08)`, glow `0 0 18px rgba(239,190,44,.20)`,
  drop `0 2px 7px rgba(0,0,0,.55)`
- `pointer-events: none`

**Tab buttons**
- Idle color: `--ink-dim` = `#8d8170`
- Active color: `--led` = `#ffb347` (amber)
- Icon size: `23 × 23px`, uses `currentColor` so it inherits the tab color.
- Active icon: `filter: drop-shadow(0 0 5px rgba(239,190,44,.6))` and
  `transform: translateY(-1px)`.
- Press feedback: icon `transform: scale(.84)` on `:active`.
- Color transitions over `.25s`.

**Labels**
- Font: `Chakra Petch` (Google Fonts), weight 600, **9px**, `letter-spacing: 2px`,
  `line-height: 1`. Text: `PADS`, `KEYS`, `SEQ`, `SMPL`, `FX` (all caps).

### Icons (custom, geometric — built as inline SVG, 24×24 viewBox, `currentColor`)
Recreate these as simple geometric shapes; do not substitute a generic icon set unless it
matches this minimal, blocky style.
- **PADS** — 2×2 grid of filled rounded squares (`rx ≈ 1.8`).
- **KEYS** — piano: rounded-rect outline (`stroke-width 1.7`) with two internal dividers
  and two filled black keys over the dividers.
- **SEQ** — three horizontal "lanes", each made of a few rounded-rect step blocks;
  alternating blocks at reduced `opacity: .4` to read as an active/inactive step pattern.
- **SMPL** — audio waveform: 5 vertical rounded bars of varying height, centered on the
  vertical midline.
- **FX** — three horizontal slider lines (`stroke-width 1.8`, round caps) each with a
  filled knob circle (`r ≈ 2.7`) at a different position.

### Interactions & Behavior
- Tapping a tab: clears `.on` from all tabs/pages, adds `.on` to the tapped tab and its
  corresponding page (`#page-<key>`), then slides the indicator to that tab.
- **Sliding indicator motion** — slides from its current X to the active tab's X over
  **320ms** with an **ease-out-back** curve (slight overshoot/spring;
  reference `cubic-bezier(.34,1.56,.5,1)` or the easeOutBack formula
  `1 + (p-1)^2 · ((c+1)(p-1) + c)` with `c = 1.7`). It also resizes its width to match the
  active tab.
- The indicator's X is computed from the active button's `offsetLeft` (minus the bar's
  `7px` left padding) and its width from the button's `offsetWidth`. Recompute on resize.
- In a native/React environment, implement this with the platform's standard animated
  value (e.g. `Animated`/Reanimated shared value, CSS transition on `transform`, or a
  layout-driven indicator) — you do **not** need the prototype's hand-rolled
  rAF tween. (That manual tween exists only because the static-export harness froze CSS
  transitions; a real runtime can use a normal transition/spring.)
- Initial state: **PADS** active, indicator under tab 0.

### State Management
- A single "active section" value (one of `pads | keys | seq | smpl | fx`).
- Indicator position/width derive from the active tab's measured geometry.

---

## Design Tokens (from the app's `:root`)
| Token | Value | Use |
|---|---|---|
| `--panel` | `#161310` | app background |
| `--raised` | `#211c17` | raised surfaces |
| `--inset` | `#0d0b09` | inset wells |
| `--line` | `#332b22` | hairline borders |
| `--ink` | `#ece2cf` | primary text |
| `--ink-dim` | `#8d8170` | idle tab / secondary text |
| `--led` | `#ffb347` | active tab amber / LED accent |
| `--org` | `#e8761b` | orange accent |
| `--grn` | `#7fc97f` | play / saved green |
| Nav bar grad | `#1f1914 → #100c07` | nav background |
| Indicator grad | `#352c21 → #1d1610` | active pill |
| Indicator border | `#4d3f2c` | pill border |
| Amber glow | `rgba(239,190,44,.20–.6)` | pill + active icon glow |

**Typography:** `Chakra Petch` (UI/labels), `Unica One` (the BEAT LAB wordmark). Both via
Google Fonts. Tab labels: 9px / 600 / `letter-spacing 2px`.

**Radii:** pill `13px`, tab tap targets fill their flex cell. **Motion:** 320ms,
ease-out-back for the indicator; 250ms ease for color/icon state.

## Assets
No raster assets. All icons are inline SVG geometry (described above). Fonts load from
Google Fonts.

## Files
- `pocket-beat-lab.html` — full prototype. Relevant regions:
  - Nav CSS: search `nav.tabbar`, `.tab-ind`, `.savedot`.
  - Nav markup: search `<nav class="tabbar">` (includes the 5 inline-SVG icons).
  - Nav logic: search `================= TABS =================` (`moveInd()` +
    click handlers).
  - The auto-save status dot moved into the header: search `id="saveDot"` / `.savedot`.
