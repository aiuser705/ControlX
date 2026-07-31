import os

doc_content = """# CONTROL X — MASTER PROJECT KNOWLEDGE DOCUMENT
**Document Version:** 2.2.0-PRODUCTION-KNOWLEDGE-BASE  
**Status:** Canonical Single Source of Truth  
**Target Tech Stack:** Next.js (App Router), Three.js / React Three Fiber (@react-three/fiber), @react-three/drei, GSAP 3+ (ScrollTrigger), TailwindCSS, Lenis Smooth Scroll (@studio-freight/lenis), GLSL Shaders.

---

## 1. Project Overview

### 1.1 Vision & Scope
ControlX is an ultra-luxury digital agency web application engineered as an interactive benchmark for modern web design. The project synthesizes classic editorial typography with real-time physical WebGL optics, glassmorphism UI layers, 3D mesh refractions, and fluid dynamics.

Rather than operating as a conventional static site with overlay animations, the interface is built as a physical 3D studio stage. The stage features:
- **WebGL Canvas Background & 3D Layer:** Renders real-time 3D glass objects (Glass X logo, Process Tube Rail, Node Discs, Particle Systems), optical caustics, and physical lighting passes.
- **DOM UI Overlay Layer:** Houses editorial typography, navigation, glassmorphism cards, form fields, and interactive action buttons.
- **GLSL Post-Processing Stack:** Includes Chromatic Aberration, Unreal Bloom, Vignette, and Depth-of-Field Blur passes.

```
┌─────────────────────────────────────────────────────────────┐
│                     DOM UI OVERLAY LAYER                    │
│   [Navbar]  [Hero Title]  [Services Grid]  [Contact Form]   │
└──────────────────────────────┬──────────────────────────────┘
                               │ Alpha / Depth Blur Blending
┌──────────────────────────────┴──────────────────────────────┐
│                  THREE.JS / WEBGL CANVAS LAYER              │
│   [3D Glass X]  [Process Rail]  [GPU Particle System]       │
└──────────────────────────────┬──────────────────────────────┘
                               │ Framebuffer Render Pass
┌──────────────────────────────┴──────────────────────────────┐
│                 GLSL POST-PROCESSING STACK                  │
│    [Chromatic Aberration]  [Unreal Bloom]  [Vignette]       │
└──────────────────────────────┴──────────────────────────────┘
```

### 1.2 Core Business Goals & Success Metrics
- **Target Audience:** C-suite executives, enterprise partners, luxury brand managers, creative directors.
- **Performance Targets:**
  - Stable 60 FPS constant framerate on desktop (DPR 2.0) and mobile (DPR 1.0).
  - First Contentful Paint (FCP): < 0.8s.
  - Time to Interactive (TTI): < 1.8s.
  - Cumulative Layout Shift (CLS): 0.00.
- **Quantitative Constraints:**
  - Maximum Triangle Budget: < 50,000 active triangles per frame.
  - Maximum Draw Calls: < 35 draw calls per frame.
  - GPU Frame Time Budget: 13.5ms total (6.0ms WebGL render + 4.5ms GLSL post-process + 3.0ms DOM composite, leaving a 3.1ms margin for 60 FPS / 16.6ms frame time).
  - Texture Memory Limit: < 64MB.

---

## 2. Design Philosophy

### 2.1 Editorial Architecture & Negative Space
- **Negative Space Ratio:** High proportion of negative space (> 55%) across all viewports to elevate visual prominence.
- **Asymmetric Composition:** Off-center display titles paired with centered 3D focal assets (e.g., central Glass X emblem).
- **Physical Realism:** Glass elements simulate real optical physical properties:
  - Index of Refraction (IOR = 1.52, matching Crown Glass).
  - Internal emerald absorption & volumetric attenuation.
  - Specular dispersion and edge chromatic aberration.

### 2.2 Easing & Motion Principles
All animations must strictly avoid linear motion (unless specifically specified for scrub synchronization).
- **Standard Structural Entrance:** cubic-bezier(0.16, 1, 0.3, 1) (Power3 / Quartz Curve) — snappy deceleration into final rest.
- **Elastic UI & Pop Interactions:** cubic-bezier(0.34, 1.56, 0.64, 1) (Expressive Spring) — subtle overshoot and settling.
- **Smooth Exit:** cubic-bezier(0.7, 0, 0.84, 0).
- **Inertia Scroll Physics:** Damped spring lag with a smoothing lerp coefficient of 0.08.

---

## 3. Visual Language

### 3.1 Material & Surface Taxonomy
1. **Studio Background Surface (#EBE9E1):** Warm neutral matte backdrop simulating studio photography backdrops under softbox lighting.
2. **Refractive Emerald Glass (#0F8259):** High-transmission (92% - 95%) glass material with clearcoat highlights (1.0), low roughness (0.04 - 0.08), and internal absorption (attenuationDistance = 0.5).
3. **UI Glassmorphism Panels:** Frosted DOM cards featuring backdrop-filter: blur(20px) saturate(180%), light semi-transparent fills (rgba(255, 255, 255, 0.25)), white translucent borders (rgba(255, 255, 255, 0.40)), and subtle drop shadows (0 20px 40px rgba(0, 0, 0, 0.06)).

---

## 4. Color System

### 4.1 Palette Tokens

| Token Name | Hex / RGBA Value | Usage / Description |
|---|---|---|
| `--color-bg-primary` | `#EBE9E1` | Primary studio background color |
| `--color-bg-gradient-start` | `#FAF9F5` | Radial gradient hotspot / highlight center |
| `--color-bg-gradient-end` | `#E2DFD5` | Radial gradient perimeter / vignette edge |
| `--color-text-primary` | `#18191C` | Primary display headers, brand titles, body text |
| `--color-text-secondary` | `#686D76` | Sub-headlines, card descriptions, labels |
| `--color-text-muted` | `#9E9E9E` | Disabled states, subtle metadata |
| `--color-accent-emerald` | `#0F8259` | Primary brand accent, glass tint, primary CTA buttons |
| `--color-accent-emerald-light` | `#10B981` | Hover states, particle emissions, active glows |
| `--color-accent-emerald-glow` | `rgba(15, 130, 89, 0.35)` | Box-shadow glows, button hover halos |
| `--color-glass-fill` | `rgba(255, 255, 255, 0.25)` | DOM glass card fill background |
| `--color-glass-border` | `rgba(255, 255, 255, 0.40)` | Translucent white card borders |
| `--color-glass-shadow` | `rgba(0, 0, 0, 0.06)` | Soft ambient shadow beneath glass cards |

### 4.2 CSS Custom Properties Export
```css
:root {
  /* Colors */
  --color-bg-primary: #EBE9E1;
  --color-bg-gradient-start: #FAF9F5;
  --color-bg-gradient-end: #E2DFD5;
  --color-text-primary: #18191C;
  --color-text-secondary: #686D76;
  --color-text-muted: #9E9E9E;
  --color-accent-emerald: #0F8259;
  --color-accent-emerald-light: #10B981;
  --color-accent-emerald-glow: rgba(15, 130, 89, 0.35);
  --color-glass-fill: rgba(255, 255, 255, 0.25);
  --color-glass-border: rgba(255, 255, 255, 0.40);
  --color-glass-shadow: rgba(0, 0, 0, 0.06);

  /* Typography */
  --font-serif: 'Playfair Display', Georgia, serif;
  --font-sans: 'Plus Jakarta Sans', system-ui, sans-serif;

  /* Spacing & Layout */
  --spacing-section-y: 120px;
  --container-max-width: 1440px;
  --grid-gap: 24px;
  --card-padding: 32px;

  /* Radii */
  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-pill: 9999px;

  /* Z-Index Hierarchy */
  --z-canvas: 0;
  --z-particles: 5;
  --z-content: 10;
  --z-navbar: 100;
  --z-cursor: 999;
}
```

---

## 5. Typography

### 5.1 Font Families
- **Display Serif:** `'Playfair Display'`, Georgia, serif (Weights: 400, 500, 600, 700). Used for all main section titles, hero display text, and editorial quotes.
- **UI Sans-Serif:** `'Plus Jakarta Sans'`, system-ui, sans-serif (Weights: 300, 400, 500, 600, 700, 800). Used for navigation links, buttons, card labels, body text, and numerical data.

### 5.2 Type Hierarchy Table

| Element Token | Font Family | Size | Line Height | Weight | Letter Spacing |
|---|---|---|---|---|---|
| `display_hero` | Serif | 72px (clamp: 2.8rem to 5.2rem) | 1.10 | 600 | -0.025em |
| `display_h1` | Serif | 64px | 1.12 | 600 | -0.02em |
| `display_h2` | Serif | 48px | 1.15 | 600 | -0.01em |
| `section_header` | Serif | 42px | 1.15 | 600 | -0.01em |
| `card_title` | Sans | 24px | 1.25 | 600 | 0.00em |
| `body_text` | Sans | 15px | 1.50 | 400 | 0.00em |
| `button_text` | Sans | 14px | 1.00 | 700 | 0.05em |
| `nav_link` | Sans | 14px | 1.00 | 500 | 0.01em |
| `label_tagline` | Sans | 12px | 1.30 | 600 | 0.18em (uppercase) |
| `footer_brand` | Sans | 36px | 1.10 | 800 | 0.12em (uppercase) |

---

## 6. Navigation System

### 6.1 Specifications
- **Positioning:** Fixed top: 0, left: 0, right: 0, z-index: 100.
- **Dimensions:** Height 80px (or 72px compact), padding horizontal 48px (64px max container).
- **Default State (Unscrolled):** Transparent background, backdrop-filter: blur(0px).
- **Scrolled State (`scrollY > 40px`):**
  - background: rgba(235, 233, 225, 0.75)
  - backdrop-filter: blur(24px) saturate(180%)
  - box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06)
  - Transition duration: 0.4s cubic-bezier(0.16, 1, 0.3, 1).

### 6.2 Layout Structure
```
┌────────────────────────────────────────────────────────────────────────┐
│ [X] CONTROL X    Services  Work  About  Process    [🔍 Search] [Sign Up]│
└────────────────────────────────────────────────────────────────────────┘
```
- **Brand Logo (Left):**
  - Emerald square icon: 28px x 28px, background #0F8259, border radius 6px, containing bold white serif "X".
  - Wordmark: "CONTROL X" in Plus Jakarta Sans 600, uppercase, letter-spacing: 0.12em, size 14px.
- **Navigation Links (Center):**
  - Links: Services, Work, About, Process (or Design, Create & More, Testing, Sports, More).
  - Spacing gap: 40px.
  - Hover effect: Underline pseudoelement (`::after`) expands from width: 0% to 100% over 0.3s cubic-bezier(0.16, 1, 0.3, 1) with #0F8259 background.
- **Action Buttons (Right):**
  - Search Button: Glass ghost pill button (background: rgba(255,255,255,0.18), border 1px solid rgba(255,255,255,0.45), radius 9999px, padding 8px 20px, SVG search icon).
  - Sign Up / Get Started Button: Solid emerald pill button (background: #0F8259, color #FFFFFF, radius 9999px, padding 8px 20px). Hover: translateY -1px, background: #10B981, box-shadow: 0 6px 20px rgba(15, 130, 89, 0.35).

---

## 7. Hero Section

### 7.1 Layout & Visual Elements
- **Height:** 100vh (100svh for mobile viewports).
- **Composition:** Centered vertical stack:
  1. Tagline Badge: Animated pulsing emerald dot (6px) + "PREMIUM DIGITAL AGENCY" (12px, uppercase, letter-spacing: 0.18em, color #0F8259).
  2. Glass X 3D Emblem / Visual: Centered 3D emerald glass logo (240px x 240px) with bevelled facets, specular highlights, ground reflection ellipse, and soft drop shadow (filter: drop-shadow(0 24px 48px rgba(15, 130, 89, 0.22))).
  3. Main Headline: "We Build Digital Experiences" (or "Prensiuny chartiment eveaqual..."), Playfair Display 600, size clamp(2.8rem, 6vw, 5.2rem), max width 820px. Per-word split wrapper for staggered GSAP reveal.
  4. Sub-headline: "Luxury interfaces. Cinematic motion. Zero compromise. Built for brands that demand the extraordinary.", Plus Jakarta Sans 300, size 16px - 18px, color #686D76, line height 1.7.
  5. CTA Buttons:
     - Primary: "View Our Work" / "Read Review" (Solid #0F8259, arrow icon, hover lift + arrow slide).
     - Secondary: "Start a Project" / "Contact Us" (Frosted glass #rgba(255,255,255,0.25)).
  6. Scroll Indicator: Vertical line (52px) with infinite downward scale/fade animation + "SCROLL" label (10px, uppercase, letter-spacing: 0.2em).
  7. Sparkle Accents: 4-point star symbols (✦) at top-right (18% top, 8% right) and bottom-left (22% bottom, 6% left) with slow rotational spin (8s to 15s).

### 7.2 Entrance Animation Choreography (Timeline 0.0s - 1.9s)
```
t = 0.00s : WebGL Canvas loads & starts idle loop.
t = 0.40s : Glass X Mesh / Visual drops in from y = -40px, scale 0.88 -> 1.00, opacity 0 -> 1 (duration: 1.4s, ease: expo.out).
t = 0.70s : Tagline badge slides up from y = 20px, opacity 0 -> 1 (duration: 0.9s, ease: expo.out).
t = 0.85s : Headline words reveal with staggered rotateX (12deg -> 0deg) and y (36px -> 0px) (stagger: 0.08s, duration: 1.0s, ease: expo.out).
t = 1.25s : Sub-headline slides up from y = 16px, opacity 0 -> 1 (duration: 0.9s, ease: expo.out).
t = 1.40s : CTA buttons slide up from y = 14px (stagger: 0.12s, duration: 0.8s, ease: expo.out).
t = 1.90s : Scroll hint & sparkles fade in (duration: 1.0s, ease: power2.inOut).
```

---

## 8. Background Architecture

### 8.1 Studio Environment Specifications
The background simulates a photographic studio backdrop lit by an overhead softbox key light.
- **Base Color:** #EBE9E1 (Primary Warm Neutral).
- **Radial Hotspot:** Oval highlight centered slightly above middle (center: 50% 30%), gradient start #FAF9F5, transitioning to #E2DFD5 and darkening to #8E867B / #615A51 at extreme vignette corners.
- **Floor Plane Strip:** Warm horizontal tone at bottom 18% (#C3BBB1) with a subtle dark shadow line (#A09790) where the floor meets the studio backdrop.
- **Subtle Film Grain:** Micro-noise texture pass (opacity: 0.012 - 0.03) to eliminate gradient banding across 8-bit displays.

### 8.2 Floating Glass Droplets / Particle System
- **Quantity:** 40 to 50 active floating glass particles (or 5,000 GPU particles for burst mode).
- **Layer Depth Tiers:**
  1. Close / Foreground: Large spheres (radius 18px - 28px), depth blur, higher opacity (0.28), fast drift.
  2. Midground: Medium glass droplets (radius 8px - 16px), crisp rim highlights, opacity 0.16.
  3. Background / Far: Micro-dust particles (radius 2px - 5px), low opacity (0.08), slow vertical float.
- **Refraction & Specular Highlights:** Glass droplets feature rim highlights (exp(-pow(nd * 3.6, 2.0))) and upper-left key light catchlights (dot(sDir, vec2(-0.50, 0.55))).

---

## 9. Camera System

### 9.1 Camera Configuration
- **Type:** PerspectiveCamera (Three.js / R3F).
- **FOV:** 45deg focal length.
- **Near Plane:** 0.1.
- **Far Plane:** 1000.0.
- **Base Coordinates:** Position: (0, 0, 8.0), LookAt: (0, 0, 0).

### 9.2 Choreography Keyframe Table

| Timestamp / Scroll Range | Camera Position (X, Y, Z) | Camera Rotation (X, Y, Z) | Active Section | Easing Curve |
|---|---|---|---|---|
| 00:00.000 (0% Scroll) | (0.0, 0.0, 8.0) | (0.0, 0.0, 0.0) | Hero Section | linear |
| 00:01.500 (15% Scroll) | (0.0, 0.0, 8.0) | (0.0, 0.0, 0.0) | Hero Hold | cubic-bezier(0.16, 1, 0.3, 1) |
| 00:05.500 (40% Scroll) | (0.0, -2.5, 10.5) | (-0.05, 0.0, 0.0) | Services Section | cubic-bezier(0.16, 1, 0.3, 1) |
| 00:08.000 (70% Scroll) | (0.0, -5.0, 9.0) | (0.0, 0.0, 0.0) | Process Node Rail | cubic-bezier(0.16, 1, 0.3, 1) |
| 00:10.000 (100% Scroll) | (0.0, -7.2, 7.5) | (0.0, 0.0, 0.0) | Contact Form & Outro | cubic-bezier(0.25, 1, 0.5, 1) |

---

## 10. Scroll System

### 10.1 Smooth Scroll Engine (Lenis)
- **Engine:** `@studio-freight/lenis` bound to GSAP Ticker.
- **Configuration:**
  - duration: 1.2s
  - easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
  - lerpSmoothness: 0.08
  - wheelMultiplier: 1.0
  - touchMultiplier: 1.5

### 10.2 Section Pinning Schedule

| Section ID | Trigger Class | Pin Duration | Purpose |
|---|---|---|---|
| `sec_hero` | `.sec-hero` | 100vh | Hero entrance & initial scroll-out |
| `sec_services` | `.sec-services` | 150vh | Glass card stagger reveal & 3D tilt |
| `sec_portfolio` | `.sec-portfolio` | 200vh | Horizontal card slider scroll lock (xPercent: -100%) |
| `sec_process` | `.sec-process` | 250vh | Node rail track travel along CatmullRom spline (t: 0 -> 1) |
| `sec_contact` | `.sec-contact` | 120vh | Contact form elevation & particle outro burst |

---

## 11. Mouse Interaction

### 11.1 Smooth Mouse Tracking Loop
Mouse vectors are updated on `mousemove` and smoothed using exponential decay lerp:
```javascript
const rawMouse = new Vector2(0, 0);
const lerpMouse = new Vector2(0, 0);
const velocity = new Vector2(0, 0);

function onMouseMove(e) {
  rawMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  rawMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
}

function update(dt) {
  const lerpFactor = 1 - Math.pow(0.06, dt * 60);
  lerpMouse.lerp(rawMouse, lerpFactor);
  velocity.subVectors(lerpMouse, prevMouse).divideScalar(Math.max(dt, 0.001));
  prevMouse.copy(lerpMouse);
}
```

### 11.2 Interactive Surface Effects
1. **Background Parallax:** Mouse displacement shifts particle layers by 2.5% (parallax = (mouse - 0.5) * 0.025).
2. **Glass Card 3D Tilt:** Hovering over DOM glass cards calculates relative pointer offset (dx, dy) and applies 3D rotation:
   `transform: rotateX(-dy * 10deg) rotateY(dx * 10deg) translateZ(12px)`.
3. **Cursor Glow:** Fast mouse movements (length(velocity)) trigger localized emerald warmth in shader background.
4. **Custom Canvas Cursor:**
   - Outer Ring: Radius 20px, border 1.5px rgba(24, 25, 28, 0.4), lerp 0.12.
   - Inner Dot: Radius 3px, fill #0F8259, lerp 0.02.
   - Target Hover: Scales ring to 1.8x on buttons/links and 2.5x with "BURST" label on 3D X logo.

---

## 12. Master Animation Timeline

```
[0.0s] ── WebGL initialization & 3D Glass X implosion assembly starts (scale 1.8 -> 1.0, duration: 1.2s)
[0.4s] ── Hero UI entrance timeline begins (Glass X visual drop-in)
[0.7s] ── Tagline badge reveal ("PREMIUM DIGITAL AGENCY")
[0.85s]── Headline per-word rotateX slide-up stagger
[1.25s]── Sub-headline paragraph fade-in
[1.4s] ── Primary & Secondary CTA buttons reveal
[1.9s] ── Scroll hint line animation & sparkle rotation active
[3.0s] ── User initiates scroll -> Camera starts pan down along Y-axis
[5.5s] ── Services Section active -> 3x2 Glass Cards stagger in with 3D tilt
[8.0s] ── Process Section active -> CatmullRom Tube Rail illuminates; 8 Node Discs scale 0 -> 1
[9.5s] ── Portfolio Horizontal Slider pins and scrolls cards 01, 02, 03 leftwards
[10.0s]── Contact Section & Outro -> Glass Form Card rises (translateY 60px -> 0px); GPU Particle System bursts 5,000 emerald shimmer particles.
```

---

## 13. Component Breakdown

### 13.1 Navbar (`src/components/dom/Navbar.tsx`)
- Fixed header navigation. Height 80px.
- Contains logo emblem, brand wordmark, 4 navigation links, search pill button, sign-up CTA button.

### 13.2 Hero Section (`src/components/dom/HeroSection.tsx`)
- Viewport hero wrapper.
- Contains tagline badge, GlassX component, per-word headline, sub-headline, dual CTAs, scroll indicator, 4-point sparkles.

### 13.3 Glass X Mesh (`src/components/canvas/GlassXMesh.tsx` / `GlassX.tsx`)
- Real-time 3D mesh or SVG bevelled emblem.
- Material: MeshPhysicalMaterial (color: #0F8259, transmission: 0.95, ior: 1.52, thickness: 0.8, clearcoat: 1.0).
- Features idle Y-rotation (y = sin(t * 0.5) * 0.15) and vertical bobbing.

### 13.4 Services Grid (`src/components/dom/ServicesGrid.tsx`)
- 3-Column x 2-Row CSS Grid of frosted glass cards.
- Cards:
  1. 01 — Seltubic Develops (Leaf icon)
  2. 02 — Nature Interratioc (Screen/laptop icon)
  3. 03 — Completing Services (Building architecture icon)
  4. 04 — Botal Devices
  5. 05 — Mesolty Desinge
  6. 06 — Punic Citama
- Glass card styling: backdrop-filter: blur(20px) saturate(180%), border 1px solid rgba(255,255,255,0.40), hover translateY -8px.

### 13.5 Process Timeline Rail (`src/components/canvas/ProcessRail.tsx`)
- 3D curved tube geometry built via THREE.CatmullRomCurve3 with 5 control points: `[(-4, 0, 0), (-2, 0.5, 0.5), (0, -0.2, 0), (2, 0.4, -0.5), (4, 0, 0)]`.
- Geometry: TubeGeometry(curve, 64, 0.08, 16, false).
- Material: Emerald glass (transmission: 0.92, ior: 1.48, color: #0F8259).
- Features 8 interactive node discs spaced along the curve that scale and illuminate on hover.

### 13.6 Portfolio Horizontal Slider (`src/components/dom/PortfolioSlider.tsx`)
- Pinned horizontal container (xPercent: -100 scrubbed via ScrollTrigger).
- Features large green serif index numbers ("01", "02", "03") in Playfair Display behind glass image cards showcasing 3D glass prism imagery.

### 13.7 Contact Glass Form (`src/components/dom/ContactForm.tsx`)
- 2-Column form grid inside a large frosted glass card (border-radius: 24px, padding 36px).
- Fields: Nest type*, Email*, Dose /access textarea, action button.
- Title: "Let's Build Something Extraordinary Together."

### 13.8 Footer Outro (`src/components/dom/Footer.tsx`)
- Minimalist finale.
- Brand header "CONTROL X" (36px, uppercase, letter-spacing: 0.12em), subtitle "Your Vision x Our Expertise", social media icon links (Facebook, Twitter, Pinterest, Instagram).

---

## 14. Assets Inventory

| Asset Name | Relative Path | Type | Description / Usage |
|---|---|---|---|
| `background.mp4` | `public/videos/background.mp4` | Video | High-resolution fluid background texture loop |
| `Create_a_second_cinematic_e.mp4` | `public/videos/Create_a_second_cinematic_e.mp4` | Video | Reference video 1 — Glass X assembly, process rail, outro |
| `Create_a_second_ultra_reali.mp4` | `public/videos/Create_a_second_ultra_reali.mp4` | Video | Reference video 2 — Navbar, portfolio slider 01 02 03, services |
| `gemini_generated_video_78f3c418.mp4` | `public/videos/gemini_generated_video_78f3c418.mp4` | Video | Reference video 3 — Studio droplet particle background, "From Vision to Reality" |
| `gemini_generated_video_b2655291.mp4` | `public/videos/gemini_generated_video_b2655291.mp4` | Video | Reference video 4 — Particle field motion, "Selected Work" title |

---

## 15. Reference Video Analysis

### 15.1 Video 1: `Create_a_second_cinematic_e.mp4`
- **Purpose:** Demonstrates the 3D Glass X intro assembly, process node rail track, and outro CTA.
- **Scene Details:**
  - Starts with floating glass shards converging into a solid emerald "X" logo on a cream studio floor.
  - Transitions to a process section featuring 8 green glass cylinder discs linked by a curved green tube rail track.
  - Outro displays "Let's Build Something Extraordinary Together." over warm studio backdrop.
- **Lighting & Camera:** Overhead studio key light casting clean ground shadows. Camera holds stationary at z=8.0 during intro then slowly pans down.

### 15.2 Video 2: `Create_a_second_ultra_reali.mp4`
- **Purpose:** Source of truth for Navigation, Services 3x2 Grid, and Portfolio Horizontal Carousel.
- **Scene Details:**
  - Header: Fixed glass bar with "X CONTROL X" logo, center navigation links, search input pill, and "Sign Up" button.
  - Portfolio Section: Pinned horizontal slider displaying giant emerald index numbers ("01", "02", "03") behind glass image cards.
  - Services Section: 3-column glass cards ("Seltubic Develops", "Nature Interratioc", "Completing Services") with green line icons and "Read more" buttons.
- **Composition & Floor:** Floor plane reflects the glass cards and 3D emblem with soft ground blur.

### 15.3 Video 3: `gemini_generated_video_78f3c418.mp4`
- **Purpose:** Studio environment and background droplet particle dynamics.
- **Scene Details:**
  - Displays warm neutral backdrop (#EBE9E1) with soft center lighting falloff.
  - Dozens of small, semi-transparent glass droplets float slowly upwards with subtle depth-of-field blur.
  - Displays "From Vision to Reality" title with a green underline indicator below "From Vision".
  - A subtle 4-point sparkle star rests in the lower right corner.

### 15.4 Video 4: `gemini_generated_video_b2655291.mp4`
- **Purpose:** Secondary particle motion validation & section headline styling.
- **Scene Details:**
  - Features "Selected Work" title with green underline accent.
  - Background droplets show smooth vertical drift and soft refraction highlights.
  - Confirms studio vignette falloff toward screen corners.

---

## 16. Engineering Notes

1. **Dual-Layer Architecture:**
   - WebGL Canvas MUST reside on a fixed, full-screen background layer (z-index: 0, pointer-events: none).
   - DOM UI Overlay MUST reside on top (z-index: 10, pointer-events: none on container, pointer-events: auto on interactive buttons/cards/inputs).
2. **Glass Material Transmission:**
   - In Three.js MeshPhysicalMaterial, transmission = 0.95 requires transparent = true, opacity = 1.0, and proper environment mapping to render refractions correctly.
   - IOR MUST be set to 1.52 for physical glass fidelity.
3. **GSAP & Lenis Integration:**
   - Always synchronize Lenis scroll events to GSAP ScrollTrigger via `lenis.on('scroll', ScrollTrigger.update)` and update Lenis inside `gsap.ticker`.
   - Set `gsap.ticker.lagSmoothing(0)` to eliminate scroll stutter during heavy WebGL frame rendering.

---

## 17. Implementation Order

To ensure zero regressions and structured progress, building must follow this strict sequence:

1. **Phase 1 — Core Infrastructure:**
   - App shell (`layout.tsx`), Tailwind tokens, Google Fonts loading (Playfair Display + Plus Jakarta Sans).
   - Lenis smooth scroll engine setup & GSAP ScrollTrigger registration.
2. **Phase 2 — WebGL Stage & Background:**
   - Fullscreen WebGL Canvas setup with PerspectiveCamera (FOV = 45deg).
   - Three-point lighting rig (Key, Fill, Emerald Accent).
   - Studio background shader & particle system layer.
3. **Phase 3 — Navigation & Hero Section:**
   - Navigation component (`Navbar.tsx`) with scroll glass blur.
   - GlassX 3D emblem mesh (`GlassXMesh.tsx`).
   - Editorial headline, sub-headline, dual CTAs, scroll indicator, GSAP entrance timeline.
4. **Phase 4 — Services Grid Section:**
   - 3x2 Glassmorphism card grid (`ServicesGrid.tsx`).
   - Hover 3D tilt transform & border sheen interactions.
5. **Phase 5 — Portfolio Pinned Carousel:**
   - Pinned horizontal scroll container (`PortfolioSlider.tsx`).
   - Parallax index numbers ("01", "02", "03") and glass cards.
6. **Phase 6 — Process Node Rail Track:**
   - CatmullRom 3D tube geometry & 8 interactive node discs (`ProcessRail.tsx`).
   - ScrollTrigger progress parameter t binding.
7. **Phase 7 — Contact Form & Outro:**
   - 2-column glass form card (`ContactForm.tsx`).
   - GPU particle burst stream on submit/hover.
   - Footer section (`Footer.tsx`).

---

## 18. Known Issues & Past Lessons

1. **WebGL Mouse Event Passthrough:**
   - Setting `pointer-events: none` on the canvas element is mandatory so mouse events pass through DOM containers to window listeners without blocking UI interactions.
2. **UV Clamping & Edge Stretching Artifacts:**
   - When displacement shaders are applied, UV sampling near screen edges can stretch border pixels. An edge attenuation mask (`eMask = smoothstep(0, M, uv.x) * smoothstep(1, 1-M, uv.x) ...`) with margin M = 0.20 MUST be applied to taper displacement forces to exactly 0 at borders.
3. **Particle Over-saturation:**
   - Particles must NOT be rendered as bold white emissive circles. They must be semi-transparent refractive glass droplets (opacity: 0.028 - 0.08) with subtle rim highlights matching the studio lighting.
"""

with open('c:/ControlX/generate_knowledge_doc.py', 'w', encoding='utf-8') as f:
    f.write(doc_content)

print("Generator script written successfully.")
