# Design System Document: Architectural Immersive Editorial

## 1. Overview & Creative North Star

### The Creative North Star: "The Monolith"
This design system is built to mirror the precision and weight of modern architecture. It transitions away from the "busy" nature of standard web interfaces toward a **Brutalist Editorial** experience. The system is defined by massive scale, intentional asymmetry, and a cinematic use of void space. 

By treating the screen as a physical site plan, we move beyond templates. We leverage sharp corners, high-contrast tonal shifts, and "The Monolith" philosophy: every element should feel carved from a single block of material, whether that is Raw Concrete (`surface`) or Walnut Wood (`secondary`).

---

## 2. Colors & Surface Philosophy

The palette is a dialogue between industrial raw materials and premium natural accents.

### Tonal Hierarchy
- **Primary (`#1A1C1E`):** Represents the structural integrity of steel and charcoal.
- **Secondary (`#6B4423`):** Walnut Wood. Used sparingly to provide warmth in an otherwise cool, industrial environment.
- **Tertiary (`#0e5b11`):** Pool Blue. A sharp, high-contrast accent used exclusively for interactive highlights and "water" elements in the visualization.
- **Surface Tiers:** Use `surface` (`#F9F9F9`) as the base site. Use `surface-container-low` for large structural sections and `surface-container-highest` (`#DDE4E5`) for nested, elevated data blocks.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders for sectioning. Boundaries must be defined by background shifts. To separate the navigation from the hero, or a sidebar from a gallery, transition from `surface` to `surface-container-low`. The interface should feel like slabs of concrete butting against one another, not a wireframe.

### Glass & Texture
For floating controls or immersive overlays, use **Glassmorphism**. Apply `surface` at 70% opacity with a `24px` backdrop blur. This allows the architectural photography to bleed through the UI, maintaining immersion. Use subtle gradients from `secondary` to `secondary_dim` for CTA buttons to mimic the grain of polished wood.

---

## 3. Typography

The typography scale is designed for impact, utilizing **Space Grotesk** for structural headlines and **Inter** for technical clarity.

| Level | Token | Font | Size | Character |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-lg` | Space Grotesk | 3.5rem | Sharp, technical, monumental. |
| **Headline** | `headline-lg` | Space Grotesk | 2.0rem | Tight tracking (-2%) for a "printed" look. |
| **Title** | `title-lg` | Inter | 1.375rem | High-contrast black (`on_surface`). |
| **Body** | `body-md` | Inter | 0.875rem | Generous line-height (1.6) for readability. |
| **Label** | `label-sm` | Inter | 0.6875rem | All-caps with +5% letter spacing. |

---

## 4. Elevation & Depth

In this design system, shadows are secondary to **Tonal Layering**. We achieve depth through the physics of materials.

*   **The Layering Principle:** Place a `surface_container_lowest` card on a `surface_container_low` background to create a "recessed" or "raised" effect without lines.
*   **Ambient Shadows:** If a floating element (like a modal) requires a shadow, use a diffuse, low-opacity tint: `box-shadow: 0 20px 40px rgba(45, 52, 53, 0.06)`. Avoid pitch-black shadows; use the `on_surface` color as the shadow base.
*   **The Ghost Border:** If a border is required for accessibility, use `outline_variant` at 15% opacity. It should be felt, not seen.
*   **Sharp Corners:** All `borderRadius` tokens are set to `0px`. Roundness is prohibited to maintain the brutalist, architectural aesthetic.

---

## 5. Components

### Buttons
*   **Primary:** Background `secondary` (Walnut), text `on_secondary`. Sharp 0px corners. High-contrast hover state switching to `secondary_dim`.
*   **Tertiary:** Text `tertiary` (Pool Blue), no background. Use for "View 3D" or "Enter Immersive Mode" actions.

### Cards & Lists
*   **Architectural Cards:** No dividers. Use `spacing.8` (2.75rem) to separate content blocks. 
*   **Nesting:** Place technical metadata (labels) inside a `surface_container_high` box nested within the main card.

### Input Fields
*   **States:** Default state is a bottom-border only (the "Ghost Border" rule). Active state transitions the bottom border to `tertiary` (Pool Blue).
*   **Typography:** All input labels use `label-sm` (all-caps).

### Immersive Components (Context Specific)
*   **The Viewport HUD:** Floating glass panels using `surface` at 60% opacity with backdrop blur. These house the camera controls and material pickers.
*   **Material Swatches:** Large, sharp-edged squares. Selected states are indicated by a 2px `tertiary` (Pool Blue) offset ring.

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical layouts. A 2/3 and 1/3 split is preferred over a centered grid.
*   **Do** embrace extreme whitespace. If a section feels "empty," it is likely correct.
*   **Do** use the `spacing.20` (7rem) token for section padding to give images room to breathe.
*   **Do** use "Pool Blue" (`tertiary`) sparingly—only for the most important interactive paths.

### Don't
*   **Don't** use border-radius. Every corner must be 90 degrees.
*   **Don't** use standard "Grey" for shadows. Always tint shadows with the `on_surface` color.
*   **Don't** use divider lines (`<hr>`). Use a background color shift or a large vertical gap.
*   **Don't** use generic icons. Use sharp, thin-stroke (1px or 1.5px) icons that match the technical nature of architectural drawings.