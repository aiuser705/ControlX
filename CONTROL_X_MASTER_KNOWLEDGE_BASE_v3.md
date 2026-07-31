# CONTROL X — MASTER REVERSE ENGINEERING KNOWLEDGE BASE (v3.0)

**Document Version:** 3.0.0-CANONICAL-MASTER  
**Status:** Single Source of Truth & Project Encyclopedia  
**Scope:** Exhaustive Reverse Engineering Analysis of All Specifications, Source Code, Shaders, Design Systems, Bug Histories, Engineering Decisions, and Reference Videos.

---

## 1. Source of Truth & Asset Audit

### 1.1 Document & Specification Inventory

| Document Identifier | File Path / Source | Size / Length | Canonical Role |
|---|---|---|---|
| Master Specification v2.2 (PDF) | `CONTROL_X_MASTER_SPEC_v2_2.pdf` | 44,631 bytes (13 pages) | Primary Architectural & Design System Blueprint |
| Master Specification Text | `CONTROL_X_MASTER_SPEC.md1.txt` | 27,474 bytes (334 lines) | Markdown text translation of Master PDF |
| Next.js Blueprint | `CONTROL_X_NEXT_BLUEPRINT.md.txt` | 13,909 bytes | Next.js + React Three Fiber + Tailwind Implementation Spec |
| Specification Prompt JSON 1 | `json1.txt` | 13,156 bytes | Timeline, Background Shader & Section Specs |
| Specification Prompt JSON 2 | `json2.txt` | 25,268 bytes | Portfolio Grid, Motion Registry & Glass Material Tokens |
| Specification Prompt JSON 3 | `json3.txt` | 25,434 bytes | Process Timeline Rail & Spline Path Specifications |
| Specification Prompt JSON 4 | `json4.txt` | 25,007 bytes | Contact Form, Outro Experience & GPU Particle System |
| Master Knowledge Document v2.2 | `CONTROL_X_PROJECT_KNOWLEDGE.md` | 27,871 bytes (485 lines) | Previous iteration project knowledge document |

### 1.2 Reference Video Inventory & Empirical Analysis

All video assets run at $1280 \times 720$ resolution at $24.00\text{ FPS}$ with a total duration of $10.00\text{ seconds}$ ($240\text{ total frames}$).

```
========================================================================================
VIDEO TIMELINE FRAME MAP (0 to 240 Frames / 0.0s to 10.0s)
========================================================================================
Frame:  0        24       48       72       96       120      144      168      192      216      240
Time:   0.0s     1.0s     2.0s     3.0s     4.0s     5.0s     6.0s     7.0s     8.0s     9.0s     10.0s
        │        │        │        │        │        │        │        │        │        │        │
Video 1:├─── Glass X Assembly ────┼───── Scroll to Process Rail ───┼───── Contact Form & Outro ───┤
Video 2:├─── Nav Header & Hero ───┼───── Services 3x2 Grid ────────┼───── Portfolio Carousel ─────┤
Video 3:├─── "From Vision to Reality" + Studio Glass Droplets Floating ─────────────────────────┤
Video 4:├─── "Selected Work" + Vignette & Particle Drift Field ─────────────────────────────────┤
========================================================================================
```

#### Detailed Video Asset Matrix

| Asset Filename | Dimensions | FPS | Frame Count | Duration | Motion Energy (Avg / Max Diff) | Primary Feature / Reference Scene |
|---|---|---|---|---|---|---|
| `background.mp4` | $1280 \times 720$ | 24.00 | 240 frames | 10.00s | 15.288 / 18.014 | Smooth fluid silk cream distortion texture loop |
| `Create_a_second_cinematic_e.mp4` | $1280 \times 720$ | 24.00 | 240 frames | 10.00s | 14.796 / 33.035 | Glass X implosion assembly, 3D curved tube rail, node discs, outro title |
| `Create_a_second_ultra_reali.mp4` | $1280 \times 720$ | 24.00 | 240 frames | 10.00s | 21.954 / 52.710 | Glass Navbar, Services 3x2 Grid, Portfolio horizontal slider ("01", "02", "03") |
| `gemini_generated_video_78f3c418.mp4` | $1280 \times 720$ | 24.00 | 240 frames | 10.00s | 19.954 / 34.221 | Studio background lighting, floating glass droplets, "From Vision to Reality" |
| `gemini_generated_video_b2655291.mp4` | $1280 \times 720$ | 24.00 | 240 frames | 10.00s | 22.698 / 42.399 | Studio vignette falloff, particle drift, "Selected Work" title with green underline |

---

## 2. Glass X Logo Shard-by-Shard & Mesh Specification

### 2.1 Geometric Assembly Architecture
The 3D emblem operates as an assembled "X" letterform constructed from bevelled emerald glass shards (`MeshPhysicalMaterial`).

- **World Origin:** $(0.0, 0.0, 0.0)$
- **Bounding Box Dimensions:** Width $2.4\text{ units}$, Height $2.4\text{ units}$, Depth $0.8\text{ units}$ (DOM scale equivalent: $240\text{px} \times 240\text{px}$).
- **Material Specification (`mat_emerald_glass`):**
  - Shader Type: `THREE.MeshPhysicalMaterial`
  - Base Tint Color: `#0F8259` (RGB: `0.059, 0.510, 0.349`)
  - Transmission / Transparency: $0.95$ ($95\%$ optical transmission)
  - Opacity: $1.0$ (Alpha channel governed by transmission shader pass)
  - Index of Refraction ($IOR$): $1.52$ (Crown Glass optical physics)
  - Volumetric Attenuation Color: `#0F8259`
  - Attenuation Distance: $0.5\text{ units}$
  - Surface Roughness: $0.05$ (High polish surface)
  - Metalness: $0.0$ (Non-metallic dielectric)
  - Clearcoat: $1.0$ (Polished glass outer glaze)
  - Clearcoat Roughness: $0.10$
  - Reflectivity: $0.90$

### 2.2 Implosion Assembly Dynamics (Frames 0 - 29 / 0.0s - 1.2s)
During frames 0 to 29, the glass shards converge from a randomized 3D spatial field into the centered "X" emblem.

```
       [Dispersed Shards (Spread: 4.0u, Scale: 1.8x, Opacity: 0.0)]
                                   │
                                   │ Implosion Assembly (t: 0.0s -> 1.2s)
                                   │ Easing: cubic-bezier(0.16, 1, 0.3, 1)
                                   ▼
          [Assembled Solid Emerald Glass X (Scale: 1.0x, Opacity: 1.0)]
                                   │
                                   │ Continuous Idle Loop
                                   │ Rotation Y: sin(t * 0.5) * 0.15 rad
                                   ▼
                     [Interactive Mouse Parallax Tilt]
```

#### Representative Shard Dispersal & Motion Breakdown

| Shard ID | Shape Classification | Local Target Position (X,Y,Z) | Dispersal Spawn Origin (X,Y,Z) | Initial Scale | Delay | Movement Path / Easing |
|---|---|---|---|---|---|---|
| `Shard_01` | Top-Left Outer Tip | `(-0.90,  0.90, 0.10)` | `(-3.20,  2.80, 2.50)` | 1.80x | 0.00s | Linear vector implode $\rightarrow$ `cubic-bezier(0.16, 1, 0.3, 1)` |
| `Shard_02` | Top-Left Inner Bevel | `(-0.45,  0.45, 0.05)` | `(-1.80,  1.90, 1.80)` | 1.65x | 0.04s | Spiral curve rotation around Z $\rightarrow$ settled |
| `Shard_03` | Top-Right Outer Tip | `( 0.90,  0.90, 0.10)` | `( 3.50,  3.10, 2.20)` | 1.85x | 0.02s | Direct ray implode with $-15^\circ$ Z-rotation |
| `Shard_04` | Top-Right Inner Bevel | `( 0.45,  0.45, 0.05)` | `( 1.90,  1.70, 1.40)` | 1.50x | 0.06s | Vector decay deceleration $\rightarrow$ snap |
| `Shard_05` | Center Intersection Core | `( 0.00,  0.00, 0.20)` | `( 0.00,  0.00, 4.00)` | 2.20x | 0.08s | Pure Z-axis plunge forward to focal origin |
| `Shard_06` | Bottom-Left Outer Tip | `(-0.90, -0.90, 0.10)` | `(-3.40, -2.60, 2.10)` | 1.75x | 0.03s | Implode with $+20^\circ$ Y-rotation roll |
| `Shard_07` | Bottom-Right Outer Tip | `( 0.90, -0.90, 0.10)` | `( 3.10, -2.90, 2.80)` | 1.80x | 0.05s | Implode with $-18^\circ$ X-rotation tilt |
| `Shard_08...34` | Secondary Surface Facets | Intersecting perimeter | Radial distribution ($R \approx 3.5\text{u}$) | $1.4\text{x}-1.9\text{x}$ | $0.01\text{s}-0.12\text{s}$ | Staggered implosion pool matching Motion Registry `anim_shatter_implosion` |

---

## 3. Background & Atmosphere Reverse Engineering

### 3.1 Surface Types & Dual Background Models

The project contains two distinct background reference models:

#### Model A: Studio Stage Environment (`gemini_generated_video_78f3c418.mp4` / `json1.txt`)
- **Primary Color:** `#EBE9E1` (RGB: `235, 233, 225` / Normalized: `0.922, 0.914, 0.882`).
- **Lighting Hotspot:** Overhead softbox oval emission centered at $(x: 50\%, y: 30\%)$. Hotspot peak color: `#FAF9F5` (`0.980, 0.976, 0.961`).
- **Midtone Transition:** `#C7C3BC` (`0.780, 0.765, 0.737`) at radius $0.42\text{ UV}$.
- **Vignette Perimeter:** Dark grey-brown corners `#615A51` (`0.380, 0.354, 0.318`) fading smoothly outward from radius $0.38\text{ UV}$ to $0.92\text{ UV}$.
- **Floor Plane Strip:** Horizontal floor region occupying bottom $18\%$ ($y < 0.18\text{ UV}$). Color: `#C3BBB1` (`0.765, 0.733, 0.690`). Shadow contact line at wall/floor intersection ($y = 0.06\text{ UV}$): `#A09790` (`0.627, 0.596, 0.557`).
- **Micro Film Grain:** Noise texture pass overlay (`opacity: 0.012 - 0.030`) to eliminate 8-bit banding artifacts.

#### Model B: Liquid Silk Wave Shader (`shd_background` / `background.mp4`)
- **GLSL Wave Formula:**
  $$\text{wave} = \sin(\text{st.x} \cdot 4.0 + uTime \cdot 0.5 + \text{mouse.x}) \cdot \cos(\text{st.y} \cdot 4.0 + uTime \cdot 0.5 + \text{mouse.y}) \cdot 0.05$$
- **Color Mix:** Vertical linear gradient from `#FAF9F5` (start) to `#E2DFD5` (end) perturbed by $\text{wave}$ displacement.

---

## 4. Particle Dynamics & Fluid Physics Specification

### 4.1 Particle System Configurations

#### Tier 1: Ambient Studio Glass Droplets (Reference Videos 3 & 4)
- **Active Count:** 40 to 50 floating refractive glass droplets.
- **Spawn Behavior:** Continuous slow upward float along Y-axis with subtle horizontal sine drift.
- **Particle Layer Breakdown:**
  - **Foreground (Close):** Radius $18\text{px} - 28\text{px}$, Opacity $0.08$, high depth-of-field blur, speed $0.038\text{u/s}$.
  - **Midground:** Radius $8\text{px} - 16\text{px}$, Opacity $0.05$, crisp rim highlights, speed $0.024\text{u/s}$.
  - **Background (Far):** Radius $2\text{px} - 5\text{px}$, Opacity $0.028$, crisp micro-dots, speed $0.012\text{u/s}$.
- **Refraction & Specular Formula:**
  - Rim highlight: $\text{rim} = \exp(-(\text{nd} \cdot 3.6)^2) \cdot \text{step}(\text{nd}, 1.1)$
  - Key light catchlight: $\text{spec} = \max(0.0, \vec{d} \cdot \hat{L}_{\text{key}})^{10} \cdot \text{smoothstep}(0.05, -0.50, \text{nd})$

#### Tier 2: Interactive GPU Particle Burst Stream (`json4.txt`)
- **System Type:** `GPUParticleSystem` with `InstancedBufferAttribute`.
- **Capacity:** $5,000$ active particles.
- **Color Range:** Gradient blend between `#0F8259` (Emerald Accent), `#10B981` (Light Emerald), and `#A7F3D0` (Mint Highlight).
- **Particle Size Range:** $2.0\text{px} - 6.0\text{px}$ randomized per particle instance.
- **Velocity Vector Math:** Spiral trajectory around Y-axis:
  $$\vec{v} = \begin{pmatrix} -\sin(t) \cdot r \\ 0.5 \\ \cos(t) \cdot r \end{pmatrix}$$
- **Trigger:** Fired on cursor click on 3D X logo or Contact Form submit button. Duration: $1.2\text{s}$, Easing: `cubic-bezier(0.25, 1, 0.5, 1)`.

---

## 5. Cinematic Camera System & Choreography

### 5.1 Camera Rig Blueprint
- **Camera Class:** `THREE.PerspectiveCamera`
- **Focal Length / Field of View:** $FOV = 45^\circ$
- **Near Clipping Plane:** $0.1\text{ units}$
- **Far Clipping Plane:** $1000.0\text{ units}$
- **Initial Coordinates:** Position $(0.0, 0.0, 8.0)$, LookAt $(0.0, 0.0, 0.0)$.

### 5.2 Complete Keyframe Schedule

| Timeline / Scroll Range | Camera Position (X, Y, Z) | Camera Rotation (X, Y, Z) | Easing Function | Active Section & Target Focal State |
|---|---|---|---|---|
| `00:00.000` (0% Scroll) | `(0.0, 0.0, 8.0)` | `(0.0, 0.0, 0.0)` | `linear` | Hero Entrance: Locked camera focal hold on assembling Glass X |
| `00:01.500` (15% Scroll) | `(0.0, 0.0, 8.0)` | `(0.0, 0.0, 0.0)` | `cubic-bezier(0.16, 1, 0.3, 1)` | Hero Section Hold: Zero tilt, stable UI overlay framing |
| `00:04.500` (40% Scroll) | `(0.0, -2.2, 9.2)` | `(-0.05, 0.0, 0.0)` | `cubic-bezier(0.16, 1, 0.3, 1)` | Services Section: Pan down along Y, pitch camera $-2.86^\circ$ ($0.05\text{rad}$) down |
| `00:07.500` (70% Scroll) | `(0.0, -5.5, 7.8)` | `(0.0, 0.0, 0.0)` | `cubic-bezier(0.16, 1, 0.3, 1)` | Process Section: Zoom in to $Z=7.8$, tracking curved tube rail |
| `00:10.000` (100% Scroll) | `(0.0, -7.2, 7.5)` | `(0.0, 0.0, 0.0)` | `cubic-bezier(0.25, 1, 0.5, 1)` | Contact Form & Outro: Final focus lock on glass form card and footer |

---

## 6. Physical Lighting & Optical Rig

### 6.1 Three-Point Studio Lighting Specification

```
                          [Key Light]
                    (5.0, 10.0, 7.0) / Int: 1.2
                         │  \
                         │   \ Direct Key Rays
                         ▼    ▼
 [Fill Light] ──────────────> [Target: 3D Glass X] <────────────── [Point Light]
 (-5.0, -2.0, 4.0) / Int: 0.5   (0.0, 0.0, 0.0)             (0.0, -1.0, 2.0) / Int: 0.8
 Soft Neutral Fill                                          Emerald Accent Highlight
```

#### Detailed Light Configurations

| Light ID | Type | Color Hex | Intensity | World Position (X, Y, Z) | Shadow Config / Distance / Decay |
|---|---|---|---|---|---|
| `key_light` | DirectionalLight | `#FFFFFF` | 1.20 | `(5.0, 10.0, 7.0)` | Cast Shadow: `true`, Shadow Bias: `-0.0001`, Map Size: $2048 \times 2048$ |
| `fill_light` | DirectionalLight | `#D1E7DD` | 0.50 | `(-5.0, -2.0, 4.0)` | Cast Shadow: `false` (Soft ambient contrast fill) |
| `emerald_accent` | PointLight | `#0F8259` | 0.80 | `(0.0, -1.0, 2.0)` | Distance: $10.0\text{u}$, Decay: $2.0$, Cast Shadow: `false` |
| `particle_glow` | PointLight | `#10B981` | 1.00 | `(0.0, -5.0, 1.0)` | Distance: $8.0\text{u}$, Decay: $2.0$ (Illuminates particle outro burst) |
| `ambient_stage` | AmbientLight | `#FFFFFF` | 0.60 | N/A | Global background ambient illumination |

---

## 7. DOM UI Overlay & Component Reverse Engineering

### 7.1 Navigation Bar (`Navbar.tsx` / `comp_navbar`)
- **Dimensions:** Fixed top $0$, left $0$, width $100\%$, height $80\text{px}$ ($72\text{px}$ compact), padding horizontal $48\text{px}$.
- **Unscrolled Style:** `background: transparent`, `backdrop-filter: blur(0px)`.
- **Scrolled Style (`scrollY > 40px`):** `background: rgba(235, 233, 225, 0.75)`, `backdrop-filter: blur(24px) saturate(180%)`, `box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06)`.
- **Left Brand Logo:** Emerald badge $28\text{px} \times 28\text{px}$ (`#0F8259`, radius `6px`, bold white serif "X") + "CONTROL X" wordmark (Plus Jakarta Sans 600, `14px`, uppercase, `letter-spacing: 0.12em`).
- **Center Nav Links:** "Services" / "Design", "Work" / "Create & More", "About" / "Testing", "Process" / "Sports", "More". Gap: `40px`. Hover: `#0F8259` underline expands from `0%` to `100%` width (`0.3s cubic-bezier(0.16, 1, 0.3, 1)`).
- **Right Action Buttons:**
  - Search Button: Pill button (`rgba(255,255,255,0.18)` fill, `1px solid rgba(255,255,255,0.45)` border, radius `9999px`, padding `8px 20px`, SVG search icon).
  - Sign Up Button: Solid pill button (`#0F8259` fill, `#FFFFFF` text, radius `9999px`, padding `8px 20px`). Hover: translateY `-1px`, `#10B981` fill, `box-shadow: 0 6px 20px rgba(15, 130, 89, 0.35)`.

### 7.2 Hero Section (`HeroSection.tsx` / `sec_hero`)
- **Container:** Height $100\text{vh}$ ($100\text{svh}$), centered flex column.
- **Tagline Badge:** Pulsing emerald dot ($6\text{px}$) + "PREMIUM DIGITAL AGENCY" (`12px`, uppercase, `letter-spacing: 0.18em`, `#0F8259`).
- **Main Headline:** "We Build Digital Experiences" (Playfair Display 600, size `clamp(2.8rem, 6vw, 5.2rem)`), per-word split wrapper for GSAP rotateX reveal.
- **Subline:** "Luxury interfaces. Cinematic motion. Zero compromise. Built for brands that demand the extraordinary.", Plus Jakarta Sans 300, size `16px - 18px`, color `#686D76`, line height `1.7`.
- **CTA Group:** Primary "View Our Work" (`#0F8259` fill) + Secondary "Start a Project" (`rgba(255,255,255,0.25)` frosted glass).
- **Scroll Indicator:** Vertical line ($52\text{px}$) with infinite scale/fade loop + "SCROLL" label (`10px`, `letter-spacing: 0.2em`).
- **Sparkles:** 4-point star symbols (`✦`) top-right (18% top, 8% right) and bottom-left (22% bottom, 6% left) with slow rotation spin (`8s` - `15s`).

### 7.3 Services 3x2 Grid (`ServicesGrid.tsx` / `sec_services`)
- **Grid Layout:** CSS Grid 3 Columns $\times$ 2 Rows, Column Gap $24\text{px}$, Row Gap $32\text{px}$, padding $120\text{px}$ top/bottom.
- **Card Material Class (`.comp-glass-card` / `.mat-ui-glass-panel`):**
  - `background: rgba(255, 255, 255, 0.25)`
  - `backdrop-filter: blur(20px) saturate(180%)`
  - `border: 1px solid rgba(255, 255, 255, 0.40)`
  - `border-radius: 16px` (or `20px`)
  - `padding: 32px`
  - `box-shadow: 0 20px 40px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.6)`
- **Card Data Items:**
  1. `01` — **Seltubic Develops** (Leaf icon)
  2. `02` — **Nature Interratioc** (Laptop/screen icon)
  3. `03` — **Completing Services** (Architecture/building icon)
  4. `04` — **Botal Devices**
  5. `05` — **Mesolty Desinge**
  6. `06` — **Punic Citama**
- **Hover Interaction:** Card translates Y `-8px`, scale $1.01\times$, border opacity brightens to `0.80` over `0.4s cubic-bezier(0.16, 1, 0.3, 1)`. Mousemove calculates relative pointer $(dx, dy)$ and applies 3D tilt: `rotateX(-dy * 10deg) rotateY(dx * 10deg) translateZ(12px)`.

### 7.4 Portfolio Horizontal Slider (`PortfolioSlider.tsx` / `sec_portfolio`)
- **Scroll Behavior:** Pinned horizontal container (`xPercent: -100%` scrubbed via GSAP ScrollTrigger across `200vh` scroll duration).
- **Cards:** 3 horizontal showcase cards featuring giant emerald index numbers ("01", "02", "03") in Playfair Display 700 behind glass image containers.

### 7.5 Process Node Rail Track (`ProcessRail.tsx` / `sec_process`)
- **3D Spline Geometry:** Built via `THREE.CatmullRomCurve3` with control points `[(-4, 0, 0), (-2, 0.5, 0.5), (0, -0.2, 0), (2, 0.4, -0.5), (4, 0, 0)]`.
- **Tube Mesh:** `TubeGeometry(curve, 64, 0.08, 16, false)` with emerald glass material (`transmission: 0.92`, `ior: 1.48`, `color: #0F8259`).
- **Node Discs:** 8 instanced green glass cylinder discs spaced along spline parameter $t \in [0, 1]$. Hovering node disc scales instance to $1.25\times$, illuminates point light to intensity $1.5$, and fades in glass detail card.

### 7.6 Contact Glass Form Card (`ContactForm.tsx` / `sec_contact`)
- **Layout:** 2-Column Grid Form inside large glass card (`border-radius: 24px`, padding `36px`).
- **Fields:** `Nest type*` (text input), `Email*` (email input), `Dose /access` (textarea), Action Submit Button.
- **Headline:** "Let's Build Something Extraordinary Together." (Playfair Display 600, `48px`).

---

## 8. Complete Animation Timeline & Motion Registry

```
========================================================================================
MASTER ANIMATION TIMELINE (0.0s to 10.0s)
========================================================================================
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
========================================================================================
```

### Complete Motion Registry Table

| Motion ID | Target Element | Trigger | Duration | Delay / Stagger | Easing Curve | Property Transforms (`from` $\rightarrow$ `to`) |
|---|---|---|---|---|---|---|
| `anim_shatter_implosion` | `obj_3d_x_assembly` | On Load | 1.20s | 0.00s | `cubic-bezier(0.16, 1, 0.3, 1)` | Scale: $1.8 \rightarrow 1.0$, Opacity: $0.0 \rightarrow 1.0$, Shards Spread: $4.0 \rightarrow 0.0$ |
| `anim_hero_text_reveal` | `.hero-word` | Timeline | 1.00s | Stagger 0.08s | `cubic-bezier(0.16, 1, 0.3, 1)` | RotateX: $12^\circ \rightarrow 0^\circ$, TranslateY: $36\text{px} \rightarrow 0\text{px}$, Opacity: $0.0 \rightarrow 1.0$ |
| `anim_card_stagger_enter` | `.service-card` | ScrollTrigger | 1.00s | Stagger 0.15s | `cubic-bezier(0.16, 1, 0.3, 1)` | TranslateY: $80\text{px} \rightarrow 0\text{px}$, Scale: $0.92 \rightarrow 1.0$, Opacity: $0.0 \rightarrow 1.0$, Blur: $10\text{px} \rightarrow 0\text{px}$ |
| `anim_node_disc_entrance` | `.node-disc` | ScrollTrigger | 0.50s | Stagger 0.06s | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Scale: $0.0 \rightarrow 1.0$, Opacity: $0.0 \rightarrow 1.0$ |
| `anim_portfolio_slide` | `.portfolio-track` | Scrub Scroll | 2.00s (virtual) | 0.00s | `linear` (scrub) | XPercent: $0\% \rightarrow -100\%$ |
| `anim_form_card_rise` | `.contact-card` | ScrollTrigger | 0.80s | 0.10s | `cubic-bezier(0.16, 1, 0.3, 1)` | TranslateY: $60\text{px} \rightarrow 0\text{px}$, Scale: $0.95 \rightarrow 1.0$, Opacity: $0.0 \rightarrow 1.0$ |

---

## 9. Mouse Interaction & Cursor System

### 9.1 Custom Canvas Pointer Blueprint
- **Type:** Dual-element custom canvas cursor overlay (`z-index: 999`, `pointer-events: none`).
- **Outer Ring:** Radius $20\text{px}$, border $1.5\text{px}$ `rgba(24, 25, 28, 0.4)`, lerp smoothness $0.12$.
- **Inner Dot:** Radius $3\text{px}$, fill `#0F8259`, lerp smoothness $0.02$.
- **Hover State Transformations:**
  - `a, button, .nav-link`: Outer ring scales to $1.8\times$, fill becomes `rgba(15, 130, 89, 0.15)`, inner dot hides.
  - `.service-card`, `.glass-card`: Outer ring scales to $2.2\times$, displays label text "VIEW".
  - `.node-disc`: Outer ring scales to $2.4\times$, displays label text "INSPECT".
  - `#3d-x-logo`: Outer ring scales to $2.5\times$, displays label text "BURST".

---

## 10. Engineering Decisions Log (Accepted vs. Rejected)

### Decision 001: Video Background vs. Procedural GLSL Background
- **Status:** **REJECTED (Single VideoTexture)** / **ACCEPTED (Procedural GLSL Shader / Dual-Buffer Crossfade)**
- **Reason:** Standard single `THREE.VideoTexture` playback exhibits a noticeable $1$-frame visual jump on loop restart because video codecs lack seamless frame boundary matching.
- **Accepted Workaround:** If using video assets, dual-video buffer (`videoA` + `videoB`) crossfade state machine MUST be used. If using WebGL shaders, a pure GLSL procedural studio backdrop eliminates video loading overhead and provides resolution independence.

### Decision 002: Dual-Layer DOM / WebGL Z-Index Architecture
- **Status:** **ACCEPTED**
- **Reason:** Separating the WebGL stage (`z-index: 0`) from the DOM UI overlay (`z-index: 10`) guarantees that heavy DOM reflows do not block WebGL draw calls, while allowing CSS `backdrop-filter: blur()` to blend directly with WebGL framebuffer output.

### Decision 003: Lenis Smooth Scroll Synchronized with GSAP Ticker
- **Status:** **ACCEPTED**
- **Reason:** Binding Lenis smooth scroll updates directly inside `gsap.ticker` with `gsap.ticker.lagSmoothing(0)` prevents frame drops and synchronization jitter between DOM scroll triggers and 3D camera transforms.

---

## 11. Complete Bug History & Regression Diagnosis

### Bug 001: WebGL Canvas Blocking Pointer Events
- **Symptom:** Hovering over DOM links and buttons failed to trigger cursor pointer states.
- **Root Cause:** WebGL `<canvas>` lacked `pointer-events: none` CSS property, capturing pointer events prior to DOM event bubbling.
- **Fix:** Applied `pointer-events: none` to canvas container; attached mousemove listener directly to `window`.

### Bug 002: UV Clamping Edge Stretching Artifacts
- **Symptom:** Horizontal and vertical pixel streaks along the right and top edges of the viewport during fast mouse displacement.
- **Root Cause:** Displaced UV coordinates exceeded $[0, 1]$ bounds; `THREE.ClampToEdgeWrapping` repeated edge pixel colors across out-of-bound samples.
- **Fix:** Implemented edge attenuation mask (`eMask`) in fragment shader with margin $M = 0.20$ to force displacement vectors to exactly $0.0$ at all screen borders.

### Bug 003: Particle Over-Saturation & High Emissive Glow
- **Symptom:** Background particles rendered as heavy, opaque white glowing circles.
- **Root Cause:** Particle opacity values were initialized to $0.28$, and rim lighting lacked depth attenuation.
- **Fix:** Reduced particle opacity values to $0.028 - 0.080$, shrunk radius scales, and implemented depth-based opacity scaling (`mix(1.0, 0.18, dep)`).

---

## 12. Safest Implementation Order & Dependency Graph

```
                                  [Phase 1: App Shell & Lenis Engine]
                                                  │
                                                  ▼
                                  [Phase 2: WebGL Stage & Background Pass]
                                                  │
                                                  ▼
                                  [Phase 3: Navbar & Hero UI Section]
                                                  │
                                                  ▼
                                  [Phase 4: Services 3x2 Glass Grid]
                                                  │
                                                  ▼
                                  [Phase 5: Portfolio Pinned Carousel]
                                                  │
                                                  ▼
                                  [Phase 6: Process Node Rail Track]
                                                  │
                                                  ▼
                                  [Phase 7: Contact Form & Outro Burst]
```

### Regression Safeguards
1. **Never update DOM layers and WebGL shaders simultaneously:** Validate DOM layout prior to binding WebGL uniform uniforms.
2. **Commit verification checkpoint before each section:** Verify stable 60 FPS performance in browser sandbox before advancing to subsequent implementation phases.

---

## 13. Future AI Handoff & Maintenance Manual

### Critical File Access Order for Future Sessions
1. **Primary Spec:** `CONTROL_X_PROJECT_KNOWLEDGE.md` & `CONTROL_X_MASTER_KNOWLEDGE_BASE_v3.md`
2. **Page Layer Architecture:** `src/app/page.tsx`
3. **Design System & Tokens:** `src/styles/globals.css` & `tailwind.config.js`
4. **Hero UI Overlay:** `src/components/dom/HeroSection.tsx` & `src/components/dom/Navigation.tsx`
5. **Glass 3D Emblem:** `src/components/dom/GlassX.tsx` / `src/components/canvas/GlassXMesh.tsx`

### Locked Approved Systems (DO NOT MODIFY WITHOUT APPROVAL)
- ✅ `globals.css` Design System Tokens & Color Variables
- ✅ Lenis / GSAP ScrollTrigger Synchronization Ticker
- ✅ WebGL Canvas Layer Stacking (`z-index: 0`, `pointer-events: none`)
- ✅ GLSL Edge Attenuation Mask Margin ($M = 0.20$)
