# UI Skill Notes

## UI/UX Pro Max

What it is:
- a design-intelligence skill
- a searchable UI/UX database
- useful for style systems, typography, color, layout, UX checks, and animation guidance

What it is not:
- not the thing that creates animated buttons by itself
- not a replacement for good product structure
- not a complete UI component library

## What It Can Help Us With

- choose visual direction early
- define palette and type system
- define component patterns
- review UI for consistency
- suggest animation rules

## What We Still Need In The App Stack

- Framer Motion for animation
- Tailwind for styling
- optional `shadcn/ui` or Radix for accessible primitives

## Codex Install Notes

Current documented install path:

- install the CLI
- run Codex-specific init

Commands on this machine would be:

```powershell
npm.cmd install -g ui-ux-pro-max-cli
uipro init --ai codex
```

## Important Cautions

- Python 3.x is required for the search scripts
- Python is currently not installed on this machine
- avoid `uipro init --ai all` on Windows because Codex-related install issues were reported
- after install, verify `~/.codex/skills/ui-ux-pro-max` contains real `data` and `scripts` folders

## Suggested Use

If we use it, use it for:
- initial visual system
- dashboard layout direction
- motion rules
- UX review passes

Do not depend on it as the foundation of the app.
