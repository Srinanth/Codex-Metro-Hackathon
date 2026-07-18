# BizzAI Design Direction

## Product character

BizzAI should feel like a calm, dependable business workspace: precise enough for an owner managing operations and warm enough for a customer booking through chat. The visual system is deliberately quiet—no gradients, no glossy decoration, and no dense data dumps.

## Foundations

- **Canvas:** `#0F172A` provides a consistent dark application backdrop.
- **Surfaces:** `#1E293B` is reserved for cards, panels, and raised controls. Nested surfaces use the canvas colour plus a soft border rather than another card colour.
- **Brand actions:** blue is for the single primary action; teal communicates helpful context and AI/receptionist cues; green and red communicate final success and error states.
- **Borders over shadows:** use `#334155` borders to define sections. Shadows should be minimal and only establish layering for modal-like content.
- **Type:** a clear visual ladder: compact eyebrow → page title → short supporting copy. Constrain long prose to approximately 65–75 characters per line.

## Layout rules

- Desktop dashboards use a stable navigation column, a roomy content canvas, and page headers that keep the title, explanation, and primary action together.
- Page content is centred within a `max-w-7xl` container. Individual readable content sections use narrower widths.
- Cards use `rounded-xl`, 20–24px internal padding, and 16–24px gaps. Avoid card-inside-card patterns unless the inner item is interactive.
- On mobile, actions stack, controls retain at least 44px tap height, and tables become horizontally scrollable rather than compressed.

## Component guidance

- **Buttons:** one filled primary action per area. Secondary actions use outline; low-priority navigation uses ghost.
- **Inputs:** dark inset surface, visible 2px blue focus ring, descriptive labels, and useful empty states.
- **Data:** render values as labels, tags, rows, and summaries. Never expose JSON, internal IDs, or empty metadata to end users.
- **Status:** use concise badges with text; colour always supports—not replaces—the status label.
- **Chat:** user messages are blue; receptionist messages sit on a low-contrast bordered surface. Tooling stays invisible; only customer-relevant confirmations are shown.

## Motion

- Use 160–240ms opacity/position transitions for page, card, and modal entry.
- Motion should confirm hierarchy or state changes, never distract from reading or booking.
- Respect reduced-motion preferences for any future expanded animation work.

## Accessibility quality bar

- Maintain visible keyboard focus on every control.
- Keep normal text at AA contrast or better (4.5:1); non-text controls and focus indicators need clear contrast against neighbouring surfaces.
- Use semantic headings, labels, and status messages. Do not rely on colour alone.

## Research references

This direction draws on the W3C Design System’s guidance for limited palettes, readable text measure, and contrast targets, including 4.5:1 for normal text and 3:1 for UI boundaries/focus indication. [W3C Design System settings](https://design-system.w3.org/settings/)

The visual system also adopts WCAG’s focus-appearance principle: authored dark backgrounds need authored focus treatment, rather than relying on browser defaults. [WCAG focus appearance guidance](https://w3c.github.io/wcag/guidelines/22/#focus-appearance)
