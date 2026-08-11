# Design System Document: The Architectural Gallery

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Curator"**

This design system is not a framework for a website; it is an environment for art. Moving away from the cluttered, grid-heavy "template" look of standard e-commerce, this system adopts the persona of a high-end physical gallery. It prioritizes the "cinematic pause"—using intentional white space (negative space) and breathing room to allow the 3D-printed textures of the products to resonate.

The layout philosophy is built on **Intentional Asymmetry**. By breaking the rigid vertical alignment of standard containers, we create a sense of movement and architectural rhythm. Elements should feel like they are floating in a curated void, utilizing overlapping components and deep tonal shifts to establish a premium, "quiet luxury" experience.

---

## 2. Colors & Surface Philosophy
The palette is rooted in charcoal, deep obsidian, and the warmth of burnished metals. We avoid pure blacks in favor of layered grays to maintain depth and visual "soul."

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to define sections. Boundaries must be established through:
- **Tonal Shifts:** Placing a `surface-container-low` section against a `background` base.
- **Negative Space:** Using the Spacing Scale to create "voids" that act as invisible barriers.
- **Texture Overlays:** Using subtle gradients (from `primary` to `primary-container`) to guide the eye without a hard edge.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—stacked sheets of tinted glass or fine-milled stone.
- **Base Layer:** `surface` (#131313) or `surface-container-lowest` (#0e0e0e) for the most immersive, cinematic sections.
- **Interaction Layer:** Use `surface-container-high` (#2a2a2a) for elements the user needs to touch.
- **The Glass Rule:** For floating navigation or modal overlays, use `surface-variant` with a **backdrop-blur (20px-40px)** and 60% opacity to allow the "bronze" and "charcoal" tones of the content to bleed through softly.

---

### 3. Typography: Editorial Authority
The typography system marries the timelessness of a serif with the industrial precision of a modern sans-serif.

*   **Display & Headlines (Noto Serif):** These are the "art titles." Use `display-lg` and `headline-md` for high-impact brand moments. Increase letter spacing (tracking) by 2-5% to enhance the "elegant and spaced out" feel.
*   **Body & Utility (Manrope):** This is the "curator’s notes." Manrope provides a clean, neutral counter-balance to the serif headings. 
*   **Scale Hierarchy:**
    *   **Display-LG (3.5rem):** Reserved for hero titles only.
    *   **Title-SM (1rem):** Used for product specifications to maintain a technical, architectural feel.
    *   **Label-MD (0.75rem):** All-caps for micro-copy or category tags to mimic museum placards.

---

## 4. Elevation & Depth
In a cinematic system, depth is felt, not seen. We reject traditional "material" shadows in favor of ambient tonal layering.

*   **The Layering Principle:** To lift a card, place a `surface-container-low` card on a `surface-container-lowest` background. The subtle shift in hex value creates a soft, natural lift.
*   **Ambient Shadows:** If a floating effect is required (e.g., a "Buy" button over a textured product image), use a shadow with a blur of **48px**, an offset of **Y: 12px**, and an opacity of **6%**. The shadow color should be derived from `on-surface` (#e5e2e1), not pure black, to simulate natural light.
*   **The "Ghost Border" Fallback:** If a container requires definition for accessibility, use the `outline-variant` token at **15% opacity**. High-contrast, 100% opaque borders are strictly forbidden.

---

## 5. Components

### Buttons
*   **Primary:** A "Copper-Bronze" gradient transition from `primary` (#ffd092) to `primary-container` (#ffab00). No border. Label in `on-primary` (#452b00), bold.
*   **Secondary/Ghost:** `outline-variant` (at 20% opacity) with `title-sm` typography. On hover, the background shifts to `surface-bright`.
*   **Interaction:** All buttons must feature a **300ms ease-out** transition on hover/active states.

### Cards & Gallery Items
*   **No Dividers:** Never use a horizontal line to separate content. Use a `32px` vertical gap or a subtle background color shift between `surface-container-low` and `surface-container-high`.
*   **The "Floating Grid":** Cards should vary in height or offset within their columns to create an asymmetrical, editorial layout.

### Input Fields
*   **Style:** Minimalist underline only, using the `outline` token (#a08e79) at 30% opacity. 
*   **Focus State:** The underline transitions to `primary` (#ffd092) with a subtle "glow" (ambient shadow).

### Chips & Tags
*   **Architectural Utility:** Use `surface-container-highest` for the background with `label-sm` text. Roundedness should be `sm` (0.125rem) to maintain the sharp, architectural theme rather than a bubbly, "app-like" feel.

---

## 6. Do’s and Don’ts

### Do:
*   **Use Asymmetry:** Allow images to bleed off the edge of the screen or sit off-center to the text.
*   **Leverage Tonal Depth:** Use `surface-dim` for background sections to create a sense of infinite space.
*   **Prioritize Typography:** Let the `display-lg` Serif typography do the heavy lifting for the brand identity.

### Don't:
*   **No 1px Lines:** Do not use lines to separate header, body, or footer. Use space and color.
*   **No Sharp Shadows:** Never use high-opacity or small-radius shadows. They feel "cheap" and break the cinematic immersion.
*   **No Crowding:** If a section feels "full," it probably needs 24px more padding. The system requires "the luxury of space."
*   **No Standard Grids:** Avoid the 12-column "Bootstrap" look. Shift elements 1-2 columns to the left or right to create a signature, custom-coded feel.