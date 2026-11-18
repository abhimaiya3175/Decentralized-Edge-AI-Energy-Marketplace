# FRONTEND UI DOCUMENTATION

> **Scope and preservation note.** This document records the frontend as it exists in the repository at the time of analysis. It is an implementation inventory, not a redesign specification. Claims about behavior below are based on the HTML, inline CSS, and inline JavaScript in the inspected files. No frontend source file was changed while creating this document.

## 1. Project Overview

EnergyChain presents a renewable-energy marketplace in four static browser pages. It combines marketing content, authentication screens, a dashboard, browser-wallet marketplace transactions, a pre-booking workflow, booking conversations, and visualization widgets.

The browser application is served as static files by the Express application. Its main frontend directory is [`energichain_backend/public/`](energichain_backend/public/). There is no separately built frontend bundle, no client-side source directory, and no compiled React/Vue/Angular application.

## 2. Frontend Technology Stack

| Concern | Implemented technology | Evidence / location |
| --- | --- | --- |
| Page implementation | Static HTML5 plus inline JavaScript | `energichain_backend/public/*.html` |
| Utility styling | Tailwind CSS browser CDN | `index.html`, `login.html`, `signup.html`, `dashboard.html` each load `https://cdn.tailwindcss.com` |
| Page-specific styling | Inline `<style>` blocks | Each HTML page |
| Charts | Chart.js 4.4.3, served locally | `dashboard.html` loads `/vendor/chart.js/chart.umd.js`; backend dependency is `chart.js: 4.4.3` |
| Wallet / contract client | Ethers UMD 6.13.1 CDN | `dashboard.html` loads `https://unpkg.com/ethers@6.13.1/dist/ethers.umd.min.js` |
| Icons | Inline SVG icons; no icon-library dependency | All public HTML pages |
| State storage | Browser `localStorage` and `sessionStorage` | Login, signup, and dashboard scripts |
| Data/API transport | Native `fetch` | Login, signup, booking UI, contract-config retrieval |
| Wallet provider | Injected EIP-1193 provider (`window.ethereum`) | `dashboard.html` |
| Animation | CSS transitions/keyframes plus scroll listeners | All page-level inline scripts |

No framework router, component library, CSS module system, Sass/Less, external font declaration, or animation library is implemented.

## 3. Frontend Folder Structure

```text
energichain_backend/
├── public/
│   ├── index.html                    # Marketing / landing page
│   ├── login.html                    # Login screen
│   ├── signup.html                   # Registration screen
│   ├── dashboard.html                # Authenticated dashboard and feature UI
│   └── config/
│       └── contract_address.json     # Chain-id-to-contract-address map read by dashboard
├── src/
│   └── app.js                        # Static-file and local Chart.js mounting
└── package.json                       # Includes pinned chart.js dependency
```

Public assets consist only of the four HTML files and `config/contract_address.json`. There are no project-owned image, font, SVG, CSS, screenshot, or video assets under `public/`. Decorative graphics and icons are inline SVG or CSS-generated shapes.

## 4. Application Architecture

The application uses a multi-page architecture:

```text
index.html ──links──> login.html / signup.html
login.html / signup.html ──sessionStorage──> dashboard.html
dashboard.html ──fetch──> same-origin Express APIs and contract config
dashboard.html ──Ethers + MetaMask──> configured Sepolia EnergyOffer contract
dashboard.html ──Chart.js──> canvas visualizations
```

`src/app.js` exposes `public/` at the server root and exposes the locally installed Chart.js distribution at `/vendor/chart.js`. Consequently, page URLs are conventional static paths such as `/dashboard.html`; there is no client route table.

## 5. Routing and Navigation

### Page routes and entry points

| URL / file | Entry purpose | Access behavior |
| --- | --- | --- |
| `/` or `/index.html` | Marketing landing page | Public |
| `/login.html` | Login | Public |
| `/signup.html` | Account registration | Public |
| `/dashboard.html` | Operational dashboard | Redirects to `login.html` when `sessionStorage.isLoggedIn`, `userName`, or `userEmail` is absent |

### Navigation implementation

- Navigation is ordinary `<a href>` navigation between files; no SPA router is present.
- Landing-page in-document links target `#features`, `#use-cases`, and `#about` and use a scroll handler with `scrollIntoView({ behavior: 'smooth' })` when a matching target exists.
- Dashboard navigation is a tab switcher. Buttons with `data-tab` match containers with `data-tab-content`; `initTabs()` toggles Tailwind’s `hidden` class and updates `.active`.
- `logoutBtn` clears all `sessionStorage` and returns to `login.html`.
- MetaMask `accountsChanged` reloads the page; `chainChanged` reloads the page after clearing the offer polling interval.

### Links without implemented destinations

| Location | Visible control | Current implementation |
| --- | --- | --- |
| `index.html` hero | “Start Free Trial” | `href="#signup"`, but no element has `id="signup"`; no registration action is initiated. |
| `index.html` use-case area | “Explore All Use Cases” | `href="#"`; no feature handler exists. |
| `login.html` | “Forgot Password?” | `href="#"`; no recovery flow or handler exists. |
| Login “Remember Me” checkbox | Checkbox is displayed | Its value is not read by the script; persistence behavior is unchanged. |

## 6. Complete Page Inventory

| Page | Exact file | Purpose | Major UI areas |
| --- | --- | --- | --- |
| Landing | `energichain_backend/public/index.html` | Product introduction and entry to auth | Fixed nav, hero, animated SVG energy graphic, trust bar, benefits, use case, about, footer |
| Login | `energichain_backend/public/login.html` | Authenticate an existing account | Fixed nav, centered card, email/password form, remember/forgot row, footer |
| Sign Up | `energichain_backend/public/signup.html` | Register or link an account | Fixed nav, centered card, name/email/password form, footer |
| Dashboard | `energichain_backend/public/dashboard.html` | Authenticated energy, marketplace, booking, and visualization surface | Fixed nav, wallet connect card, KPI cards, six tabs, toast |

## 7. Page-by-Page UI Analysis

### 7.1 Landing page — `public/index.html`

**Purpose.** Public product marketing and entry point to login/registration.

**Header and navigation.** A fixed white, 64px (`h-16`) navbar carries a green lightning SVG and gradient “EnergyChain” wordmark. Desktop-only (`hidden md:flex`) anchor links lead to Features, Use Cases, and About. LogIn and Sign Up remain visible action links.

**Hero.** The hero is a `pt-32 pb-20` green/emerald/teal background with blurred circular background shapes. It includes:

- A `text-5xl md:text-7xl` headline, “Powering the Future of Energy Trading”.
- Descriptive copy and the non-targeting “Start Free Trial” anchor.
- A “Join 500+…” line.
- A white rounded, shadowed SVG scene showing solar panels, a wind unit, storage, a smart grid, EV charging, dashed connections, and animated energy particles.

**Trust bar.** Three icon-and-label claims: Verified Green Energy, Carbon Neutral Trading, and 100% Transparent.

**Core Benefits.** Three `md:grid-cols-3` cards: Unbreakable Security, Instant Settlement, and Green Compliance. Cards use `hover-lift` and entry reveal classes.

**Use-case section.** A two-column (`md:grid-cols-2`) P2P trading explanation with three checked bullet points and a separate green metric card displaying “60% Lower Energy Costs” and “2.5 GWh”. Values are static display text.

**About and footer.** Centered sustainability statement, inline three-circle connection SVG, and a simple copyright footer. No footer links are implemented.

### 7.2 Login — `public/login.html`

**Purpose.** Authenticate through the backend first, retaining a legacy browser-storage fallback.

**Layout.** A fixed white navbar precedes a full-height centered panel on a green/emerald/teal gradient background. Two blurred circles sit behind a `max-w-md`, white, `rounded-3xl`, `shadow-2xl` card.

**Navigation.** Brand at left; Home and Sign Up gradient buttons at right.

**Form and controls.**

| Control | ID / type | UI behavior |
| --- | --- | --- |
| Email | `#email`, `type=email` | Required browser validation; sent in login request |
| Password | `#password`, `type=password` | Required browser validation; sent in login request |
| Remember Me | `#remember`, checkbox | Visual only; not consumed by JavaScript |
| Forgot Password? | anchor | Visual only; `href="#"` |
| Log In | submit button | Calls backend `POST /auth/login`; on success stores JWT/session and opens dashboard; otherwise tries legacy local-user record |
| Create an Account | link | Opens `signup.html` |

The form uses browser `alert()` for success and error messaging. It has no inline validation message component or loading state.

### 7.3 Sign Up — `public/signup.html`

**Purpose.** Register a backend account when possible and preserve browser-local account compatibility.

**Layout.** The presentation mirrors Login: fixed navbar, gradient full-height background, blurred circles, and a centered `max-w-md` elevated card.

**Form and behavior.** Name, email, and password are all required. The script enforces a six-character minimum password. It first attempts `POST /auth/signup`; if the backend reports that the account exists, it attempts backend login with the submitted credentials. It records a local `energyUsers` entry only when absent, and records session information before navigating to the dashboard. If backend access fails, the existing browser-local fallback remains available.

### 7.4 Dashboard — `public/dashboard.html`

**Purpose.** The primary authenticated operational screen. It combines local/session state, MetaMask contract calls, booking API calls, client-side simulated values, and Chart.js canvases.

**Header.** A fixed, shadowed white bar carries the inline lightning mark, green-gradient wordmark, and `#logoutBtn`. The page title reads “Energy Dashboard”; “Live Data” with a green dot is displayed as a visual status element.

**Wallet card.** A centered `module-card` provides `#connectBtn` (“Connect MetaMask / Wallet”) and `#accountDisplay`. Wallet connection is distinct from application login.

**KPI cards.** A responsive `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` layout contains:

| KPI | Element | Current source |
| --- | --- | --- |
| Total Generation | `#totalGeneration`, `#generationMeter` | Sum of displayed solar prediction and simulated wind power |
| Active Offers | `#activeOffers` | Count of visible offer cards in `#offersContainer` |
| Total Revenue | `#totalRevenue` | Sum of locally cached accepted offer prices |
| Battery Storage | `#batteryLevel`, `#batteryMeter` | Sinusoidal browser simulation |

**Tabs.** Overview, Solar Power, Wind Energy, Marketplace, Pre-booking, and History are all implemented in this single file. Only the active tab remains visible.

#### Overview tab

- Profile card showing `#profileName`, `#profileEmail`, and `#profileWallet`.
- Energy Production Trend canvas (`#productionChart`).
- Energy Mix Distribution canvas (`#mixChart`).

#### Solar Power tab

Four inputs form a prediction panel: Date & Time (`#solarDateTime`), Irradiation (`#solarIrradiation`), Ambient Temp (`#solarAmbient`), and Module Temp (`#solarModule`). The panel has “Predict AC Power” and “Fill Sample Data” buttons, a hidden spinner, and a hidden amber result card. The result card displays output and the submitted parameters.

The visible “AI-Powered” badge and copy describe a model, but the current `predictSolarPower()` implementation calculates a browser-side heuristic. It does **not** fetch `/predict` or the FastAPI service.

#### Wind Energy tab

Three blue cards show wind speed, power output, and efficiency. `updateWindData()` randomizes wind speed between 10 and 15 m/s every five seconds, derives power as `windSpeed * 0.7`, and selects an efficiency between 82 and 91. The “Real-time” label is therefore presentation text, not an external feed. The turbine status meters (92%/88%) and outputs (4.2/4.1 kW) are static markup.

#### Marketplace tab

- Create Energy Offer card: public name (`#userName`) and ETH price (`#priceEth`) with inline validation messages.
- `#createOfferBtn` begins disabled and is enabled only after valid input and a connected wallet.
- “Show all marketplace offers” checkbox (`#showAllToggle`) and sort select (`#sortOffers`) support ID, price ascending/descending, and newest ordering.
- Active Offers container (`#offersContainer`) is populated from the configured smart contract. An owner sees Cancel; others see Accept.

#### Pre-booking tab

- Reservation form (`#bookingForm`) requests provider email, future delivery datetime, energy quantity in kWh, and price per kWh.
- `#bookingTotal` updates client-side as `quantity × price`.
- `#bookingAuthStatus` distinguishes a valid three-segment JWT session from legacy local-only session state.
- My Pre-bookings list (`#bookingsContainer`) renders API-returned bookings with Pending, Confirmed, or Cancelled badge states. Provider accounts can confirm pending bookings; either participant can cancel pending bookings.
- Booking Conversation (`#bookingMessages`) is selected per booking. `#bookingMessageInput` and Send remain disabled until a conversation successfully loads.

#### History tab

- Accepted Offers transaction cards from local accepted-offer history.
- Price History canvas (`#priceChart`).
- Accepted by Seller canvas (`#acceptedChart`).

**Toast.** The fixed `#toast` uses `toast-success`, `toast-error`, or `toast-warning`; `showToast()` uses `innerHTML` and removes `.show` after three seconds.

## 8. Global Layout and Design System

The UI uses Tailwind’s utility scales with small page-local CSS systems. The dominant layout is a centered `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` container. Dashboard content begins below the fixed header with `pt-24 pb-12`; landing begins at `pt-32`.

| Pattern | Implemented CSS / utility treatment |
| --- | --- |
| Main page backgrounds | `bg-gray-50`, white sections, or `bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50` |
| Content widths | `max-w-7xl`, landing about `max-w-5xl`, auth cards `max-w-md` |
| Standard dashboard module | `.module-card`: white, 16px radius, 1.5rem padding, 1px `#e5e7eb` border, `0 4px 6px rgba(0,0,0,.07)` shadow |
| KPI card | `.stat-card`: white, 12px radius, 1.5rem padding, lighter `0 2px 4px rgba(0,0,0,.05)` shadow |
| Spacing grid | `gap-4`, `gap-5`, `gap-6`, `gap-8`, `gap-10`, `gap-16` according to context |
| Interactive elevation | `.hover-lift` moves up 10px; module/stat cards get stronger shadows on hover |
| Fixed UI | Navbars use `fixed w-full top-0 z-50`; toast uses `z-index:1000` |

## 9. Color Palette

| Role | Exact implemented values |
| --- | --- |
| Primary energy green gradient | `linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)` (`.energy-gradient`) |
| Primary text gradient | `linear-gradient(135deg, #10b981 0%, #059669 100%)` (`.gradient-text`) |
| Alternate green gradient | `linear-gradient(135deg, #34d399 0%, #10b981 100%)` in landing CSS |
| Solar amber gradient | `#f59e0b → #d97706 → #b45309` (`.solar-gradient`) |
| Wind blue gradient | `#3b82f6 → #2563eb → #1d4ed8` (`.wind-gradient`) |
| Battery violet gradient | `#8b5cf6 → #7c3aed → #6d28d9` (`.battery-gradient`) |
| Page/card backgrounds | Tailwind `gray-50`, `white`, green/emerald/teal light gradients; dashboard cards use `white` |
| Main text | Tailwind `text-gray-900`; supporting text `gray-600`, `gray-700`, `gray-500` |
| Card border / meter track | `#e5e7eb` |
| Error | `#ef4444` (`.toast-error`, `.invalid`) |
| Warning / solar accent | `#f59e0b` (`.toast-warning`, `.prediction-card` border) |
| Success | `#10b981` (`.toast-success`) |
| Prediction background | `linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)` |

## 10. Typography System

- `font-sans antialiased` is applied to page bodies. No custom font family is loaded, so Tailwind’s standard sans-serif system stack is used.
- Landing hero: `text-5xl md:text-7xl font-bold leading-tight`.
- Dashboard page title: `text-4xl font-bold`.
- Main panel headings: `text-2xl font-bold`; panel subheadings `text-xl font-bold` or `text-lg font-bold`.
- KPI figures: `text-3xl font-bold`; solar result figure: `text-4xl font-bold` plus `text-2xl` unit.
- Body text is generally `text-gray-600` / `text-gray-700`, with `text-lg` or `text-xl` in landing copy.
- Labels use `font-medium` or `font-semibold`, commonly `text-sm`; helper/error text is `text-xs` or `text-sm`.

## 11. Buttons and Interaction Styles

| Style | Classes / behavior |
| --- | --- |
| Primary green | `.energy-gradient text-white ... rounded-lg font-semibold btn-glow`; used for auth actions, wallet connect, booking submit, and logout |
| Solar action | `.solar-gradient ... btn-glow btn-solar-glow`; amber hover glow for prediction |
| Neutral action | `bg-gray-600 text-white ... btn-glow`; used by Fill Sample Data |
| Tab button | `.tab-btn`; active is green gradient/white text, inactive `#f3f4f6`/`#6b7280`, hover `#e5e7eb`/`#374151` |
| Booking list actions | Runtime-generated small green Confirm, red Cancel, and green-outline Open messages buttons |
| Text action | `text-green-700 font-semibold hover:text-green-800`; Refresh uses this pattern |
| Disabled state | Global `button:disabled`: opacity `.6`, `not-allowed`, no pointer events, no hover/glow |

`btn-glow` includes a white sweep pseudo-element and a `0 0 30px rgba(16,185,129,.6)` hover glow with `translateY(-2px)`. There is no separate active/focus visual system beyond Tailwind input focus borders.

## 12. Cards, Tables and Widgets

- No HTML `<table>` is implemented. Marketplace offers, bookings, messages, and accepted-offer history are rendered as cards/list rows.
- `.table-container { overflow-x:auto; }` exists only in the dashboard’s mobile media rule; no inspected markup uses this class.
- Energy meters are 8px-high gray tracks with a rounded, animated-width fill.
- Dashboard cards react on hover; auth cards are static elevated cards.
- The landing page contains a large SVG visualization and several SVG symbol cards, not canvas charts.

## 13. Reusable Component Inventory

There are no reusable JavaScript component files, JSX/TSX components, imports, props, or framework component definitions. Reuse is achieved through repeated utility-class patterns and page-local CSS classes.

| Reused primitive | File location | Purpose | Inputs / interactions | Dependencies |
| --- | --- | --- | --- | --- |
| `.energy-gradient` / `.gradient-text` | All four HTML pages | Brand green buttons and wordmark/headline text | CSS class only | Inline CSS |
| `.btn-glow` | All four HTML pages | Shimmer and lifted hover action treatment | Hover/disabled CSS | Inline CSS |
| `reveal*` classes | Landing/login/signup | Scroll-triggered entrance transitions | `.active` added/removed by `revealOnScroll()` | Browser DOM APIs |
| `.module-card` | Dashboard | Primary dashboard surface | Hover shadow only | Dashboard CSS |
| `.stat-card` | Dashboard | KPI surface | Hover lift/shadow | Dashboard CSS |
| `.tab-btn` + `.tab-content` | Dashboard | Tab navigation shell | `data-tab` mapping | Dashboard JS |
| `showToast()` / `#toast` | Dashboard | Timed success/error/warning feedback | Message and type | Dashboard JS |

## 14. Forms and Input Components

| Page / feature | Fields | Validation / feedback | Submission behavior |
| --- | --- | --- | --- |
| Login | email, password, unused remember checkbox | Browser `required`; `alert()` errors | Backend login first; local-browser fallback |
| Signup | name, email, password | Browser `required`, six-character minimum; `alert()` | Backend signup/login attempt; local record fallback |
| Solar prediction | datetime, irradiation, ambient temp, module temp | Client checks for blank/NaN; only warns when irradiation is outside 0–1500 | Browser-side heuristic; result card/toast |
| Create offer | public name, ETH price | Name required; price must be ≥ 0.01; fields get `.invalid` and text errors | MetaMask contract transaction |
| Booking | provider email, datetime, quantity, price | HTML required/min/step plus backend validates future date and valid values | Authenticated `POST /bookings` |
| Booking message | max 2,000-character text | Disabled until booking loads; backend validates trimmed 1–2,000 characters | Authenticated `POST /bookings/:id/messages` |

## 15. Charts and Data Visualizations

All dashboard charts are Chart.js canvases initialized after DOM content loads, when global `Chart` is available.

| Canvas / widget | Type | Current data source and input | Labels / axes | Interactions |
| --- | --- | --- | --- | --- |
| `#productionChart` | Line | Hard-coded weekly solar `[12,15,13,17,14,16,18]` and wind `[8,9,10,8,9,11,10]` | Mon–Sun; y-axis “Energy (kWh)” | Repainted on Overview tab activation |
| `#mixChart` | Doughnut | Hard-coded Solar/Wind/Battery `[55,35,10]` | Legend right; title “Current Energy Sources” | Repainted on Overview activation |
| `#priceChart` | Filled line | Active on-chain offers read by `loadOffers()` | `Offer #id`; y-axis “Price (ETH)” | Updates after offers load / filters change |
| `#acceptedChart` | Pie | `acceptedOffers` stored in `localStorage` | Seller labels; “Accepted Offers by Seller” title | Updates after accepted event/history load |
| Landing SVG grid | Inline animated SVG | Static markup | No Cartesian axes | Float/dash/particle SVG animations |
| Solar result | Card, not chart | Browser-calculated power and form inputs | kW readout | Revealed after valid prediction |

## 16. User Interactions and Functionality

### Fully implemented

- File navigation and landing anchors with matching section IDs.
- Login/signup backend attempts, JWT session storage, and local compatibility fallback.
- Dashboard login guard and logout.
- Wallet detection, Sepolia network switch/add flow, account request, and contract configuration fetch.
- Smart-contract offer creation, cancellation, acceptance, active offer retrieval, past accepted-event query, event listeners, and 30-second polling.
- Offer filtering/sorting; DOM-safe text rendering helpers are used for runtime listing strings.
- Client-side form validation, buttons/spinners, toast feedback, and booking API operations.
- Pre-booking creation/listing/status update/message operations for valid JWT sessions.
- Chart initialization and updates.

### Partially implemented or simulated

| Feature | Actual implementation status |
| --- | --- |
| Solar prediction | Functional browser heuristic using irradiation/temperatures/time. It is not connected to the existing `/predict` route or a trained ML artifact. |
| Wind monitoring | Runs a five-second random browser simulation; no weather/turbine API exists in the frontend. |
| Battery storage | Uses a time-based sinusoidal simulation. |
| Production and mix charts | Static sample arrays, not generation data. |
| Total generation | Combines current solar UI readout with simulated wind power. |
| “Live Data” label | Visual status wording; not separately backed by a live-data transport. |
| Accepted history | On-chain event scan plus browser-local cache; not a database settlement history. |

### Non-functional UI elements

- Start Free Trial anchor target is missing.
- Explore All Use Cases has no destination.
- Forgot Password has no flow.
- Remember Me has no script behavior.
- No modal/dialog component, search UI, plant selector, export/download control, pagination, sidebar, or responsive hamburger menu exists.

## 17. Responsive Design

The Tailwind CDN’s standard breakpoint utilities are used: `sm` (640px), `md` (768px), and `lg` (1024px). Only behavior expressed by existing classes/CSS is documented here.

| Viewport range | Implemented behavior |
| --- | --- |
| Desktop / large (`lg`) | Dashboard KPIs become four columns; solar fields can become four columns; full navigation links appear on landing. |
| Medium (`md`) | Landing benefits form three columns; use case is two columns; dashboard KPI layout is two columns; charts and booking panels form two columns. |
| Small | Dashboard KPI cards collapse to one column; tab strip remains a horizontal flex row with `overflow-x-auto`; landing in-page nav links are hidden by `hidden md:flex`; auth and landing containers use progressively smaller horizontal padding. |
| `max-width: 640px` dashboard CSS | `canvas { max-width: 100%; }`, card padding becomes 1rem, tab buttons become `.5rem 1rem` at `.875rem` font size; `.table-container` would scroll horizontally if used. |

There is no sidebar to collapse and no mobile-only navigation menu. Auth navbar action buttons are retained at all widths.

## 18. API and Backend Integration

The frontend uses same-origin relative URLs; it has no configured API base URL string. Express serves the public files and API routes on the same origin.

| Frontend consumer | Endpoint / method | Request | Auth | Result used by UI |
| --- | --- | --- | --- | --- |
| Login | `POST /auth/login` | `{ email, password }` | None | `token`, `user.name`, `user.email`; JWT stored in session storage |
| Signup | `POST /auth/signup` | `{ name, email, password }` | None | Same session data; signup can follow with login when user exists |
| Booking list | `GET /bookings/mine` | None | `Authorization: Bearer <JWT>` | Cards in `#bookingsContainer` |
| Create booking | `POST /bookings` | `{ providerEmail, scheduledFor, energyUnits, pricePerUnit }` | JWT | New booking toast and refreshed list |
| Status update | `PATCH /bookings/:id/status` | `{ status: "confirmed" | "cancelled" }` | JWT | Refreshed booking list/conversation |
| Get conversation | `GET /bookings/:id/messages` | None | JWT | Booking title and message cards |
| Send message | `POST /bookings/:id/messages` | `{ body }` | JWT | Refreshed conversation |
| Contract configuration | `GET /config/contract_address.json` | None | None | Chain-specific contract address |

The dashboard does not invoke `POST /trade/create`, `GET /trade/mine`, or `POST /predict`, even though server implementations exist. No secrets, API keys, or private keys are exposed by the documented UI.

### Authentication handling

- Backend sessions: the login/signup flows save a JWT to `sessionStorage.authToken`; booking calls treat a token with three dot-separated parts as a backend token.
- Legacy compatibility: `localStorage.energyUsers` can hold fallback local records and `sessionStorage` includes `isLoggedIn`, `userName`, and `userEmail`.
- Wallet access: MetaMask account access is separate from the JWT; it uses Ethers with `window.ethereum`.

## 19. Dashboard Data Flow

```text
Login/signup → sessionStorage → dashboard guard/profile

MetaMask → Sepolia switch/check → contract_address.json → Ethers Contract
  → active offers / contract events → offer cards, history cache, offer charts, KPIs

Booking JWT → /bookings APIs → booking cards and message cards

Solar form → browser heuristic → result card → total-generation KPI
Wind simulator + battery simulator → wind widgets / KPI updates
Static arrays → production and mix Chart.js canvases
```

`updateDashboardStats()` runs every three seconds after dashboard initialization. Marketplace polling starts after wallet connection and runs every 30 seconds.

## 20. ML Integration Opportunities

This section identifies existing integration surfaces only; it does not prescribe or add a new interface.

| Existing UI surface | Existing implementation | Compatible future ML insertion point |
| --- | --- | --- |
| Solar Power tab inputs | Date/time, irradiation, ambient temperature, module temperature are already collected | `predictSolarPower()` can replace its current heuristic calculation with a request/response mapping to the existing backend prediction endpoint, retaining the same inputs/result IDs |
| Prediction Result card | Displays `#predictedPower` and all inputs | Can receive a model-produced AC power value without changing card structure |
| Total Generation KPI | Reads `#predictedPower` | Will automatically incorporate a model output placed in the same UI element |
| Production Trend chart | Static solar/wind weekly arrays | Can render historical actual and predicted series when an API supplies arrays; this is not implemented today |
| Marketplace flow | Separate on-chain price offer UI | The existing tip suggests using prediction to inform offers, but no automatic offer price/quantity recommendation exists |

The frontend does not include plant-selection control, weather-service fetch, historical actual-power table, ML confidence interval, predicted-vs-actual chart series, or ML API loading state beyond the existing generic prediction spinner. The existing backend `src/predict.py` and `energichain_backend/model_train/` scripts are not currently consumed by dashboard JavaScript.

## 21. Assets and Icons

- All visible icons are inline SVG paths in the HTML: lightning, shield/check, database, sun, wind, battery, calendar, wallet/marketplace, and chart-related symbols.
- The landing page contains inline SVG grid and relationship illustrations.
- `public/` contains no raster screenshots, design exports, custom font files, or standalone SVG/image assets.
- Therefore, no repository screenshot or design-asset file can be associated with a page.

## 22. Dependencies and Libraries

| Library / platform | Frontend use |
| --- | --- |
| Tailwind CSS CDN | Layout, spacing, responsive utilities, typography, colors, shadows, animation utility classes |
| Chart.js 4.4.3 | Four dashboard canvas charts; local asset mount avoids a Chart.js CDN dependency |
| Ethers 6.13.1 | Browser-provider, signer, contract instantiation, ABI calls, ETH conversion, events |
| Native browser APIs | `fetch`, DOM events, `localStorage`, `sessionStorage`, `Date`, `setInterval`, SVG/Canvas |
| MetaMask / EIP-1193 wallet | Account connection and network management, if the extension is installed and approved |

## 23. Existing Functionalities

- Public marketing content and smooth in-page scrolling for valid anchors.
- Login, signup, dashboard session gating, and logout.
- Local and backend-backed session handling.
- MetaMask Sepolia connection and `EnergyOffer` contract operations.
- On-chain offer listing/filtering/sorting and accepted-event history cache.
- Dashboard tabs, toast notifications, validation messaging, responsive grids, and Chart.js charts.
- Pre-booking creation, participant-specific status handling, and booking messages when a valid backend JWT is available.
- Browser-only solar heuristic, wind simulation, battery simulation, and dashboard stat updates.

## 24. Partially Implemented Features

- Solar UI is visually framed as ML-powered, but uses a heuristic in the browser and does not use model files or `/predict`.
- The backend prediction endpoint exists but has no current dashboard consumer.
- Chart surfaces exist, but two overview charts use hard-coded arrays and not persisted/time-series data.
- Wind and battery displays are simulations despite real-time/live terminology in UI text.
- Legacy browser-local credentials remain as a fallback alongside backend authentication.

## 25. Non-functional UI Elements

- Start Free Trial, Explore All Use Cases, and Forgot Password.
- Remember Me checkbox.
- The `table-container` mobile utility has no matching table markup.
- No explicit modal/popover system, search, export, download, plant picker, pagination control, or footer navigation is implemented.

## 26. Frontend Preservation Requirements

Future changes should preserve the following current contracts unless intentionally revised:

1. Keep static page entry points and their relative links (`index.html`, `login.html`, `signup.html`, `dashboard.html`).
2. Preserve dashboard element IDs used by the scripts, particularly solar inputs/result IDs, offer IDs, chart canvas IDs, booking IDs, and `#toast`.
3. Preserve `data-tab` / `data-tab-content` names and active/hidden behavior.
4. Preserve same-origin relative API paths and JWT `Authorization` header behavior for bookings.
5. Preserve the MetaMask Sepolia network flow and `contract_address.json` lookup before changing wallet/contract features.
6. Keep Chart.js available at `/vendor/chart.js/chart.umd.js` or update the single dashboard script reference in a coordinated change.
7. Preserve the green, amber, blue, and violet semantic visual roles and the card/button patterns if integrating ML output.
8. When replacing the solar heuristic with a model call, preserve form input IDs, `#predictionResult`, `#predictedPower`, loading spinner behavior, validation feedback, and the total-generation KPI dependency.

## 27. Final Summary

The current frontend is a carefully styled static HTML interface driven by page-local scripts rather than a component framework. Its visual system is green-first, card-based, responsive through Tailwind utilities, and relies on inline SVG iconography, gradient surfaces, glow buttons, and scroll-entry transitions. The dashboard is the main interactive surface: it contains wallet-driven marketplace functions, JWT-protected pre-booking and conversation functions, four Chart.js visualizations, and simulated energy widgets.

The strongest ML-compatible existing area is the Solar Power tab: its inputs, result panel, spinner, and KPI linkage are already present. The documented implementation distinction is essential: the displayed solar prediction currently comes from a client-side heuristic, not an integrated trained model. No frontend code changes are required to preserve this interface while planning a future model integration.
