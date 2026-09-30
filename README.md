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
pnpm dev              # http://localhost:5174
```

To run a demo locally:

1. Start the BlueMonk backend (`bluemonk-db-prod`) at `localhost:8080`.
2. Log in to the admin app, generate an Integration API Key for an
   application, copy it.
3. Open this app, paste the API base URL (`http://localhost:8080`) and the
   key into the setup screen.
4. Edit the cart, apply coupons, watch the inspector show the engine's
   decisions in real time.

The dev server runs on `http://localhost:5174` (pinned so it doesn't clash with
the admin app). Its origin isn't in the backend's default CORS allowlist, so
instead of `http://localhost:8080` paste **`/api-local`** as the base URL — Vite
proxies it to `localhost:8080` server-to-server. The backend resolves the tenant
from the Host header, so this targets the tenant whose domain is `localhost`.

## Customers and journeys

Each connect, reload, reconfigure or **New customer** click creates a fresh
customer and signs it up with `PUT /v1/customers/{id}?runRuleEngine=true`
before the first session call. That fires `customerProfileCreated`, which is
what enrolls the customer into `user_signed_up` journeys (a session upsert
would create the customer silently and skip them). **Start a new order** keeps
the same customer, so journey vouchers unlocked by one order can be redeemed in
the next.

- **Journeys tab** — `GET /v1/customers/{id}/journeys`: every journey the
  customer is in, with step progress, the live voucher code, expiry and unlock
  hints. **Use in cart** applies the voucher (starting a new order if the last
  one was placed).
- **Wallet** — live journey vouchers appear above the static demo vouchers.
- **Checkout** — a closed session is what enrolls `first_purchase` /
  `coupon_redeemed` journeys and advances a step whose voucher was redeemed.
  Journeys are re-read after checkout; changes show as toasts and on the
  order-placed screen.
- **Dev drawer** — the customer ID, the sign-up call's effects
  (`enrollInJourney` = an entry rule fired; enrollment is confirmed by the
  journeys read) and the raw journeys response.

Steps with an activation delay stay locked until the backend **worker**'s
reconcile cron (every 10 min) activates them.

## Configuration

| Env var | Purpose |
|---|---|
| `VITE_INTEGRATION_API_BASE_URL` | Default BlueMonk API base URL pre-filled on the setup screen. The user can still override per session. |

## Backend dependency — journeys

Journeys need a backend with the journeys feature (Integration API
`/v1/customers/{id}/journeys`) and at least one **enabled** journey on the
key's application. Against a backend without it, the Journeys tab just shows
the empty state.

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
