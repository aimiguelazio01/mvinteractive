---
name: Lumina Tech
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#434655'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#3e3fcc'
  on-tertiary: '#ffffff'
  tertiary-container: '#585be6'
  on-tertiary-container: '#f1eeff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#e1e0ff'
  tertiary-fixed-dim: '#c0c1ff'
  on-tertiary-fixed: '#07006c'
  on-tertiary-fixed-variant: '#2f2ebe'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style

The brand identity centers on precision, clarity, and a forward-leaning technological perspective. It targets professionals and enthusiasts in the high-performance SaaS and technology sectors who value efficiency and understated sophistication.

The design system adopts a **Modern Corporate** style with a heavy influence of **Minimalism**. The aesthetic is defined by ample negative space, a restricted and disciplined color palette, and a focus on high-quality typography. This approach creates a UI that feels reliable, systematic, and intentional, ensuring that data and content remain the primary focus without unnecessary visual noise.

## Colors

The color strategy is rooted in a professional blue spectrum to evoke trust and stability.

- **Primary:** A vibrant Blue (#2563EB) used for primary actions, progress indicators, and active states.
- **Secondary:** Deep Slate (#0F172A) provides high-contrast grounding for text and dark-themed components.
- **Tertiary:** An Indigo-Violet (#6366F1) serves as a subtle accent for secondary highlights and data visualization depth.
- **Neutral:** A very light Gray-Blue (#F8FAFC) acts as the primary background color, preventing the "starkness" of pure white and reducing eye strain.

The system defaults to a **light mode** with high legibility, though the palette is engineered to support an easy transition to dark mode surfaces using the Secondary Slate as the base.

## Typography

This design system utilizes **Hanken Grotesk** across all roles to maintain a cohesive, sharp, and modern appearance. The typeface was selected for its exceptional legibility and professional character.

- **Headlines:** Use tighter letter spacing and heavier weights to create a strong visual hierarchy.
- **Body:** Sized for comfortable reading with generous line heights to accommodate technical documentation and long-form data.
- **Labels:** Generally rendered in Semi-Bold or Bold, often in uppercase for the smallest sizes to ensure clarity in navigation and interface controls.
- **Scaling:** For mobile screens, large headlines scale down to prevent excessive wrapping while maintaining their weighted presence.

## Layout & Spacing

The system employs a **Fluid Grid** model based on an 8px square baseline. This ensures vertical rhythm and consistent alignment across all components.

- **Grid:** A 12-column grid is used for desktop layouts, transitioning to a 4-column grid for mobile devices.
- **Gutters:** Fixed at 24px to provide clear separation between content blocks.
- **Margins:** 16px on mobile to maximize screen real estate, expanding to 64px on desktop to provide a professional, spacious feel.
- **Logic:** Spacing between related elements (e.g., label and input) uses `xs` or `base`, while sections are separated by `lg` or `xl` units.

## Elevation & Depth

Visual hierarchy is achieved through a combination of **Tonal Layers** and **Ambient Shadows**.

- **Surfaces:** The primary background is the neutral light gray. Interactive containers and cards use pure white (#FFFFFF) to "lift" off the page.
- **Shadows:** Use a very soft, diffused shadow (Blur: 16px, Y: 4px) with low-opacity Slate (#0F172A at 4-6%) to create a sense of natural depth without feeling heavy.
- **Borders:** In lieue of heavy shadows for lower-priority elements, use a 1px solid border in a slightly darker neutral tone to define boundaries subtly.
- **Interaction:** Upon hover, elevations should slightly increase (larger blur, slightly more opacity) to provide tactile feedback.

## Shapes

The design system uses a **Soft** shape language. This creates a balance between the precision of sharp corners and the friendliness of rounded ones.

- **Standard Elements:** Buttons, input fields, and small chips use a 0.25rem (4px) corner radius.
- **Large Elements:** Cards, modals, and larger containers use a 0.5rem (8px) radius.
- **Interactive Logic:** Roundedness remains consistent across states to maintain the structural integrity of the interface.

## Components

### Buttons
- **Primary:** Solid Blue background with White text. Sharp 4px corners. 
- **Secondary:** Ghost style with a Slate border and Slate text.
- **Sizing:** Fixed heights (32px, 40px, 48px) to maintain the 8px grid rhythm.

### Input Fields
- **Styling:** White background with a subtle light-gray border. On focus, the border transitions to the Primary Blue with a subtle 2px outer glow (brand color at 10% opacity).
- **Labels:** Placed above the field using `label-md`.

### Cards
- **Styling:** White fill, 1px neutral border, and the standard ambient shadow.
- **Padding:** Uses the `md` (24px) spacing unit for internal padding.

### Chips & Tags
- **Styling:** Small, subtle backgrounds (Primary or Secondary at 10% opacity) with high-contrast text. Used for status indicators and filtering.

### Lists
- **Styling:** Clean rows separated by 1px light gray dividers. High-density layouts use 8px vertical padding, while standard layouts use 16px.

### Checkboxes & Radios
- **Styling:** Custom-styled to match the Primary color. Checkboxes use a 2px radius; Radios remain fully circular for clear affordance.