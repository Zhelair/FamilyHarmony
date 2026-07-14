# Family Harmony Playable Home

## Decision: 2D first, not a walkable 3D house

The family loop must earn the game layer. A polished 3D house with avatars, navigation, collision, animation states, and device support would be a separate game project before it makes the daily planner more useful.

Build the home as a warm, interactive 2D scene first: custom SVG/CSS rooms, subtle light changes, and clear room cards. This will look intentional, load quickly on phones, and can become the art direction for a future playable version.

## The rooms

- **The Hearth**: family glow from shared goals and friendly challenges.
- **Garden**: sport and movement.
- **Living Room**: shared moments, visits, calls, and connection.
- **Library**: reading, learning, applications, and skills.
- **Quiet Corner**: stretching, yoga, recovery, and calm moments.

Each room has three visual states: resting, warming, and glowing. Shared work unlocks small visual details—garden lights, a fuller bookshelf, a warm living-room window—rather than pay-to-win or public rankings.

## When to consider a walkable home

Only prototype a walkable 2D character after the app has proven that the weekly goal, challenge, and reflection loop is used consistently. The first version should be a single small map, no online multiplayer, no 3D, and no borrowed game assets. Any open-source code must have a compatible license and should only supply engine mechanics, never the product’s identity or artwork.

## First visual slice — implemented

The dashboard now includes a clickable 2D Harmony Home. It shows five rooms as illustrated destinations, labels each room's resting/warming/glowing state, and derives those states from the current user's visible goals and challenges. Clicking a room leads to Goals, where the real work happens.

This deliberately stays a small, accessible CSS illustration rather than an engine or borrowed game art. The next home work is room detail views that lead into real shared activity and moments.
