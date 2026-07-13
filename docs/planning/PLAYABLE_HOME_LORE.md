# Family Harmony Playable Home

## Decision: 2D first, not a walkable 3D house

The family loop must earn the game layer. A polished 3D house with avatars, navigation, collision, animation states, and device support would be a separate game project before it makes the daily planner more useful.

Build the home as a warm, interactive 2D scene first: custom SVG/CSS rooms, subtle light changes, and clear room cards. This will look intentional, load quickly on phones, and can become the art direction for a future playable version.

## The rooms

- **The Hearth**: family glow from shared goals and friendly challenges.
- **Garden**: sport and movement.
- **Kitchen**: nutrition and meal planning.
- **Library**: reading, learning, applications, and skills.
- **Quiet Corner**: stretching, yoga, recovery, and calm moments.

Each room has three visual states: resting, warming, and glowing. Shared work unlocks small visual details—garden lights, a fuller bookshelf, a warm kitchen window—rather than pay-to-win or public rankings.

## When to consider a walkable home

Only prototype a walkable 2D character after the app has proven that the weekly goal, challenge, and reflection loop is used consistently. The first version should be a single small map, no online multiplayer, no 3D, and no borrowed game assets. Any open-source code must have a compatible license and should only supply engine mechanics, never the product’s identity or artwork.

## First visual slice

Place a clickable 2D home card on the dashboard. It should show the five rooms as illustrated destinations and explain what activity warms each room. This is the right next visual task after meals and the activity feed become real.
