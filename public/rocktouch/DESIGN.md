# Design System Strategy: Industrial Grunge-Chic

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Electric Underground."** 

This isn't a standard corporate dark mode; it is an immersive, high-octane editorial experience that bridges the gap between raw, tactile industrialism and high-tech digital performance. We are moving away from the "clean-grid" fatigue of modern SaaS and toward a signature look defined by **Mechanical Brutalism**. 

The interface should feel like a piece of high-end rack equipment in a recording studio: heavy, intentional, and alive with electrical current. We achieve this through:
*   **Intentional Asymmetry:** Breaking the vertical axis with overlapping "amplifier" cards and skewed image placements.
*   **Kinetic High-Contrast:** Using the deep graphite base to make the Cyan and Orange accents feel like they are literally glowing off the screen.
*   **Tonal Depth:** Replacing flat surfaces with "nested" layers that mimic physical machinery.

## 2. Colors: High-Voltage Contrast
Our palette is built on a foundation of "Deep Graphite" shadows and "Incandescent" highlights.

### The "No-Line" Rule
**Prohibit 1px solid borders for sectioning.** To separate the hero from the feature set, transition from `surface` (#0e0e0e) to `surface-container-low` (#131313). Let the tonal shift define the boundary.

### Surface Hierarchy & Nesting
Treat the UI as a series of stacked industrial plates. 
*   **Base:** `surface` (#0e0e0e) for the main background.
*   **Plates:** Use `surface-container` (#1a1a1a) for secondary content blocks.
*   **Floating Components:** Use `surface-container-high` (#20201f) for cards.
*   **Nesting:** A `primary-container` button should sit inside a `surface-container-highest` card to create a natural, mechanical lift.

### The "Glass & Gradient" Rule
To achieve the "Rock-and-Roll" vibe, interactive elements should utilize **Glassmorphism**. Floating navigation or video overlays must use semi-transparent `surface-variant` (#262626) with a `backdrop-blur` of 12px. 

**Signature Texture:** Use a linear gradient for primary CTAs transitioning from `primary` (#81ecff) to `primary-dim` (#00d4ec) at a 135-degree angle. This mimics the sheen of polished chrome under stage lights.

## 3. Typography: The Editorial Voice
Our typography is designed to be felt as much as read.

*   **Display (Epilogue):** Our "Headliner." Use `display-lg` for hero statements. It is bold, authoritative, and unapologetic.
*   **Headline (Epilogue):** Used for section titles. The tight kerning conveys a sense of industrial precision.
*   **Title & Body (Manrope):** The "Roadie." Manrope provides high legibility amidst the visual noise of the grunge aesthetic. Use `title-lg` for sub-headers and `body-lg` for descriptions.
*   **Labels (Space Grotesk):** The "Technical Spec." Use Space Grotesk for technical data or micro-copy. Its monospaced feel reinforces the industrial/engineering theme.

## 4. Elevation & Depth
Elevation is not about shadows; it’s about **Luminance and Layering.**

*   **Tonal Layering:** Achieve hierarchy by stacking. A `surface-container-lowest` (#000000) inset area inside a `surface-container` card creates a "milled" look, as if the UI was carved out of metal.
*   **Ambient Shadows:** For floating elements, use a `24px` blur with 8% opacity. The shadow color must be a tinted Cyan (`primary`) to simulate the ambient glow of a neon sign reflecting on a dark street.
*   **The "Ghost Border" Fallback:** If a container needs more definition, use a 1px border of `outline-variant` at **15% opacity**. Never use a solid, high-contrast line.
*   **Interactive Glow:** On hover, active elements (like the guitar strings in the reference) should transition from a flat state to a `primary` glow using an external `box-shadow: 0 0 15px #00E5FF`.

## 5. Components: The Industrial Kit

### Buttons
*   **Primary (The "Power" Button):** Solid `secondary` (#ff734a) background, `on-secondary` (#430c00) text. Sharp `DEFAULT` (4px) corners. No rounded pills—stay angular.
*   **Secondary (The "Circuit" Button):** `outline` (#767575) Ghost Border with `primary` (#81ecff) text. On hover, the border "energizes" to 100% `primary` opacity with a subtle outer glow.

### Cards & Lists
*   **Forbid Divider Lines:** Use `spacing-8` (2.75rem) to separate list items or use alternating tonal shifts between `surface-container-low` and `surface-container`.
*   **The "Amplifier" Card:** Deep `surface-container-highest` background, subtle `ghost-border`, and `space-3` padding.

### Input Fields
*   **States:** Default state is an "inset" look using `surface-container-lowest`. Focus state triggers a `primary` (#81ecff) 1px bottom-border only, mimicking a digital gauge.

### Signature Component: The "Hot-Spot"
Inspired by the interactive poster: Use `primary` or `secondary` circular rings with a "pulse" animation. These should overlap imagery to create a 3D, layered effect.

## 6. Do’s and Don'ts

### Do:
*   **Do** lean into high-contrast pairings (Orange text on Graphite).
*   **Do** use asymmetrical layouts where images bleed off the edge of the container.
*   **Do** use large, bold typography as a background element (e.g., "ROCK" at 200px height with 5% opacity).
*   **Do** treat white space as "Negative Voltage"—it provides the necessary silence between the loud visual elements.

### Don't:
*   **Don't** use soft, rounded corners (stay between `sm` and `md`). This is "Grunge-Chic," not a soft-tech app.
*   **Don't** use pure grey shadows. Always tint them with the accent colors (`primary` or `secondary`).
*   **Don't** use standard "out-of-the-box" icons. Use thin-stroke, technical icons that match the `Space Grotesk` aesthetic.
*   **Don't** clutter the screen. If every element glows, nothing is important. Reserve "Electric Cyan" for the most critical interactive paths.