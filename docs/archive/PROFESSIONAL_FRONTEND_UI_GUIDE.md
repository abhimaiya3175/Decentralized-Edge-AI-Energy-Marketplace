# PROFESSIONAL FRONTEND UI GUIDE

> **Document scope.** This is a UI/UX audit and design-system specification for the current EnergyChain frontend. “Existing” describes verified implementation. “Proposed” appears only in the dedicated recommendation and future-table sections. No source, dependency, API, database, or application behavior was changed while producing this document.

## 1. Executive Summary

EnergyChain is a static, multi-page energy-marketplace interface with a green renewable-energy visual identity. The frontend consists of a marketing landing page, authentication pages, and a dashboard. The dashboard combines browser session state, a MetaMask/Ethers marketplace, JWT-protected pre-bookings and conversations, client-side simulated energy widgets, and four Chart.js canvases.

The implementation has a consistent card-based visual language, clear semantic energy colors, and a useful responsive utility layout. Its primary product-design limitation is that several visually mature dashboard surfaces use static or simulated values, and several presentational controls have no corresponding feature flow. The existing Solar Power interface is the strongest compatible surface for future ML integration because its input, loading, result, and KPI structures are already present.

## 2. Project Overview

| Attribute | Current implementation |
| --- | --- |
| Product | Renewable-energy marketplace and operational dashboard |
| Frontend model | Four static HTML pages with inline CSS and JavaScript |
| Main frontend directory | `energichain_backend/public/` |
| Page delivery | Express static middleware; conventional file URLs |
| Component framework | None; no React, Vue, Angular, JSX, or TSX |
| State model | `localStorage`, `sessionStorage`, DOM state, MetaMask provider state, backend API responses |
| Primary brand motif | Green energy gradient, lightning mark, white elevated cards, inline SVG |

## 3. Frontend Technology Architecture

| Layer | Technology | Implementation reference |
| --- | --- | --- |
| Markup | HTML5 | `energichain_backend/public/*.html` |
| Styling | Tailwind browser CDN plus each page’s inline `<style>` block | All public HTML files |
| Charting | Chart.js 4.4.3, served locally | `dashboard.html`; `/vendor/chart.js/chart.umd.js` |
| Web3 | Ethers UMD 6.13.1 plus MetaMask EIP-1193 provider | `dashboard.html` |
| Icons | Inline SVG paths | All public HTML files |
| Page interaction | Native DOM events and `fetch` | Inline scripts |
| Application storage | Browser Web Storage | Login, signup, dashboard scripts |
| Backend API | Same-origin Express routes | Relative URLs such as `/auth/login`, `/bookings/mine` |

The frontend has no build pipeline, route manifest, reusable component import graph, icon package, custom font package, CSS preprocessor, or design-token file.

## 4. Application Page Inventory

| Page | File path | Audience | Primary role |
| --- | --- | --- | --- |
| Landing Page | `energichain_backend/public/index.html` | Public | Product positioning and auth entry links |
| Login Page | `energichain_backend/public/login.html` | Returning users | Backend-first login with browser-local fallback |
| Signup Page | `energichain_backend/public/signup.html` | New/linking users | Backend account registration/linking with fallback |
| Dashboard | `energichain_backend/public/dashboard.html` | Authenticated users | Energy UI, wallet marketplace, bookings, messages, and charts |

## 5. Navigation and Routing

### Routing model

The application is multi-page rather than SPA-routed. Static URLs are `/`, `/index.html`, `/login.html`, `/signup.html`, and `/dashboard.html`. `src/app.js` mounts `public/` at the server root. There is no pathname router, nested route, route guard library, route parameter, or 404 UI implementation.

### Navigation behavior

| Surface | Mechanism | Existing behavior |
| --- | --- | --- |
| Landing navigation | `href="#features"`, `#use-cases`, `#about` | Smooth scroll when matching DOM target is found |
| Auth navigation | Relative file anchors | Traditional page navigation between Home, Login, and Sign Up |
| Dashboard sections | `.tab-btn[data-tab]` to `.tab-content[data-tab-content]` | Active button and visible panel are switched by `initTabs()` |
| Logout | `#logoutBtn` | Clears `sessionStorage`, then opens `login.html` |
| Wallet account/network change | MetaMask provider event listeners | Reloads the page after resetting active polling where applicable |

No sidebar, navigation drawer, breadcrumb, command menu, or mobile hamburger menu exists.

## 6. Global Design System

### Design principles evident in the implementation

1. **Energy-first semantic color.** Green is the default product/action color, with amber for solar, blue for wind, and violet for battery.
2. **Elevated white surfaces.** Important content is grouped in rounded, shadowed cards over a light neutral background.
3. **Inline iconography.** Icons are SVG rather than a third-party icon set.
4. **Motion as feedback.** Scroll reveals, shimmer button hovers, meter width transitions, and short toast fades provide emphasis.
5. **Utility-driven responsiveness.** Grid and spacing behavior is expressed with Tailwind responsive classes rather than custom layout components.

### Core surfaces

| Pattern | CSS / class | Visual specification |
| --- | --- | --- |
| Primary module | `.module-card` | White; `16px` radius; `1.5rem` padding; `1px solid #e5e7eb`; `0 4px 6px rgba(0,0,0,.07)` shadow; hover shadow increases to `0 12px 24px rgba(0,0,0,.12)` |
| KPI card | `.stat-card` | White; `12px` radius; `1.5rem` padding; `0 2px 4px rgba(0,0,0,.05)` shadow; hover moves up 2px and uses `0 8px 16px rgba(0,0,0,.1)` |
| Auth card | Tailwind utility combination | `max-w-md`, white, `rounded-3xl`, `shadow-2xl`, `p-8` |
| Landing benefit card | Tailwind utility combination | White, `p-10`, `rounded-2xl`, `shadow-lg`, `.hover-lift` |
| Energy meter | `.energy-meter` / `.energy-meter-fill` | 8px-high `#e5e7eb` track, 4px radius, clipped fill, .5s width transition |
| Notification | `.toast` | Fixed bottom-right, 8px radius, white text, 12px × 24px padding, 0.3s opacity fade |

## 7. Color Palette and Design Tokens

The custom colors below are literal source values. Tailwind gray/white entries are the default Tailwind utility values referenced in markup.

| Token | Color Name | HEX Value | Usage | Component |
| --- | --- | --- | --- | --- |
| Primary | Energy Green | `#10b981` | Primary gradient origin, success, green accent | `.energy-gradient`, `.toast-success`, meter fills |
| Primary Dark | Emerald Deep | `#059669` | Primary gradient midpoint / active tab border | `.energy-gradient`, `.tab-btn.active` |
| Primary Deep | Forest Green | `#047857` | Primary gradient end | `.energy-gradient` |
| Secondary | Emerald Light | `#34d399` | Alternate landing gradient accent | `.energy-gradient-alt` |
| Accent | Solar Amber | `#f59e0b` | Solar gradient, solar glow, warning, prediction border | `.solar-gradient`, `.toast-warning`, `.prediction-card` |
| Accent Dark | Solar Amber Dark | `#d97706` | Solar gradient midpoint/text gradient end | `.solar-gradient`, `.solar-text` |
| Accent Deep | Solar Brown | `#b45309` | Solar gradient end | `.solar-gradient` |
| Accent | Wind Blue | `#3b82f6` | Wind gradient start and chart line | `.wind-gradient`, production chart |
| Accent Dark | Wind Blue Dark | `#2563eb` | Wind gradient midpoint/text end | `.wind-gradient`, `.wind-text` |
| Accent Deep | Wind Navy | `#1d4ed8` | Wind gradient end | `.wind-gradient` |
| Accent | Battery Violet | `#8b5cf6` | Battery gradient start and mix segment | `.battery-gradient` |
| Accent Dark | Battery Violet Dark | `#7c3aed` | Battery gradient midpoint | `.battery-gradient` |
| Accent Deep | Battery Purple | `#6d28d9` | Battery gradient end | `.battery-gradient` |
| Background | Light Gray | `#f9fafb` | Body background via `bg-gray-50` | All pages |
| Surface | White | `#ffffff` | Cards, nav, footer, chart panels | `.module-card`, `.stat-card`, auth cards |
| Border / track | Gray 200 | `#e5e7eb` | Module borders, energy-meter track | `.module-card`, `.energy-meter` |
| Primary text | Gray 900 | `#111827` | Major headings and metrics | `text-gray-900` |
| Supporting text | Gray 600 | `#4b5563` | Descriptions, labels | `text-gray-600` |
| Success | Energy Green | `#10b981` | Success toast | `.toast-success` |
| Error | Red | `#ef4444` | Error toast and invalid field border | `.toast-error`, `.invalid` |
| Warning | Solar Amber | `#f59e0b` | Warning toast | `.toast-warning` |

### Gradient tokens

```css
/* Existing source definitions */
.energy-gradient  { background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%); }
.solar-gradient   { background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%); }
.wind-gradient    { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%); }
.battery-gradient { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%); }
```

## 8. Typography System

No custom font is declared. `font-sans` uses Tailwind’s system sans-serif stack. The values below are the Tailwind default scale used by the actual classes.

| Element | Font Family | Size | Weight | Line Height | Usage |
| --- | --- | --- | --- | --- |
| Landing H1 | System sans-serif | `3rem` (`text-5xl`), `4.5rem` at `md` (`text-7xl`) | 700 (`font-bold`) | 1 (`leading-tight` also applied) | Hero statement |
| Dashboard H1 | System sans-serif | `2.25rem` (`text-4xl`) | 700 | `2.5rem` | “Energy Dashboard” |
| Section H2 | System sans-serif | `1.5rem` (`text-2xl`) | 700 | `2rem` | Dashboard cards and tabs |
| Card H3 | System sans-serif | `1.25rem` (`text-xl`) or `1.125rem` (`text-lg`) | 700 | `1.75rem` | Card/chart titles |
| KPI metric | System sans-serif | `1.875rem` (`text-3xl`) | 700 | `2.25rem` | Dashboard KPI values |
| Prediction metric | System sans-serif | `2.25rem` (`text-4xl`) | 700 | `2.5rem` | Predicted AC power |
| Body | System sans-serif | `1rem` default; `1.125rem`/`1.25rem` in landing content | 400 | default browser/Tailwind behavior | Descriptions and main content |
| Label | System sans-serif | `.875rem` (`text-sm`) or base | 500/600 | `1.25rem` for `text-sm` | Inputs and compact UI labels |
| Caption | System sans-serif | `.75rem` (`text-xs`) | 400 | `1rem` | Ranges, timestamps, helper copy |
| Button | System sans-serif | Base, `.875rem`, or `1.125rem` (`text-lg`) by context | 600 | inherited | Primary and contextual actions |

Gradient headings use `background-clip:text` and transparent text fill; they are decorative treatments, not a separate typography family.

## 9. Spacing and Layout System

| Category | Existing specification | Evidence |
| --- | --- | --- |
| Global content width | `max-w-7xl mx-auto`; About uses `max-w-5xl`; auth card uses `max-w-md` | All page layouts |
| Horizontal page padding | `px-4` (1rem), `sm:px-6` (1.5rem), `lg:px-8` (2rem) | Nav and page containers |
| Fixed header height | `h-16` (4rem) | Landing/login/signup navs |
| Landing hero spacing | `pt-32 pb-20` | `index.html` |
| Dashboard content offset | `pt-24 pb-12` | `dashboard.html` |
| Common grid gaps | `gap-4`, `gap-5`, `gap-6`, `gap-8`, `gap-10`, `gap-16` | Forms, cards, sections |
| Dashboard KPIs | `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` | KPI row |
| Dashboard panels | `grid md:grid-cols-2`; solar fields extend to `lg:grid-cols-4` | Overview, booking, history, solar |
| Radius | 8px tab/button/input, 12px KPI, 16px module, Tailwind `rounded-2xl`/`rounded-3xl` on landing/auth | Inline CSS and utilities |
| Alignment | Flex-based `items-center`, `justify-between`, `justify-center`; grid for structured content | All pages |
| Borders | `1px solid #e5e7eb` module border; inputs use Tailwind `border` | Dashboard/input UI |

## 10. Button Design System

The project does not define an explicit pressed/active state. The table reports undefined states as such rather than inferring a design rule.

| Button Type | Background | Text Color | Border | Hover State | Active State | Disabled State |
| --- | --- | --- | --- | --- | --- | --- |
| Primary | Energy Green gradient | White | None specified | Shimmer pseudo-element, green 30px glow, `translateY(-2px)` | Not defined | Global opacity `.6`, no pointer events or glow |
| Secondary / neutral | `bg-gray-600` | White | None specified | Uses inherited `.btn-glow` where applied | Not defined | Global disabled behavior |
| Solar Action | Solar Amber gradient | White | None specified | Shimmer plus amber 30px glow (`.btn-solar-glow`) | Not defined | Global disabled behavior |
| Marketplace action | Runtime green Confirm, red Cancel, green-outline Open messages | White or green | Runtime class dependent | No explicit hover class in generated markup | Not defined | Native/runtime state only |
| Tab button | Green gradient when active; `#f3f4f6` when inactive | White active; `#6b7280` inactive | Active `2px #059669`; otherwise transparent | Inactive becomes `#e5e7eb` and `#374151` | Active state represented by `.active`, not press state | No tab-specific disabled style |
| Icon-bearing button | Same as parent action style | Inherits parent | Inherits parent | Inherits parent | Not defined | Inherits parent |

### Common button measurements and behavior

- Standard nav action: `px-6 py-2`, `rounded-lg`, `font-semibold`.
- Main prediction / sample action: `px-6 py-2.5`, `rounded-lg`, `font-semibold`.
- Full-width auth submit: `w-full py-3`, `rounded-lg`, `text-lg`, `font-semibold`.
- The interaction transition is `all 0.3s`; shimmer travel uses `0.5s`.
- `#predictBtn` and `#createOfferBtn` include hidden spinner containers. The prediction script changes button text to “Predicting…” while executing its synchronous client calculation. Offer creation changes text to “Sending…”.

## 11. Card and Widget Design System

| Component | File path | CSS class / ID | Purpose | Dependencies | Reusability |
| --- | --- | --- | --- | --- | --- |
| Module Card | `public/dashboard.html` | `.module-card` | Main dashboard content container | Inline CSS | Repeated across dashboard tabs |
| Stat Card | `public/dashboard.html` | `.stat-card` | KPI metric container | Inline CSS | Four repeated instances |
| Energy Meter | `public/dashboard.html` | `.energy-meter`, `.energy-meter-fill` | Visual proportional output/storage bar | Inline CSS and DOM updates | Repeated in KPI and wind status |
| Prediction Card | `public/dashboard.html` | `.prediction-card`, `#predictionResult` | Revealed solar result surface | Solar script | One instance |
| Auth Card | `login.html`, `signup.html` | Tailwind class combination | Centered auth form surface | Tailwind CDN | Repeated page pattern |
| Landing Feature Card | `index.html` | `.hover-lift` plus utilities | Marketing benefit surface | Inline CSS | Three repeated instances |
| Toast | `dashboard.html` | `#toast`, `.toast-*` | Fixed timed feedback | Dashboard script | One global target |
| Tab Button | `dashboard.html` | `.tab-btn` | Section selection | Dashboard script | Six instances |

There are no reusable component files or prop interfaces; this inventory documents reusable HTML/CSS patterns instead.

## 12. Table Design Specification

### Existing implementation

The current application uses cards and stacked lists rather than semantic HTML tables:

- Marketplace offers are generated as bordered `<div>` cards in `#offersContainer`.
- Bookings are generated as bordered `<article>` cards in `#bookingsContainer`.
- Messages are generated as bordered `<div>` cards in `#bookingMessages`.
- Accepted-offer history is generated as green-tinted `<div>` cards in `#acceptedContainer`.

The mobile `.table-container` overflow rule exists but no inspected markup uses a `<table>` or `.table-container`.

### Proposed future table specification — not currently implemented

| Column | Description | Data Type | Alignment | Formatting |
| --- | --- | --- | --- | --- |
| ID | Unique record identifier | Integer/string | Left | Monospaced text where practical |
| Timestamp | Measurement or transaction time | Datetime | Left | Single locale-aware date-time convention |
| Plant | Solar plant identifier | String | Left | Neutral badge when categorization is needed |
| Generation | Generated power/energy | Numeric | Right | Fixed decimal precision plus unit |
| Status | Booking/record state | Enum | Center | Semantic status badge |
| Actions | Contextual operations | Action group | Right | Compact icon/text buttons with labels |

**Proposed table requirements:** clear header hierarchy; consistent row height; subtle horizontal dividers; right-aligned numbers; left-aligned descriptive values; optional alternating backgrounds; status badges; row hover indication; explicit empty/loading/error states; search, sorting indicators, filters, pagination; responsive horizontal scroll; and keyboard-accessible actions. These are recommendations only and must not be interpreted as existing UI behavior.

## 13. Page-by-Page UI Analysis

### Landing Page

**Page purpose.** Introduce the EnergyChain marketplace and direct visitors to login or signup.

**Layout structure.** Fixed white navbar; centered green/emerald/teal hero; animated inline SVG energy-grid illustration; white trust bar; gray feature section; white two-column use-case section; light-green about section; footer.

| Component | Element ID / Class | Position | Visual Style | Functionality | Status |
| --- | --- | --- | --- | --- | --- |
| Header | `#navbar` | Fixed top | White, 4rem height, gradient wordmark | In-page and auth navigation | Implemented |
| Hero title | `text-5xl md:text-7xl` | Top content | Large bold dark/gradient text | Marketing content | Implemented |
| Hero action | `href="#signup"` | Hero CTA | Green gradient glow button | No matching target exists | Non-functional target |
| Trust bar | `border-y border-gray-200` | Below hero | White horizontal icon row | Display only | Implemented presentation |
| Benefit cards | `.hover-lift` | Features | White, rounded, elevated cards | Hover lift | Implemented |
| Use-case metric card | `.energy-gradient rounded-3xl` | Right use-case column | Green, large metric typography | Display only | Implemented presentation |
| Footer | `footer` | Bottom | White, top border | Copyright text | Implemented |

**Visual hierarchy.** Hero headline → product explanation/CTA → energy SVG → trust claims → benefits → use case/metrics → mission statement.

**Responsive behavior.** The main nav links hide below `md`; action links remain. Benefits become three columns at `md`; use case becomes two columns at `md`; base layouts stack below that threshold.

### Login Page

**Page purpose.** Authenticate an account and establish dashboard session storage.

**Layout structure.** Fixed branded nav; centered auth card on a full-height green gradient; footer.

| Component | Element ID / Class | Position | Visual Style | Functionality | Status |
| --- | --- | --- | --- | --- | --- |
| Header | `#navbar` | Fixed top | White navbar with Home/Sign Up actions | File navigation | Implemented |
| Login card | `max-w-md ... rounded-3xl shadow-2xl` | Center | Elevated white card | Holds form | Implemented |
| Login form | `#loginForm` | Card body | Labeled fields, green submit | Backend-first authentication/local fallback | Implemented |
| Remember Me | `#remember` | Form row | Native checkbox | No value is read | Non-functional behavior |
| Forgot Password | `href="#"` | Form row | Green text link | No handler | Non-functional |
| Footer | `footer` | Bottom | White bordered footer | Copyright display | Implemented |

**Visual hierarchy.** Brand/nav → “Log In” heading → email/password inputs → optional controls → primary action → registration prompt.

**Interaction behavior.** The form validates empty inputs in the browser, tries `POST /auth/login`, falls back to local browser users if necessary, alerts the outcome, and redirects on success. Entry card reveal is scroll/load driven.

### Signup Page

**Page purpose.** Register an account or link an existing browser-local account to the backend.

**Layout structure.** Matches the Login composition with alternate nav action order.

| Component | Element ID / Class | Position | Visual Style | Functionality | Status |
| --- | --- | --- | --- | --- | --- |
| Header | `#navbar` | Fixed top | White nav with Log In/Home | File navigation | Implemented |
| Signup card | `max-w-md ... rounded-3xl shadow-2xl` | Center | Elevated white card | Holds registration form | Implemented |
| Signup form | `#signupForm` | Card body | Name/email/password fields | Backend signup/login attempt plus local fallback | Implemented |
| Login prompt | link to `login.html` | Card bottom | Green text link | Opens login page | Implemented |
| Footer | `footer` | Bottom | White bordered footer | Copyright display | Implemented |

**Visual hierarchy.** Brand/nav → Sign Up heading → identity fields → primary action → login prompt.

**Interaction behavior.** Required fields are checked; the password must be at least six characters. Backend registration is attempted first, while a local storage record supports legacy fallback behavior.

### Dashboard

**Page purpose.** Provide authenticated energy visibility, wallet-connected marketplace capability, bookings, communications, and chart surfaces.

**Layout structure.** Fixed nav; full-width centered main container; wallet card; four KPI cards; horizontally scrollable tabs; one active content area; fixed toast.

| Component | Element ID / Class | Position | Visual Style | Functionality | Status |
| --- | --- | --- | --- | --- | --- |
| Header | Fixed `nav` / `#logoutBtn` | Top | White, shadowed | Clears session on logout | Implemented |
| Wallet card | `.module-card`, `#connectBtn` | Top of content | Centered white card | MetaMask network/account flow | Implemented |
| KPI row | `.stat-card` | Below wallet | Four responsive cards | Browser/contract-derived or simulated display | Implemented with mixed sources |
| Tab navigation | `.tab-btn` | Below KPIs | Green active/inactive gray | Switches panels | Implemented |
| Overview panel | `data-tab-content="overview"` | Active initially | Profile plus chart cards | Displays stored profile and static charts | Implemented |
| Solar panel | `data-tab-content="solar"` | Tab | Amber action/result system | Client heuristic prediction | Partially implemented ML claim |
| Wind panel | `data-tab-content="wind"` | Tab | Blue metric cards | Randomized five-second simulation | Simulated |
| Marketplace panel | `data-tab-content="marketplace"` | Tab | Offer form/list cards | Contract transactions and reads | Implemented |
| Pre-booking panel | `data-tab-content="bookings"` | Tab | Reservation/message cards | JWT booking APIs | Implemented for backend session |
| History panel | `data-tab-content="history"` | Tab | Accepted list and charts | Local/on-chain accepted-offer history | Implemented with local cache |

## 14. Dashboard Component Analysis

### Overview

| UI Element | Component ID | Purpose | Data Source | Display Type | Interaction |
| --- | --- | --- | --- | --- |
| Profile name/email | `#profileName`, `#profileEmail` | Identify signed-in user | `sessionStorage` | Text row | Set on DOM load |
| Wallet text | `#profileWallet` | Show connected address | Ethers signer | Code-styled text | Updated after wallet connection |
| Total Generation | `#totalGeneration` | Combined visible output | Solar UI value + simulated wind | KPI card | Refreshes every 3 seconds |
| Production Trend | `#productionChart` | Weekly energy illustration | Static arrays | Line chart | Repaint on Overview activation |
| Energy Mix | `#mixChart` | Energy-source proportion illustration | Static `[55,35,10]` | Doughnut chart | Repaint on Overview activation |

### Solar Power

| UI Element | Component ID | Purpose | Data Source | Display Type | Interaction |
| --- | --- | --- | --- | --- |
| Input group | `#solarDateTime`, `#solarIrradiation`, `#solarAmbient`, `#solarModule` | Capture weather/time inputs | User entry | Four-column responsive form | Validated in script |
| Predict action | `#predictBtn` | Calculate AC output | Browser heuristic | Solar gradient button | Shows spinner/text state |
| Sample action | `#fillSampleBtn` | Populate example input | Current time + hard-coded sample values | Neutral button | Fills inputs |
| Result | `#predictionResult`, `#predictedPower` | Show predicted output | Heuristic output | Amber result card | Reveals after prediction |

### Wind Energy

| UI Element | Component ID | Purpose | Data Source | Display Type | Interaction |
| --- | --- | --- | --- | --- |
| Wind speed | `#windSpeed` | Display speed | Random browser simulation | Blue metric card | Refreshes every 5 seconds |
| Power | `#windPower` | Display derived output | `speed × 0.7` | Blue metric card | Refreshes every 5 seconds |
| Efficiency | `#windEfficiency` | Display efficiency | Random integer simulation | Blue metric card | Refreshes every 5 seconds |
| Turbine status | Static markup | Illustrate two turbines | Static values | Meter/list widget | No data interaction |

### Marketplace

| UI Element | Component ID | Purpose | Data Source | Display Type | Interaction |
| --- | --- | --- | --- | --- |
| Offer form | `#userName`, `#priceEth` | Create offer | User input | Form card | Validates and sends contract transaction |
| Filter | `#showAllToggle` | Choose all vs user offers | UI state | Checkbox | Reloads offers |
| Sort | `#sortOffers` | Sort active offers | UI state | Select | Reloads/sorts offers |
| Offer list | `#offersContainer` | Display contract offers | Ethers reads | Generated cards | Accept/cancel based on owner |

### Pre-booking

| UI Element | Component ID | Purpose | Data Source | Display Type | Interaction |
| --- | --- | --- | --- | --- |
| Booking form | `#bookingForm` | Reserve planned energy | User input | Two-column form | Authenticated create request |
| Total | `#bookingTotal` | Estimate booking cost | Quantity × price | Inline metric | Updates on input |
| Booking list | `#bookingsContainer` | Show customer/provider bookings | `/bookings/mine` | Generated article cards | Refresh, confirm, cancel, open messages |
| Conversation | `#bookingMessages` | Show related messages | `/bookings/:id/messages` | Generated message cards | Loads per selected booking |

### History

| UI Element | Component ID | Purpose | Data Source | Display Type | Interaction |
| --- | --- | --- | --- | --- |
| Accepted list | `#acceptedContainer` | Record accepted offers | Local `acceptedOffers`, contract events | Green list cards | Updates after events/history query |
| Price History | `#priceChart` | Show active-offer prices | Loaded offer prices | Line chart | Updated by `loadOffers()` |
| Accepted by Seller | `#acceptedChart` | Show acceptance count by seller | Local accepted-offer cache | Pie chart | Updated after accepted-event handling |

## 15. Forms and Input Design

| Form | IDs | Existing visual treatment | Validation and feedback |
| --- | --- | --- | --- |
| Login | `#loginForm`, `#email`, `#password` | Labeled inputs; `px-4 py-3`, gray border, green focus border | HTML required plus `alert()` messages |
| Signup | `#signupForm`, `#name`, `#email`, `#password` | Same auth input system | HTML required; script enforces 6+ character password |
| Solar | Four `#solar*` inputs | Compact `px-3 py-2`, amber focus border, helper ranges | Missing/NaN error toast; irradiation warning |
| Offer creation | `#userName`, `#priceEth` | Two-column panel inputs | Inline hidden error text and `.invalid` red border |
| Booking | `#booking*` inputs | Two-column grid and conventional green focus border | Browser constraints plus server validation/error toast |
| Message | `#bookingMessageInput` | Single-line input with Send action | Disabled until selected conversation; 2,000-char maximum |

Inputs have associated labels in auth/booking UI. Solar labels are visual labels without `for` attributes; they remain adjacent to their inputs.

## 16. Chart and Visualization Design

| Chart | Chart Type | Data Source | X-Axis | Y-Axis | Purpose |
| --- | --- | --- | --- | --- | --- |
| Production Trend | Line | Static solar and wind arrays | Mon–Sun | “Energy (kWh)” | Illustrate a weekly trend |
| Energy Mix | Doughnut | Static Solar/Wind/Battery `[55,35,10]` | N/A | N/A | Illustrate source composition |
| Price History | Filled line | Active offer `priceEth` values | Offer ID | “Price (ETH)” | Compare current marketplace offer prices |
| Accepted Offers | Pie | Count of local accepted offers by seller | N/A | N/A | Show seller distribution |

### Existing chart standards

- All charts set `responsive: true` and `maintainAspectRatio: true`.
- Production Trend colors: solar `#f59e0b` / `rgba(245,158,11,.1)` and wind `#3b82f6` / `rgba(59,130,246,.1)`.
- Price History uses `#10b981`, `rgba(16,185,129,.2)`, fill, and `tension: .4`.
- Energy Mix uses `#f59e0b`, `#3b82f6`, and `#8b5cf6`, with 2px white segment borders.
- Legends are top-positioned for production and accepted pie; Energy Mix legend is right-positioned. Chart.js default tooltips are not overridden.
- No chart has a custom empty/error state; a canvas still initializes with static/placeholder data.

## 17. Component Inventory

| Component | File Path | CSS Class | Purpose | Dependencies | Reusability |
| --- | --- | --- | --- | --- | --- |
| Brand gradient | All `public/*.html` | `.energy-gradient`, `.gradient-text` | Consistent energy brand treatment | Inline CSS | High |
| Button glow | All `public/*.html` | `.btn-glow` | Action hover shimmer and elevation | Inline CSS | High |
| Reveal motion | Landing/login/signup | `.reveal*` | Scroll/load entry transitions | DOM scroll listeners | High across marketing/auth |
| Module Card | `public/dashboard.html` | `.module-card` | Dashboard panel surface | Inline CSS | High |
| Stat Card | `public/dashboard.html` | `.stat-card` | Dashboard KPI surface | Inline CSS | High |
| Tab Button | `public/dashboard.html` | `.tab-btn` | Dashboard tab navigation | `initTabs()` | High |
| Toast | `public/dashboard.html` | `.toast`, `.toast-*` | Notification feedback | `showToast()` | Global singleton |
| Energy Meter | `public/dashboard.html` | `.energy-meter` | Capacity/progress visualization | Inline CSS | Medium |
| Prediction Card | `public/dashboard.html` | `.prediction-card` | Solar output result | Solar script | Low |

## 18. Interaction and Animation Specification

| Interaction | Existing implementation | Timing / state |
| --- | --- | --- |
| Scroll reveal | `.reveal`, `.reveal-left`, `.reveal-right`, `.reveal-scale` become `.active` | `.8s cubic-bezier(.16,1,.3,1)`; 80px reveal threshold |
| Landing SVG float | `.float-animation` | 3s ease-in-out loop; 20px vertical movement |
| Button glow | `.btn-glow::before` | 0.5s left-to-right sweep; 0.3s transition |
| Card hover | `.stat-card`, `.module-card`, `.hover-lift` | 0.3–0.4s transitions |
| Meter update | `.energy-meter-fill` | Width transition `0.5s ease` |
| Toast | `.toast.show` | 0.3s opacity; removed after 3 seconds by script |
| Dashboard stats | `updateDashboardStats()` | Invoked every 3 seconds |
| Wind simulation | `updateWindData()` | Invoked every 5 seconds |
| Marketplace polling | `startPolling()` | Invoked every 30 seconds after wallet connection |

No modal open/close transitions, drag interactions, or custom chart animations are explicitly configured.

## 19. Responsive Design Specification

| Breakpoint / state | Existing rules |
| --- | --- |
| Base/mobile | Single-column dashboard KPIs; cards retain full width; tab strip is horizontally scrollable; landing desktop anchor navigation is hidden |
| `sm` / 640px | Page horizontal padding changes from 1rem to 1.5rem where `sm:px-6` appears |
| `md` / 768px | Landing feature cards form three columns; use-case grid becomes two columns; dashboard KPI becomes two columns; dashboard panel grids become two columns; hero headline increases to `text-7xl` |
| `lg` / 1024px | Dashboard KPI row becomes four columns; Solar form becomes four columns; page horizontal padding can become 2rem (`lg:px-8`) |
| `max-width: 640px` custom CSS | Canvas max-width 100%; stat/module padding reduced to 1rem; tab padding reduced to `.5rem 1rem`; tab text becomes `.875rem` |

Responsive behavior is layout-oriented. No page implements a responsive navigation drawer, mobile menu, alternate chart mode, or breakpoint-specific data density change.

## 20. Accessibility Analysis

### Existing strengths

- Authentication and booking inputs have visible labels and native input types.
- Buttons use native `<button>` elements.
- Disabled controls use both visual opacity and disabled pointer behavior.
- Dashboard tabs are keyboard-focusable buttons, even though ARIA tab roles/attributes are absent.
- Semantic headings establish a visible content hierarchy.

### Existing limitations

| Current situation | Accessibility implication | Priority |
| --- | --- | --- |
| Inline SVGs generally have no accessible name or `aria-hidden` declaration | Decorative/meaning ambiguity for assistive technology | Medium |
| Canvas charts have no alternative text/data summary | Chart information is not exposed as text | High |
| Toast is not marked as live region | Async feedback may not be announced | High |
| Tab buttons lack `role="tab"`, `aria-selected`, and tabpanel semantics | State is not fully communicated to assistive technology | Medium |
| Gradient text can depend on transparent glyph fill | Contrast/readability may vary by browser/forced-color settings | Medium |
| Error handling often uses browser `alert()` or visual toast | Field-specific programmatic error association is limited | Medium |
| “Forgot Password?” and similar `#` links are focusable but non-functional | Creates a misleading keyboard stop | Low |

These are audit findings, not implemented changes.

## 21. API and Data Integration

| UI consumer | Endpoint | Method | Request | Authentication | UI response handling |
| --- | --- | --- | --- | --- | --- |
| Login form | `/auth/login` | POST | `{ email, password }` | None | JWT/user persisted to session storage; redirects to dashboard |
| Signup form | `/auth/signup` | POST | `{ name, email, password }` | None | JWT/user persisted; may attempt login for an existing backend user |
| Booking list | `/bookings/mine` | GET | None | Bearer JWT | Renders booking cards |
| Booking create | `/bookings` | POST | Provider email, schedule, units, unit price | Bearer JWT | Shows toast and refreshes list |
| Booking state | `/bookings/:id/status` | PATCH | `confirmed` or `cancelled` status | Bearer JWT | Refreshes list and selected conversation |
| Booking messages | `/bookings/:id/messages` | GET/POST | None / `{ body }` | Bearer JWT | Renders/sends message cards |
| Contract config | `/config/contract_address.json` | GET | None | None | Resolves chain-specific contract address |

The dashboard uses Ethers directly for marketplace data and transactions rather than a REST marketplace API. The UI does not call the implemented server endpoints `/predict`, `/trade/create`, or `/trade/mine`.

## 22. ML Integration UI Compatibility

### Existing compatible surfaces

| Surface | Existing UI contract | Compatibility note |
| --- | --- | --- |
| Solar input row | `#solarDateTime`, `#solarIrradiation`, `#solarAmbient`, `#solarModule` | Matches expected temporal/weather input collection without adding controls |
| Prediction action | `#predictBtn`, `#predictText`, `#predictSpinner` | Existing loading affordance can represent asynchronous API work |
| Result card | `#predictionResult`, `#predictedPower` | Existing output placement can display returned `AC_POWER` |
| Input echo | `#resultIrradiation`, `#resultAmbient`, `#resultModule`, `#resultTime` | Can continue showing prediction context |
| KPI dependency | `#totalGeneration` reads displayed predicted power | Existing downstream widget remains compatible |
| Production Trend chart | `#productionChart` | Could later receive actual/predicted time series; currently static |

### Verified implementation boundary

The existing Solar UI describes itself as AI-powered, but `predictSolarPower()` uses a client-side mathematical heuristic. It does not call the backend `/predict` route, the Python model script, or `energichain_backend/model_train/`. A future model integration should preserve current IDs, result card, validation messages, and visual hierarchy rather than replace the UI.

## 23. Existing UI Limitations

1. Several dashboard metrics and chart series are simulated or static rather than service-backed.
2. The landing CTA and selected auth links are visible but do not resolve to implemented flows.
3. There is no user-facing API error state beyond toast/alert text in most flows.
4. The dashboard has no semantic HTML tables, plant selector, export action, search field, pagination, or data-download control.
5. Visual status labels such as “Live Data,” “Real-time,” and “AI-Powered” exceed what the associated client-only implementations currently prove.
6. The dashboard relies on CDN-hosted Tailwind and Ethers; only Chart.js is served locally.
7. The fixed navigation patterns have no mobile menu alternative.

## 24. Professional UI Improvement Recommendations

The following are recommendations, not current features or requested source changes.

| Current Situation | Identified Issue | Recommended Improvement | Priority | Existing Functionality Impact |
| --- | --- | --- | --- | --- |
| Solar card is labeled AI-powered but runs a heuristic | Product claim and implementation diverge | Connect existing form/result contract to validated model API and disclose model state | Critical | Preserve existing IDs, layout, and result interaction |
| Overview charts use static arrays | Users cannot distinguish sample from production data | Label sample state until live series is supplied; later bind same chart instances to real arrays | High | No visual redesign required |
| Charts lack text alternatives | Canvas data is inaccessible | Provide adjacent compact summaries and accessible descriptions | High | Additive only |
| Toast has no live region | Async feedback may be missed | Use an ARIA live status container while retaining current toast visual | High | Additive only |
| Non-functional `#` links | Misleading affordances | Hide until implemented or connect to valid route/section | Medium | Removes dead-end behavior |
| No dedicated mobile menu | Desktop nav has limited small-screen navigation | Add a controlled mobile navigation pattern only if navigation grows | Medium | Requires new UI, keep current links intact |
| Card lists carry tabular data | Comparisons can be difficult at scale | Introduce a responsive table only for dense historical/list views; retain cards for conversational mobile views | Medium | Future additive surface |
| Input errors use alerts/toasts | Errors are not consistently field-associated | Add inline error IDs and `aria-describedby` while retaining toast summaries | Medium | Improves current validation UX |
| Color gradients carry meaning | Forced-color/contrast cases may reduce readability | Validate contrast and provide non-gradient fallback text color | Medium | Styling hardening only |
| Local browser credential fallback exists | Browser-stored legacy identity is not equivalent to backend auth | Continue migration toward backend sessions while preserving compatibility during transition | High | Must preserve current fallback until a migration is approved |

## 25. Frontend Preservation Checklist

- [ ] Preserve page entry files and relative navigation links.
- [ ] Preserve dashboard element IDs consumed by scripts, including solar, chart, offer, booking, and toast IDs.
- [ ] Preserve `data-tab` and `data-tab-content` names and active/hidden switch behavior.
- [ ] Preserve `.energy-gradient`, `.solar-gradient`, `.wind-gradient`, `.battery-gradient`, `.module-card`, `.stat-card`, `.tab-btn`, and `.btn-glow` visual contracts unless intentionally versioned.
- [ ] Preserve the local Chart.js route `/vendor/chart.js/chart.umd.js` or coordinate any replacement with the dashboard script.
- [ ] Preserve MetaMask Sepolia chain handling and `contract_address.json` lookup before modifying marketplace functions.
- [ ] Preserve same-origin booking API paths and `Authorization: Bearer <JWT>` behavior.
- [ ] Preserve the Solar form/result IDs and total-generation linkage when integrating ML.
- [ ] Keep proposed table, accessibility, and responsiveness improvements distinct from existing behavior until separately approved.

## 26. Final Technical Summary

EnergyChain’s frontend is a static HTML implementation with an identifiable renewable-energy brand system: green gradients, elevated white cards, amber/blue/violet energy categories, inline SVG imagery, and utility-class responsive layout. The application is not component-framework based; reusable behavior lives in repeated CSS patterns and page-local JavaScript.

The dashboard is the highest-value product surface. Its MetaMask marketplace and JWT-backed booking workflows are implemented, while its solar, wind, battery, and overview analytics surfaces have mixed data maturity. The current frontend already provides a stable visual contract for ML integration through the Solar Power tab. Any future enhancement should retain its semantic color system, card hierarchy, element IDs, loading/result behavior, and responsive structure.
