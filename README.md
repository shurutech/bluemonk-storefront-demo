# BlueMonk Demo Storefront

Internal-only demo storefront for BlueMonk sales calls. Simulates a customer
cart against the public Integration API to showcase real-time rule
evaluation, coupon redemption, and discount calculation.

This app is **not customer-facing**. It exists so the BlueMonk sales /
solutions team can demo the promotion engine on prospect calls without
falling back to Postman / Yaak.

## How it works

The storefront is a self-contained React app. It has no admin login of its
own — the user pastes a BlueMonk **Application API key** on the setup screen,
and that key is the credential the storefront uses to call the engine.

Whichever tenant + application the API key was created in, that's whose
campaign rules get evaluated against the cart.

```
┌─────────────────────────┐         ┌──────────────────────────┐
│  Demo Storefront         │  HTTP  │  BlueMonk backend         │
│  (this app)              │ ─────▶ │                           │
│                          │ X-API- │  Integration API          │
│  - cart simulation       │  Key   │  /v1/sessions/{id}        │
│  - coupon input          │        │                           │
│  - real-time inspector   │        │  routes by API key →      │
│                          │        │  tenant + application     │
└─────────────────────────┘         └──────────────────────────┘
```

## Tech stack

- React 19 + TypeScript + Vite
- Tailwind CSS 4
- Radix UI primitives (shadcn-style component pattern)
- React Hook Form, Sonner, Lucide

## Local development

```bash
pnpm install
cp .env.example .env  # adjust VITE_INTEGRATION_API_BASE_URL to your local backend
pnpm dev              # http://localhost:5173
```

To run a demo locally:

1. Start the BlueMonk backend (`bluemonk-db-prod`) at `localhost:8080`.
2. Log in to the admin app, generate an Integration API Key for an
   application, copy it.
3. Open this app, paste the API base URL (`http://localhost:8080`) and the
   key into the setup screen.
4. Edit the cart, apply coupons, watch the inspector show the engine's
   decisions in real time.

## Configuration

| Env var | Purpose |
|---|---|
| `VITE_INTEGRATION_API_BASE_URL` | Default BlueMonk API base URL pre-filled on the setup screen. The user can still override per session. |

## Components lifted from `bluemonk-web`

The visual components (cart, inspector, effect cards, etc.) were originally
prototyped inside the admin app on the archived branch
`archive/demo-storefront-frontend`. They were lifted into this repo when the
team decided to host the storefront as its own app rather than embedding it
in the admin sidebar.

## Backend dependency

The storefront uses the existing public Integration API. There are no new
backend endpoints. The only backend requirement is:

- `X-API-Key` must be in the CORS allowlist of the BlueMonk backend (so the
  browser can send it on preflight).
- The storefront's deployed origin must be in `ALLOWED_CORS_ORIGINS`.

## Scripts

```bash
pnpm dev           # Vite dev server
pnpm build         # production build (tsc + vite build)
pnpm preview       # serve the production build locally
pnpm lint          # ESLint
pnpm format        # Prettier write
pnpm format:check  # Prettier check
```
