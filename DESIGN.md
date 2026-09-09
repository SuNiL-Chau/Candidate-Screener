---
name: CrystalScreen
description: Candidate Screener with AI Integrity Layer
colors:
  primary: "oklch(0.511 0.096 186.391)"
  primary-foreground: "oklch(0.984 0.014 180.72)"
  background: "oklch(0.978 0.004 60)"
  foreground: "oklch(0.147 0.004 49.3)"
  card: "oklch(1 0 0)"
  card-foreground: "oklch(0.147 0.004 49.3)"
  border: "oklch(0.922 0.005 34.3)"
  muted: "oklch(0.96 0.002 17.2)"
  muted-foreground: "oklch(0.547 0.021 43.1)"
  accent: "oklch(0.96 0.002 17.2)"
  accent-foreground: "oklch(0.214 0.009 43.1)"
  destructive: "oklch(0.577 0.245 27.325)"
typography:
  display:
    fontFamily: "Raleway, sans-serif"
    fontWeight: 800
    lineHeight: 1.15
  headline:
    fontFamily: "Raleway, sans-serif"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "Raleway, sans-serif"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "DM Sans, sans-serif"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "DM Sans, sans-serif"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: "0.375rem"
  md: "0.625rem"
  lg: "0.875rem"
  xl: "1rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.card-foreground}"
    rounded: "{rounded.xl}"
    padding: "24px"
---

# Design System: CrystalScreen

## Overview

**Creative North Star: "The Security Intelligence Observatory"**

CrystalScreen balances the rigor of security intelligence infrastructure with the approachable clarity required by modern talent acquisition teams. The aesthetic is anchored on shadcn's Nova preset: quiet warmth through a soft taupe canvas, structural confidence via crisp elevated white cards, and decisive analytical authority marked by deep mineral Teal accents.

**Key Characteristics:**
- **Warm Neutral Canvas:** A soft taupe foundation (`oklch(0.978 0.004 60)`) that eliminates sterile glare while giving pure white cards natural contrast and depth.
- **Decisive Mineral Accent:** Deep rich Teal (`oklch(0.511 0.096 186.391)`) reserved for primary action triggers, active tabs, and verified state highlights.
- **Refined Typographic Cadence:** High-character Raleway headings paired with hyper-legible DM Sans body and data cells.
- **Transparent Evidence Framing:** Monospaced quarantined code excerpts and clear severity chips that emphasize human verification over automated opacity.

## Colors

The palette pairs warm neutral taupe surfaces with rich mineral teal accents, creating a calm, high-contrast, professional workspace.

- **Primary:** Deep Teal (`oklch(0.511 0.096 186.391)`) — primary buttons, active states, key data highlights.
- **Background:** Soft Taupe (`oklch(0.978 0.004 60)`) — global application canvas.
- **Card / Surface:** Pure Crisp White (`oklch(1 0 0)`) — floating cards and modular containers.
- **Border:** Warm Taupe Gray (`oklch(0.922 0.005 34.3)`) — subtle 1px dividers and card rings.
- **Foreground:** Charcoal Slate (`oklch(0.147 0.004 49.3)`) — high-contrast readable text.
- **Muted:** Light Taupe Neutral (`oklch(0.96 0.002 17.2)`) / (`oklch(0.547 0.021 43.1)`) — secondary labels, helper copy.

## Typography

- **Headings (Display, Headline, Title):** Raleway (`font-heading`), geometric sans with architectural rhythm.
- **Body, Metadata, & Controls:** DM Sans (`font-sans`), clean geometric grotesque optimized for dense dashboards and numerical readability.
- **Evidence & Code Payloads:** JetBrains Mono / monospace for quarantined resume payloads, directives, and confidence scores.

## Layout

- **Fixed Left Sidebar Navigation (`w-64`):** Anchors brand mark, navigation tabs, engine health, and recruiter session.
- **Responsive Main Canvas:** Padded with breathable margins (`p-6 md:p-8 lg:p-10`), maximum width constraint of `1440px` for optimal eye-tracking during resume review.
- **Grid Systems:** 4-column metric strip, 3-column role card grid, and 12-column split layout for candidate dossier reviews (7 cols evaluation / 5 cols document inspector).

## Elevation & Depth

- **Tonal Contrast Over Heavy Shadows:** Cards lift off the warm taupe canvas via color contrast rather than dark drop shadows.
- **Subtle Shadow Rhythms:** `shadow-xs` for rest states, transitioning smoothly to `shadow-sm` on hover with `-translate-y-0.5`.

## Shapes

- **Radius Scale:** Base radius is medium (`0.625rem` / `10px`).
- **Cards & Modals:** Large pill-softened rounded corners (`rounded-xl` / `rounded-2xl`).
- **Pills & Chips:** Fully rounded (`rounded-full`) for status indicators, confidence badges, and tag chips.

## Components

- **Buttons:**
  - `default`: Solid deep Teal with crisp white text (`bg-primary text-primary-foreground hover:bg-primary/90`).
  - `outline`: Bordered in warm taupe (`border-border`) with subtle hover highlight.
  - `secondary`: Soft muted surface (`bg-secondary text-secondary-foreground`).
  - `ghost`: Borderless, minimal hover feedback for auxiliary controls.
- **Cards:** Crisp white containers with `border border-border` and generous internal padding (16px–24px).
- **Badges:** Semantically color-coded (Teal for clean/verified, Amber for timeline flags, Rose for prompt injection alerts).

## Do's and Don'ts

### Do's:
- Maintain generous whitespace and breathing room around card groups.
- Keep candidate resumes isolated as raw text in monospaced document inspector panels.
- Use Raleway exclusively for headings and DM Sans for body/data tables.
- Keep the light theme warm and inviting using the taupe background.

### Don'ts:
- Never use harsh pure black (`#000000`) or sterile pure white page backgrounds.
- Never mix dark mode components into the light dashboard.
- Never silently drop candidates without displaying quoted evidence and recruiter action prompts.
