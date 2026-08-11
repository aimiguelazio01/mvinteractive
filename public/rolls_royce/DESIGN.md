# Design System Strategy: The Digital Atelier

## 1. Overview & Creative North Star
**Creative North Star: "The Atmospheric HUD"**

This design system is not a set of templates; it is a curated environment. To design for the ultra-luxury automotive sector, we must move away from the "clutter" of traditional SaaS interfaces. We are building a digital experience that feels like the cockpit of a bespoke motor car at midnight: quiet, powerful, and impeccably finished. 

The system breaks the "template" look by prioritizing **intentional asymmetry** and **atmospheric depth**. Rather than rigid grids, we use expansive whitespace and overlapping glass layers to create a sense of three-dimensional movement. Every interaction should feel like an "event"—heavy, smooth, and dampened.

## 2. Colors & Materiality
The palette is rooted in the depth of midnight. We use high-contrast metallic accents to guide the eye, while structural elements remain almost invisible.

### The Palette
- **Deep Core:** `surface` (#131313) and `surface_container_lowest` (#0e0e0e) provide the "infinite" black backdrop.
- **The Metallic Accent:** `primary` (#ffffff) and `primary_fixed` (#5d5e5f) represent the polished silver and gunmetal chrome.
- **Tonal Shifts:** `surface_container` variants define the hierarchy without the need for lines.

### The "No-Line" Rule
**Explicit Instruction:** You are prohibited from using 1px solid borders for sectioning. Structural boundaries must be defined solely through:
1. **Background Shifts:** Placing a `surface_container_low` card on a `surface` background.
2. **Atmospheric Gradients:** Using a subtle linear gradient from `surface_container` to `surface` to imply a transition.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of materials. 
- **Base Layer:** `surface` (#131313)
- **Nested Content:** Use `surface_container_low` for the main content areas.
- **High-Priority Elements:** Use `surface_container_high` or `highest` to "lift" the element toward the user.

### The "Glass & Gradient" Rule
To achieve the signature luxury look, use **Glassmorphism**. For floating panels or navigation bars, use `surface` at 60% opacity with a `backdrop-filter: blur(20px)`. This creates a "frosted gunmetal" effect that feels premium and integrated.

## 3. Typography
Our typography conveys authority through weight and width.

*   **Display & Headlines (Space Grotesk):** This is our "Signature" face. The extended nature of Space Grotesk feels modern and expensive. Use `display-lg` (3.5rem) with reduced letter-spacing (-0.02em) for hero headlines to create a "technical-chic" aesthetic.
*   **Body & Labels (Manrope):** We use Manrope for its geometric precision. It provides a clean, neutral counter-balance to the expressive headlines.
*   **The Luxury of Space:** Increase line-height for body copy to 1.6 to ensure the text "breathes."

## 4. Elevation & Depth
In this system, depth is achieved through **Tonal Layering**, not shadows.

### The Layering Principle
Stack containers to create soft, natural lift. A `surface_container_lowest` card sitting on a `surface_container_low` section provides a subtle "recessed" look, reminiscent of custom leather upholstery.

### Ambient Shadows
If a floating element requires a shadow, it must be "Ambient":
- **Color:** Use a 10% opacity version of `surface_container_lowest`.
- **Blur:** Extremely high (40px - 60px).
- **Spread:** Negative values to keep the shadow tucked beneath the element.

### The "Ghost Border"
When a border is required for accessibility, use the **Ghost Border** method:
- **Token:** `outline_variant` (#474747) at **15% opacity**. 
- **Effect:** This creates a microscopic light-catch on the edge of the glass, mimicking how light hits the edge of polished metal.

## 5. Components

### Buttons
- **Primary:** Solid `primary` (#ffffff) with `on_primary` (#1a1c1c) text. Use `rounded-sm` (0.125rem) for a sharp, machined look.
- **Secondary:** A Glassmorphism button using `outline` token at 20% opacity with a blur.
- **Interaction:** On hover, primary buttons should subtly shift to `primary_container`.

### Cards & Lists
- **No Dividers:** Forbid the use of line dividers. Use `surface_container` shifts or 48px–64px of vertical whitespace.
- **Structure:** Content should be left-aligned with "Display" typography to anchor the eye.

### Input Fields
- **Minimalist HUD Style:** No box. Use a single bottom border using the "Ghost Border" (15% opacity `outline_variant`). 
- **Active State:** The border glows to 100% `primary` white.

### Glass HUD (Special Component)
For automotive stats (e.g., Range, Speed, Torque), use a floating glass container (`surface` @ 40% + blur) with `display-sm` typography. This mimics a high-end Head-Up Display.

## 6. Do’s and Don’ts

### Do:
- **Embrace Asymmetry:** Offset images and text blocks to create a dynamic, editorial layout.
- **Use "Large" Whitespace:** If you think a section has enough padding, double it. Luxury is the ability to "waste" space.
- **Tonal Contrast:** Use `on_surface_variant` (grey) for secondary text and `primary` (white) for headers to create immediate hierarchy.

### Don’t:
- **No Pure Black Borders:** Never use #000000 or high-contrast lines. It breaks the "atmospheric" illusion.
- **No Default Roundedness:** Avoid `rounded-full` or large radii unless it's for a specific functional chip. Stick to `sm` or `md` to maintain a "technical" feel.
- **No Vibrant Colors:** Aside from the error states, stay strictly within the monochrome and gunmetal spectrum. The "color" comes from the automotive photography.

### Accessibility Note:
While we use low-opacity ghost borders, ensure that all interactive elements maintain a 4.5:1 contrast ratio between text and their immediate background. Use the `tertiary` tokens for subtle status indicators that remain legible.