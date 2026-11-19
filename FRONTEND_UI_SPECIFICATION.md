# EnergyChain — Complete Frontend UI/UX Specification

> **Specification Authority & Status**: Implementation Blueprint for Next.js Rebuild  
> **Target Framework**: Next.js 14+ (App Router), React 18+, Tailwind CSS 3.4+, Ethers.js v6, Chart.js 4.4+  
> **Source Analysis**: Extracted directly from existing verified EnergyChain source files (`energichain_backend/public/*.html`, `energichain_backend/src/`, `energichain_frontend/`, `energichain-contract/contracts/`, and accompanying audit documentation).

---

## Table of Contents

1. [Overall Design System](#1-overall-design-system)
   - [1.1 Color Palette](#11-color-palette)
   - [1.2 Color Token Reference Table](#12-color-token-reference-table)
   - [1.3 Color Combinations & Contrast States](#13-color-combinations--contrast-states)
   - [1.4 Typography System & Scale](#14-typography-system--scale)
2. [Layout System & Architecture](#2-layout-system--architecture)
   - [2.1 Application Shell & Layout](#21-application-shell--layout)
   - [2.2 Sidebar Navigation (Desktop & Mobile)](#22-sidebar-navigation-desktop--mobile)
   - [2.3 Top Header Navigation](#23-top-header-navigation)
   - [2.4 Grid, Containers & Spacing](#24-grid-containers--spacing)
3. [Every Page and Section](#3-every-page-and-section)
   - [3.1 Route Directory & Inventory](#31-route-directory--inventory)
   - [3.2 Landing Page (`/`)](#32-landing-page-)
   - [3.3 Login Page (`/login`)](#33-login-page-login)
   - [3.4 Registration Page (`/signup`)](#34-registration-page-signup)
   - [3.5 Main Dashboard Layout & Shell (`/dashboard`)](#35-main-dashboard-layout--shell-dashboard)
   - [3.6 Tab 1: Overview (`/dashboard#overview`)](#36-tab-1-overview-dashboardoverview)
   - [3.7 Tab 2: Solar Power Prediction (`/dashboard#solar`)](#37-tab-2-solar-power-prediction-dashboardsolar)
   - [3.8 Tab 3: Energy Consumption Prediction (`/dashboard#consumption`)](#38-tab-3-energy-consumption-prediction-dashboardconsumption)
   - [3.9 Tab 4: Wind Energy Monitor (`/dashboard#wind`)](#39-tab-4-wind-energy-monitor-dashboardwind)
   - [3.10 Tab 5: Energy Marketplace (`/dashboard#marketplace`)](#310-tab-5-energy-marketplace-dashboardmarketplace)
   - [3.11 Tab 6: Pre-booking & Direct Messages (`/dashboard#bookings`)](#311-tab-6-pre-booking--direct-messages-dashboardbookings)
   - [3.12 Tab 7: Historical Transactions & Analytics (`/dashboard#history`)](#312-tab-7-historical-transactions--analytics-dashboardhistory)
4. [Dashboard Detail Specification](#4-dashboard-detail-specification)
5. [Cards and Containers System](#5-cards-and-containers-system)
6. [Button Design System](#6-button-design-system)
7. [Iconography System](#7-iconography-system)
8. [Data Table Design System](#8-data-table-design-system)
9. [Forms and Inputs System](#9-forms-and-inputs-system)
10. [Graphs and Visualizations System](#10-graphs-and-visualizations-system)
11. [Marketplace UI & Smart Contract Flow](#11-marketplace-ui--smart-contract-flow)
12. [MetaMask & Web3 Wallet UI Specification](#12-metamask--web3-wallet-ui-specification)
13. [Booking Workflow UI Specification](#13-booking-workflow-ui-specification)
14. [Messaging & Chat UI Specification](#14-messaging--chat-ui-specification)
15. [Solar, Wind, and Energy Consumption Telemetry UI](#15-solar-wind-and-energy-consumption-telemetry-ui)
16. [Modals, Dialogs, Toasts, and Alerts](#16-modals-dialogs-toasts-and-alerts)
17. [Badges, Tags, and Status Indicators](#17-badges-tags-and-status-indicators)
18. [Animations and Micro-Interactions](#18-animations-and-micro-interactions)
19. [Responsive Design Specifications](#19-responsive-design-specifications)
20. [Accessibility (a11y) Standards](#20-accessibility-a11y-standards)
21. [Design Tokens & Tailwind Configuration](#21-design-tokens--tailwind-configuration)
22. [Reusable Component Inventory](#22-reusable-component-inventory)
23. [Page-by-Page UI Blueprint](#23-page-by-page-ui-blueprint)
24. [Implementation Execution Guidance](#24-implementation-execution-guidance)

---

# 1. Overall Design System

EnergyChain employs an **Enterprise Eco-Tech Clean** design language. It pairs a clinical, high-contrast light sage background with high-saturation renewable energy semantic colors (Emerald Green for primary blockchain/grid actions, Solar Amber for photovoltaic generation, Wind Azure for aerodynamic turbines, and Storage Violet for battery capacity). Surfaces are crisp white cards elevated with soft multi-layered green-tinted shadows, sharp hairline borders, and micro-animations.

---

### 1.1 Color Palette

#### Primary Green & Brand Gradients
- **Primary Base (`brand-green-500`)**: `#10b981` (Emerald 500 — Main action color, brand icon, progress tracks, active status)
- **Primary Hover (`brand-green-600`)**: `#059669` (Emerald 600 — Button hover, interactive link hover, active tab underline)
- **Primary Active / Deep (`brand-green-700`)**: `#047857` (Emerald 700 — Primary gradient anchor, text headlines, solid button pressed)
- **Primary Strong (`brand-green-800`)**: `#065f46` (Emerald 800 — High-contrast text on soft green backgrounds)
- **Primary Darkest (`brand-green-900`)**: `#064e3b` (Emerald 900 — Deepest contrast headings)
- **Primary Soft Tint (`brand-green-50`)**: `#ecfdf5` (Emerald 50 — Metric pill backgrounds, active tab background, table hover accent)
- **Primary Light Border (`brand-green-200`)**: `#a7f3d0` (Emerald 200 — Badges, subtle dividers, active card borders)
- **Brand Gradient (`.energy-gradient`)**: `linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)`
- **Brand Gradient Light (`.energy-gradient-alt`)**: `linear-gradient(135deg, #34d399 0%, #10b981 100%)`

#### Solar Amber (Photovoltaic Energy & Warnings)
- **Solar Base (`solar-amber-500`)**: `#f59e0b` (Amber 500 — Solar icons, warning toasts, solar chart line, pending status)
- **Solar Hover / Mid (`solar-amber-600`)**: `#d97706` (Amber 600 — Solar button hover, gradient midpoint)
- **Solar Dark (`solar-amber-700`)**: `#b45309` (Amber 700 — Solar titles, gradient terminus)
- **Solar Darkest (`solar-amber-900`)**: `#78350f` (Amber 900 — High-contrast text on amber cards)
- **Solar Soft Tint (`solar-amber-50`)**: `#fffbeb` (Amber 50 — Prediction card background, pending status badge background)
- **Solar Border (`solar-amber-300`)**: `#fcd34d` (Amber 300 — Prediction card border, sample alert border)
- **Solar Gradient (`.solar-gradient`)**: `linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)`

#### Wind Azure (Aerodynamic Wind Energy & System Status)
- **Wind Base (`wind-blue-500`)**: `#3b82f6` (Blue 500 — Wind indicators, production chart wind series, info icons)
- **Wind Dark (`wind-blue-600`)**: `#2563eb` (Blue 600 — Wind text, link focus, gradient midpoint)
- **Wind Deep (`wind-blue-700`)**: `#1d4ed8` (Blue 700 — High contrast wind metrics, gradient terminus)
- **Wind Soft Tint (`wind-blue-50`)**: `#eff6ff` (Blue 50 — Wind metric card background, notification info tint)
- **Wind Border (`wind-blue-200`)**: `#bfdbfe` (Blue 200 — Wind card borders)
- **Wind Gradient (`.wind-gradient`)**: `linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)`

#### Battery Violet (Energy Storage & Mix Distribution)
- **Battery Base (`battery-violet-500`)**: `#8b5cf6` (Violet 500 — Battery level fill, energy mix doughnut segment)
- **Battery Dark (`battery-violet-600`)**: `#7c3aed` (Violet 600 — Battery gradient midpoint)
- **Battery Deep (`battery-violet-700`)**: `#6d28d9` (Violet 700 — Battery gradient terminus)
- **Battery Soft Tint (`battery-violet-50`)**: `#f5f3ff` (Violet 50 — Battery icon container)
- **Battery Gradient (`.battery-gradient`)**: `linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)`

#### Energy Consumption Teal/Emerald
- **Consumption Primary (`consumption-green-700`)**: `#047857` (Predicted consumption metric, chart bars)
- **Consumption Bar Alpha Fill**: `rgba(4, 120, 87, 0.78)` (Consumption bar chart background fill)

#### Neutral Backgrounds, Surfaces, Text, & Borders
- **Main Page Background (`--ec-page`)**: `#f6f8f6` (Subtle tinted sage/gray page canvas, avoiding harsh pure gray)
- **Alternative Body Background**: `#f9fafb` (Tailwind Gray 50 fallback)
- **Card / Surface Background (`--ec-surface`)**: `#ffffff` (Pure optical white for all cards, panels, and nav bars)
- **Subsurface / Table Header / Striping**: `#f3f6f4` (Light sage-gray for data table `<th>` elements)
- **Subsurface Muted Container**: `#fbfdfb` (Slightly warm off-white for empty states and message threads)
- **Sidebar Background**: `#ffffff` (with desktop right border `1px solid #dfe7e1`)
- **Header Background**: `rgba(255, 255, 255, 0.95)` (95% opacity white with `backdrop-filter: blur(10px)`)
- **Primary Text (`--ec-ink`)**: `#17211d` (Ultra-deep forest charcoal, high readability, softer than pure `#000000`)
- **Secondary Text / Headings**: `#111827` (Tailwind Gray 900)
- **Supporting / Body Text (`--ec-muted`)**: `#637067` (Medium sage-slate, optimized for WCAG AAA at 14px+)
- **Muted Helper Text**: `#6b7280` (Tailwind Gray 500 — Timestamps, input placeholders, ranges)
- **Disabled Text**: `#9ca3af` (Tailwind Gray 400 — Inactive controls, disabled buttons)
- **Dividers & Structural Borders (`--ec-border`)**: `#dfe7e1` (Crisp light border for cards, navbars, and panels)
- **Light Table Borders**: `#edf1ee` (Hairline dividers between data rows)
- **Focus Ring Glow**: `rgba(16, 185, 129, 0.38)` (Emerald focus highlight for keyboard navigation)

#### Semantic Alert & Status Colors
- **Success Base**: `#10b981` (Green 500) | **Dark**: `#047857` | **Background**: `#ecfdf5` | **Border**: `#a7f3d0`
- **Warning Base**: `#f59e0b` (Amber 500) | **Dark**: `#a16207` | **Background**: `#fffbeb` | **Border**: `#fde68a`
- **Error / Danger Base**: `#ef4444` (Red 500) | **Dark**: `#b91c1c` (Red 700) | **Background**: `#fef2f2` | **Border**: `#fecaca`
- **Info Base**: `#3b82f6` (Blue 500) | **Dark**: `#1d4ed8` | **Background**: `#eff6ff` | **Border**: `#bfdbfe`

---

### 1.2 Color Token Reference Table

| Token Name | Hex Value | Usage Context | Component / Target |
| :--- | :--- | :--- | :--- |
| `--ec-page` | `#f6f8f6` | Application viewport background | `<body>`, AppShell background |
| `--ec-surface` | `#ffffff` | Floating cards, modals, navigation bars | `.module-card`, `.stat-card`, Header |
| `--ec-ink` | `#17211d` | High-emphasis headings, key metrics | `h1`, `h2`, `.text-3xl`, table IDs |
| `--ec-muted` | `#637067` | Descriptive text, field labels, units | `.metric-note`, `.section-caption`, `label` |
| `--ec-border` | `#dfe7e1` | Card outlines, header borders, inputs | Card borders, input default border |
| `--ec-primary` | `#047857` | Brand actions, primary CTA, active states | Buttons, active tab bottom indicator |
| `--ec-primary-mid` | `#059669` | Mid-gradient, active borders | `.energy-gradient`, button hover |
| `--ec-primary-light`| `#10b981` | Brand gradient origin, success dots | `.energy-gradient`, toast success |
| `--ec-primary-soft` | `#ecfdf5` | Highlight pills, active tab background | `.tab-btn.active`, `.status-confirmed` |
| `--ec-solar` | `#f59e0b` | Solar generation, warnings, pending | Solar tab, `.status-pending` |
| `--ec-solar-soft` | `#fffbeb` | Heuristic solar output panel background | `#predictionResult`, warning banners |
| `--ec-wind` | `#3b82f6` | Wind monitor, turbine charts | Wind tab, metric cards |
| `--ec-wind-soft` | `#eff6ff` | Wind speed and telemetry card background| Wind metric card container |
| `--ec-battery` | `#8b5cf6` | Energy storage indicators | Energy mix chart, battery meter fill |
| `--ec-danger` | `#b91c1c` | Transaction cancellation, errors | `.table-action--cancel`, error toasts |
| `--ec-danger-soft` | `#fef2f2` | Cancelled status badges, error banners | `.status-cancelled`, `#consumptionError` |
| `--ec-focus` | `rgba(16,185,129,.38)`| Keyboard focus ring (3px solid, 2px offset)| `:focus-visible` on all interactives |

---

### 1.3 Color Combinations & Contrast States

1. **Background-to-Card Contrast**:
   - Canvas: `#f6f8f6` (Light sage-gray)
   - Elevated Card: `#ffffff` (Pure optical white)
   - Border: `1px solid #dfe7e1`
   - Shadow: `0 10px 28px rgba(15, 46, 31, 0.08)`
   - Contrast Ratio: Exceeds 1.15:1 baseline surface luminance with unmistakable depth via elevation and green-tinted shadow.
2. **Text Contrast Ratios**:
   - Deep Ink (`#17211d`) on White Surface (`#ffffff`): **15.2:1** (Exceeds WCAG AAA standard of 7.0:1).
   - Muted Sage (`#637067`) on White Surface (`#ffffff`): **5.4:1** (Exceeds WCAG AA standard of 4.5:1).
   - White Text (`#ffffff`) on Primary CTA (`#047857`): **5.9:1** (Exceeds WCAG AA).
   - Danger Text (`#b91c1c`) on Danger Soft (`#fef2f2`): **7.8:1** (WCAG AAA compliant).
   - Amber Warning Text (`#a16207`) on Amber Soft (`#fffbeb`): **5.6:1** (WCAG AA compliant).
3. **Button State System**:
   - **Default State**: Rich gradient background or flat high-contrast fill.
   - **Hover State**: `-translate-y-0.5` (-2px), animated diagonal shimmer pseudo-element traveling `left: 100%` in 0.5s, box shadow expansion to `0 8px 20px rgba(4, 120, 87, 0.22)`.
   - **Active (Pressed) State**: `translate-y-0` (returns to origin), shadow tightens to `0 2px 4px rgba(4, 120, 87, 0.15)`.
   - **Focus State**: Visible `3px solid rgba(16, 185, 129, 0.38)` outline with `2px` offset.
   - **Disabled State**: `opacity: 0.6`, `cursor: not-allowed`, `pointer-events: none`, no transform, no shimmer, no glow.
4. **Theme Decision**:
   - EnergyChain is strictly calibrated as a **High-Legibility Daytime Clean Theme** (`light-mode`). All telemetry data, green badges, and financial charts are optimized for readability in operations centers and sunny field environments. Dark mode tokens are reserved for a future phase and must not alter the primary light mode values specified herein.

---

### 1.4 Typography System & Scale

- **Primary Font Family**: `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`
- **Monospace Code Family**: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace` (Used for: Ethereum wallet addresses, Sepolia transaction hashes, cryptographic Keccak256 user hashes, and numeric table identifiers).
- **Font Weights**:
  - `400` (Regular): Body descriptions, long-form content, secondary explanations.
  - `500` (Medium): Secondary button labels, table text, input values, metric subtitles.
  - `600` (Semi-Bold): Card headers, table actions, interactive links, form labels.
  - `700` (Bold): Section headings (`H2`), card titles (`H3`), large KPI metric values.
  - `800` (Extra-Bold): Eyebrow kickers, table column headers (`<th>`), landing statement highlights.
  - `900` (Black): Hero H1 titles, dashboard lockup branding.

#### Typography Scale Table

| Role / Tag | Font Size | Line Height | Weight | Letter Spacing | Tracking / Transform | Example Content |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Display (H1 Desktop)** | `4.5rem` (72px) | `1.0` (72px) | 900 | `-0.03em` | None | "Powering the Future of Energy Trading" |
| **Hero Display (H1 Mobile)** | `3.0rem` (48px) | `1.1` (52.8px) | 800 | `-0.025em` | None | "Powering the Future of Energy Trading" |
| **Page Title (H1)** | `2.25rem` (36px) | `2.5rem` (40px) | 800 | `-0.03em` | None | "Energy Dashboard" |
| **Section Heading (H2)** | `1.5rem` (24px) | `2.0rem` (32px) | 700 | `-0.02em` | None | "Active Marketplace", "Reserve Energy" |
| **Card / Widget Title (H3)** | `1.25rem` (20px) | `1.75rem` (28px)| 700 | `-0.015em` | None | "Energy Production Trend", "Create Offer"|
| **Subheading (H4)** | `1.125rem` (18px)| `1.5rem` (24px) | 600 | `-0.01em` | None | "Wind Turbine Status" |
| **Primary KPI Metric** | `2.25rem` (36px) | `2.5rem` (40px) | 700 | `-0.02em` | `tabular-nums` | `12.5 kWh`, `0.050 ETH`, `75%` |
| **Prediction Large Metric** | `2.5rem` (40px) | `1.0` (40px) | 800 | `-0.03em` | `tabular-nums` | `4.28 kW`, `142.8520` |
| **Body Large / Lead** | `1.125rem` (18px)| `1.75rem` (28px)| 400 | `0` | None | Landing subheaders, auth card intros |
| **Body Base** | `1.0rem` (16px) | `1.5rem` (24px) | 400 | `0` | None | Descriptive copy, message thread body |
| **Body Small / Inputs** | `0.875rem` (14px)| `1.25rem` (20px)| 500 | `0` | None | Text fields, dropdown items, table cells|
| **Labels & Form Titles** | `0.875rem` (14px)| `1.25rem` (20px)| 600 | `0` | None | "Energy quantity (kWh)", "Price in ETH" |
| **Table Headers (`<th>`)** | `0.70rem` (11.2px)| `1.0rem` (16px) | 800 | `+0.06em` | `uppercase` | "OFFER ID", "SELLER WALLET", "PRICE" |
| **Eyebrows / Kickers** | `0.75rem` (12px) | `1.0rem` (16px) | 800 | `+0.12em` | `uppercase` | "OPERATIONS WORKSPACE", "PERMANENT WALLET"|
| **Status Badges & Chips** | `0.72rem` (11.5px)| `1.0rem` (16px) | 700 | `+0.02em` | `capitalize` | "Pending", "Confirmed", "Completed" |
| **Monospace / Hash / Addr** | `0.78rem` (12.5px)| `1.1rem` (17.6px)| 600 | `+0.02em` | Monospace | `0xaa36...38z`, `#0012` |

---

# 2. Layout System & Architecture

### 2.1 Application Shell & Layout

The Next.js rebuild utilizes a modern dual-layout paradigm:
1. **Marketing & Auth Shell** (Fluid centered container, sticky slim top navbar, full-width sections).
2. **Authenticated Operations AppShell** (Persistent 260px left sidebar on desktop, fixed top utility header, and responsive main content viewport).

```text
+------------------------------------------------------------------------------------+
|  Top Utility Header (h-16 / 64px) — Sticky top-0 z-40                              |
|  [Logo / Mobile Toggle]  [Breadcrumb]      [Sepolia Status] [Wallet Pill] [Profile] |
+------------------+-----------------------------------------------------------------+
|                  |  Main Scrollable Content Canvas (bg: #f6f8f6)                   |
|  Desktop Sidebar |  max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8                    |
|  (w-64 / 260px)  |  +-----------------------------------------------------------+  |
|                  |  | Page Header: Eyebrow + Title + Operational Status Badge   |  |
|  - Logo Lockup   |  +-----------------------------------------------------------+  |
|  - Nav Groups:   |  | Wallet Status & Binding Banner (Module Card)             |  |
|    * Workspace   |  +-----------------------------------------------------------+  |
|    * Intelligence|  | KPI 4-Column Grid (Generation, Offers, Revenue, Storage)  |  |
|    * Trade & P2P |  +-----------------------------------------------------------+  |
|  - User Profile  |  | Tabbed Navigation Bar (7 Horizontal Tabs)                 |  |
|  - Logout Button |  +-----------------------------------------------------------+  |
|                  |  | Active Module Content (Overview / Solar / Market / etc.)  |  |
|                  |  +-----------------------------------------------------------+  |
+------------------+-----------------------------------------------------------------+
```

#### Content Layout Metrics
- **Global Viewport Max-Width**: `1280px` (`max-w-7xl mx-auto`).
- **Main Container Horizontal Padding**:
  - Mobile (`< 640px`): `1.0rem` (16px, `px-4`)
  - Tablet (`640px - 1023px`): `1.5rem` (24px, `sm:px-6`)
  - Desktop (`>= 1024px`): `2.0rem` (32px, `lg:px-8`)
- **Vertical Spacing Rhythm**:
  - Section-to-section gap: `2.0rem` (32px, `space-y-8`)
  - Sub-grid gap: `1.5rem` (24px, `gap-6`)
  - Input field rhythm: `1.25rem` (20px, `gap-5`)
  - Internal card padding: `1.5rem` (24px, `p-6`), down to `1.0rem` (16px, `p-4`) on mobile.

---

### 2.2 Sidebar Navigation (Desktop & Mobile)

The desktop sidebar provides structured access to all EnergyChain operational surfaces without requiring deep tab switching.

- **Width**: `260px` (`16.25rem`, fixed desktop).
- **Background**: `#ffffff` (Pure white).
- **Borders**: `border-r border-[#dfe7e1]`.
- **Z-Index**: `z-30` (Desktop), `z-50` (Mobile Drawer).
- **Logo Lockup**:
  - Top position: `h-16` (64px aligned with top header).
  - Left padding: `1.5rem` (24px).
  - Icon: 32px × 32px (`w-8 h-8`) Emerald lightning SVG.
  - Brand Title: "EnergyChain" in 24px bold gradient text (`.gradient-text`).
  - Subtitle: "OPERATIONS" in 10px uppercase tracking `0.15em` (`#637067`).
- **Navigation Groups**:
  1. **Core Workspace**:
     - Overview (`/dashboard/overview`)
     - Marketplace (`/dashboard/marketplace`)
     - Pre-bookings (`/dashboard/bookings`)
     - History & Trades (`/dashboard/history`)
  2. **Energy Intelligence (AI/ML)**:
     - Solar Prediction (`/dashboard/solar`)
     - Consumption ML (`/dashboard/consumption`)
     - Wind Telemetry (`/dashboard/wind`)
- **Navigation Items**:
  - Height: `44px` (2.75rem).
  - Padding: `0.625rem 1.0rem` (10px 16px).
  - Border Radius: `0.55rem` (8.8px).
  - Icon Size: `20px × 20px` (`w-5 h-5`).
  - Font Size: `0.875rem` (14px), font weight 600.
  - **Inactive Style**: Text `#637067`, transparent background, icon color `#637067`.
  - **Hover Style**: Text `#17211d`, background `#f3f6f4`, icon color `#047857`.
  - **Active Style**: Text `#065f46`, background `#ecfdf5`, font weight 700, icon color `#047857`, left border accent `3px solid #047857`.
- **Sidebar Footer (Profile & Logout)**:
  - Bottom pinned with `border-t border-[#dfe7e1] p-4`.
  - User avatar chip with initials or fallback user icon.
  - User name in 14px bold `#17211d`.
  - User email in 12px `#637067` truncate.
  - Logout button: Full width, height 36px, text `#b91c1c`, background `#fef2f2`, hover `#fee2e2`, with logout door/arrow icon.
- **Mobile Drawer Behavior**:
  - Hidden by default on screens `< 1024px`.
  - Triggered by top-left hamburger menu button in Header.
  - Slides in from left with `cubic-bezier(0.16, 1, 0.3, 1)` in `0.3s`.
  - Accompanied by fixed full-screen backdrop `rgba(23, 33, 29, 0.4)` with backdrop blur `4px`.
  - Tap outside or tap navigation link closes the drawer automatically.

---

### 2.3 Top Header Navigation

- **Height**: `64px` (`h-16`, 4.0rem).
- **Position**: Sticky (`sticky top-0 z-40`).
- **Background**: `rgba(255, 255, 255, 0.95)` with `backdrop-filter: blur(10px)`.
- **Border**: `border-b border-[#dfe7e1]`.
- **Box Shadow**: `0 1px 0 rgba(15, 46, 31, 0.04)`.
- **Left Cluster**:
  - Mobile Menu Toggle button (hidden on desktop `lg:hidden`).
  - Breadcrumb navigation: e.g., `EnergyChain / Dashboard / Marketplace` (13px, text `#637067`, active leaf `#17211d` font-bold).
- **Right Utility Cluster**:
  1. **Sepolia Network Indicator**:
     - Pill: `bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] px-3 py-1 rounded-full text-xs font-bold`.
     - Icon: 6px animated green pulse dot (`bg-[#10b981]`).
     - Text: "Sepolia (11155111)".
  2. **Wallet Connection Pill**:
     - Disconnected: `bg-[#fffbeb] border border-[#fde68a] text-[#92400e] px-3 py-1.5 rounded-full text-xs font-bold` with amber dot "No Wallet".
     - Connected: `bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] px-3 py-1.5 rounded-full text-xs font-mono font-bold` with green dot and formatted address `0xaa36...38z`.
     - Copy action: Click copies raw address to clipboard with momentary checkmark toast.
  3. **User Profile Quick Dropdown**:
     - User Name button with chevron down.
     - Dropdown menu: Shows full name, verified email, bound wallet status, link to documentation, and Logout trigger.

---

# 3. Every Page and Section

### 3.1 Route Directory & Inventory

| Route Path | View / Component | Authentication Required | Primary Data Source |
| :--- | :--- | :--- | :--- |
| `/` | Landing / Marketing Page | Public | Static assets, SVG energy animations |
| `/login` | Account Login | Public (Guest only) | `POST /auth/login`, localStorage fallback |
| `/signup` | Account Registration | Public (Guest only) | `POST /auth/signup`, localStorage fallback |
| `/dashboard` | Main AppShell & Dashboard | Authenticated (JWT) | PostgreSQL DB, Sepolia Contract, ML models |
| `/dashboard#overview` | Overview Tab | Authenticated (JWT) | Session user, KPI aggregations, Chart.js |
| `/dashboard#solar` | Solar Power Prediction | Authenticated (JWT) | Local Heuristic calculation / `POST /predict` |
| `/dashboard#consumption`| Energy Consumption ML | Authenticated (JWT) | `POST /api/energy-consumption/predict` |
| `/dashboard#wind` | Wind Energy Telemetry | Authenticated (JWT) | Client mathematical turbine simulation |
| `/dashboard#marketplace`| On-Chain Marketplace | Authenticated + Wallet | Sepolia `EnergyOffer.sol` Smart Contract |
| `/dashboard#bookings` | Pre-booking & Messaging | Authenticated (JWT) | `GET/POST /bookings`, `GET/POST /messages` |
| `/dashboard#history` | Transaction Audit Log | Authenticated + Wallet | Sepolia Events (`OfferAccepted`), local cache |

---

### 3.2 Landing Page (`/`)
1. **Page Purpose**: High-conversion marketing showcase explaining decentralized renewable energy trading, blockchain transparency, and automated settlements.
2. **Route**: `/`
3. **Layout**: Full-width marketing layout. Fixed branded navigation bar, Hero section with animated interactive SVG grid, Trust Bar, 3-column Feature Grid, 2-column Use Case section with high-impact savings metric card, Sustainable Future mission statement, and corporate footer.
4. **Background**: Radial gradients over canvas `#f6f8f6`, featuring gradient blobs (`#10b981` with 10% opacity and blur-3xl).
5. **Header**: Fixed `h-16` white navbar with EnergyChain logo, in-page smooth-scroll links (`#features`, `#use-cases`, `#about`), and twin action buttons ("Log In" outlined/ghost and "Sign Up" solid green gradient).
6. **Sidebar**: None (full-width marketing experience).
7. **Main Content**:
   - Hero headline: `text-5xl md:text-7xl` bold with `.gradient-text`.
   - Hero CTA: "Start Free Trial" button (`px-10 py-4`, font-semibold, `.btn-glow`).
   - SVG Energy Grid: 1000px × 320px animated vector graphic with 5 nodes (Solar Panels, Wind Turbine, Battery Storage, Smart Grid, EV Charging) with floating micro-animations and pulsating energy flow particles.
   - Trust Bar: 3 horizontal trust badges (Verified Green Energy, Carbon Neutral Trading, 100% Transparent) with circular green gradient icons.
   - Core Benefits: 3 elevated cards (`.hover-lift`, `p-10`, `rounded-2xl`, shadow-lg) for Security, Instant Settlement, and Green Compliance.
   - Use Cases: Real-world P2P trading breakdown with checklist and a massive emerald statistics card (`60% Lower Energy Costs`, `2.5 GWh Traded daily`).
8. **Components**: `Navbar`, `HeroSection`, `EnergyGridGraphic`, `TrustBar`, `FeatureCard`, `MetricCard`, `Footer`.
9. **Cards**: Benefit card (`p-10 rounded-2xl bg-white shadow-lg border border-[#dfe7e1]`), Statistic Card (`p-12 rounded-3xl bg-energy-gradient text-white shadow-2xl`).
10. **Tables**: None.
11. **Buttons**: Hero CTA button, Navbar "Log In" / "Sign Up" buttons, "Explore All Use Cases" inline text link with chevron.
12. **Forms**: None.
13. **Icons**: Lightning bolt, Shield check, Clock settlement, Leaf compliance, Check circle.
14. **Charts**: None (represented by interactive SVG energy graph).
15. **Data Displayed**: "60% Lower Energy Costs", "2.5 GWh Traded daily", "500+ Energy Providers".
16. **Interactions**: Scroll reveal triggers (`.reveal`, `.reveal-left`, `.reveal-right`, `.reveal-scale`), card hover lift (`-10px`), button shimmer on hover.
17. **Loading States**: Immediate static hydration.
18. **Empty States**: Not applicable.
19. **Error States**: Not applicable.
20. **Success States**: Not applicable.
21. **Responsive Behavior**: Hero shrinks to `text-5xl` on mobile; benefit grid switches from 3 columns to single stacked column; use-case grid stacks vertically; SVG illustration maintains aspect ratio with horizontal overflow protection.

---

### 3.3 Login Page (`/login`)
1. **Page Purpose**: Authenticate returning energy prosumers and consumers, issue secure JWT session, and initialize browser session state.
2. **Route**: `/login`
3. **Layout**: Centered single-column card layout inside a full-height auth shell (`min-h-screen pt-16`).
4. **Background**: Sage page canvas with ambient top-right radial gradient glow (`rgba(16, 185, 129, 0.12)`).
5. **Header**: Simplified sticky header with EnergyChain brand lockup on the left and navigation buttons ("Home", "Sign Up") on the right.
6. **Sidebar**: None.
7. **Main Content**: Auth card container with centered lockup: "Secure account access" eyebrow, "Log In" gradient heading, email input, password input, Remember Me checkbox, Forgot Password action, and full-width green gradient submit button.
8. **Components**: `AuthCard`, `TextInput`, `PasswordInput`, `Checkbox`, `PrimaryButton`, `AlertBanner`.
9. **Cards**: `.auth-card` (Max-width 28rem/448px, background `#ffffff`, radius 1.5rem/24px, shadow `0 18px 42px rgba(15, 46, 31, 0.1)`, border `1px solid #dfe7e1`, padding 2rem/32px).
10. **Tables**: None.
11. **Buttons**:
    - Submit Button: `w-full py-3 rounded-lg font-semibold text-lg .energy-gradient text-white .btn-glow`.
    - Forgot Password: Text link `#047857`, font-semibold.
    - Create Account link: Text link `#10b981`.
12. **Forms**: `#loginForm` with client-side required validation and submit interception.
13. **Icons**: Brand lightning mark, input focus indicators, spinning loader dot.
14. **Charts**: None.
15. **Data Displayed**: User credentials inputs.
16. **Interactions**: Submit triggers `POST /auth/login`; displays loading spinner and updates button text to "Signing in…"; stores JWT and user details in `sessionStorage`; redirects to `/dashboard`.
17. **Loading States**: Submit button disabled with animated spinning indicator; inputs locked during request.
18. **Empty States**: Not applicable.
19. **Error States**: Inline alert banner (`#authNotice` with `.auth-notice--error`, `#fef2f2` background, `#b91c1c` text, `#fecaca` border) for invalid credentials or connection failures.
20. **Success States**: Inline banner turns green (`.auth-notice--success`, `#ecfdf5` background, `#047857` text) reading "Signed in successfully. Opening your dashboard…".
21. **Responsive Behavior**: Card scales down to `calc(100vw - 2rem)` on small viewports with `p-6` padding; header actions remain visible.

---

### 3.4 Registration Page (`/signup`)
1. **Page Purpose**: Register a new user account with PostgreSQL persistence or link an existing browser-local account to the backend database.
2. **Route**: `/signup`
3. **Layout**: Centered auth shell matching the Login page.
4. **Background**: Sage canvas with radial green gradient overlay.
5. **Header**: Minimal auth navbar with "Log In" and "Home" actions.
6. **Sidebar**: None.
7. **Main Content**: Registration card with: "Create your marketplace account" kicker, "Sign Up" gradient heading, Full Name input, Email input, Password input with helper text ("Use at least 6 characters"), full-width submit button, and "Already have an account? Log In" link.
8. **Components**: `AuthCard`, `TextInput`, `PasswordInput`, `HelperText`, `PrimaryButton`, `AlertBanner`.
9. **Cards**: Matches `.auth-card` specifications.
10. **Tables**: None.
11. **Buttons**: Full-width "Create Account" gradient button with loading spinner.
12. **Forms**: `#signupForm` enforcing minimum 6-character password length.
13. **Icons**: Lightning icon, check indicators.
14. **Charts**: None.
15. **Data Displayed**: Name, Email, Password fields.
16. **Interactions**: Submits to `POST /auth/signup`; on existing user collision, falls back gracefully to backend account linking; persists JWT and profile to `sessionStorage`; redirects to `/dashboard`.
17. **Loading States**: Button shows "Creating account…" and spinning dot.
18. **Empty States**: Not applicable.
19. **Error States**: Red notice banner on missing fields, short password, or server error.
20. **Success States**: Green banner "Account created successfully. Opening your dashboard…".
21. **Responsive Behavior**: Responsive card sizing with minimum margins on mobile.

---

### 3.5 Main Dashboard Layout & Shell (`/dashboard`)
1. **Page Purpose**: Primary operational command center aggregating energy generation telemetry, smart contract trading, reservations, and AI models.
2. **Route**: `/dashboard`
3. **Layout**: Standard AppShell: Fixed top utility header (`h-16`), optional 260px collapsible sidebar, central content area with Max-width 1280px (`max-w-7xl mx-auto`).
4. **Background**: `#f6f8f6` (Enterprise sage canvas).
5. **Header**: Fixed navbar with brand mark, subtitle, Sepolia network badge, wallet connection status pill, and Log Out button.
6. **Sidebar**: Desktop persistent sidebar with navigation groups; mobile drawer.
7. **Main Content**:
   - Operations workspace header with status badge.
   - Permanent MetaMask Wallet Binding module card.
   - 4-Card KPI Overview Grid (Generation, Offers, Revenue, Storage).
   - 7-Section Tab Navigation Strip with active indicator.
   - Active Tab Content Panel.
8. **Components**: `AppShell`, `Header`, `Sidebar`, `WalletCard`, `KpiCard`, `TabBar`, `Toast`.
9. **Cards**: `.module-card`, `.stat-card`.
10. **Tables**: Embedded within Marketplace, Bookings, and History tabs.
11. **Buttons**: Connect MetaMask, Log Out, Tab Switchers.
12. **Forms**: Embedded in respective feature tabs.
13. **Icons**: Solar sun, Wind turbine, Battery lightning, Shopping bag, Calendar reservation, Clock history.
14. **Charts**: Canvas charts rendered via Chart.js 4.4+.
15. **Data Displayed**: Aggregate generation, active offer count, accumulated revenue, battery percentage.
16. **Interactions**: Tab switching without page reload, wallet connection modal/flow, session validation, 3-second live stat update loop.
17. **Loading States**: Top-level "Loading secure session…" skeleton before JWT verification.
18. **Empty States**: Tab-level empty states when no data is available.
19. **Error States**: Session expired redirect to `/login`; Web3 network warning if not Sepolia.
20. **Success States**: Notification toast for completed operations.
21. **Responsive Behavior**: 4-column KPI grid stacks to 2 columns on tablet (`md`) and 1 column on mobile (`< 640px`); tab strip enables horizontal scroll (`overflow-x-auto pb-2`).

---

### 3.6 Tab 1: Overview (`/dashboard#overview`)
1. **Page Purpose**: Deliver a holistic summary of the user's identity, connected wallet, weekly generation trends, and energy source distribution.
2. **Route**: `/dashboard#overview` (or `/dashboard/overview`)
3. **Layout**: Two-row layout: Top full-width Profile Card; Bottom 2-column Chart Grid.
4. **Background**: `#ffffff` cards on `#f6f8f6` canvas.
5. **Header**: Section title within card.
6. **Sidebar**: Inherited from AppShell.
7. **Main Content**:
   - **Your Profile Card**: 3 columns displaying Name (`#profileName`), Email (`#profileEmail`), and Connected Wallet address (`#profileWallet` formatted with monospace chip).
   - **Energy Production Trend Card**: Line chart displaying weekly energy generation in kWh with separate series for Solar and Wind.
   - **Energy Mix Distribution Card**: Doughnut chart illustrating the breakdown of current energy assets (55% Solar, 35% Wind, 10% Battery).
8. **Components**: `ProfileModule`, `ProductionTrendChart`, `EnergyMixDoughnut`.
9. **Cards**: `.module-card`, `.chart-card`.
10. **Tables**: None.
11. **Buttons**: None.
12. **Forms**: None.
13. **Icons**: User silhouette icon, Line graph icon, Doughnut chart icon.
14. **Charts**:
    - Line Chart (`#productionChart`): 7 days (Mon–Sun), 2 series (Solar `#f59e0b`, Wind `#3b82f6`), smooth curves (`tension: 0.4`), semi-transparent fills.
    - Doughnut Chart (`#mixChart`): 3 segments (Solar `#f59e0b`, Wind `#3b82f6`, Battery `#8b5cf6`), 2px white borders.
15. **Data Displayed**: User full name, email, wallet address, weekly generation arrays, percentage asset split.
16. **Interactions**: Hovering chart points reveals Chart.js tooltips; charts automatically update/repaint when the Overview tab is selected.
17. **Loading States**: Subtle gray skeleton placeholders before chart initialization.
18. **Empty States**: If user profile is unavailable, dashes (`-`) are displayed.
19. **Error States**: If Chart.js fails to initialize, a warning toast is displayed.
20. **Success States**: None.
21. **Responsive Behavior**: Bottom chart grid stacks from 2 columns to 1 column on viewports `< 768px`.

---

### 3.7 Tab 2: Solar Power Prediction (`/dashboard#solar`)
1. **Page Purpose**: Provide a predictive estimation tool calculating AC power output (kW) based on weather parameters and time of day, with explicit disclosure of local heuristic modeling.
2. **Route**: `/dashboard#solar` (or `/dashboard/solar`)
3. **Layout**: Single elevated `.module-card` containing an input form grid, action buttons, and a revealed calculation result panel.
4. **Background**: `#ffffff` card surface; revealed result card uses amber gradient (`#fffbeb` to `#fef3c7`).
5. **Header**: "Solar Power Prediction" in amber gradient text (`.solar-text`), sun icon, and "Local estimate" amber pill badge (`.simulated-note`).
6. **Sidebar**: Inherited from AppShell.
7. **Main Content**:
   - Description paragraph explicitly disclosing local calculation vs. backend model integration.
   - 4-Column Responsive Input Form:
     1. Date & Time (`#solarDateTime`): `datetime-local` input with calendar icon.
     2. Irradiation (`#solarIrradiation`): Number input, step 0.01, placeholder `800.5`, helper range `0-1200 W/m²`.
     3. Ambient Temperature (`#solarAmbient`): Number input, step 0.1, placeholder `25.5`, helper range `-10 to 50°C`.
     4. Module Temperature (`#solarModule`): Number input, step 0.1, placeholder `45.2`, helper range `0 to 85°C`.
   - Action Button Row:
     - "Predict AC Power" (`#predictBtn`): Solid amber gradient, shimmer hover, contains text and spinning loader.
     - "Fill Sample Data" (`#fillSampleBtn`): Neutral gray button (`bg-gray-600 hover:bg-gray-700`) filling realistic midday values.
   - Revealed Prediction Result Panel (`#predictionResult`):
     - Amber border `2px solid #f59e0b`, background `#fffbeb`.
     - Sub-card 1: Predicted AC Power Output in bold `text-4xl text-amber-600` with unit `kW`.
     - Sub-card 2: Input parameters summary list (Irradiation, Ambient, Module, Time).
     - Tip banner: "💡 Tip: Use this prediction to optimize your energy offers on the marketplace!".
8. **Components**: `SolarForm`, `DateTimeInput`, `NumberInput`, `AmberGradientButton`, `SampleDataButton`, `PredictionResultCard`.
9. **Cards**: `.module-card`, `.prediction-card`.
10. **Tables**: None.
11. **Buttons**: Predict AC Power button, Fill Sample Data button.
12. **Forms**: Grid form with client validation (checks non-empty and non-NaN values; warns if irradiation > 1500 W/m²).
13. **Icons**: Sun rays, Calendar clock, Thermometer ambient, Solar cell module, Lightbulb tip.
14. **Charts**: None.
15. **Data Displayed**: Predicted power output in kW, echoed input values, date/time stamp.
16. **Interactions**:
    - Clicking "Fill Sample Data" populates current local timestamp, 850.5 W/m², 28.5°C ambient, 45.2°C module, and shows a green toast.
    - Clicking "Predict AC Power" triggers calculation, shows loading spinner, changes button text to "Predicting...", reveals result card, shows success toast, and recalculates the Total Generation KPI.
17. **Loading States**: Button shows spinner and text "Predicting..." for 300ms.
18. **Empty States**: Prediction result panel remains hidden (`.hidden`) until first calculation.
19. **Error States**: Red toast notification if inputs are blank or NaN.
20. **Success States**: Green toast: "Solar power estimate calculated.".
21. **Responsive Behavior**: 4 input columns collapse to 2 columns on tablet (`md`) and 1 column on mobile (`< 640px`).

---

### 3.8 Tab 3: Energy Consumption Prediction (`/dashboard#consumption`)
1. **Page Purpose**: Deliver a real machine-learning inference interface connected to the backend endpoint (`POST /api/energy-consumption/predict`), utilizing models trained on `Energy_consumption.csv`.
2. **Route**: `/dashboard#consumption` (or `/dashboard/consumption`)
3. **Layout**: Upper input module card; Lower 2-column revealed results grid (Result metrics on left, Bar chart on right).
4. **Background**: `#ffffff` module cards.
5. **Header**: Section title with subtitle "A time-aware model trained from the supplied Energy_consumption.csv dataset", and badge "Prediction, not measured usage".
6. **Sidebar**: Inherited from AppShell.
7. **Main Content**:
   - Disclaimer note regarding target units ("dataset-defined unit (not specified)").
   - 10-Field Input Form Grid (3 columns):
     1. Timestamp (`#consumptionTimestamp`): `datetime-local` input.
     2. Temperature (`#consumptionTemperature`): Float input (e.g. 28.5).
     3. Humidity (`#consumptionHumidity`): Numeric 0–100%.
     4. Building Square Footage (`#consumptionSquareFootage`): Float input (e.g. 1500).
     5. Occupancy (`#consumptionOccupancy`): Integer input (e.g. 5).
     6. Renewable Energy Input (`#consumptionRenewableEnergy`): Float input (e.g. 12.5).
     7. HVAC Usage (`#consumptionHvacUsage`): Select dropdown ("On", "Off").
     8. Lighting Usage (`#consumptionLightingUsage`): Select dropdown ("On", "Off").
     9. Day of Week (`#consumptionDayOfWeek`): Select dropdown (Monday through Sunday).
     10. Holiday (`#consumptionHoliday`): Select dropdown ("No", "Yes").
   - Action Buttons: "Predict consumption" (green gradient with spinner) and "Reset" (outlined button).
   - Error Banner (`#consumptionError`): Hidden by default; displays red border and text on validation or server failure.
   - Revealed Result Grid (`#consumptionResult`):
     - Left Card: Section caption, massive predicted numeric value in `text-4xl font-bold text-green-700`, unit indicator, model artifact name (e.g., "Model: Random Forest"), and out-of-range warning container (`#consumptionWarning`, amber alert).
     - Right Card: Chart.js bar chart (`#consumptionPredictionChart`) graphing the single predicted value with y-axis baseline.
8. **Components**: `ConsumptionForm`, `SelectDropdown`, `NumberField`, `PredictionChartCard`, `AlertCallout`.
9. **Cards**: `.module-card`, `.chart-card`.
10. **Tables**: None.
11. **Buttons**: Predict consumption submit button, Reset button.
12. **Forms**: `#consumptionForm` with multi-field numeric and range validation.
13. **Icons**: Lightning zap, Building footprint, Users occupancy, HVAC fan, Lightbulb.
14. **Charts**: Single-value bar chart (`type: "bar"`), bar background `rgba(4, 120, 87, 0.78)`, border `#047857`, border radius 6px.
15. **Data Displayed**: Predicted numeric value (formatted to 4 decimals), model algorithm name, data boundary warnings.
16. **Interactions**: Submit dispatches JSON to `/api/energy-consumption/predict`; renders dynamic bar chart; reset button clears form and destroys chart instance.
17. **Loading States**: Button disabled, shows "Predicting…" with pulsing dot.
18. **Empty States**: Result section hidden until successful response.
19. **Error States**: Red banner `#consumptionError` displaying backend or validation error messages.
20. **Success States**: Success toast notification: "Energy consumption prediction completed.".
21. **Responsive Behavior**: 3-column form collapses to 2 columns at `lg` and 1 column at `md`/mobile. Results grid stacks to 1 column.

---

### 3.9 Tab 4: Wind Energy Monitor (`/dashboard#wind`)
1. **Page Purpose**: Real-time operational visualization of aerodynamic wind turbine generation, wind velocity, and generation efficiency, clearly labeled as simulation.
2. **Route**: `/dashboard#wind` (or `/dashboard/wind`)
3. **Layout**: Upper 3-card metric grid; Lower dual turbine visual status panel.
4. **Background**: Gradient cards (`bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200`).
5. **Header**: Title in blue gradient text (`.wind-text`), turbine icon, and amber badge "Simulated data".
6. **Sidebar**: Inherited from AppShell.
7. **Main Content**:
   - **Wind Metric 1: Wind Speed** (`#windSpeed`): Current velocity in `m/s` (e.g. 12.5 m/s), updating dynamically every 5 seconds.
   - **Wind Metric 2: Power Output** (`#windPower`): Derived kilowatt generation (e.g. 8.3 kW).
   - **Wind Metric 3: Efficiency** (`#windEfficiency`): Percentage conversion rate (e.g. 87%).
   - **Wind Turbine Status Module**: Dual-column progress meter visual:
     - Turbine 1: "Active" green badge, blue gradient fill meter at 92%, output "4.2 kW".
     - Turbine 2: "Active" green badge, blue gradient fill meter at 88%, output "4.1 kW".
8. **Components**: `WindMetricCard`, `TurbineStatusWidget`, `EnergyMeterFill`.
9. **Cards**: `.module-card`, `.stat-card`.
10. **Tables**: None.
11. **Buttons**: None.
12. **Forms**: None.
13. **Icons**: Wind swirl, Turbine rotor, Lightning power, Dial efficiency.
14. **Charts**: None (utilizes animated HTML5 progress meters).
15. **Data Displayed**: Wind speed (m/s), active power (kW), turbine efficiency (%), individual turbine status.
16. **Interactions**: Automatic 5-second interval timer updates metrics with realistic randomized fluctuations (`10 + Math.random() * 5`); recalculates Total Generation KPI.
17. **Loading States**: Initial fallback values displayed instantly.
18. **Empty States**: Not applicable.
19. **Error States**: Not applicable.
20. **Success States**: Not applicable.
21. **Responsive Behavior**: 3 metric cards stack to single column on mobile; turbine status grid stacks to single column below 768px.

---

### 3.10 Tab 5: Energy Marketplace (`/dashboard#marketplace`)
1. **Page Purpose**: Decentralized Web3 energy exchange enabling users to create offers on the Sepolia Ethereum blockchain, browse active listings, accept offers via MetaMask, and cancel owned listings.
2. **Route**: `/dashboard#marketplace` (or `/dashboard/marketplace`)
3. **Layout**:
   - Top: "Create Energy Offer" module card.
   - Middle: Filter, Search, and Sort toolbar.
   - Center: "Active Offers" responsive data table.
   - Bottom: "Historical Legacy Offers" reference table.
4. **Background**: `#ffffff` cards on `#f6f8f6` page canvas.
5. **Header**: "Active Offers" title with list icon.
6. **Sidebar**: Inherited from AppShell.
7. **Main Content**:
   - **Create Offer Form**:
     - Public Name input (`#userName`): Text input, autofocuses user's profile name.
     - Price input (`#priceEth`): Numeric input, step `0.001`, minimum `0.01 ETH`.
     - Create Offer button (`#createOfferBtn`): Full-width green gradient button (disabled until wallet is connected and validated).
     - Notice: "Minimum price: 0.01 ETH. Seller identity is bound to your connected MetaMask address."
   - **Marketplace Toolbar**:
     - Checkbox: "Show all marketplace offers" (`#showAllToggle`, checked by default).
     - Search Field: Real-time search by offer ID or seller address (`#offerSearch`).
     - Sort Select: Dropdown (`#sortOffers`) with options (Offer ID, Price Low to High, Price High to Low, Date Newest).
   - **Active Offers Data Table**:
     - Columns: `Offer ID`, `Seller Wallet`, `Created Date`, `Price (ETH)`, `Action`.
     - Action buttons: Red "Cancel" button for offers created by the user's bound wallet; Green "Accept" button for third-party offers.
   - **Historical Legacy Offers Panel**:
     - Snapshot table of 17 immutable legacy contract offers preserved as audit history.
8. **Components**: `CreateOfferForm`, `FilterToolbar`, `MarketplaceDataTable`, `CancelButton`, `AcceptButton`, `HistoricalOffersTable`.
9. **Cards**: `.module-card`, `.table-shell`.
10. **Tables**:
    - Active Offers Table (`.data-table`).
    - Historical Legacy Table (`.data-table`).
11. **Buttons**:
    - Create Offer submit button.
    - Cancel Offer button (`.table-action--cancel`, `#fef2f2` bg, `#b91c1c` text).
    - Accept Offer button (`.table-action--accept`, `#047857` bg, `#ffffff` text, with spinner).
12. **Forms**: `#createOfferForm` with real-time validation for name and minimum 0.01 ETH price.
13. **Icons**: Shopping bag, Plus offer, Filter funnel, Search glass, Ethereum crystal, Cancel cross, Check purchase.
14. **Charts**: None in this tab (historical charts live in Tab 7).
15. **Data Displayed**: On-chain Offer ID (`#0`, `#1`), Seller address or resolved profile name, created datetime, price in ETH.
16. **Interactions**:
    - Offer creation triggers MetaMask transaction for `createOffer(bytes32, uint256)`; polls transaction hash; refreshes table on confirmation.
    - Accept triggers preflight simulation (`activeContract.acceptOffer.staticCall`), validates Sepolia ETH balance + gas estimate, prompts MetaMask transaction, emits `OfferAccepted` event, and adds entry to transaction history.
    - Cancel triggers `cancelOffer(uint256)` on-chain.
17. **Loading States**: Table displays "Loading offers from blockchain…" with skeleton rows. Buttons display "Sending…" or "Accepting…" with spinning indicator.
18. **Empty States**: Container displays `.empty-state` dashed box: "No active offers are available yet." or "No active offers match this search.".
19. **Error States**: Rejection toasts for user denial in MetaMask, insufficient Sepolia funds, or attempting to buy one's own offer.
20. **Success States**: Success toast with clickable Etherscan transaction link: `Offer created! Tx: View`.
21. **Responsive Behavior**: Tables wrap inside `.table-shell` with horizontal scroll (`overflow-x: auto`, min-width 660px); toolbar controls wrap into stacked rows.

---

### 3.11 Tab 6: Pre-booking & Direct Messages (`/dashboard#bookings`)
1. **Page Purpose**: Off-chain peer-to-peer energy reservation workflow allowing customers to reserve energy from registered providers with mutual status updates and dedicated conversational threads.
2. **Route**: `/dashboard#bookings` (or `/dashboard/bookings`)
3. **Layout**:
   - Top: "Reserve Energy" pre-booking form card.
   - Bottom: 2-column split (Left: "My Pre-bookings" table; Right: "Booking Conversation" chat interface).
4. **Background**: `#ffffff` module cards.
5. **Header**: "Reserve Energy" title with backend account connectivity status badge (`#bookingAuthStatus`).
6. **Sidebar**: Inherited from AppShell.
7. **Main Content**:
   - **Pre-booking Form**:
     - Provider Email (`#bookingProviderEmail`): Email input looking up registered provider.
     - Delivery Date & Time (`#bookingScheduledFor`): `datetime-local` input (must be in future).
     - Energy Quantity (`#bookingEnergyUnits`): Number input in kWh.
     - Agreed Price Per Unit (`#bookingPricePerUnit`): Number input in ETH or currency units.
     - Live Estimated Total indicator (`#bookingTotal`): Automatically computes `units * unitPrice`.
     - Submit button: "Create pre-booking" (`#createBookingBtn`).
   - **My Pre-bookings Table**:
     - Columns: `Booking ID`, `Participant`, `Delivery Date`, `Quantity`, `Total Price`, `Status`, `Actions`.
     - Participant column displays counterpart name/email and badge ("Provider" or "Customer").
     - Status badges: `Pending` (amber), `Confirmed` (green), `Cancelled` (red).
     - Action buttons: "Messages" (opens chat thread), "Confirm" (provider only), "Cancel" (either participant while pending).
   - **Booking Conversation Panel**:
     - Header: "Booking #ID with [Counterpart Name]".
     - Scrollable Message Feed (`#bookingMessages`): Max-height 320px (`max-h-80 overflow-y-auto`).
     - Message Bubbles: Sender messages colored soft green (`#ecfdf5`), counterpart messages in white (`#ffffff`).
     - Message Input Form: Text field (max 2000 chars) and "Send" button (disabled until a booking is selected).
8. **Components**: `BookingForm`, `BookingsTable`, `StatusBadge`, `ChatThread`, `MessageBubble`, `ChatInput`.
9. **Cards**: `.module-card`, `.table-shell`.
10. **Tables**: Data table (`.data-table`) with custom actions column.
11. **Buttons**:
    - Create Pre-booking button.
    - Confirm Booking button (`.table-action--confirm`, solid green).
    - Cancel Booking button (`.table-action--cancel`, soft red).
    - Open Messages button (`.table-action--message`, white with green border).
    - Send Message button.
12. **Forms**: `#bookingForm` and `#bookingMessageForm`.
13. **Icons**: Calendar clock, User counterpart, Envelope mail, Chat bubble, Send plane, Check mark, Cross mark.
14. **Charts**: None.
15. **Data Displayed**: Booking ID, participant names, delivery schedules, energy quantities, total calculated prices, message bodies and timestamps.
16. **Interactions**:
    - Inputting quantity and price dynamically recalculates total cost.
    - Selecting "Messages" queries `GET /bookings/:id/messages` and binds active chat thread.
    - Sending message posts to `POST /bookings/:id/messages` and scrolls chat container to bottom.
    - Confirming/Cancelling dispatches `PATCH /bookings/:id/status` and updates status badge instantly.
17. **Loading States**: Table shows "Loading pre-bookings…"; conversation shows "Loading conversation…".
18. **Empty States**:
    - No bookings: "No pre-bookings yet. Reserve future energy from a registered provider to begin.".
    - No booking selected in chat: "Select a booking to message its customer or provider.".
    - Empty chat thread: "Start the conversation for this booking.".
19. **Error States**: Red text alert if provider email does not exist, if reservation is in the past, or if unauthorized.
20. **Success States**: Success toast: "Pre-booking #ID created." or "Booking confirmed.".
21. **Responsive Behavior**: Bottom split grid stacks vertically on screens `< 1024px`; conversation panel moves below booking table.

---

### 3.12 Tab 7: Historical Transactions & Analytics (`/dashboard#history`)
1. **Page Purpose**: Comprehensive audit trail of accepted marketplace transactions, accompanied by price trend analytics and seller volume distribution charts.
2. **Route**: `/dashboard#history` (or `/dashboard/history`)
3. **Layout**:
   - Top: "Accepted Offers (Transaction History)" data table module card.
   - Bottom: 2-column Analytics Grid (Price History line chart on left; Seller distribution pie chart on right).
4. **Background**: `#ffffff` module cards.
5. **Header**: "Accepted Offers (Transaction History)" with clipboard audit icon.
6. **Sidebar**: Inherited from AppShell.
7. **Main Content**:
   - **Accepted Offers Table**:
     - Columns: `Offer ID`, `Seller`, `Buyer`, `Accepted Date`, `Price (ETH)`, `Status`.
     - Status column always displays "Completed" in solid green badge (`.status-confirmed`).
   - **Price History Chart Card**:
     - Line chart (`#priceChart`) plotting Offer IDs on X-axis vs. Price in ETH on Y-axis.
     - Area fill under curve (`rgba(16, 185, 129, 0.2)`), border `#10b981`.
   - **Accepted by Seller Chart Card**:
     - Pie chart (`#acceptedChart`) visualizing proportion of completed trades grouped by seller address/name.
     - 5-shade emerald color palette (`#10b981`, `#059669`, `#047857`, `#34d399`, `#6ee7b7`).
8. **Components**: `TransactionHistoryTable`, `PriceHistoryLineChart`, `SellerDistributionPieChart`.
9. **Cards**: `.module-card`, `.chart-card`, `.table-shell`.
10. **Tables**: Data table (`.data-table`).
11. **Buttons**: None.
12. **Forms**: None.
13. **Icons**: Clipboard check, Line trend, Pie distribution.
14. **Charts**:
    - Price History Line Chart (`#priceChart`).
    - Accepted by Seller Pie Chart (`#acceptedChart`).
15. **Data Displayed**: Historical offer IDs, seller names, buyer wallet addresses, transaction timestamps, ETH settlement amounts.
16. **Interactions**: Smart contract event listener `contract.on("OfferAccepted")` catches new transactions in real time, writes them to `localStorage`, appends row to table, and recalculates both charts automatically.
17. **Loading States**: Initial table placeholder: "Loading transaction history…".
18. **Empty States**: Container displays `.empty-state`: "No accepted offers are stored in this browser yet.". Charts show "No Data" placeholder.
19. **Error States**: If contract event filter query fails, logged to console without crashing page.
20. **Success States**: None.
21. **Responsive Behavior**: Bottom chart grid stacks from 2 columns to 1 column below 768px.

---

# 4. Dashboard Detail Specification

### 4.1 Dashboard Header & Operations Bar
- **Eyebrow**: "OPERATIONS WORKSPACE" in `0.75rem` (12px), bold 800, tracking `0.12em`, color `#047857`.
- **Title**: "Energy Dashboard" in `2.25rem` (36px), bold 800, tracking `-0.03em`, color `#17211d`.
- **Operational Status Badge**: Pill container displaying a pulsating amber or green dot (`width: 0.5rem; height: 0.5rem; border-radius: 999px;`) and text: "Data sources vary by module". Background `#ffffff`, border `1px solid #dfe7e1`, color `#637067`, padding `0.45rem 0.7rem`, text-xs font-bold.

---

### 4.2 Permanent Wallet Binding Module Card
- **Layout**: Flexbox row (`justify-between items-center gap-5`), stacking vertically on mobile.
- **Card Styling**: Background `#ffffff`, border `1px solid #dfe7e1`, border-radius `14px`, padding `1.5rem` (24px), shadow `0 10px 28px rgba(15, 46, 31, 0.08)`.
- **Copy Block**:
  - Title: "Marketplace wallet" in 16px bold `#17211d`.
  - Explanatory Hint: "Each EnergyChain account is permanently bound to its own MetaMask wallet. Switch MetaMask first, then connect." in 14px `#637067`.
  - Account Display (`#accountDisplay`): 14px text `#047857` font-semibold (e.g. `Connected: 0xaa36...38z` or `Wallet not connected`).
- **Action Button (`#connectBtn`)**:
  - Unconnected: Emerald gradient button (`.energy-gradient`), text "Connect MetaMask / Wallet", padding `0.75rem 1.5rem`, font-semibold, with shimmer `.btn-glow`.
  - Connected: White background, green border, checkmark icon, text "Connected", no shimmer.

---

### 4.3 4-Column KPI Overview Grid
Positioned directly below the wallet card in a 4-column grid (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8`).

```text
+-------------------+ +-------------------+ +-------------------+ +-------------------+
| Total Generation  | | Active Offers     | | Total Revenue     | | Battery Storage   |
| [Icon: Green Bolt]| | [Icon: Blue Doc]  | | [Icon: Amber Coin]| | [Icon: Violet Bat] |
| 12.5 kWh          | | 8                 | | 0.450 ETH         | | 75%               |
| [================]| |                   | |                   | | [==============] |
| Solar + Wind sim  | | Visible listings  | | From accept events| | Simulated cycle   |
+-------------------+ +-------------------+ +-------------------+ +-------------------+
```

#### Detailed Card 1: Total Generation
- **Dimensions**: Responsive 100% column width, height auto (~156px).
- **Padding**: `1.5rem` (24px), reduced to `1.0rem` (16px) on mobile.
- **Border Radius**: `14px` (`var(--ec-radius)`).
- **Background**: `#ffffff`.
- **Border**: `1px solid #dfe7e1`.
- **Shadow**: `0 3px 10px rgba(15, 46, 31, 0.04)`.
- **Hover**: Transforms `translateY(-2px)`, border `#c5d9cc`, shadow expands to `0 10px 28px rgba(15, 46, 31, 0.08)`.
- **Header**: Flex row with title "Total Generation" (`text-sm font-medium text-gray-600`) and Icon Container:
  - Icon Container: `2.25rem × 2.25rem` (36px × 36px), rounded `0.7rem`, background `#ecfdf5`.
  - Icon: Emerald Lightning Bolt (`w-5 h-5 text-green-600`).
- **Value**: `<span id="totalGeneration">0</span> kWh` in `text-3xl font-bold text-gray-900`.
- **Visual Meter (`.energy-meter`)**:
  - Track: Height `8px`, background `#e5e7eb`, border-radius `4px`, overflow hidden, margin-top `0.75rem`.
  - Fill (`#generationMeter`): Height `100%`, background `#10b981`, transition `width 0.5s ease`.
- **Footer Note**: "Solar estimate + wind simulation" in `0.75rem` (12px) text `#637067`.

#### Detailed Card 2: Active Offers
- **Dimensions**: Matches Card 1.
- **Header**: Title "Active Offers" (`text-sm font-medium text-gray-600`) and Icon Container:
  - Icon Container: `2.25rem × 2.25rem`, rounded `0.7rem`, background `#eff6ff`.
  - Icon: Blue Document / Clipboard (`w-5 h-5 text-blue-600`).
- **Value**: `<span id="activeOffers">0</span>` in `text-3xl font-bold text-gray-900`.
- **Visual Meter**: None.
- **Footer Note**: "Visible active marketplace listings" in `0.75rem` (12px) text `#637067`.

#### Detailed Card 3: Total Revenue
- **Dimensions**: Matches Card 1.
- **Header**: Title "Total Revenue" (`text-sm font-medium text-gray-600`) and Icon Container:
  - Icon Container: `2.25rem × 2.25rem`, rounded `0.7rem`, background `#fffbeb`.
  - Icon: Amber Currency Coin (`w-5 h-5 text-amber-600`).
- **Value**: `<span id="totalRevenue">0.000</span> ETH` in `text-3xl font-bold text-gray-900`.
- **Visual Meter**: None.
- **Footer Note**: "From locally recorded accept events" in `0.75rem` (12px) text `#637067`.

#### Detailed Card 4: Battery Storage
- **Dimensions**: Matches Card 1.
- **Header**: Title "Battery Storage" (`text-sm font-medium text-gray-600`) and Icon Container:
  - Icon Container: `2.25rem × 2.25rem`, rounded `0.7rem`, background `#f5f3ff`.
  - Icon: Violet Battery Cell (`w-5 h-5 text-purple-600`).
- **Value**: `<span id="batteryLevel">75</span>%` in `text-3xl font-bold text-gray-900`.
- **Visual Meter (`.energy-meter`)**:
  - Track: Height `8px`, background `#e5e7eb`, border-radius `4px`.
  - Fill (`#batteryMeter`): Height `100%`, gradient background `.battery-gradient` (`linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)`), width dynamically bound.
- **Footer Note**: "Simulated storage cycle" in `0.75rem` (12px) text `#637067`.

---

### 4.4 Horizontal Tab Navigation Strip
- **Container**: `flex space-x-2 mb-8 overflow-x-auto pb-2 border-b border-[#dfe7e1]`.
- **ARIA Semantics**: `role="tablist"` with `aria-label="Dashboard sections"`.
- **Individual Tab Button (`.tab-btn`)**:
  - Height: `44px`.
  - Padding: `0.75rem 1.0rem` (12px 16px).
  - Border Radius: `0.55rem 0.55rem 0 0` (Flat bottom matching border).
  - Typography: `0.875rem` (14px), font weight 600.
  - Icon: `w-5 h-5 inline mr-2`.
  - **Active State (`.active`)**:
    - Background: `#ecfdf5` (Soft emerald).
    - Text: `#065f46` (Deep emerald).
    - Border: Transparent.
    - Bottom Indicator: Inset border `box-shadow: inset 0 -2px 0 #047857`.
    - ARIA: `aria-selected="true"`.
  - **Inactive State**:
    - Background: Transparent.
    - Text: `#637067`.
    - ARIA: `aria-selected="false"`.
    - Hover: Background `#eef3ef`, Text `#17211d`.

---

# 5. Cards and Containers System

EnergyChain relies on 11 distinct card variants. Every card must conform to the exact design specifications below:

| Card Variant | Target Module / Purpose | Background | Border | Radius | Shadow | Padding |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Standard Module Card** | General dashboard panels | `#ffffff` | `1px solid #dfe7e1` | `14px` | `0 10px 28px rgba(15,46,31,0.08)` | `1.5rem` (24px) |
| **Statistic KPI Card** | Top KPI metric displays | `#ffffff` | `1px solid #dfe7e1` | `14px` | `0 3px 10px rgba(15,46,31,0.04)` | `1.5rem` (24px) |
| **Wallet Binding Banner**| Web3 account status | `#ffffff` | `1px solid #dfe7e1` | `14px` | `0 10px 28px rgba(15,46,31,0.08)` | `1.5rem` (24px) |
| **Chart Container Card** | Canvas chart wrapper | `#ffffff` | `1px solid #dfe7e1` | `14px` | `0 10px 28px rgba(15,46,31,0.08)` | `1.5rem` (24px) |
| **Prediction Result Card**| Solar heuristic output | `linear-gradient(135deg, #fffbeb, #fef3c7)`| `2px solid #f59e0b`| `12px`| None (flat elevation) | `1.5rem` (24px) |
| **Wind Telemetry Card** | Wind speed/power metrics| `linear-gradient(135deg, #eff6ff, #dbeafe)`| `2px solid #bfdbfe`| `12px`| None (flat elevation) | `1.5rem` (24px) |
| **Auth Form Card** | Login / Signup container| `#ffffff` | `1px solid #dfe7e1` | `24px` | `0 18px 42px rgba(15,46,31,0.10)` | `2.0rem` (32px) |
| **Landing Benefit Card** | Marketing feature pitch | `#ffffff` | `1px solid #dfe7e1` | `16px` | `0 4px 12px rgba(15,46,31,0.06)` | `2.5rem` (40px) |
| **Landing Stat Hero Card**| P2P energy savings pitch| `.energy-gradient` (Emerald)| None | `24px` | `0 20px 40px rgba(16,185,129,0.20)`| `3.0rem` (48px) |
| **Table Shell Container**| Responsive table wrapper| `#ffffff` | `1px solid #dfe7e1` | `12px` | None | `0` (flush table)|
| **Message Thread Container**| Direct chat conversation| `#fbfdfb` | `1px solid #dfe7e1` | `12px` | `0 1px 2px rgba(15,46,31,0.04)` | `0.75rem` (12px)|

---

# 6. Button Design System

### 6.1 Button Hierarchy & Sizes

1. **Large Action (`h-12` / 48px)**:
   - Padding: `0.75rem 2.0rem` (12px 32px).
   - Typography: `1.125rem` (18px), font-weight 700.
   - Border Radius: `0.75rem` (12px).
   - Usage: Hero CTA, Auth Form submit buttons.
2. **Medium Action (`h-11` / 44px)**:
   - Padding: `0.625rem 1.5rem` (10px 24px).
   - Typography: `0.875rem` (14px), font-weight 600.
   - Border Radius: `0.55rem` (8.8px).
   - Usage: Connect Wallet, Predict AC Power, Create Pre-booking, Create Offer.
3. **Small / Table Action (`h-8` / 32px)**:
   - Padding: `0.42rem 0.75rem` (6.7px 12px).
   - Typography: `0.75rem` (12px), font-weight 700.
   - Border Radius: `0.45rem` (7.2px).
   - Usage: Table actions (Confirm, Cancel, Accept, Messages), Filter reset.

---

### 6.2 Button Variant Specifications

```text
+-----------------------+  +-----------------------+  +-----------------------+
|  Primary Action (CTA) |  |  Solar Action (Amber) |  |  Secondary / Outlined |
|  [==================] |  |  [==================] |  |  [------------------] |
|  bg: .energy-gradient |  |  bg: .solar-gradient  |  |  bg: #ffffff          |
|  color: #ffffff       |  |  color: #ffffff       |  |  border: 1px #cfd9d2  |
|  glow: emerald 30px   |  |  glow: amber 30px     |  |  color: #17211d       |
+-----------------------+  +-----------------------+  +-----------------------+

+-----------------------+  +-----------------------+  +-----------------------+
|  Accept Table Action  |  |  Cancel Table Action  |  |  Message Table Action |
|  bg: #047857          |  |  bg: #fef2f2          |  |  bg: #ffffff          |
|  color: #ffffff       |  |  border: 1px #fecaca  |  |  border: 1px #a7f3d0  |
|  text: "Accept"       |  |  color: #b91c1c       |  |  color: #047857       |
+-----------------------+  +-----------------------+  +-----------------------+
```

| Variant | Normal State | Hover State | Active State | Disabled State | Applied Locations |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Primary Brand CTA** | Background: `.energy-gradient`, Color: `#ffffff`, Shadow: None | Shimmer travel, `-translate-y-0.5`, Glow `rgba(16,185,129,.6)` | `translate-y-0`, tight shadow | `opacity-60`, no glow, no pointer events | Connect Wallet, Create Booking, Auth submits |
| **Solar Action** | Background: `.solar-gradient`, Color: `#ffffff` | Shimmer travel, `-translate-y-0.5`, Amber glow `rgba(245,158,11,.6)`| `translate-y-0` | `opacity-60`, no glow | "Predict AC Power" |
| **Secondary Outlined**| Background: `#ffffff`, Border: `1px solid #cfd9d2`, Color: `#17211d` | Background: `#f8faf8`, Border: `#047857` | Background: `#edf1ee` | `opacity-50`, border `#e5e7eb` | "Reset", "Fill Sample Data" |
| **Table Accept** | Background: `#047857`, Color: `#ffffff`, Radius: `0.45rem` | Background: `#065f46`, `-translate-y-0.5` | `translate-y-0` | `opacity-50` | Active marketplace listings |
| **Table Cancel** | Background: `#fef2f2`, Border: `1px solid #fecaca`, Color: `#b91c1c` | Background: `#fee2e2`, Border: `#f87171` | Background: `#fca5a5` | `opacity-50` | Owned offers, pending bookings |
| **Table Message** | Background: `#ffffff`, Border: `1px solid #a7f3d0`, Color: `#047857` | Background: `#ecfdf5`, Border: `#047857` | Background: `#d1fae5` | `opacity-50` | Booking conversation launcher |
| **Ghost / Text** | Background: Transparent, Color: `#047857`, Font-bold | Background: `#ecfdf5`, Underline | Background: `#d1fae5` | Color: `#9ca3af` | "Refresh Bookings", "Explore Use Cases" |

---

# 7. Iconography System

EnergyChain standardizes on **Heroicons (Micro, Mini, and Outline 24)** in SVG format. All icons must be rendered as semantic vector graphics with `aria-hidden="true"` or paired with explicit accessible labels.

- **Icon Dimensions**:
  - Micro / Inline text: `16px × 16px` (`w-4 h-4`)
  - Standard Action / Inputs: `20px × 20px` (`w-5 h-5`)
  - Feature / Metric Cards: `24px × 24px` (`w-6 h-6`)
  - Brand Display / Large: `32px × 32px` (`w-8 h-8`)
- **Stroke Width**: `1.75px` for outline icons; solid icons use crisp standard fill geometry.
- **Metric Icon Containers**:
  - Size: `36px × 36px` (`w-9 h-9`).
  - Radius: `0.7rem` (11.2px).
  - Alignment: Flexbox centered (`grid place-items-center`).

#### Semantic Icon Mapping

| Domain / Concept | Icon Name | Color Class | Container Background |
| :--- | :--- | :--- | :--- |
| **Brand Mark** | `BoltIcon` (Solid) | `text-green-600` | None (Inline) |
| **Total Generation** | `BoltIcon` (Solid) | `text-green-600` | `#ecfdf5` (Emerald soft) |
| **Active Marketplace** | `ShoppingBagIcon` (Solid)| `text-blue-600` | `#eff6ff` (Azure soft) |
| **Total Revenue** | `CurrencyDollarIcon` | `text-amber-600` | `#fffbeb` (Amber soft) |
| **Battery Storage** | `Battery100Icon` | `text-purple-600`| `#f5f3ff` (Violet soft) |
| **Solar Generation** | `SunIcon` (Solid) | `text-amber-500` | `#fffbeb` (Amber soft) |
| **Wind Energy** | `SparklesIcon` / Turbine | `text-blue-600` | `#eff6ff` (Azure soft) |
| **Energy Consumption** | `BuildingOfficeIcon` | `text-emerald-700`| `#ecfdf5` (Emerald soft) |
| **Pre-booking** | `CalendarDaysIcon` | `text-green-600` | `#ecfdf5` (Emerald soft) |
| **Conversations** | `ChatBubbleLeftRightIcon` | `text-green-600` | `#ecfdf5` (Emerald soft) |
| **Transaction History** | `ClockIcon` | `text-green-600` | `#ecfdf5` (Emerald soft) |
| **Web3 Wallet** | `WalletIcon` | `text-green-600` | `#ecfdf5` (Emerald soft) |
| **Confirmed Status** | `CheckCircleIcon` | `text-emerald-600`| `#ecfdf5` |
| **Cancelled Status** | `XCircleIcon` | `text-red-600` | `#fef2f2` |
| **Pending Status** | `ClockIcon` | `text-amber-600` | `#fffbeb` |

---

# 8. Data Table Design System

The Next.js rebuild migrates all record listings into fully accessible, enterprise-grade data tables housed inside a designated `.table-shell`.

### 8.1 Table Container & Structure
- **Table Shell Container (`.table-shell`)**:
  - Overflow: `overflow-x: auto`.
  - Border: `1px solid var(--ec-border)`.
  - Border Radius: `0.75rem` (12px).
  - Background: `#ffffff`.
  - Margin: `margin-top: 1.0rem`.
- **Data Table (`.data-table`)**:
  - Width: `100%`.
  - Min-Width: `660px` (guarantees column breathing room on mobile scrolling).
  - Border Collapse: `collapse`.
  - Font Size: `0.875rem` (14px).
- **Header Row (`<th>`)**:
  - Background: `#f3f6f4` (Subtle sage-gray).
  - Color: `#526159` (Deep slate-green).
  - Font Size: `0.70rem` (11.2px).
  - Font Weight: `800`.
  - Letter Spacing: `0.06em`.
  - Text Transform: `uppercase`.
  - Text Align: `left` (except numeric columns which are `right`).
  - Padding: `0.85rem 1.0rem` (13.6px 16px).
  - Border Bottom: `1px solid #dfe7e1`.
  - White Space: `nowrap`.
- **Data Rows (`<td>`)**:
  - Padding: `0.85rem 1.0rem` (13.6px 16px).
  - Border Bottom: `1px solid #edf1ee`.
  - Vertical Align: `middle`.
  - Transition: `background 0.15s ease`.
  - Hover State: `background: #f8fbf8`.
  - Last Row: `border-bottom: 0`.
- **Specialized Column Classes**:
  - `.numeric`: `text-align: right; font-variant-numeric: tabular-nums; font-weight: 600;`.
  - `.actions`: `text-align: right; white-space: nowrap;`.
  - `.table-id`: `color: #047857; font-family: ui-monospace, monospace; font-size: 0.78rem; font-weight: 700;`.

---

### 8.2 Data Table Specifications for All Modules

#### Table 1: Active Marketplace Offers
- **Headers**: `Offer ID` | `Seller` | `Created` | `Price (ETH)` | `Action`
- **Alignments**: Left | Left | Left | Right | Right
- **Sample Row**:
  - `Offer ID`: `<span class="table-id">#12</span>`
  - `Seller`: `John Doe (0xaa36...38z)`
  - `Created`: `11/19/2026, 2:30:00 PM`
  - `Price`: `0.050 ETH`
  - `Action`: `<button class="table-action table-action--accept">Accept</button>`

#### Table 2: Historical Legacy Offers
- **Headers**: `Offer ID` | `Seller Wallet` | `Created` | `Price` | `Status` | `Action`
- **Alignments**: Left | Left | Left | Right | Center | Right
- **Sample Row**:
  - `Offer ID`: `<span class="table-id">Legacy #4</span>`
  - `Seller`: `0x42f7...91e3`
  - `Created`: `10/05/2026, 11:15:22 AM`
  - `Price`: `0.025 ETH`
  - `Status`: `<span class="status-badge status-pending">Active at audit</span>`
  - `Action`: `<span class="text-xs text-gray-400">Historical only</span>`

#### Table 3: User Pre-Bookings
- **Headers**: `Booking ID` | `Participant` | `Delivery Schedule` | `Quantity` | `Total Price` | `Status` | `Actions`
- **Alignments**: Left | Left | Left | Right | Right | Center | Right
- **Sample Row**:
  - `Booking ID`: `<span class="table-id">#108</span>`
  - `Participant`: `Solar Farm Alpha` `<span class="block text-xs text-gray-500">Provider</span>`
  - `Delivery Schedule`: `11/25/2026, 9:00 AM`
  - `Quantity`: `50.00 kWh`
  - `Total Price`: `2.500000 ETH`
  - `Status`: `<span class="status-badge status-confirmed">Confirmed</span>`
  - `Actions`: `[Messages]` `[Cancel]`

#### Table 4: Transaction History (Accepted Offers)
- **Headers**: `Offer ID` | `Seller` | `Buyer` | `Accepted Date` | `Settled Price` | `Status`
- **Alignments**: Left | Left | Left | Left | Right | Center
- **Sample Row**:
  - `Offer ID`: `<span class="table-id">#9</span>`
  - `Seller`: `Jane Provider`
  - `Buyer`: `0x3b11...99ef`
  - `Accepted Date`: `11/18/2026, 6:45:10 PM`
  - `Settled Price`: `0.080 ETH`
  - `Status`: `<span class="status-badge status-confirmed">Completed</span>`

---

# 9. Forms and Inputs System

### 9.1 Base Input Styles & Tokens
All standard inputs (Text, Email, Password, Number, Datetime, Select) share a consistent ergonomic visual language:

- **Height**:
  - Standard Forms: `44px` (`min-height: 2.75rem`).
  - Auth Forms: `48px` (`min-height: 3.0rem`).
  - Table Search / Filters: `36px` (`min-height: 2.25rem`).
- **Padding**: `0.75rem 1.0rem` (12px 16px).
- **Background**: `#ffffff`.
- **Border**: `1px solid #cfd9d2` (Subtle sage-slate).
- **Border Radius**: `0.55rem` (8.8px) for dashboard inputs; `0.75rem` (12px) for auth inputs.
- **Typography**: `0.875rem` (14px), font-weight 500, color `#17211d`.
- **Placeholder**: Color `#9ca3af` (Gray 400).
- **Focus State**: `border-color: #047857 !important; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12); outline: none;`.
- **Invalid / Error State**: `border-color: #ef4444 !important; box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);`.
- **Disabled State**: `background: #f3f6f4; color: #9ca3af; cursor: not-allowed;`.

---

### 9.2 Complete Form Inventory & Field Rules

#### Form 1: Account Login Form (`#loginForm`)
- `email`: Type `email`, required, placeholder `you@domain.com`, autocomplete `email`.
- `password`: Type `password`, required, placeholder `Your password`, autocomplete `current-password`.
- `remember`: Type `checkbox`, label "Remember Me".
- Validation: Non-empty check on both fields; inline red error banner if authentication fails.

#### Form 2: Account Registration Form (`#signupForm`)
- `name`: Type `text`, required, placeholder `Your full name`, autocomplete `name`.
- `email`: Type `email`, required, placeholder `you@domain.com`, autocomplete `email`.
- `password`: Type `password`, required, minlength 6, placeholder `Strong password`, autocomplete `new-password`.
- Helper Text: "Use at least 6 characters." (`text-xs text-gray-500 mt-1`).
- Validation: Rejects passwords shorter than 6 characters; detects existing registered email collisions.

#### Form 3: Solar Prediction Heuristic Form
- `solarDateTime`: Type `datetime-local`, required, icon: calendar.
- `solarIrradiation`: Type `number`, step `0.01`, placeholder `800.5`, helper range `0-1200 W/m²`.
- `solarAmbient`: Type `number`, step `0.1`, placeholder `25.5`, helper range `-10 to 50°C`.
- `solarModule`: Type `number`, step `0.1`, placeholder `45.2`, helper range `0 to 85°C`.
- Validation: Numbers must be finite; irradiation warned if outside 0–1500 W/m².

#### Form 4: Energy Consumption ML Form (`#consumptionForm`)
- `consumptionTimestamp`: Type `datetime-local`, required.
- `consumptionTemperature`: Type `number`, step `0.01`, placeholder `28.5`.
- `consumptionHumidity`: Type `number`, min `0`, max `100`, step `0.01`, placeholder `65`.
- `consumptionSquareFootage`: Type `number`, min `0.01`, step `0.01`, placeholder `1500`.
- `consumptionOccupancy`: Type `number`, min `0`, step `1`, placeholder `5`.
- `consumptionRenewableEnergy`: Type `number`, min `0`, step `0.01`, placeholder `12.5`.
- `consumptionHvacUsage`: Select dropdown (`On`, `Off`), required.
- `consumptionLightingUsage`: Select dropdown (`On`, `Off`), required.
- `consumptionDayOfWeek`: Select dropdown (`Monday` through `Sunday`), required.
- `consumptionHoliday`: Select dropdown (`No`, `Yes`), required.
- Validation: Form checks every input; displays error if occupancy < 0, humidity not 0-100, or square footage <= 0.

#### Form 5: Create Offer Form
- `userName`: Type `text`, required, placeholder `John Doe`, length >= 2 chars.
- `priceEth`: Type `number`, step `0.001`, min `0.01`, placeholder `0.05`.
- Validation: Real-time event listeners on input; disables submit button if price < 0.01 ETH or name is blank.

#### Form 6: Reserve Pre-Booking Form (`#bookingForm`)
- `bookingProviderEmail`: Type `email`, required, placeholder `provider@example.com`.
- `bookingScheduledFor`: Type `datetime-local`, required, must be in future.
- `bookingEnergyUnits`: Type `number`, min `0.01`, step `0.01`, placeholder `25`.
- `bookingPricePerUnit`: Type `number`, min `0`, step `0.000001`, placeholder `0.05`.
- Live Calculated Output: `#bookingTotal` computes `units * unitPrice` to 6 decimal places.
- Validation: Rejects self-booking (customer cannot book own email); rejects past timestamps.

#### Form 7: Booking Message Input Form (`#bookingMessageForm`)
- `bookingMessageInput`: Type `text`, maxlength `2000`, placeholder `Write a message…`.
- Submit button: "Send" (`#sendBookingMessageBtn`).
- Validation: Trims whitespace; requires length between 1 and 2000 characters; disabled until booking is selected.

---

# 10. Graphs and Visualizations System

All charts are implemented using **Chart.js 4.4+** with default typography set to Inter, clean gridlines, rounded line joins, and custom tooltips.

### 10.1 Global Chart Defaults
```javascript
Chart.defaults.font.family = "Inter, ui-sans-serif, system-ui, -apple-system, sans-serif";
Chart.defaults.font.size = 12;
Chart.defaults.color = "#526159";
Chart.defaults.borderColor = "#e5ece7";
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.boxWidth = 8;
Chart.defaults.plugins.tooltip.backgroundColor = "#17211d";
Chart.defaults.plugins.tooltip.titleFont = { size: 13, weight: "bold" };
Chart.defaults.plugins.tooltip.padding = 10;
Chart.defaults.plugins.tooltip.cornerRadius = 8;
```

---

### 10.2 Detailed Specifications for All Charts

#### Chart 1: Energy Production Trend (Line Chart)
- **Container**: `.module-card.chart-card`, canvas ID `#productionChart`, max-height `280px`.
- **Type**: `line`
- **Data Source**: Static weekly arrays (`[12, 15, 13, 17, 14, 16, 18]` for Solar; `[8, 9, 10, 8, 9, 11, 10]` for Wind).
- **Labels (X-Axis)**: `['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']`.
- **Series 1 (Solar Generation)**:
  - Label: `Solar (kWh)`
  - Border Color: `#f59e0b` (Solar Amber)
  - Background Color: `rgba(245, 158, 11, 0.1)`
  - Line Tension: `0.4` (Smooth cubic spline)
  - Border Width: `2px`
  - Fill: `true` (Area fill to origin)
  - Point Radius: `3px`, Point Hover Radius: `5px`
- **Series 2 (Wind Generation)**:
  - Label: `Wind (kWh)`
  - Border Color: `#3b82f6` (Wind Azure)
  - Background Color: `rgba(59, 130, 246, 0.1)`
  - Line Tension: `0.4`
  - Border Width: `2px`
  - Fill: `true`
  - Point Radius: `3px`, Point Hover Radius: `5px`
- **Axes**:
  - Y-Axis: `beginAtZero: true`, Title text `Energy (kWh)`, grid color `#e5ece7`.
  - X-Axis: grid color `transparent`.
- **Legend**: Position `top`, align `center`.

#### Chart 2: Energy Mix Distribution (Doughnut Chart)
- **Container**: `.module-card.chart-card`, canvas ID `#mixChart`, max-height `280px`.
- **Type**: `doughnut`
- **Data Source**: Static breakdown `[55, 35, 10]`.
- **Labels**: `['Solar', 'Wind', 'Battery']`.
- **Colors**:
  - Segment 0 (Solar): `#f59e0b` (Amber 500)
  - Segment 1 (Wind): `#3b82f6` (Blue 500)
  - Segment 2 (Battery): `#8b5cf6` (Violet 500)
- **Borders**: Border Width `2px`, Border Color `#ffffff`.
- **Cutout**: `65%` (Clean modern donut ring).
- **Legend**: Position `right`, labels font size `12px`, padding `16px`.

#### Chart 3: Energy Consumption ML Prediction (Bar Chart)
- **Container**: `.module-card.chart-card`, canvas ID `#consumptionPredictionChart`, max-height `260px`.
- **Type**: `bar`
- **Data Source**: Single dynamic value returned from `POST /api/energy-consumption/predict`.
- **Labels (X-Axis)**: `[new Date(timestamp).toLocaleString()]`.
- **Dataset**:
  - Label: `Predicted consumption (unit)`
  - Background Color: `rgba(4, 120, 87, 0.78)`
  - Border Color: `#047857`
  - Border Width: `1px`
  - Border Radius: `6px`
  - Max Bar Thickness: `64px`
- **Axes**:
  - Y-Axis: `beginAtZero: true`, Title text matching returned unit string.
  - X-Axis: grid color `transparent`.
- **Legend**: `display: false`.

#### Chart 4: Price History Trend (Line Chart)
- **Container**: `.module-card.chart-card`, canvas ID `#priceChart`, max-height `260px`.
- **Type**: `line`
- **Data Source**: Dynamic array of active offer prices in ETH extracted during contract query.
- **Labels (X-Axis)**: `Offer #ID` (e.g. `['Offer #0', 'Offer #1', 'Offer #2']`).
- **Dataset**:
  - Label: `Offer Prices (ETH)`
  - Border Color: `#10b981` (Energy Green)
  - Background Color: `rgba(16, 185, 129, 0.2)`
  - Line Tension: `0.4`
  - Border Width: `2px`
  - Fill: `true`
- **Axes**:
  - Y-Axis: `beginAtZero: true`, Title text `Price (ETH)`.
  - X-Axis: Title text `Offer ID`.
- **Legend**: `display: false`.

#### Chart 5: Accepted Offers by Seller (Pie Chart)
- **Container**: `.module-card.chart-card`, canvas ID `#acceptedChart`, max-height `260px`.
- **Type**: `pie`
- **Data Source**: Aggregated counts of accepted offers grouped by seller name/address.
- **Palette**: `['#10b981', '#059669', '#047857', '#34d399', '#6ee7b7']` (Monochromatic emerald spectrum).
- **Borders**: Border Width `2px`, Border Color `#ffffff`.
- **Legend**: Position `top`.
- **Empty State**: Renders single gray segment labeled `No Data` if transaction history is empty.

---

# 11. Marketplace UI & Smart Contract Flow

The Marketplace integrates directly with the deployed Sepolia smart contract `EnergyOffer.sol`.

### 11.1 Smart Contract ABI & Interface
The Next.js rebuild utilizes the verified 6-method ABI:
```json
[
  "function createOffer(bytes32 userHash, uint256 price)",
  "function getOfferCount() view returns (uint256)",
  "function getOffer(uint256 id) view returns (bytes32, uint256, uint256, bool)",
  "function getOwnerAddress(uint256 id) view returns (address)",
  "function cancelOffer(uint256 id)",
  "function acceptOffer(uint256 id) payable",
  "function getActiveUserOfferIds(bytes32 userHash) view returns (uint256[])",
  "event OfferCreated(uint256 indexed offerId, bytes32 indexed userHash, uint256 price, uint256 timestamp)",
  "event OfferAccepted(uint256 indexed offerId, address buyer, bytes32 sellerHash, uint256 price, uint256 timestamp)",
  "event OfferCancelled(uint256 indexed offerId, bytes32 indexed userHash)"
]
```

---

### 11.2 Marketplace Operations Lifecycle

```text
User Action            Preflight Verification                 Contract Interaction               UI State Update
--------------------------------------------------------------------------------------------------------------------
[Create Offer]  --->   Check Form (Price >= 0.01 ETH)   --->  activeContract.createOffer()  --->  Wait for Tx receipt
                       Verify Bound Wallet Signer             (hashName(user), priceWei)          Toast Etherscan link
                                                                                                  Reload offer list

[Accept Offer]  --->   Check Not Seller (caller!=owner) --->  activeContract.acceptOffer()  --->  Wait for Tx receipt
                       Check staticCall simulation            { value: offerPriceWei }            Toast Etherscan link
                       Check Balance >= Price + Gas                                               Append to History tab

[Cancel Offer]  --->   Check Caller == ownerOfOffer(id) --->  activeContract.cancelOffer(id) ---> Wait for Tx receipt
                       Confirm Dialog Box                                                         Reload offer list
```

1. **Offer Creation**:
   - User inputs public name and ETH price (minimum 0.01 ETH).
   - Identity hash computed via `ethers.keccak256(ethers.toUtf8Bytes(name.trim().toLowerCase()))`.
   - Dispatches transaction `createOffer(bytes32, uint256)`.
   - Displays spinner on submit button; shows toast with Etherscan transaction link on block confirmation.
2. **Offer Acceptance & Purchase**:
   - User clicks "Accept" on an active listing.
   - **Preflight Check 1**: Confirms user's connected wallet address is not equal to `sellerAddress`. If identical, displays error: `"You cannot accept an offer created by this same wallet."`.
   - **Preflight Check 2**: Runs `activeContract.acceptOffer.staticCall(id, { value })` without committing gas. If contract reverts, catches error and warns user before opening MetaMask.
   - **Preflight Check 3**: Checks Sepolia ETH balance against `value + estimatedGasFee`. If insufficient, prompts error: `"Your wallet needs enough Sepolia ETH for the offer price plus network gas."`.
   - Prompts native browser confirmation dialog: `"Accept from [Seller] for [Price] ETH using [Wallet]?"`.
   - Submits payable transaction `acceptOffer(id, { value })`.
   - On confirmation, refreshes active offers and appends record to Transaction History.
3. **Offer Cancellation**:
   - User clicks "Cancel" on an offer owned by their connected wallet.
   - Prompts confirmation: `"Cancel offer #[id]?"`.
   - Calls `cancelOffer(id)`.
   - On block receipt, removes offer from active table and displays toast.

---

# 12. MetaMask & Web3 Wallet UI Specification

### 12.1 Permanent Wallet Binding Architecture
EnergyChain enforces an **immutable one-to-one binding** between a registered website user account and an Ethereum MetaMask wallet address.

> [!IMPORTANT]
> **Permanent Wallet Rule**:
> - The first wallet connected by an authenticated user is immutably stored in PostgreSQL via `POST /auth/wallet`.
> - Once bound, that website user can NEVER connect a different wallet address.
> - That specific wallet address can NEVER be bound to any other website user.
> - Logging out clears only the browser session; it never removes or resets the database binding.

#### Visual Communication of Permanent Wallet Binding
To prevent user confusion or accidental binding of unwanted wallets, the frontend communicates binding status through three distinct visual states:

1. **Unbound State (First Time User)**:
   - Wallet card header: "Permanent marketplace wallet".
   - Warning callout: "⚠️ Notice: The first MetaMask wallet you connect will be permanently bound to your account. This action cannot be undone."
   - Connect Button: "Connect MetaMask".
2. **Bound & Matched State (Normal Operations)**:
   - Wallet card shows green shield icon with label "Permanent wallet verified".
   - Displays bound wallet address formatted: `0xaa36...38z` with a copy button.
   - Header shows green indicator pill: `● 0xaa36...38z`.
   - Marketplace actions are fully enabled.
3. **Wallet Mismatch State (Wrong Account Active in MetaMask)**:
   - If MetaMask switches to account B while user is bound to account A:
   - Entire marketplace action area is disabled.
   - Prominent red alert banner is displayed:
     > `"⚠️ Wallet Mismatch: This account is permanently bound to 0xaa36...38z. You are currently connected with 0x9f12...44b. Please switch MetaMask back to your bound account to continue."`
   - Connect button transforms to: "Switch to Bound Wallet".

---

### 12.2 Network Indicator & Sepolia Verification
- **Required Chain ID**: `11155111` (Hex `0xaa36a7`).
- **Network Name**: Sepolia Testnet.
- **RPC Endpoint**: `https://ethereum-sepolia-rpc.publicnode.com`.
- **Block Explorer**: `https://sepolia.etherscan.io`.
- **Network Switch Flow**:
  - If MetaMask chain does not equal `0xaa36a7`, frontend automatically requests chain switch via `wallet_switchEthereumChain`.
  - If chain is missing in MetaMask (error code `4902`), frontend requests `wallet_addEthereumChain` with official Sepolia configuration.
  - If user rejects the network switch, UI displays a warning banner: "Sepolia Testnet is required for marketplace transactions.".

---

# 13. Booking Workflow UI Specification

### 13.1 Pre-Booking Lifecycle & Statuses

```text
[Customer Submits] ---> Status: PENDING (Amber)
                            |
           +----------------+----------------+
           |                                 |
[Provider Confirms]              [Customer or Provider Cancels]
           |                                 |
           v                                 v
Status: CONFIRMED (Green)        Status: CANCELLED (Red)
```

1. **Pending State (`status-pending`)**:
   - Background: `#fffbeb`, Text: `#a16207`, Border dot: Amber.
   - Provider sees two action buttons: `[Confirm]` (solid emerald) and `[Cancel]` (soft red).
   - Customer sees one action button: `[Cancel]` (soft red).
2. **Confirmed State (`status-confirmed`)**:
   - Background: `#ecfdf5`, Text: `#047857`, Border dot: Emerald.
   - Both parties see status "Confirmed". No further status transitions allowed.
   - Both parties retain access to the "Messages" conversational thread.
3. **Cancelled State (`status-cancelled`)**:
   - Background: `#fef2f2`, Text: `#b91c1c`, Border dot: Red.
   - Both parties see status "Cancelled". Chat thread remains read-only for audit history.

---

# 14. Messaging & Chat UI Specification

### 14.1 Messaging Architecture & Layout
The messaging interface provides a dedicated, real-time communication channel scoped strictly to individual pre-bookings.

- **Container Dimensions**:
  - Container: `.module-card` with height auto.
  - Chat Message Thread (`#bookingMessages`): Max height `320px` (`max-h-80`), overflow `overflow-y-auto`, padding `0.75rem` (12px), background `#fbfdfb`, border `1px solid #dfe7e1`, border-radius `0.75rem` (12px).
- **Header**:
  - Title: "Booking Conversation" in 20px bold `#17211d`.
  - Subtitle (`#messageBookingTitle`): Dynamic text: "Booking #108 with Solar Farm Alpha" in 14px `#637067`.

---

### 14.2 Message Bubble Design & Alignment

```text
+------------------------------------------------------------------------------------+
|  [Counterpart Message - Left Aligned]                                              |
|  +-------------------------------------------------------------+                  |
|  | Solar Farm Alpha (Provider)                                  |                  |
|  | We have confirmed your 50 kWh reservation for tomorrow 9 AM. |                  |
|  | 11/19/2026, 3:15 PM                                         |                  |
|  +-------------------------------------------------------------+                  |
|                                                                                    |
|                                                  [User Message - Right Aligned]    |
|                                  +-----------------------------------------------+ |
|                                  | John Doe (You)                                | |
|                                  | Perfect, thank you! Grid connection is ready. | |
|                                  | 11/19/2026, 3:18 PM                           | |
|                                  +-----------------------------------------------+ |
+------------------------------------------------------------------------------------+
| [ Write a message...                                      ] [ Send Button ]        |
+------------------------------------------------------------------------------------+
```

#### Bubble 1: Current User's Message (Right Aligned or Highlighted)
- **Background**: `#ecfdf5` (Soft emerald green tint).
- **Border**: `1px solid #a7f3d0`.
- **Border Radius**: `12px 12px 2px 12px` (Slight asymmetry indicating user speech).
- **Sender Label**: Name in `0.8125rem` (13px), bold `#065f46`.
- **Message Body**: Text in `0.875rem` (14px), color `#17211d`, line-height `1.4`, `whitespace-pre-wrap`.
- **Timestamp**: `0.75rem` (12px) text `#637067` right-aligned.

#### Bubble 2: Counterpart's Message (Left Aligned)
- **Background**: `#ffffff` (Pure white).
- **Border**: `1px solid #dfe7e1`.
- **Border Radius**: `12px 12px 12px 2px`.
- **Sender Label**: Counterpart name in `0.8125rem` (13px), bold `#374151`.
- **Message Body**: Text in `0.875rem` (14px), color `#17211d`.
- **Timestamp**: `0.75rem` (12px) text `#637067`.

#### Input & Send Bar
- **Input Field**: Height `44px`, padding `0.75rem 1.0rem`, border `1px solid #cfd9d2`, border-radius `0.55rem`, placeholder "Write a message…".
- **Send Button**: Height `44px`, padding `0.75rem 1.5rem`, solid green gradient `.energy-gradient`, text `#ffffff`, border-radius `0.55rem`, font-weight 600.
- **Disabled State**: Input and button disabled with opacity 0.5 when no booking is actively selected.

---

# 15. Solar, Wind, and Energy Consumption Telemetry UI

### 15.1 Truthful Data Categorization
The Next.js rebuild strictly distinguishes between data types to eliminate misleading claims:

| Module | UI Category Label | Visual Indicator | Real Technical Source |
| :--- | :--- | :--- | :--- |
| **Solar Power** | `Local estimate` | Amber Badge (`#fffbeb` / `#856404`) | Client Heuristic formula (Cosine solar declination) |
| **Wind Energy** | `Simulated data` | Amber Badge (`#fffbeb` / `#856404`) | Client Random walk simulation (`setInterval 5s`) |
| **Energy Consumption**| `Prediction, not measured usage`| Slate Badge (`#f8faf8` / `#637067`) | Backend ML model via `predict_energy_consumption.py` |
| **Active Marketplace** | `Verified On-Chain`| Green Badge (`#ecfdf5` / `#047857`) | Sepolia Smart Contract RPC (`EnergyOffer.sol`) |
| **Pre-Bookings** | `Database Authorized` | Green Badge (`#ecfdf5` / `#047857`) | PostgreSQL database with JWT auth |

---

# 16. Modals, Dialogs, Toasts, and Alerts

### 16.1 Modal Architecture & Sizing
Modals are rendered using React Portals attached directly to `document.body` with focus trap and escape key listeners:

- **Overlay**: `position: fixed; inset: 0; background: rgba(23, 33, 29, 0.45); backdrop-filter: blur(4px); z-index: 50;`.
- **Container**: Centered via `grid place-items-center p-4`.
- **Modal Card**:
  - Max-Width: Small (`400px`), Standard (`520px`), Large (`720px`).
  - Background: `#ffffff`.
  - Border Radius: `1.0rem` (16px).
  - Border: `1px solid #dfe7e1`.
  - Shadow: `0 25px 50px -12px rgba(15, 46, 31, 0.25)`.
  - Padding: `1.5rem` (24px).
  - Animation: Scale in from 95% to 100% with opacity transition in `0.2s cubic-bezier(0.16, 1, 0.3, 1)`.

---

### 16.2 Modal Inventory

1. **Accept Offer Confirmation Modal**:
   - Icon: Emerald Shopping Bag.
   - Title: "Confirm Energy Purchase".
   - Content: Summarizes Offer ID, Seller address, Energy unit cost, Sepolia network gas estimate, and total payable ETH.
   - Buttons: Secondary "Cancel" and Primary "Confirm in MetaMask".
2. **Cancel Offer Confirmation Modal**:
   - Icon: Red Warning Triangle.
   - Title: "Cancel Marketplace Offer".
   - Content: "Are you sure you want to delist Offer #[ID]? This will submit an on-chain transaction to revoke the listing."
   - Buttons: Secondary "Keep Active" and Danger "Confirm Cancellation".
3. **Permanent Wallet Binding Warning Modal**:
   - Icon: Amber Shield Exclamation.
   - Title: "Permanent Wallet Assignment".
   - Content: Explains the immutable 1:1 binding between the website user and the active MetaMask account. Requires explicit checkbox acknowledgment: "I understand this wallet cannot be unbound later."
   - Buttons: Secondary "Abort" and Primary "Bind Wallet Permanently".

---

### 16.3 Toast Notification System
The global notification toast provides non-blocking async feedback:

- **Position**: `position: fixed; bottom: 20px; right: 20px; z-index: 1000;`.
- **Dimensions**: Min-width `280px`, max-width `420px`, padding `0.75rem 1.25rem` (12px 20px).
- **Border Radius**: `0.55rem` (8.8px).
- **Typography**: `0.875rem` (14px), font-weight 600, color `#ffffff`.
- **Box Shadow**: `0 10px 25px rgba(0, 0, 0, 0.15)`.
- **Auto-Dismiss Duration**: `3000ms` (3 seconds).
- **Variants**:
  - **Success (`.toast-success`)**: Background `#10b981` (Emerald).
  - **Error (`.toast-error`)**: Background `#ef4444` (Crimson Red).
  - **Warning (`.toast-warning`)**: Background `#f59e0b` (Amber).

---

# 17. Badges, Tags, and Status Indicators

```text
+-----------------------+  +-----------------------+  +-----------------------+
|  Active / Confirmed   |  |  Pending Status       |  |  Cancelled / Failed   |
|  [● Confirmed       ] |  |  [● Pending         ] |  |  [● Cancelled       ] |
|  bg: #ecfdf5          |  |  bg: #fffbeb          |  |  bg: #fef2f2          |
|  text: #047857        |  |  text: #a16207        |  |  text: #b91c1c        |
|  dot: #10b981         |  |  dot: #f59e0b         |  |  dot: #ef4444         |
+-----------------------+  +-----------------------+  +-----------------------+
```

| Badge Identifier | Background | Text Color | Dot / Border Color | Height | Padding | Example Display |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Confirmed / Active** | `#ecfdf5` | `#047857` | `#10b981` (Solid Dot)| `24px` | `0.3rem 0.6rem` | `● Confirmed` |
| **Pending / In Review**| `#fffbeb` | `#a16207` | `#f59e0b` (Solid Dot)| `24px` | `0.3rem 0.6rem` | `● Pending` |
| **Cancelled / Inactive**| `#fef2f2`| `#b91c1c` | `#ef4444` (Solid Dot)| `24px` | `0.3rem 0.6rem` | `● Cancelled` |
| **Connected Wallet** | `#ecfdf5` | `#065f46` | `#a7f3d0` (Outline) | `26px` | `0.45rem 0.7rem`| `● 0xaa36...38z` |
| **Disconnected Wallet**| `#fffbeb` | `#92400e` | `#fde68a` (Outline) | `26px` | `0.45rem 0.7rem`| `● No Wallet` |
| **Telemetry Simulation**| `#fffbeb`| `#856404` | `#fde68a` (Outline) | `22px` | `0.35rem 0.6rem`| `Simulated data` |
| **Dataset Prediction** | `#f8faf8` | `#637067` | `#dfe7e1` (Outline) | `22px` | `0.35rem 0.6rem`| `Prediction, not measured`|
| **Table ID Tag** | `#f3f6f4` | `#047857` | None (Monospace) | `20px` | `0.2rem 0.4rem` | `#0012` |

---

# 18. Animations and Micro-Interactions

EnergyChain incorporates deliberate, performance-optimized micro-interactions with hardware acceleration and respect for reduced motion preferences (`prefers-reduced-motion`).

1. **Button Shimmer Effect (`.btn-glow`)**:
   - Implementation: `::before` pseudo-element with `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`.
   - Normal position: `left: -100%`.
   - Hover position: `left: 100%`, transition duration `0.5s ease`.
   - Elevation: `transform: translateY(-2px); box-shadow: 0 0 30px rgba(16, 185, 129, 0.6);`.
2. **Card Hover Lift (`.hover-lift`)**:
   - Transition: `all 0.4s cubic-bezier(0.16, 1, 0.3, 1)`.
   - Hover State: `transform: translateY(-10px); box-shadow: 0 20px 40px rgba(16, 185, 129, 0.20);`.
3. **Energy Grid Floating Animation (`.float-animation`)**:
   - Keyframe `@keyframes float`: Translates vertically between `0px` and `-20px` over `3s ease-in-out infinite`.
   - Staggered delays: Node 1 (0s), Node 2 (0.5s), Node 3 (1.0s), Node 4 (1.5s), Node 5 (2.0s).
4. **Energy Flow Particle Animation**:
   - SVG circles travel along stroke paths with animated `cx` coordinates repeating every `2s indefinite`.
5. **Progress Bar Fill (`.energy-meter-fill`)**:
   - Transition: `width 0.5s ease`.
6. **Toast Slide & Fade**:
   - Entrance: Opacity `0` to `1` in `0.3s`.
   - Exit: Opacity `1` to `0` after `3000ms`.
7. **Reduced Motion Override**:
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, *::before, *::after {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
       scroll-behavior: auto !important;
     }
   }
   ```

---

# 19. Responsive Design Specifications

| Viewport Category | Breakpoint Range | Layout Adjustments |
| :--- | :--- | :--- |
| **Mobile** | `< 640px` | Sidebar collapses to drawer; Header displays hamburger toggle; 4-column KPI grid becomes 1 column; Tab navigation strip enables horizontal scroll; Data tables scroll horizontally inside `.table-shell`; Auth cards span full width minus 2rem margin; Padding reduced to `p-4` (16px). |
| **Tablet** | `640px - 1023px` | KPI overview grid displays in 2 × 2 columns; Main panels display in 2 columns; Charts stack vertically; Table shell maintains horizontal scroll padding; Page padding expands to `sm:px-6` (24px). |
| **Laptop / Desktop** | `1024px - 1279px` | Persistent 260px left sidebar activates; Hamburger menu hides; KPI grid displays full 4 columns; Solar form expands to 4 columns; Consumption form displays 3 columns; Page padding reaches `lg:px-8` (32px). |
| **Wide Desktop** | `>= 1280px` | Main content area centers at max-width `1280px` (`max-w-7xl`); Double-column analytics charts render side-by-side at optimal 280px height. |

---

# 20. Accessibility (a11y) Standards

1. **Color Contrast Compliance**:
   - All text combinations must meet or exceed WCAG 2.1 Level AA (4.5:1 for normal text, 3:1 for large text).
   - Primary text (`#17211d`) on `#ffffff`: **15.2:1** (AAA Compliant).
   - Muted text (`#637067`) on `#ffffff`: **5.4:1** (AA Compliant).
   - Emerald CTA (`#047857`) on `#ffffff`: **5.9:1** (AA Compliant).
2. **Keyboard Navigation & Visible Focus**:
   - Every interactive element (Buttons, Form inputs, Links, Tab triggers) must implement a high-contrast focus indicator:
     `outline: 3px solid rgba(16, 185, 129, 0.38); outline-offset: 2px;`.
   - Modal focus trapping: Opening a modal traps keyboard tab focus within the modal boundaries until dismissed.
3. **ARIA Semantics & Screen Reader Support**:
   - Tab navigation strip declared with `role="tablist"`, individual buttons with `role="tab"`, `aria-selected="true|false"`, and content panels with `role="tabpanel"`.
   - Toast notifications utilize `role="status"` and `aria-live="polite"`.
   - Error banners utilize `role="alert"` and `aria-live="assertive"`.
   - Data tables utilize semantic `<table>`, `<thead>`, `<tbody>`, `<th> scope="col"`, and `<td>`.
   - Decorative SVGs carry `aria-hidden="true"`.

---

# 21. Design Tokens & Tailwind Configuration

The Next.js rebuild implements these tokens directly within `tailwind.config.js` and `app/globals.css`:

### 21.1 CSS Variables (`app/globals.css`)
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  /* Surface & Canvas Tokens */
  --ec-page: #f6f8f6;
  --ec-surface: #ffffff;
  --ec-subsurface: #f3f6f4;
  --ec-border: #dfe7e1;
  --ec-border-light: #edf1ee;

  /* Typography Colors */
  --ec-ink: #17211d;
  --ec-muted: #637067;
  --ec-disabled: #9ca3af;

  /* Primary Brand Tokens */
  --ec-primary: #047857;
  --ec-primary-mid: #059669;
  --ec-primary-light: #10b981;
  --ec-primary-soft: #ecfdf5;
  --ec-primary-border: #a7f3d0;

  /* Domain Semantic Tokens */
  --ec-solar: #f59e0b;
  --ec-solar-dark: #b45309;
  --ec-solar-soft: #fffbeb;
  --ec-wind: #3b82f6;
  --ec-wind-dark: #1d4ed8;
  --ec-wind-soft: #eff6ff;
  --ec-battery: #8b5cf6;
  --ec-battery-dark: #6d28d9;
  --ec-battery-soft: #f5f3ff;

  /* Feedback Tokens */
  --ec-danger: #b91c1c;
  --ec-danger-soft: #fef2f2;
  --ec-danger-border: #fecaca;
  --ec-warning: #a16207;
  --ec-warning-soft: #fffbeb;
  --ec-warning-border: #fde68a;

  /* Elevation & Shape */
  --ec-radius-sm: 8px;
  --ec-radius-md: 12px;
  --ec-radius-lg: 14px;
  --ec-radius-xl: 24px;
  --ec-shadow-sm: 0 3px 10px rgba(15, 46, 31, 0.04);
  --ec-shadow-md: 0 10px 28px rgba(15, 46, 31, 0.08);
  --ec-shadow-lg: 0 18px 42px rgba(15, 46, 31, 0.10);
}

body {
  background: var(--ec-page);
  color: var(--ec-ink);
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
}
```

---

### 21.2 Tailwind Configuration (`tailwind.config.js`)
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        solar: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        wind: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        battery: {
          50: '#f5f3ff',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
        ink: '#17211d',
        muted: '#637067',
        surface: '#ffffff',
        subsurface: '#f3f6f4',
        page: '#f6f8f6',
        border: '#dfe7e1',
      },
      borderRadius: {
        'card': '14px',
        'auth': '24px',
      },
      boxShadow: {
        'ec-sm': '0 3px 10px rgba(15, 46, 31, 0.04)',
        'ec-md': '0 10px 28px rgba(15, 46, 31, 0.08)',
        'ec-lg': '0 18px 42px rgba(15, 46, 31, 0.10)',
        'ec-glow': '0 0 30px rgba(16, 185, 129, 0.6)',
      },
    },
  },
  plugins: [],
};
```

---

# 22. Reusable Component Inventory

The Next.js rebuild organizes components into strict, modular React files:

| Component Name | Category | Primary Props | States Supported | File Path |
| :--- | :--- | :--- | :--- | :--- |
| `AppShell` | Layout | `children`, `session`, `activeTab` | Loading, Hydrated | `components/layout/AppShell.jsx` |
| `Header` | Layout | `session`, `wallet`, `onLogout` | Connected, Disconnected | `components/layout/Header.jsx` |
| `Sidebar` | Layout | `activeTab`, `onSelectTab` | Open, Collapsed, Mobile | `components/layout/Sidebar.jsx` |
| `KpiCard` | Display | `title`, `value`, `unit`, `icon`, `note`, `meter` | Default, Loading | `components/ui/KpiCard.jsx` |
| `ModuleCard` | Container | `title`, `badge`, `children`, `className` | Default, Hover | `components/ui/ModuleCard.jsx` |
| `Button` | Interactive | `variant`, `size`, `pending`, `icon`, `onClick` | Default, Hover, Loading, Disabled | `components/ui/Button.jsx` |
| `DataTable` | Data | `columns`, `data`, `loading`, `emptyMessage` | Loading, Empty, Populated | `components/ui/DataTable.jsx` |
| `StatusBadge` | Feedback | `status` (`pending`, `confirmed`, `cancelled`)| Active, Completed, Error | `components/ui/StatusBadge.jsx` |
| `Toast` | Feedback | `message`, `type` (`success`, `error`, `warning`)| Hidden, Visible | `components/ui/Toast.jsx` |
| `SolarModule` | Domain | `onPredict`, `initialValues` | Idle, Calculating, Revealed | `components/domain/SolarModule.jsx` |
| `ConsumptionModule`| Domain | `onPredict`, `onReset` | Idle, Predicting, Result | `components/domain/ConsumptionModule.jsx`|
| `WindModule` | Domain | None (simulated internally) | Active interval loop | `components/domain/WindModule.jsx` |
| `MarketplaceTable` | Web3 | `offers`, `wallet`, `onAccept`, `onCancel` | Connecting, Active, Settling | `components/domain/MarketplaceTable.jsx`|
| `BookingChat` | Workflow | `booking`, `messages`, `onSendMessage` | Unselected, Active, Sending | `components/domain/BookingChat.jsx` |

---

# 23. Page-by-Page UI Blueprint

```text
========================================================================================
1. LANDING PAGE (/)
========================================================================================
LandingPage
├── Header (Sticky h-16)
│   ├── Brand Lockup (Logo Icon + "EnergyChain" Gradient Title)
│   ├── Nav Links (#features, #use-cases, #about)
│   └── Action Group ([Log In] Ghost Button + [Sign Up] Solid Gradient Button)
├── Hero Section (bg-gradient from-green-50 to-teal-50)
│   ├── Headline ("Powering the Future of Energy Trading" text-7xl)
│   ├── Subtitle (Description copy max-w-3xl)
│   ├── CTA Group ([Start Free Trial] Button + "Join 500+ Providers" Subtext)
│   └── Energy Grid Visual (1000x320 SVG with 5 Floating Nodes & Particles)
├── Trust Bar (Bordered White Row with 3 Shield Badges)
├── Features Grid (3 Elevated Cards: Security, Settlement, Compliance)
├── Use Case Section (2-Column Split: Explanation Checklist vs 60% Savings Stat Card)
├── About Mission Section (Center-aligned Copy + Network SVG graphic)
└── Footer (Copyright & Legal)

========================================================================================
2. AUTHENTICATION PAGES (/login & /signup)
========================================================================================
AuthPage
├── Slim Header (Logo Lockup + Direct Navigation Link)
├── Auth Shell Canvas (Centered grid with ambient radial green glow)
│   └── AuthCard (max-w-md bg-white rounded-3xl shadow-2xl p-8 border)
│       ├── Kicker ("Secure account access" / "Create your marketplace account")
│       ├── Title ("Log In" / "Sign Up" gradient text)
│       ├── Notice Alert Banner (Hidden by default; displays loading/error/success)
│       ├── Form Fields
│       │   ├── [Sign Up Only] Name Input
│       │   ├── Email Input
│       │   ├── Password Input (minlength 6)
│       │   └── [Login Only] Remember Me Row + Forgot Password Link
│       ├── Submit Button (Full-width .energy-gradient with spinner)
│       └── Alternate Auth Link ("New to EnergyChain? Create an Account")
└── Footer (Copyright)

========================================================================================
3. MAIN OPERATIONAL DASHBOARD (/dashboard)
========================================================================================
DashboardAppShell
├── Top Utility Header (Sticky h-16)
│   ├── Mobile Hamburger Toggle + Breadcrumbs ("Dashboard / Operations")
│   └── Utility Cluster (Sepolia Network Pill + Wallet Pill + User Menu + Logout)
├── Desktop Left Sidebar (Fixed w-64 / 260px)
│   ├── Brand Lockup (Lightning Logo + Operations subtitle)
│   ├── Core Navigation Group (Overview, Marketplace, Bookings, History)
│   ├── Intelligence Navigation Group (Solar, Consumption ML, Wind)
│   └── Footer User Profile Chip + Logout Button
└── Main Viewport (max-w-7xl px-4 sm:px-6 lg:px-8 py-8)
    ├── Operations Workspace Header (Eyebrow + "Energy Dashboard" + Status Badge)
    ├── Wallet Binding Module Card (Wallet status + Address + Connect/Verify Button)
    ├── KPI Overview 4-Column Grid
    │   ├── Total Generation Card (kWh Metric + Progress Meter + Source Note)
    │   ├── Active Offers Card (Count Metric + Blue Icon + Listing Note)
    │   ├── Total Revenue Card (ETH Metric + Amber Icon + Settlement Note)
    │   └── Battery Storage Card (% Metric + Violet Meter + Cycle Note)
    ├── Tab Navigation Strip (7 Tab buttons with icons and ARIA tablist)
    └── Active Module Panel
        │
        ├── [TAB 1: OVERVIEW]
        │   ├── User Profile Card (Name, Email, Monospace Wallet Chip)
        │   └── 2-Column Analytics Grid
        │       ├── Energy Production Trend (Chart.js Line Chart: Solar vs Wind)
        │       └── Energy Mix Distribution (Chart.js Doughnut: Solar/Wind/Battery)
        │
        ├── [TAB 2: SOLAR POWER PREDICTION]
        │   └── Module Card
        │       ├── Header (Sun Icon + "Solar Power Prediction" + "Local estimate" Badge)
        │       ├── Explanation Copy
        │       ├── 4-Column Weather Form (DateTime, Irradiation, Ambient, Module)
        │       ├── Action Buttons ([Predict AC Power] Gradient + [Fill Sample Data] Neutral)
        │       └── Prediction Result Card (Hidden by default; reveals kW output + echo)
        │
        ├── [TAB 3: ENERGY CONSUMPTION ML]
        │   ├── Input Module Card
        │   │   ├── Header ("Energy Consumption Prediction" + "Prediction, not measured")
        │   │   ├── 10-Field Grid Form (Timestamp, Temp, Humidity, SqFt, Occupancy, etc.)
        │   │   ├── Action Buttons ([Predict consumption] Gradient + [Reset] Outlined)
        │   │   └── Error Alert Banner (Hidden by default)
        │   └── Result 2-Column Grid (Hidden by default)
        │       ├── Metric Card (Predicted value + Unit + Model algorithm name + Warning)
        │       └── Visualization Card (Chart.js Bar Chart graphing prediction)
        │
        ├── [TAB 4: WIND ENERGY MONITOR]
        │   └── Module Card
        │       ├── Header (Wind Icon + "Wind Energy Monitor" + "Simulated data" Badge)
        │       ├── 3-Card Telemetry Grid (Wind Speed m/s, Power Output kW, Efficiency %)
        │       └── Dual Turbine Status Panel (Turbine 1 & 2 Active meters and kW)
        │
        ├── [TAB 5: ENERGY MARKETPLACE]
        │   ├── Create Offer Module Card (Public Name, Price ETH, [Create Offer] Button)
        │   ├── Filter & Search Toolbar (Show All Checkbox + Search Input + Sort Select)
        │   ├── Active Offers Table (Data table with Cancel / Accept triggers)
        │   └── Historical Legacy Offers Panel (17 Preserved audit listings)
        │
        ├── [TAB 6: PRE-BOOKING & MESSAGES]
        │   ├── Reserve Energy Form Card (Provider Email, Date, Quantity, Unit Price, Total)
        │   └── 2-Column Operational Split
        │       ├── My Pre-bookings Table (Booking records with Confirm/Cancel/Messages)
        │       └── Booking Conversation Panel (Scrollable chat feed + Input + Send)
        │
        └── [TAB 7: TRANSACTION HISTORY]
            ├── Accepted Offers Table (Audit trail of completed on-chain purchases)
            └── 2-Column Analytics Grid
                ├── Price History Trend (Chart.js Line Chart plotting Offer IDs vs ETH)
                └── Seller Distribution (Chart.js Pie Chart plotting trades per seller)
```

---

# 24. Implementation Execution Guidance

When implementing this specification in Next.js:

1. **Strictly Preserve All Existing Backend API Contracts**:
   - `/auth/signup`, `/auth/login`, `/auth/me`, `/auth/wallet`
   - `/bookings/mine`, `/bookings`, `/bookings/:id/status`, `/bookings/:id/messages`
   - `/api/energy-consumption/predict`
   - `/config/contract_address.json`, `/config/contract_history.json`, `/config/legacy_sepolia_energyoffer_snapshot.json`
2. **Strictly Preserve All Smart Contract ABIs & Function Names**:
   - `createOffer(bytes32, uint256)`, `acceptOffer(uint256) payable`, `cancelOffer(uint256)`
   - Events: `OfferCreated`, `OfferAccepted`, `OfferCancelled`
3. **Strictly Enforce the Permanent Wallet Rule**:
   - The first wallet address connected must be stored immutably via `POST /auth/wallet`.
   - Never allow switching to a different wallet once bound to that user account.
4. **Maintain Truthful Data Disclosures**:
   - Never label client heuristics or client interval simulations as live real-world IoT telemetry.
   - Always display the respective status badges: `Local estimate`, `Simulated data`, and `Prediction, not measured usage`.
5. **Chart Rendering in Next.js**:
   - Ensure Chart.js is imported dynamically or within `"use client"` components to prevent SSR hydration mismatches.
   - Clean up chart instances on component unmount to prevent canvas memory leaks.

---

*End of Frontend UI/UX Specification Extraction.*
