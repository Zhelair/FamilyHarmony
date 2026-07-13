# Hearthlight Design System

> For a page-specific exception, check `design-system/pages/[page-name].md` first. Otherwise follow this live baseline.

## Product

**Hearthlight** is a private family wellbeing dashboard, not a newsletter platform. The experience should feel warm, practical, premium, and gently motivating.

## Foundations

| Role | Token/value | Use |
| --- | --- | --- |
| Forest | `--forest: #24584f` | Primary actions and active navigation |
| Dark forest | `--forest-dark: #1a443d` | Headlines and strongest text |
| Cream | `--cream: #f8f7f2` | Page background |
| Paper | `--paper: #fffefa` | Card surface |
| Mint | `--mint: #dbeee5` | Positive or selected state |
| Honey | `--sun: #f8e6a8` | Gentle milestone accent |
| Peach/lavender | `--peach`, `--lavender` | Supporting moments and member accents |

- Heading font: Fredoka, medium weight, warm and friendly.
- Body font: Nunito, 16px minimum on mobile with generous line height.
- Spacing: follow a 4/8px rhythm; sections use 24/32/48px steps.
- Cards: 19-25px radius, cream paper surfaces, fine warm-gray border, soft shadow.

## Interaction

- Use Lucide outline icons; do not use emoji as structural UI.
- Provide visible keyboard focus, descriptive icon-only labels, and 44px minimum targets.
- Use one primary action per screen. Disabled and loading states must be explicit.
- Motion is useful feedback only: 180-280ms, transform/opacity, and reduced-motion aware.
- Keep mobile layouts single-column and leave room above the fixed mobile navigation.

## Goal-page pattern

1. Explain the current weekly context and show one clear “Create a goal” action.
2. Reveal a compact, labelled creation form with shared or personal visibility explained in plain language.
3. Group goal cards into shared and personal sections; show numeric progress and a visible progress bar.
4. Keep progress logging small and immediate, with nearby validation and success feedback.
5. Empty states should be honest and invite the next useful action.

## Avoid

- generic SaaS blue or newsletter/lead-magnet patterns
- public sign-up, invitations, or email-link language
- public leaderboards or shame-based health competition
- low-contrast text, hidden focus styles, tiny tap targets, or layout-shifting hover effects
