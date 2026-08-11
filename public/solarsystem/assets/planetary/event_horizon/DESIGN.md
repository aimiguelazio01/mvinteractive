# Design System: Editorial Cosmic Exploration

## 1. Overview & Creative North Star

### The Creative North Star: "The Celestial Observer"
This design system is not a dashboard; it is a lens. Our goal is to move away from the "cluttered mission control" aesthetic and toward a "High-End Digital Observatory." We prioritize the vastness of space through expansive negative space, intentional asymmetry, and a sense of weightlessness.

To break the "template" look, we employ **Editorial Layering**. Elements should rarely sit in a flat, linear grid. Instead, we use overlapping glass cards, varying typographic scales, and planetary "anchors"—large, high-quality celestial imagery that bleeds off the edges of the viewport—to create a sense of infinite scale.

---

## 2. Colors & Atmospheric Depth

Our palette is derived from the physics of light in a vacuum: deep voids punctuated by intense, vibrant radiation.

### The Palette
*   **The Void (Neutral):** `background` (#0c0e12) and `surface_container_lowest` (#000000). These are your foundations.
*   **Planetary Accents:**
    *   **Neptune Blue:** `primary` (#8eabff) for core actions and navigation.
    *   **Mars Rust:** `secondary` (#fa846c) for call-outs and secondary exploration paths.
    *   **Nebula Violet:** `tertiary` (#e192ff) for deep-level educational data and specialized insights.

### The "No-Line" Rule
**Borders are forbidden for sectioning.** To define space, use background shifts. A `surface_container_low` section sitting on a `background` provides all the edge definition a modern eye needs. Structural 1px lines feel like a cage; we are designing for the frontier.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. 
*   **Base:** `background` (#0c0e12).
*   **Secondary Sections:** `surface_container_low` (#111417).
*   **Floating Cards:** `surface_container_high` (#1c2025) or `highest` (#22262b).
*   **Nesting:** When placing a card inside a section, the card must always be "lighter" (a higher tier) than its parent to simulate it moving toward the viewer's eye.

### The "Glass & Gradient" Rule
For primary CTAs and Hero moments, do not use flat fills. Apply a subtle linear gradient from `primary` (#8eabff) to `primary_container` (#789dff) at a 135-degree angle. This adds "soul" and mimics the way light wraps around a planet's curve.

---

## 3. Typography

The typography strategy pairs technical precision with humanistic readability.

*   **Display & Headlines (Space Grotesk):** This is our "Technical Authority." With its wide stance and geometric quirks, use `display-lg` (3.5rem) for planetary names and `headline-lg` (2rem) for section titles. Use tight letter-spacing (-0.02em) for headlines to create a premium, editorial feel.
*   **Body & Labels (Plus Jakarta Sans):** This is our "Human Navigator." It is highly legible even at small sizes. Use `body-lg` (1rem) for educational narratives. 
*   **Contrast as Hierarchy:** Pair a `display-md` headline in `on_surface` with a `label-md` uppercase sub-header in `primary` (#8eabff) to create a sophisticated, high-contrast lockup.

---

## 4. Elevation & Depth

We achieve depth through **Tonal Layering** and **Atmospheric Perspective** rather than heavy shadows.

*   **The Layering Principle:** Stack `surface_container` tiers. A `surface_container_highest` element on a `surface_dim` background creates a natural visual lift.
*   **Glassmorphism (The "Frost" Effect):** For interactive floating elements (modals, dropdowns), use `surface_variant` at 40% opacity with a `backdrop-filter: blur(20px)`. This creates the "frosted glass" look that allows celestial background imagery to bleed through softly.
*   **Ambient Shadows:** If a shadow is required for a floating HUD element, use a blur of 40px and 4% opacity. The color should be `surface_container_lowest` (#000000), never a generic grey.
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, use `outline_variant` at 15% opacity. It should be felt, not seen.

---

## 5. Components

### Buttons
*   **Primary:** A gradient fill (Primary to Primary-Container) with `on_primary` text. No border. Roundedness: `full`.
*   **Secondary:** Ghost style. `outline` (#73757a) at 30% opacity with `primary` text.
*   **Interactive State:** On hover, increase the `backdrop-blur` of the button and add a subtle `primary` outer glow (4px blur, 20% opacity).

### Cards & Lists
*   **No Dividers:** Lists should be separated by `1rem` of vertical space or a subtle shift to `surface_container_low` on alternating items.
*   **The "Observation Card":** Use Glassmorphism (40% opacity `surface`) with a `sm` (0.25rem) corner radius for a sleek, modern feel.

### Input Fields
*   **Field Style:** Use `surface_container_high` as the fill. No bottom line. Use a `none` border, but on focus, transition to a 1px "Ghost Border" using the `primary` color at 50% opacity.

### Specialized Components: "The HUD Overlay"
*   **Telemetry Chips:** Small, semi-transparent labels (`label-sm`) using `surface_bright` with 10% opacity, used to display technical data (e.g., "Distance: 4.2ly") next to celestial bodies.

---

## 6. Do’s and Don’ts

### Do
*   **Do** use asymmetrical layouts. Place a planet off-center and let the text wrap around its perceived gravity.
*   **Do** use high-quality imagery of space with deep blacks to blend seamlessly into the `background` color.
*   **Do** use `primary` (#8eabff) sparingly as a "guiding light" for the user's eye.

### Don't
*   **Don't** use 100% opaque, high-contrast borders. They break the immersion of the "deep space" environment.
*   **Don't** use standard drop shadows. They look like "stickers" on a page rather than objects in space.
*   **Don't** use pure white (#FFFFFF) for body text. Use `on_surface_variant` (#a9abb0) to reduce eye strain against the dark background, reserving `on_surface` (#f8f9fe) for headers.