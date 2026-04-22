---
version: alpha
name: The Crow
description: Monochrome editorial system for compact document-first interfaces and operational tools.
colors:
  primary: "#0D0D0D"
  secondary: "#8A8A8A"
  neutral: "#FCFCFB"
  surface-app: "#ECEAE6"
  surface-panel: "#F5F4F1"
  surface-card: "#FFFFFF"
typography:
  brand:
    fontFamily: "TT Norms Pro Mono Trl"
    fontSize: 8.5px
    fontWeight: 700
    lineHeight: 1
    letterSpacing: 0.22em
  body:
    fontFamily: "TT Norms Pro Trial"
    fontSize: 10px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  label:
    fontFamily: "TT Norms Pro Mono Trl"
    fontSize: 8px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0.12em
  section:
    fontFamily: "TT Norms Pro Mono Trl"
    fontSize: 7.5px
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: 0.2em
rounded:
  xs: 1px
  sm: 2px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 52px
  "2xl": 80px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.sm}"
    padding: 8px 14px
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.secondary}"
    rounded: "{rounded.sm}"
    padding: 8px 14px
  chip-default:
    backgroundColor: "transparent"
    textColor: "{colors.secondary}"
    rounded: "{rounded.sm}"
    padding: 5px 9px
  chip-active:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.sm}"
    padding: 5px 9px
  app-shell:
    backgroundColor: "{colors.surface-app}"
    rounded: "{rounded.sm}"
    padding: 16px
  panel-surface:
    backgroundColor: "{colors.surface-panel}"
    rounded: "{rounded.sm}"
    padding: 24px
  card-surface:
    backgroundColor: "{colors.surface-card}"
    rounded: "{rounded.sm}"
    padding: 16px
  document-sheet:
    backgroundColor: "{colors.neutral}"
    rounded: "{rounded.sm}"
    padding: 52px
---

## Overview
The system is intentionally restrained, editorial, and utilitarian. It should feel like a precise printed artifact translated into software: quiet, dense, and highly legible.

The visual voice is monochrome first. Layout, spacing, and type hierarchy do most of the work, while color is used sparingly to maintain a disciplined, document-like feel.

## Colors
The palette is built on high-contrast neutrals and soft paper-like surfaces.

- **Primary (#0D0D0D):** Deep ink for body text, headlines, dividers, and key actions.
- **Secondary (#8A8A8A):** Muted graphite for labels, metadata, helper text, and supporting UI.
- **Neutral (#FCFCFB):** Warm paper white for document surfaces.
- **Surface App (#ECEAE6):** A cool beige-gray background for the surrounding application shell.
- **Surface Panel (#F5F4F1):** A slightly lighter panel tone for grouped controls and side areas.
- **Surface Card (#FFFFFF):** A near-white card surface when separation needs to be explicit.

Color should not become decorative. Use contrast, not chroma, to establish hierarchy.

## Typography
TT Norms Pro Trial defines the voice of the body text, while TT Norms Pro Mono Trl keeps the interface feeling technical, structured, and unembellished.

- **Brand:** Uppercase, tightly controlled, and used for headers and product marks.
- **Body:** Small but readable, designed for compact document layouts and high information density.
- **Labels:** Uppercase metadata with generous tracking to distinguish utility text from content.
- **Sections:** Very small section labels with strong letter spacing for the editorial rhythm of the page.

Text should generally stay left-aligned and avoid decorative typographic treatments. Weight and spacing should do the heavy lifting.

## Layout
The layout is built around a compact document grid with measured spacing and clear section boundaries.

- Use a dense vertical rhythm with frequent dividers and small spacing increments.
- Reserve the largest padding values for document sheets and primary content blocks.
- Keep side panels and builders visually separate from the document surface with subtle surface shifts and borders.
- Prefer stacked sections over complex nested layouts.

This system should feel composed and efficient rather than spacious or airy.

## Shapes
Shapes are intentionally sharp and minimal.

- Corner radii are tiny, typically 1px to 2px.
- Borders and rules are preferred over shadows for separation.
- Containers should read as precise frames rather than soft cards.

The result should feel engineered, not playful.

## Components
Buttons, chips, fields, cards, and document sheets should follow the same disciplined visual language.

- **Primary buttons:** Solid ink backgrounds with reversed text for the most important action.
- **Secondary buttons:** Transparent surfaces with subtle outlines and muted text for supporting actions.
- **Chips:** Compact uppercase controls with thin borders and crisp active states.
- **Fields:** Underlined, minimal inputs with clear label separation and no unnecessary chrome.
- **Cards:** Lightly surfaced containers with subtle borders and compact internal padding.
- **Document sheets:** Large, paper-like containers that anchor the final output.

Components should be visually quiet until state or hierarchy requires emphasis.

## Do's and Don'ts
- Do keep the interface monochrome and restrained.
- Do use uppercase labels sparingly and consistently.
- Do prefer borders and spacing over shadows and gradients.
- Do keep typography compact and highly legible.
- Don't introduce bright accent colors unless there is a strong functional reason.
- Don't round corners beyond the tiny radius language already established.
- Don't add decorative motion or flair that competes with the document-first feel.
