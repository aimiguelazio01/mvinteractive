---
name: Architectural Minimalist
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f4'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#444748'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f0f1f1'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#5c5f60'
  on-secondary: '#ffffff'
  secondary-container: '#e1e3e4'
  on-secondary-container: '#626566'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#0f1f16'
  on-tertiary-container: '#76887b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474746'
  secondary-fixed: '#e1e3e4'
  secondary-fixed-dim: '#c5c7c8'
  on-secondary-fixed: '#191c1d'
  on-secondary-fixed-variant: '#444748'
  tertiary-fixed: '#d4e7d8'
  tertiary-fixed-dim: '#b8cbbd'
  on-tertiary-fixed: '#0f1f16'
  on-tertiary-fixed-variant: '#3a4b40'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Newsreader
    fontSize: 80px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Newsreader
    fontSize: 48px
    fontWeight: '500'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
spacing:
  unit: 8px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 24px
  split-primary: 66.66%
  split-secondary: 33.33%
---

## Brand & Style
This design system is built upon the principles of modern architecture: structural honesty, spatial intentionality, and a focus on material essence. It is designed for premium environments where clarity and sophistication are paramount. The aesthetic is a rigorous blend of **Minimalism** and **Glassmorphism**, favoring open space over decorative clutter.

The UI should evoke a sense of permanence and intellectual calm. It treats the digital screen as a physical gallery space—utilizing massive negative space to allow content to breathe and emphasizing "material" transitions over digital artifice. The emotional response is one of precision, quiet luxury, and unwavering authority.

## Colors
The palette is derived from raw architectural materials. 
- **Matte Black & Stark White**: Provide the high-contrast structural foundation.
- **Raw Concrete Grey**: Acts as the primary surface color for tonal layering, providing a softer alternative to pure white.
- **Forest Green & Walnut Wood**: These are used sparingly as organic accents to prevent the UI from feeling sterile. They should be reserved for interactive highlights or subtle environmental cues.

Color is applied to reinforce hierarchy rather than for decoration. Large surfaces should remain neutral, using the primary and secondary colors to define the "weight" of different functional zones.

## Typography
The typographic system relies on the tension between a sharp, authoritative serif and a clean, technical sans-serif. 

- **Headlines (Newsreader)**: Used for editorial impact and structural headers. The high-contrast serif evokes traditional architectural blueprints and academic rigor.
- **Body & Interface (Hanken Grotesk)**: Chosen for its contemporary precision and neutrality. It ensures maximum readability for functional data and long-form descriptions.

Scale is used aggressively. Large headers should have significant breathing room, while labels are often small, uppercase, and tracked out to provide a technical, "draftsman" feel.

## Layout & Spacing
The layout philosophy is rooted in intentional asymmetry and the "Golden Ratio" logic, favoring 2/3 and 1/3 splits. 

- **Grid**: A 12-column fluid grid is used, but content should rarely span the full width. Instead, align content to specific "anchor points" to create a sense of dynamic balance.
- **Negative Space**: White space is a functional element, not a void. Use it to separate distinct conceptual blocks rather than relying on lines or borders.
- **Breakpoints**: 
  - **Desktop (1440px+)**: Utilize the full 2/3 split for primary content and 1/3 for metadata or navigation.
  - **Tablet (768px - 1024px)**: Transition to stacked vertical blocks but maintain wide margins (48px).
  - **Mobile (<768px)**: Revert to a single-column flow with a focus on vertical rhythm and 24px safe areas.

## Elevation & Depth
Depth is achieved through **Tonal Layering** and **Glassmorphism** rather than traditional drop shadows.

- **The Ground Plane**: The base level is typically Stark White or Concrete Grey.
- **Tonal Tiers**: Elevated content areas use a slightly darker or lighter neutral shade to differentiate from the background.
- **Glass Overlays**: For transient elements like navigation menus, modals, or hovering filters, use a backdrop blur (20px - 40px) with a low-opacity (10-20%) black or white fill. This creates a "frosted pane" effect that maintains a connection to the architectural space behind it.
- **Borders**: Avoid borders entirely. If a separator is required, use a 1px solid line in a color only 5% different from the background, or a change in tonal fill.

## Shapes
The shape language is strictly **Sharp**. There are no rounded corners in this design system. 

All buttons, input fields, cards, and containers must feature 90-degree angles. This reinforces the "Architectural" theme, mimicking the hard edges of stone, steel, and glass. The lack of radii contributes to the serious, high-end feel of the interface.

## Components
- **Buttons**: Rectangular, no radius. Primary buttons are Matte Black with White text. Secondary buttons use a tonal grey background. Hover states should involve a subtle shift in tone (e.g., Concrete to Walnut) rather than a shadow.
- **Inputs**: Field backgrounds should be a light Concrete Grey with no borders. On focus, the background shifts to a very subtle Walnut tint or adds a 1px bottom-only accent line.
- **Chips**: Small, rectangular blocks of color (Forest Green or Walnut) with small, uppercase Hanken Grotesk labels. 
- **Cards**: Defined by a change in background color or a glassmorphic blur. No shadows. The content within cards should follow the asymmetric spacing rules.
- **Navigation**: Persistent but unobtrusive. Use vertical navigation on the left (1/12th of the screen) or a glassmorphic top bar that blurs the content beneath it as the user scrolls.
- **Lists**: Minimalist, separated by whitespace or extremely subtle tonal shifts. Icons should be thin-stroke (1px) and geometric.