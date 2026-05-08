# Open4Printing

A custom-print ecommerce store: customers browse products, configure options, upload artwork, and place orders. Admins log in to manage orders, payments, and product catalog.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (auto-seeds default admin + product catalog)
- `pnpm --filter @workspace/open4printing run dev` — run the web frontend
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from `lib/api-spec/openapi.yaml`
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

### Required env

- `DATABASE_URL` — Postgres connection string
- `SESSION_SECRET` — secret used to sign admin session JWT

### Optional env (see `.env.example`)

- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — overrides for the seeded admin user (defaults: `admin@open4printing.com` / `admin123`)
- `AUTHORIZE_NET_API_LOGIN_ID` / `AUTHORIZE_NET_TRANSACTION_KEY` / `AUTHORIZE_NET_ENVIRONMENT` — when set, the `/api/payments/authorize-net/charge` endpoint should call the live Authorize.net API. When unset, payments fall back to test/manual mode and orders stay in `pending_payment` until an admin marks them paid.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5, JWT cookie sessions for admin (`bcryptjs`, `jsonwebtoken`)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (request bodies, params, queries, and responses → Zod schemas + React Query hooks)
- File uploads: `multer` disk storage at `artifacts/api-server/uploads/` (50 MB limit, common print formats only)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/db/src/schema/` — Drizzle tables: `products`, `customers`, `orders`, `orderItems`, `uploadedFiles`, `payments`, `adminUsers` (+ `ORDER_STATUSES` and `PAYMENT_STATUSES` enums)
- `lib/api-spec/openapi.yaml` — single source of truth for the API contract
- `lib/api-zod/` and `lib/api-client-react/` — generated Zod validators and React Query hooks (do not edit `generated/`)
- `artifacts/api-server/src/routes/` — Express routes (`orders`, `admin`, `adminOrders`, `adminProducts`, `adminDashboard`, `uploads`, `payments`)
- `artifacts/api-server/src/lib/` — `auth.ts` (JWT cookies + `requireAdmin`), `payments/authorize-net.ts` (env-driven stub), `notifications.ts` (email stubs), `seed.ts` (admin user + ~67 products)
- `artifacts/open4printing/src/pages/` — public pages plus `Checkout.tsx`, `OrderConfirmation.tsx`, and `admin/*` (login, dashboard, orders, order detail, products)

## Architecture decisions

- **OpenAPI-first**: every route's body/params/query/response shape comes from `openapi.yaml`. The API server validates with the generated Zod schemas; the frontend uses the generated hooks. Add a route by editing the spec, running codegen, then wiring up the server handler and the page.
- **Admin auth = JWT in HttpOnly cookie**, signed with `SESSION_SECRET`. Cookies are SameSite=Lax, 7-day expiry. The frontend just calls `useAdminMe()`; the cookie travels automatically.
- **Payment provider is pluggable**: the `chargeCard` helper in `payments/authorize-net.ts` returns success in test/manual mode when env vars are absent. Swap in the real Authorize.net call without touching the route.
- **Uploads are decoupled from orders**: clients `POST /api/uploads` first (gets back a file id), then attach `uploadedFileIds` per item when creating the order. This keeps the order request small and lets the upload happen as soon as the file is picked.
- **Order numbers** are human-readable (`O4P-YYYYMMDD-HHMMSS`) and used as the public lookup key on the confirmation page; the numeric `id` stays internal.

## Product

- Catalog browse, product detail with configurator (size/material/finish/turnaround/quantity)
- Persistent localStorage cart
- Real checkout: contact + billing/shipping address + per-item file uploads → creates an order in Postgres and shows an order-confirmation page
- Order confirmation page lookup by order number
- Admin area at `/admin` (login at `/admin/login`):
  - Dashboard with KPI tiles + recent orders
  - Orders list with search and status filters
  - Order detail with payment/order status updates and per-item file downloads
  - Products management (price, name, description, enabled flag)

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- **Generated names follow operationId**: response Zod schemas are `GetXResponse` / `ListXResponse`, not the `XResponse` aliases in `types/`. The barrel re-exports types explicitly to avoid colliding with same-named runtime Zod schemas — when adding a new schema to `openapi.yaml`, also add its TS type to the explicit `export type { … }` list in `lib/api-zod/src/index.ts`.
- The `lib/db` package is composite — after editing `lib/db/src/`, run `pnpm run typecheck:libs` so consumers see the new types.
- The default seeded admin password is for development only — change `ADMIN_PASSWORD` (or update the row directly) before deploying.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
