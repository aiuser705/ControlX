# Control X — Comprehensive Frontend Architecture & Website Structure

> **Document Purpose**: Complete, granular mapping of the entire Control X frontend codebase prior to backend architecture and integration. Every route, section, visual element, interactive control, form field, hardcoded data structure, and static asset is documented verbatim from active source code in `src/app` and `src/components`.

---

## Known Gaps

This unnumbered audit highlights every incomplete interaction, dummy handler, mock authentication flow, and missing backend connection currently present in the frontend code:

1. **Global Search Action (Navigation)**:
   - **File**: [`src/components/dom/Navigation.tsx`](file:///c:/ControlX/src/components/dom/Navigation.tsx#L91) & [`Navigation.tsx:L172`](file:///c:/ControlX/src/components/dom/Navigation.tsx#L172)
   - **Issue**: The desktop button `"Search"` and mobile button `"Search Website"` have no search modal, drawer, or query logic attached. Clicking the mobile button only closes the drawer.
   - **Backend Needed**: Search index or endpoint (`GET /api/search?q=...`) to query services, case studies, process steps, and articles.

2. **"Explore Service" Buttons (Services Section)**:
   - **File**: [`src/components/dom/ServicesSection.tsx`](file:///c:/ControlX/src/components/dom/ServicesSection.tsx#L299-L305)
   - **Issue**: All 6 cards render an `<button className="service-card__btn" type="button">Explore Service →</button>` with no `onClick` handler, modal trigger, or link navigation.
   - **Backend Needed**: Dynamic routing to dedicated service detail pages (`/services/[slug]`) or a modal displaying detailed service offerings, pricing tiers, and deliverables fetched from CMS/database.

3. **Workflow Step Detail CTAs (Process Section)**:
   - **File**: [`src/components/dom/ProcessSection.tsx`](file:///c:/ControlX/src/components/dom/ProcessSection.tsx#L813-L815)
   - **Issue**: 8 workflow steps render action buttons (`"Learn more about Discovery"`, `"Learn more about Research"`, etc.) with `type="button"` and zero `onClick` logic.
   - **Backend Needed**: CMS-backed modal, documentation drawer, or deep-dive route (`/process/[step]`) explaining deliverables and client checkpoints.

4. **Brand Story Collaboration Buttons (Brand Story Section)**:
   - **File**: [`src/components/dom/BrandStorySection.tsx`](file:///c:/ControlX/src/components/dom/BrandStorySection.tsx#L657-L673)
   - **Issue**: 4 relationship buttons (`"Control X × Creator"`, `"Control X × Startup"`, etc.) trigger hover animations and particle trajectories, but `onClick` performs no navigation or filtering.
   - **Backend Needed**: Audience-specific onboarding flow, landing page filters, or inquiry pre-configuration (`/contact?tier=creator`).

5. **Contact Form Submission (Contact Section)**:
   - **File**: [`src/components/dom/ContactSection.tsx`](file:///c:/ControlX/src/components/dom/ContactSection.tsx#L172-L176)
   - **Issue**: `handleSubmit` executes `e.preventDefault()` and toggles a local React state `setSubmitted(true)` for 4 seconds. No form data (`nestType`, `email`, `doseAccess`) is extracted, validated server-side, or transmitted.
   - **Backend Needed**: `POST /api/contact` endpoint to validate inputs, rate-limit submissions, store inquiries in a database (e.g. PostgreSQL / Supabase), and dispatch email notifications (e.g. Resend / SendGrid).

6. **Authentication & Session Management (Login Page)**:
   - **File**: [`src/app/login/page.tsx`](file:///c:/ControlX/src/app/login/page.tsx#L130-L150)
   - **Issue**: Authentication is simulated using a client-side `setTimeout` comparing against a hardcoded string `DEMO_PASSWORD = 'controlx123'`. No real auth provider, JWT session, HTTP-only cookies, or database queries exist.
   - **Backend Needed**: Real authentication system (`POST /api/auth/login`, `POST /api/auth/register`, session token generation, OAuth handlers for Google/Apple/GitHub, and database-backed password hashing with bcrypt/argon2).

7. **Social Sign-In Buttons (Login Page)**:
   - **File**: [`src/app/login/page.tsx`](file:///c:/ControlX/src/app/login/page.tsx#L311-L330)
   - **Issue**: Google, Apple, and GitHub icons are wrapped in static `<div>` containers with titles but no `onClick` handlers or OAuth redirect URLs.
   - **Backend Needed**: OAuth 2.0 / OpenID Connect endpoints (`/api/auth/oauth/google`, `/api/auth/oauth/github`, `/api/auth/oauth/apple`).

8. **"Forgot Password" & "Sign Up" Links (Login Page)**:
   - **File**: [`src/app/login/page.tsx`](file:///c:/ControlX/src/app/login/page.tsx#L294) & [`page.tsx:L334`](file:///c:/ControlX/src/app/login/page.tsx#L334)
   - **Issue**: Anchor links point to dummy hashes (`href="#forgot"` and `href="#signup"`). No reset flow, token verification email, or registration page exists.
   - **Backend Needed**: Password recovery endpoint (`POST /api/auth/forgot-password`, `POST /api/auth/reset-password`) and user registration route (`/signup` or `POST /api/auth/signup`).

9. **Language Selector (Login Page)**:
   - **File**: [`src/app/login/page.tsx`](file:///c:/ControlX/src/app/login/page.tsx#L170)
   - **Issue**: `🌐 English ▾` is a static non-interactive text node.
   - **Backend Needed**: i18n locale context/cookie switcher (`en`, `fr`, `de`, `ja`) with localized string bundles.

10. **Footer Outro Social Links (Footer)**:
    - **File**: [`src/components/dom/Footer.tsx`](file:///c:/ControlX/src/components/dom/Footer.tsx#L17-L28)
    - **Issue**: All 4 social links point to placeholder hash anchors (`#facebook`, `#twitter`, `#pinterest`, `#instagram`).
    - **Backend Needed**: Configurable agency social URLs managed via database or environment configuration.

---

## Home Page — `/`

- **Route Path**: `/` (handled by [`src/app/page.tsx`](file:///c:/ControlX/src/app/page.tsx) wrapped by [`src/app/layout.tsx`](file:///c:/ControlX/src/app/layout.tsx))
- **Page Wrapper Architecture**:
  - `Layer 0`: Fixed background video (`/videos/background.mp4`) with smooth mouse parallax lerping ($\pm 15\text{px}$).
  - `Layer 1`: Full-screen architectural frosted glass overlay (`rgba(235, 233, 225, 0.48)` tint with `backdrop-filter: blur(16px)`).
  - `Layer 10`: DOM UI interactive container (`#ui`).

---

### Sections (in order top to bottom)

#### 1. Navigation Bar & Mobile Drawer
- **Component File**: [`src/components/dom/Navigation.tsx`](file:///c:/ControlX/src/components/dom/Navigation.tsx)
- **Visual Content**:
  - Official Control X Logo mark image (`/assets/nav-logo-x.png`, height: 25px) + serif wordmark `"CONTROL"`.
  - Desktop navigation items: `"Services"`, `"Work"`, `"About"`, `"Process"`.
  - Search button with magnifying glass SVG icon.
  - Primary CTA button `"Get Started"`.
  - Mobile hamburger toggle button with 3 animated SVG lines.
  - Mobile slide-out drawer containing logo header, close button, numbered navigation list (`01 Services`, `02 Work`, `03 About`, `04 Process`), `"Search Website"` secondary button, and `"Get Started"` primary button.
- **Interactive Elements**:
  1. **Brand Logo Link (Desktop & Mobile Drawer)**:
     - *Type*: Link (`<Link href="/">`)
     - *Visible Label*: Image + `"CONTROL"`
     - *Current Code Behavior*: Navigates to `/` and invokes `closeMenu()`.
     - *Backend Functionality Needed*: Standard client route transition (no backend API required).
  2. **"Services" Nav Link**:
     - *Type*: Link (`<Link href="#services">`)
     - *Visible Label*: `"Services"` (Mobile: `01 Services`)
     - *Current Code Behavior*: Smoothly scrolls viewport to `#services`; closes mobile drawer if open.
     - *Backend Functionality Needed*: None (client-side anchor navigation).
  3. **"Work" Nav Link**:
     - *Type*: Link (`<Link href="#work">`)
     - *Visible Label*: `"Work"` (Mobile: `02 Work`)
     - *Current Code Behavior*: Smoothly scrolls viewport to `#work`; closes mobile drawer if open.
     - *Backend Functionality Needed*: None (client-side anchor navigation).
  4. **"About" Nav Link**:
     - *Type*: Link (`<Link href="#about">`)
     - *Visible Label*: `"About"` (Mobile: `03 About`)
     - *Current Code Behavior*: Smoothly scrolls viewport to `#about`; closes mobile drawer if open.
     - *Backend Functionality Needed*: None (client-side anchor navigation).
  5. **"Process" Nav Link**:
     - *Type*: Link (`<Link href="#process">`)
     - *Visible Label*: `"Process"` (Mobile: `04 Process`)
     - *Current Code Behavior*: Smoothly scrolls viewport to `#process`; closes mobile drawer if open.
     - *Backend Functionality Needed*: None (client-side anchor navigation).
  6. **"Search" Button (Desktop)**:
     - *Type*: Button (`<button type="button" aria-label="Search">`)
     - *Visible Label*: Magnifying glass icon + `"Search"`
     - *Current Code Behavior*: `onClick` is empty; no action occurs.
     - *Backend Functionality Needed*: Triggers global search overlay and calls `GET /api/search?q=...` to query project case studies, service descriptions, and blog posts.
  7. **"Get Started" CTA Button (Desktop)**:
     - *Type*: Link (`<Link href="#contact">`)
     - *Visible Label*: `"Get Started"`
     - *Current Code Behavior*: Scrolls viewport to `#contact` anchor.
     - *Backend Functionality Needed*: Anchor navigation (can link to multi-step client project onboarding / lead intake flow).
  8. **Hamburger Menu Toggle (Mobile Viewport)**:
     - *Type*: Button (`<button type="button" aria-controls="mobile-nav-drawer">`)
     - *Visible Label*: 3 horizontal morphing lines
     - *Current Code Behavior*: Toggles `mobileMenuOpen` state (`true`/`false`), locks `document.body.style.overflow = 'hidden'`.
     - *Backend Functionality Needed*: None (client UI state).
  9. **Mobile Drawer Close Button**:
     - *Type*: Button (`<button type="button" aria-label="Close menu">`)
     - *Visible Label*: "X" close icon
     - *Current Code Behavior*: Invokes `closeMenu()` setting `mobileMenuOpen = false`.
     - *Backend Functionality Needed*: None.
  10. **"Search Website" Button (Mobile Drawer)**:
      - *Type*: Button (`<button type="button" aria-label="Search">`)
      - *Visible Label*: Magnifying glass icon + `"Search Website"`
      - *Current Code Behavior*: Invokes `closeMenu()` only.
      - *Backend Functionality Needed*: Opens mobile search interface backed by search API.
  11. **"Get Started" CTA Link (Mobile Drawer)**:
      - *Type*: Link (`<Link href="#contact">`)
      - *Visible Label*: `"Get Started"` + right arrow icon
      - *Current Code Behavior*: Invokes `closeMenu()` and scrolls to `#contact`.
      - *Backend Functionality Needed*: Lead capture navigation.

---

#### 2. Hero Section
- **Component File**: [`src/components/dom/HeroSection.tsx`](file:///c:/ControlX/src/components/dom/HeroSection.tsx)
- **Subcomponent**: [`src/components/dom/ChromaKeyVideo.tsx`](file:///c:/ControlX/src/components/dom/ChromaKeyVideo.tsx)
- **Visual Content**:
  - Brand Mark: Serif text `"Control"` + Canvas-based 3D Glass X with rotating emerald energy ring (`/videos/X2-trimmed.mp4`).
  - Pulsing green status dot + Tagline: `"Premium Digital Agency"`.
  - Headline: `"We Build Digital Experiences"` (rendered word-by-word with GSAP 3D reveal).
  - Subline: `"Luxury interfaces. Cinematic motion. Zero compromise. Built for brands that demand the extraordinary."`.
  - Buttons: `"View Our Work"` + arrow icon, `"Start a Project"`.
  - Scroll indicator line + label `"Scroll"`.
  - Decorative 4-point sparkles (`✦`).
- **Interactive Elements**:
  1. **Hero 3D Canvas ChromaKeyVideo**:
     - *Type*: Interactive WebGL/2D Canvas with mouse parallax tracking.
     - *Visible Label*: 3D Glass X Asset.
     - *Current Code Behavior*: Listens to `window.mousemove` and applies 3D perspective rotation (`rotateX`, `rotateY`), horizontal/vertical translation, floating bob, specular sheen tracking, and dynamic ground shadow shift.
     - *Backend Functionality Needed*: None (client GPU/Canvas rendering).
  2. **"View Our Work" Primary Button**:
     - *Type*: Anchor Link (`<a href="#work" id="hero-cta-primary">`)
     - *Visible Label*: `"View Our Work"` + right arrow icon
     - *Current Code Behavior*: Smoothly navigates to `#work` (Portfolio Section).
     - *Backend Functionality Needed*: None.
  3. **"Start a Project" Secondary Button**:
     - *Type*: Anchor Link (`<a href="#contact" id="hero-cta-secondary">`)
     - *Visible Label*: `"Start a Project"`
     - *Current Code Behavior*: Smoothly navigates to `#contact` (Contact Section).
     - *Backend Functionality Needed*: Can connect to inquiry intake / client calendar scheduling API (e.g. Cal.com / Calendly integration).

---

#### 3. Brand Story Section ("Our Philosophy")
- **Component File**: [`src/components/dom/BrandStorySection.tsx`](file:///c:/ControlX/src/components/dom/BrandStorySection.tsx)
- **Visual Content**:
  - Header Tag: `"OUR NAME. OUR PHILOSOPHY."`.
  - Header Headline: `"More Than Just a Name"`.
  - Header Subtitle: `"Every unforgettable brand begins with a meaningful story. Control X isn't just a company name—it's the philosophy behind every digital experience we build."`.
  - **Left Panel ("The Foundation / CONTROL")**:
    - Hexagonal shield badge with `ShieldCheck` icon.
    - Tag: `"THE FOUNDATION"`, Title: `"CONTROL"`.
    - Body: `"Your vision, your direction, your goals — always in your hands. We never overwrite your direction. From initial strategy to final launch, you retain 100% brand ownership."`.
    - Feature 1: `Eye` icon | `"Vision-First Approach"` | `"Your direction is always protected and preserved without compromise."`.
    - Feature 2: `ShieldCheck` icon | `"Total Brand Ownership"` | `"You own every decision, asset, design, and code repository."`.
    - Feature 3: `Sparkles` icon | `"Transparent Process"` | `"Nothing happens without your explicit review and approval."`.
  - **Center Arena ("Interactive Arena")**:
    - HTML5 2D Canvas rendering 3D Crystal X, concentric rotating orbit rings, travelling glowing orbs, and ambient floating motes.
    - SVG curved energy paths connecting to 4 nodes.
    - Animated traveling white glowing particle.
    - 4 Floating Glass Nodes:
      - `User` icon | `"CREATOR"` (Top-Left)
      - `Target` icon | `"STARTUP"` (Bottom-Left)
      - `Briefcase` icon | `"BUSINESS"` (Top-Right)
      - `Star` icon | `"YOUR VISION"` (Bottom-Right)
  - **Right Panel ("Collaboration / X")**:
    - Hexagonal sparkles badge with `Sparkles` icon.
    - Tag: `"COLLABORATION"`, Title: `"X"`.
    - Body: `"X represents collaboration — the meeting point where your vision and our engineering expertise intersect to create something extraordinary."`.
    - 4 Interactive Relationship Buttons:
      1. `"Control X × Creator"` | `"Designers, Artists & Visionaries"`
      2. `"Control X × Startup"` | `"Founders & Next-Gen Products"`
      3. `"Control X × Business"` | `"Enterprise Brands & Platforms"`
      4. `"Control X × Your Vision"` | `"Your Unique Brand Identity"`
  - **Promise Equation Bar**:
    - Tag: `"OUR PROMISE"`.
    - Formula Capsules: `[Your Vision]` $\times$ `[Our Expertise]` $=$ `[Extraordinary Digital Experiences]`.
  - **Why Choose Us Sub-Section**:
    - Tag: `"WHY CHOOSE US"`, Headline: `"Built Different. For Results That Matter."`.
    - 6 Glass Benefit Cards:
      1. `Target` icon | `"Strategic By Design"` | `"We combine strategy and creativity to build digital experiences that perform."`
      2. `TrendingUp` icon | `"Scalable & Future-Ready"` | `"We use modern technologies and best practices to ensure your brand is future-proof."`
      3. `UserCheck` icon | `"Client-Centric"` | `"Your goals drive every decision. You stay in control at every step of the journey."`
      4. `Award` icon | `"Quality Without Compromise"` | `"Clean code, thoughtful design, and rigorous testing — every time."`
      5. `Clock` icon | `"Timely Delivery"` | `"We respect your time and consistently deliver on schedule."`
      6. `Handshake` icon | `"Long-Term Partner"` | `"We don't just launch projects. We build relationships that create lasting value."`
- **Interactive Elements**:
  1. **Left & Right Master Panels (3D Tilt)**:
     - *Type*: Interactive Container (`onMouseMove`, `onMouseLeave`)
     - *Current Code Behavior*: Applies dynamic 3D perspective tilt ($\pm 4^\circ$) via GSAP.
     - *Backend Functionality Needed*: None.
  2. **4 Connected Floating Glass Nodes (Creator, Startup, Business, Vision)**:
     - *Type*: Interactive Hover Cards (`onMouseEnter`, `onMouseLeave`)
     - *Current Code Behavior*: Sets `hoveredNode(idx)`, highlighting the corresponding SVG curve and launching the traveling white particle loop.
     - *Backend Functionality Needed*: None.
  3. **4 Collaboration Relationship Buttons (Right Panel)**:
     - *Type*: Buttons (`<button type="button" className="bs-rel-btn">`)
     - *Visible Labels*:
       - `"Control X × Creator"`
       - `"Control X × Startup"`
       - `"Control X × Business"`
       - `"Control X × Your Vision"`
     - *Current Code Behavior*: Hover triggers particle path animation and pulses the center X canvas. Clicking has no handler.
     - *Backend Functionality Needed*: Filter case studies or redirect to segment-specific proposal generators (`/services?audience=startup`).

---

#### 4. Services Section ("What We Build")
- **Component File**: [`src/components/dom/ServicesSection.tsx`](file:///c:/ControlX/src/components/dom/ServicesSection.tsx)
- **Visual Content**:
  - Header Tagline: `"OUR EXPERTISE"`.
  - Header Title: `"What We Build"` (with animated parchment unrolling & 3D curl effect).
  - Subtitle: `"From strategy and design to development and long-term support, we craft premium digital experiences that help modern brands stand out online."`.
  - 6 Glass Service Cards:
    1. `01` | `"Premium Landing Pages"` | `"Beautiful, conversion-focused landing pages designed to capture attention, communicate value, and turn visitors into customers."` | Custom layout SVG icon.
    2. `02` | `"UI / UX Design"` | `"Thoughtfully designed interfaces that combine usability, clarity, and premium aesthetics across every screen."` | Custom pen-tool SVG icon.
    3. `03` | `"Frontend Development"` | `"Pixel-perfect websites built with React, Next.js and TypeScript for speed, scalability, and long-term maintainability."` | Custom code bracket SVG icon.
    4. `04` | `"Motion & Interactions"` | `"Luxury animations powered by GSAP and Three.js that make every interaction smooth, immersive and memorable."` | Custom sparkle SVG icon.
    5. `05` | `"Performance & SEO"` | `"Optimized for Core Web Vitals, accessibility, search visibility and lightning-fast performance on every device."` | Custom gauge SVG icon.
    6. `06` | `"Support & Growth"` | `"Continuous maintenance, feature enhancements and long-term support to help your digital presence evolve with your business."` | Custom handshake SVG icon.
- **Interactive Elements**:
  1. **6 Glass Service Cards (3D Tilt & Cursor Reflection)**:
     - *Type*: Interactive Card Containers (`onMouseMove`, `onMouseLeave`).
     - *Current Code Behavior*: Computes pointer coordinates relative to card center, tilts card in 3D space (`perspective(1000px) rotateX(...) rotateY(...) translateY(-8px) scale(1.02)`), and sets CSS variables `--mouse-x` and `--mouse-y` for dynamic border-beam glint reflection.
     - *Backend Functionality Needed*: None.
  2. **6 "Explore Service" Action Buttons**:
     - *Type*: Buttons (`<button className="service-card__btn" type="button">`)
     - *Visible Label*: `"Explore Service"` + right arrow icon
     - *Current Code Behavior*: `onClick` is empty.
     - *Backend Functionality Needed*: Opens service package modal or routes to dynamic service pages (`/services/landing-pages`, `/services/ui-ux-design`, etc.) querying CMS service deliverables, pricing calculator, and case studies.

---

#### 5. Process Section ("Workflow Methodology")
- **Component File**: [`src/components/dom/ProcessSection.tsx`](file:///c:/ControlX/src/components/dom/ProcessSection.tsx)
- **Visual Content**:
  - Header Tagline: `"WORKFLOW METHODOLOGY"`.
  - Header Title: `"From Vision to Reality"` with animated SVG underline.
  - **Horizontal 3D Glass Pipeline**:
    - SVG tube with liquid emerald gradient fill and floating micro-particle bubbles.
    - 8 Control Spheres with active breathing ripple animations:
      - `01 Discover`
      - `02 Research`
      - `03 Strategy`
      - `04 Design`
      - `05 Development`
      - `06 Launch`
      - `07 Support`
      - `08 Evolution`
  - **3-Column Master Detail Card**:
    - **Column 1 (Info & Checklist)**:
      - Step badge: `STEP [XX] / 08`
      - Title & Subtitle (e.g. `Development — Next.js & Custom Shaders Architecture`)
      - Description text
      - 4 Verified Checkmarks (e.g. `Brand Audit`, `Market Research`, etc.)
      - Action CTA button: `"Learn more about [Step] →"`
    - **Column 2 (Dynamic Visual Demo Block)**:
      - Step 01: Corkboard UI with pinned client brief, user persona card (`Executive Director`), and goal sticky notes.
      - Step 02: Linear Analytics telemetry dashboard with live SVG quadratic bezier graph and moving glowing dot.
      - Step 03: Architectural Decision Tree with flow nodes and tech chips (`Raymarched Optics`, `GSAP Motion`, `60 FPS`).
      - Step 04: Mini Figma application UI with tool palette, zoom level, color swatches (`#0F8259`, `#10B981`, `#EBE9E1`, `#18191C`), and typography frame.
      - Step 05: Dark IDE VS Code editor with syntax-highlighted `@react-three/fiber` code and blinking typewriter cursor.
      - Step 06: Terminal deployment window with GitHub Actions pass pill and Vercel edge deployment status.
      - Step 07: Live Support Center inbox with resolved SLA health check ticket and active 24/7 priority monitoring pill.
      - Step 08: Product Evolution workspace with version roadmap (`v1.0`, `v2.0`, `v3.4`) and growth badge (`+240% Growth Delta`).
    - **Column 3 (Tech Tree & Live Counters)**:
      - Interactive Tech Tree chips with animated spring feedback.
      - $2 \times 2$ Metric Grid with direct DOM count-up animations (e.g. `100% Alignment`, `48h Sprints`, `1.4M Data Points`, `60 FPS Target`, `98 Performance`, `< 0.3s FCP Speed`, `99.99% Uptime`, `+240% Growth`).
- **Interactive Elements**:
  1. **8 Glass Control Spheres on Pipeline**:
     - *Type*: Role buttons (`<div className="node-disc-item" role="button" tabIndex={0}>`)
     - *Visible Labels*: `Discover`, `Research`, `Strategy`, `Design`, `Development`, `Launch`, `Support`, `Evolution`
     - *Current Code Behavior*: `onClick` and `onMouseEnter` invoke `handleSelectNode(index)`. Animates GSAP detail card fade/slide transition, updates liquid progress rail width, and switches column 2 demo block.
     - *Backend Functionality Needed*: None (client-side interactive state).
  2. **8 "Learn more about [Step]" Buttons**:
     - *Type*: Button (`<button type="button" className="process-card-btn">`)
     - *Visible Labels*:
       - `"Learn more about Discovery →"`
       - `"Learn more about Research →"`
       - `"Learn more about Strategy →"`
       - `"Learn more about Design →"`
       - `"Learn more about Development →"`
       - `"Learn more about Launch →"`
       - `"Learn more about Support →"`
       - `"Learn more about Evolution →"`
     - *Current Code Behavior*: `onClick` is empty.
     - *Backend Functionality Needed*: Can open modal or documentation article detailing process artifacts and deliverables.
  3. **Interactive Tech Tag Chips (Column 3)**:
     - *Type*: Role button (`<div className="wf-tech-badge" role="button" tabIndex={0}>`)
     - *Visible Labels*: Dynamic per step (e.g. `Audit`, `Telemetry`, `Tokens`, `Figma`, `React`, `NEXT.js`, `Three.js`, `Vercel Edge`, `SLA Guarantee`, `v3.4 Spatial UI`)
     - *Current Code Behavior*: `onClick` sets active tag state and triggers a GSAP spring bounce animation (`scale: 1.18 -> 1.0`).
     - *Backend Functionality Needed*: None.
  4. **Master Process Detail Card (Mouse Parallax)**:
     - *Type*: Interactive Container (`onMouseMove`, `onMouseLeave`)
     - *Current Code Behavior*: Applies 3D perspective rotation ($\pm 3.5^\circ$) based on cursor distance from card center.
     - *Backend Functionality Needed*: None.

---

#### 6. Portfolio / Selected Work Section
- **Component File**: [`src/components/dom/PortfolioSection.tsx`](file:///c:/ControlX/src/components/dom/PortfolioSection.tsx)
- **Visual Content**:
  - Header Tagline: `"SELECTED SHOWCASE"`.
  - Header Title: `"Selected Work"`.
  - Horizontal Scroll Track containing 5 glass case study cards:
    1. `01` | `"Brand VIP"` | `"Brand & Identity Platform"` | `"Exclusive brand identity and high-end digital presentation system."` | Label: `"AURA · Fall/Winter Collection"` | Image preview: `/assets/projects/brand-vip.png` | External URL: `https://brand-vip.vercel.app/`.
    2. `02` | `"Portfolio"` | `"Interactive Portfolio & Showcase"` | `"Minimalist, high-performance personal portfolio experience."` | Label: `"Rahul · Web Designer"` | Image preview: `/assets/projects/portfolio.png` | External URL: `https://portfolio-v1-sigma-brown.vercel.app/`.
    3. `03` | `"Salon VIP"` | `"Luxury Service & Booking Platform"` | `"Bespoke salon and wellness luxury digital platform."` | Label: `"Maison Noir · Colour Art"` | Image preview: `/assets/projects/salon-vip.png` | External URL: `https://salon-vip.vercel.app/`.
    4. `04` | `"Gym VIP"` | `"Fitness & Premium Membership"` | `"High-energy, modern fitness and performance platform."` | Label: `"IRONYARD · Reception"` | Image preview: `/assets/projects/gym-vip.png` | External URL: `https://gym-vip.vercel.app/`.
    5. `05` | `"Interactive Login Experience"` | `"Interactive Web Experience"` | `"A playful interactive login interface with a responsive character-based interaction system."` | Label: `"ControlX · Interactive Mascot System"` | Image preview: `/assets/projects/login-experience.png` | Internal Route: `/login`.
- **Interactive Elements**:
  1. **5 Project Showcase Cards**:
     - *Type*: Links (`<a className="portfolio-card glass-card">`)
     - *Visible Label*: Number + Project Image + Category + Title + Description + `"View Project →"` button badge
     - *Current Code Behavior*:
       - Items 1-4 navigate to external Vercel live deployments in a new tab (`target="_blank" rel="noopener noreferrer"`).
       - Item 5 navigates to internal route `/login` in the same tab.
     - *Backend Functionality Needed*: Projects can be stored and fetched dynamically from database (`GET /api/projects`), with click telemetry tracking (`POST /api/analytics/click`).
  2. **Pinned Horizontal Scroll (Desktop $\ge 768\text{px}$)**:
     - *Type*: ScrollTrigger Scrub Timeline
     - *Current Code Behavior*: Pins section and translates track horizontally (`x: -scrollWidth`) as user scrolls vertically.
     - *Backend Functionality Needed*: None.

---

#### 7. Contact Section ("Let's Build Something Extraordinary")
- **Component File**: [`src/components/dom/ContactSection.tsx`](file:///c:/ControlX/src/components/dom/ContactSection.tsx)
- **Visual Content**:
  - Full-width HTML5 canvas rendering falling ambient water droplet particles with emerald glow gradients.
  - Outro Header with double-layered ghost echo: `"Let's Build Something Extraordinary Together."`.
  - Floating Glass Contact Form Card.
  - Post-submission Success State: Green checkmark icon + `"Inquiry Received"` + `"Thank you for reaching out. Our executive design team will respond within 24 hours."`.
- **Interactive Elements & Form**:
  - *(Detailed in Forms section below)*

---

#### 8. Footer Section
- **Component File**: [`src/components/dom/Footer.tsx`](file:///c:/ControlX/src/components/dom/Footer.tsx)
- **Visual Content**:
  - Brand Title: `"CONTROL X"`.
  - Subtitle: `"Your Vision × Our Expertise"`.
  - 4 Social Links: `"Facebook"`, `"Twitter"`, `"Pinterest"`, `"Instagram"`.
  - Copyright line: `© [Current Year] CONTROL X. All rights reserved.`.
  - Technical badge: `"Precision Optics & WebGL Architecture"`.
- **Interactive Elements**:
  1. **"Facebook" Link**:
     - *Type*: Anchor link (`<a href="#facebook" className="footer-social-link">`)
     - *Visible Label*: `"Facebook"`
     - *Current Code Behavior*: Jumps to dummy hash `#facebook`.
     - *Backend Functionality Needed*: Replace with real Facebook agency URL or fetch from social config endpoint.
  2. **"Twitter" Link**:
     - *Type*: Anchor link (`<a href="#twitter" className="footer-social-link">`)
     - *Visible Label*: `"Twitter"`
     - *Current Code Behavior*: Jumps to dummy hash `#twitter`.
     - *Backend Functionality Needed*: Replace with real X / Twitter agency URL.
  3. **"Pinterest" Link**:
     - *Type*: Anchor link (`<a href="#pinterest" className="footer-social-link">`)
     - *Visible Label*: `"Pinterest"`
     - *Current Code Behavior*: Jumps to dummy hash `#pinterest`.
     - *Backend Functionality Needed*: Replace with real Pinterest agency URL.
  4. **"Instagram" Link**:
     - *Type*: Anchor link (`<a href="#instagram" className="footer-social-link">`)
     - *Visible Label*: `"Instagram"`
     - *Current Code Behavior*: Jumps to dummy hash `#instagram`.
     - *Backend Functionality Needed*: Replace with real Instagram agency URL.

---

### Forms (Home Page)

#### Contact Inquiry Form
- **Component File**: [`src/components/dom/ContactSection.tsx`](file:///c:/ControlX/src/components/dom/ContactSection.tsx#L212-L265)
- **Form Fields**:
  1. **Field: Nest type / Name**:
     - *Input ID*: `nestType`
     - *Type*: `text` (`<input type="text">`)
     - *Label*: `"Nest type*"`
     - *Placeholder*: `"Enterprise / Brand Name"`
     - *Required*: `true` (`required` HTML attribute)
     - *Current Validation*: Native browser required field check only.
  2. **Field: Email**:
     - *Input ID*: `email`
     - *Type*: `email` (`<input type="email">`)
     - *Label*: `"Email*"`
     - *Placeholder*: `"executive@brand.com"`
     - *Required*: `true` (`required` HTML attribute)
     - *Current Validation*: Native browser email format check only.
  3. **Field: Dose / access requirements (Message Scope)**:
     - *Input ID*: `doseAccess`
     - *Type*: `textarea` (`<textarea rows={4}>`)
     - *Label*: `"Dose / access requirements"`
     - *Placeholder*: `"Describe your project scope, timeline, and architectural goals..."`
     - *Required*: `false` (Optional)
     - *Current Validation*: None.
- **Submit Control**:
  - *Button*: `<button className="btn-primary btn-contact" type="submit">`
  - *Visible Label*: `"Send Inquiry"` + arrow icon
- **Current Submission Behavior**:
  - Executes `e.preventDefault()`.
  - Sets `submitted = true` to display the inline success card.
  - Runs `setTimeout(() => setSubmitted(false), 4000)` to reset back to the blank form after 4 seconds.
  - **No payload is sent anywhere**.
- **Backend Functionality Needed**:
  - **Endpoint**: `POST /api/contact`
  - **Request Payload**:
    ```json
    {
      "nestType": "Acme Luxury Corp",
      "email": "executive@acme.com",
      "doseAccess": "Full brand identity & Next.js platform build."
    }
    ```
  - **Server-Side Requirements**:
    - Input sanitization and email format regex validation.
    - Anti-spam / honeypot or captcha validation.
    - Database insertion into `inquiries` table with timestamps and client IP metadata.
    - Dispatch transactional email to agency team via Resend / SendGrid and auto-responder confirmation to the client.
  - **Expected API Response**:
    - *Success (201 Created)*: `{ "success": true, "message": "Inquiry recorded successfully", "inquiryId": "inq_12345" }`
    - *Error (400 / 422 / 500)*: `{ "success": false, "error": "Invalid email address" }`

---

### Data Currently Hardcoded in the Frontend (Home Page)

| Constant / Variable Name | File Path | Content Description |
| :--- | :--- | :--- |
| `NAV_LINKS` | [`src/components/dom/Navigation.tsx`](file:///c:/ControlX/src/components/dom/Navigation.tsx#L7-L12) | Array of 4 navigation link items (`Services`, `Work`, `About`, `Process`). |
| `FEATURES` | [`src/components/dom/BrandStorySection.tsx`](file:///c:/ControlX/src/components/dom/BrandStorySection.tsx#L26-L42) | Array of 3 core brand pillars (`Vision-First Approach`, `Total Brand Ownership`, `Transparent Process`). |
| `RELATIONSHIPS` | [`src/components/dom/BrandStorySection.tsx`](file:///c:/ControlX/src/components/dom/BrandStorySection.tsx#L44-L49) | Array of 4 relationship buttons (`Creator`, `Startup`, `Business`, `Your Vision`). |
| `NODES` | [`src/components/dom/BrandStorySection.tsx`](file:///c:/ControlX/src/components/dom/BrandStorySection.tsx#L51-L56) | Array of 4 floating canvas nodes (`CREATOR`, `STARTUP`, `BUSINESS`, `YOUR VISION`). |
| `WHY_CHOOSE_US` | [`src/components/dom/BrandStorySection.tsx`](file:///c:/ControlX/src/components/dom/BrandStorySection.tsx#L58-L89) | Array of 6 value proposition cards (`Strategic By Design`, `Scalable & Future-Ready`, `Client-Centric`, etc.). |
| `SERVICES_DATA` | [`src/components/dom/ServicesSection.tsx`](file:///c:/ControlX/src/components/dom/ServicesSection.tsx#L12-L112) | Array of 6 service offerings with descriptions, custom SVG icons, and identifiers. |
| `PROCESS_STEPS` | [`src/components/dom/ProcessSection.tsx`](file:///c:/ControlX/src/components/dom/ProcessSection.tsx#L52-L189) | Array of 8 workflow steps with checkmarks, descriptions, tech nodes, and telemetry metrics. |
| `CODE_STRING` | [`src/components/dom/ProcessSection.tsx`](file:///c:/ControlX/src/components/dom/ProcessSection.tsx#L278-L293) | Hardcoded React Three Fiber code snippet for Step 05 typewriter simulation. |
| `PORTFOLIO_ITEMS` | [`src/components/dom/PortfolioSection.tsx`](file:///c:/ControlX/src/components/dom/PortfolioSection.tsx#L12-L58) | Array of 5 project case studies with titles, categories, live URLs, image paths, and tags. |

---

### Assets Referenced (Home Page)

| Asset Path | Component Using It | Purpose |
| :--- | :--- | :--- |
| `/videos/background.mp4` | [`src/app/page.tsx`](file:///c:/ControlX/src/app/page.tsx#L79) | Fixed atmospheric full-screen background video layer. |
| `/assets/nav-logo-x.png` | [`src/components/dom/Navigation.tsx`](file:///c:/ControlX/src/components/dom/Navigation.tsx#L67) | Transparent emerald green X monogram in navbar and mobile drawer. |
| `/videos/X2-trimmed.mp4` | [`src/components/dom/HeroSection.tsx`](file:///c:/ControlX/src/components/dom/HeroSection.tsx#L110) & [`ChromaKeyVideo.tsx`](file:///c:/ControlX/src/components/dom/ChromaKeyVideo.tsx#L27) | Trimmed 3D glass X hero animation keyed in real-time on HTML5 canvas. |
| `/assets/projects/brand-vip.png` | [`src/components/dom/PortfolioSection.tsx`](file:///c:/ControlX/src/components/dom/PortfolioSection.tsx#L19) | Screenshot preview image for Brand VIP project. |
| `/assets/projects/portfolio.png` | [`src/components/dom/PortfolioSection.tsx`](file:///c:/ControlX/src/components/dom/PortfolioSection.tsx#L28) | Screenshot preview image for Portfolio project. |
| `/assets/projects/salon-vip.png` | [`src/components/dom/PortfolioSection.tsx`](file:///c:/ControlX/src/components/dom/PortfolioSection.tsx#L37) | Screenshot preview image for Salon VIP project. |
| `/assets/projects/gym-vip.png` | [`src/components/dom/PortfolioSection.tsx`](file:///c:/ControlX/src/components/dom/PortfolioSection.tsx#L46) | Screenshot preview image for Gym VIP project. |
| `/assets/projects/login-experience.png` | [`src/components/dom/PortfolioSection.tsx`](file:///c:/ControlX/src/components/dom/PortfolioSection.tsx#L55) | Screenshot preview image for Interactive Login Experience project. |

---

## Login Page — `/login`

- **Route Path**: `/login` (handled by [`src/app/login/page.tsx`](file:///c:/ControlX/src/app/login/page.tsx))
- **Styles**: Scoped CSS Module [`src/app/login/login.module.css`](file:///c:/ControlX/src/app/login/login.module.css)
- **Subcomponents**: [`src/components/dom/LoginCatStage.tsx`](file:///c:/ControlX/src/components/dom/LoginCatStage.tsx)

---

### Sections (in order top to bottom)

#### 1. Brand Left Panel
- **Visual Content**:
  - Full-height side image panel rendering `/assets/left-panel.png` (`"Welcome back!"`, 3D emerald glass X brand emblem, features list, and trust badges).

#### 2. Interactive Cat Mascot Stage
- **Component File**: [`src/components/dom/LoginCatStage.tsx`](file:///c:/ControlX/src/components/dom/LoginCatStage.tsx)
- **Visual Content**:
  - 3D cat character resting on top of the login container with 9 distinct visual states:
    1. `idle`: Resting and breathing with slow GSAP sine pulse (`transformOrigin: '50% 100%'`).
    2. `email`: Looking down towards the email input field.
    3. `typing`: Leaning forward attentively as user types their password.
    4. `hidden`: Covering eyes with paws when password is masked (`type="password"`).
    5. `visible`: Peeking through fingers when password eye is clicked (`type="text"`).
    6. `error`: Shaking head horizontally with error expression on failed login.
    7. `success`: Jumping up excitedly with elastic bounce on successful login.
    8. `blink`: Periodic random eye blink easter egg (every 3.5–6.5s).
    9. `backview`: Turning back completely when clicked directly.
- **Interactive Elements**:
  1. **Cat Character Mascot**:
     - *Type*: Clickable Avatar (`<div id="catStage" title="click me">`)
     - *Current Code Behavior*: `onClick` triggers the `backview` easter egg state for 900ms before returning to the active form state.
     - *Backend Functionality Needed*: None (client-side interactive mascot).

#### 3. Login Card & Credentials Form
- **Component File**: [`src/app/login/page.tsx`](file:///c:/ControlX/src/app/login/page.tsx)
- **Visual Content**:
  - Language indicator: `🌐 English ▾`
  - Title: `"Log in"` (or `"Welcome Aboard!"` upon authentication success)
  - Subtitle: `"Enter your credentials to access Control X"` (or `"Redirecting to your executive dashboard..."`)
  - Email input field with mail icon.
  - Password input field with lock icon and interactive eye toggle button (`👁` / `🙈`).
  - Error message alert banner (`"Incorrect password. Please try again."` / `"Please enter your password."`).
  - Remember me checkbox + `"Forgot password?"` link.
  - Submit button: `"Sign In"` (shows `"Checking..."` while loading, `"Welcome back! ✓"` on success).
  - Divider: `"or continue with"`.
  - 3 Social sign-in buttons: Google, Apple, GitHub.
  - Sign up prompt: `"Don't have an account? Sign up now"`.
- **Interactive Elements**:
  1. **Email Input Field**:
     - *Type*: Input (`<input type="email">`)
     - *Current Code Behavior*: `onFocus` sets cat state to `email`; `onChange` updates `email` state; `onBlur` reverts cat state to `idle` (or `hidden`/`visible` if password exists).
     - *Backend Functionality Needed*: Input binding for credentials authentication.
  2. **Password Input Field**:
     - *Type*: Input (`<input type="password">` / `<input type="text">`)
     - *Current Code Behavior*: `onFocus` sets cat to `typing`; `onChange` updates `password` state and schedules a 500ms pause timer to cover/uncover eyes (`hidden`/`visible`); `onBlur` sets cat to `hidden`/`visible`.
     - *Backend Functionality Needed*: Credentials verification against hashed password.
  3. **Password Eye Toggle**:
     - *Type*: Clickable Toggle (`<div id="toggleEye">`)
     - *Visible Label*: `👁` (when masked) / `🙈` (when unmasked)
     - *Current Code Behavior*: Toggles `isMasked` state, switches input type between `password` and `text`, and updates cat state between `hidden` (hands over eyes) and `visible` (peeking).
     - *Backend Functionality Needed*: None (client UI control).
  4. **"Remember Me" Checkbox**:
     - *Type*: Input Checkbox (`<input type="checkbox">`)
     - *Visible Label*: `"Remember me"`
     - *Current Code Behavior*: Toggles `rememberMe` boolean state.
     - *Backend Functionality Needed*: Tells backend whether to issue a long-lived refresh token (e.g. 30 days) vs. session-only cookie.
  5. **"Forgot password?" Link**:
     - *Type*: Anchor Link (`<a href="#forgot">`)
     - *Visible Label*: `"Forgot password?"`
     - *Current Code Behavior*: Jumps to dummy hash `#forgot`.
     - *Backend Functionality Needed*: Opens password recovery modal or redirects to `/forgot-password` triggering `POST /api/auth/forgot-password`.
  6. **"Sign In" Submit Button**:
     - *Type*: Button (`<button type="submit" id="loginBtn">`)
     - *Visible Label*: `"Sign In"` + arrow icon (or `"Checking..."` while loading)
     - *Current Code Behavior*: Executes `handleSubmit`, validates password length, triggers 500ms simulation against `controlx123`.
     - *Backend Functionality Needed*: Dispatches `POST /api/auth/login`.
  7. **"Sign up now" Link**:
     - *Type*: Anchor Link (`<a href="#signup">`)
     - *Visible Label*: `"Sign up now"`
     - *Current Code Behavior*: Jumps to dummy hash `#signup`.
     - *Backend Functionality Needed*: Routes to registration flow (`/signup` or `POST /api/auth/register`).
  8. **"Log in with another account" Button (Success State)**:
     - *Type*: Button (`<button onClick={...}>`)
     - *Visible Label*: `"Log in with another account"`
     - *Current Code Behavior*: Resets `isSuccess = false`, clears `password`, resets cat to `idle`.
     - *Backend Functionality Needed*: Triggers `POST /api/auth/logout` to clear active session cookies.

---

### Forms (Login Page)

#### User Authentication Form
- **Component File**: [`src/app/login/page.tsx`](file:///c:/ControlX/src/app/login/page.tsx#L229-L336)
- **Form Fields**:
  1. **Field: Email address**:
     - *Input ID*: `email`
     - *Type*: `email` (`<input type="email">`)
     - *Label*: `"Email address"`
     - *Placeholder*: `"name@company.com"`
     - *Required*: Implicit in validation
     - *Current Validation*: None in client code (only checks password).
  2. **Field: Password**:
     - *Input ID*: `password`
     - *Type*: `password` or `text` (dynamic via `isMasked`)
     - *Label*: `"Password"`
     - *Placeholder*: `"••••••••"`
     - *Required*: `true`
     - *Current Validation*: Checked for non-zero length (`password.length === 0`).
  3. **Field: Remember me**:
     - *Type*: `checkbox` (`<input type="checkbox">`)
     - *Label*: `"Remember me"`
     - *Default*: `false`
- **Current Submission Behavior**:
  - Checks if `password.length === 0` -> displays error `"Please enter your password."` and triggers cat `error` animation.
  - Sets `isLoading = true` for 500ms.
  - Compares `password === 'controlx123'`.
  - If mismatch: displays `"Incorrect password. Please try again."`, triggers cat error shake.
  - If matched: sets `isSuccess = true`, displays `"Welcome Aboard! Redirecting to your executive dashboard..."`, triggers cat celebration jump.
- **Backend Functionality Needed**:
  - **Endpoint**: `POST /api/auth/login`
  - **Request Payload**:
    ```json
    {
      "email": "executive@brand.com",
      "password": "user_raw_password",
      "rememberMe": true
    }
    ```
  - **Server-Side Requirements**:
    - Query user by email from database `users` table.
    - Compare password hash using `bcrypt.compare()` or `argon2.verify()`.
    - Handle account locking after 5 failed attempts.
    - Set secure, HTTP-only, SameSite session cookie containing JWT or session ID.
    - Return user profile (id, name, role, permissions).
  - **Expected API Response**:
    - *Success (200 OK)*:
      ```json
      {
        "success": true,
        "user": { "id": "usr_991", "email": "executive@brand.com", "name": "Director" },
        "redirectUrl": "/dashboard"
      }
      ```
    - *Error (401 Unauthorized / 400 Bad Request)*:
      ```json
      {
        "success": false,
        "error": "Invalid email or password."
      }
      ```

---

### Data Currently Hardcoded in the Frontend (Login Page)

| Variable Name | File Path | Content Description |
| :--- | :--- | :--- |
| `DEMO_PASSWORD` | [`src/app/login/page.tsx`](file:///c:/ControlX/src/app/login/page.tsx#L134) | Hardcoded dummy password `'controlx123'` used for mock validation. |
| `CAT_STATES` | [`src/components/dom/LoginCatStage.tsx`](file:///c:/ControlX/src/components/dom/LoginCatStage.tsx#L19-L29) | Array of 9 mascot animation states (`idle`, `email`, `typing`, `hidden`, `visible`, `error`, `success`, `blink`, `backview`). |

---

### Assets Referenced (Login Page)

| Asset Path | Component Using It | Purpose |
| :--- | :--- | :--- |
| `/assets/left-panel.png` | [`src/app/login/page.tsx`](file:///c:/ControlX/src/app/login/page.tsx#L159) | Full-height brand visual on left side of login screen. |
| `/assets/cat/idle.png` | [`src/components/dom/LoginCatStage.tsx`](file:///c:/ControlX/src/components/dom/LoginCatStage.tsx#L139) | Cat mascot resting frame. |
| `/assets/cat/email.png` | [`src/components/dom/LoginCatStage.tsx`](file:///c:/ControlX/src/components/dom/LoginCatStage.tsx#L139) | Cat mascot looking down at email input. |
| `/assets/cat/typing.png` | [`src/components/dom/LoginCatStage.tsx`](file:///c:/ControlX/src/components/dom/LoginCatStage.tsx#L139) | Cat mascot leaning forward typing pose. |
| `/assets/cat/hidden.png` | [`src/components/dom/LoginCatStage.tsx`](file:///c:/ControlX/src/components/dom/LoginCatStage.tsx#L139) | Cat mascot covering eyes with paws (password masked). |
| `/assets/cat/visible.png` | [`src/components/dom/LoginCatStage.tsx`](file:///c:/ControlX/src/components/dom/LoginCatStage.tsx#L139) | Cat mascot peeking through fingers (password unmasked). |
| `/assets/cat/error.png` | [`src/components/dom/LoginCatStage.tsx`](file:///c:/ControlX/src/components/dom/LoginCatStage.tsx#L139) | Cat mascot startled error pose. |
| `/assets/cat/success.png` | [`src/components/dom/LoginCatStage.tsx`](file:///c:/ControlX/src/components/dom/LoginCatStage.tsx#L139) | Cat mascot celebrating success jump. |
| `/assets/cat/blink.png` | [`src/components/dom/LoginCatStage.tsx`](file:///c:/ControlX/src/components/dom/LoginCatStage.tsx#L139) | Cat mascot blinking frame. |
| `/assets/cat/backview.png` | [`src/components/dom/LoginCatStage.tsx`](file:///c:/ControlX/src/components/dom/LoginCatStage.tsx#L139) | Cat mascot turned-around back view easter egg. |

---

## Shared, Branding & Auxiliary Components

1. **`ControlXLogo.tsx`** ([`src/components/branding/ControlXLogo.tsx`](file:///c:/ControlX/src/components/branding/ControlXLogo.tsx)):
   - Reusable brandmark component accepting `size` (`sm`, `md`, `lg`, `hero`), `showTagline` (`BUILD · SCALE · DOMINATE`), `variant` (`light`, `dark`), and `href`. Renders the official monogram and uppercase wordmark.

2. **`ControlXMonogram.tsx`** ([`src/components/branding/ControlXMonogram.tsx`](file:///c:/ControlX/src/components/branding/ControlXMonogram.tsx)):
   - Monogram renderer displaying `/assets/branding/controlx-monogram.png` with customizable square dimension sizing.

3. **`ChromaKeyVideo.tsx`** ([`src/components/dom/ChromaKeyVideo.tsx`](file:///c:/ControlX/src/components/dom/ChromaKeyVideo.tsx)):
   - Real-time 2D Canvas chroma-keying video player with dynamic corner sampling, emerald glass protection, edge feathering, despill, and 3D cursor parallax physics.

4. **`GlassX.tsx`** ([`src/components/dom/GlassX.tsx`](file:///c:/ControlX/src/components/dom/GlassX.tsx)):
   - WebGL GPU-accelerated dual-buffer crossfading chroma-key video player for `/videos/new_x.mp4`.

5. **`SceneCanvas.tsx`, `BackgroundPlane.tsx`, `GlassX3D.tsx`, `LightingRig.tsx`** ([`src/components/canvas/`](file:///c:/ControlX/src/components/canvas)):
   - WebGL / Three.js fallback sub-system with custom GLSL raymarching shader passes (`src/shaders/background.fragment.glsl`) and camera scroll rig (`src/hooks/useScrollCamera.ts`).

---

## Summary of Planned Backend Endpoints

When backend development commences, the following API routes must be implemented to fulfill all documented frontend interfaces:

| Method | Endpoint | Associated Frontend Component | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/contact` | [`ContactSection.tsx`](file:///c:/ControlX/src/components/dom/ContactSection.tsx) | Process, validate, persist, and notify on client project inquiries. |
| `POST` | `/api/auth/login` | [`src/app/login/page.tsx`](file:///c:/ControlX/src/app/login/page.tsx) | Verify credentials and establish secure JWT session cookie. |
| `POST` | `/api/auth/logout` | [`src/app/login/page.tsx`](file:///c:/ControlX/src/app/login/page.tsx) | Invalidate session token and clear HTTP-only cookies. |
| `POST` | `/api/auth/forgot-password` | [`src/app/login/page.tsx`](file:///c:/ControlX/src/app/login/page.tsx) | Generate and email password reset tokens. |
| `GET` | `/api/search` | [`Navigation.tsx`](file:///c:/ControlX/src/components/dom/Navigation.tsx) | Full-text search across services, case studies, and articles. |
| `GET` | `/api/services` | [`ServicesSection.tsx`](file:///c:/ControlX/src/components/dom/ServicesSection.tsx) | Retrieve dynamic service offerings, deliverables, and pricing. |
| `GET` | `/api/projects` | [`PortfolioSection.tsx`](file:///c:/ControlX/src/components/dom/PortfolioSection.tsx) | Retrieve portfolio case studies, metrics, and live showcase URLs. |
| `GET` | `/api/process` | [`ProcessSection.tsx`](file:///c:/ControlX/src/components/dom/ProcessSection.tsx) | Retrieve 8-step methodology specifications, SLAs, and technical checkpoints. |
