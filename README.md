# Rukhsar Commerce Platform

Rukhsar is a premium saree and ethnicwear commerce monorepo with a Next.js storefront, an Express API, shared design/config packages, and a Prisma schema for future database-backed expansion.

## Stack

- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS
- Backend: Express, TypeScript, Zod, JWT auth
- Shared packages: `@rukhsar/types`, `@rukhsar/config`, `@rukhsar/ui`
- Preview data layer: file-backed JSON store at `apps/api/data/store.json`
- Database scaffolding: Prisma + PostgreSQL schema in `prisma/schema.prisma`

## Workspace Layout

- `apps/web`: storefront and admin UI
- `apps/api`: REST API
- `packages/types`: shared domain types
- `packages/config`: brand tokens and navigation
- `packages/ui`: shared UI primitives
- `prisma`: future production schema and seed scaffolding

## Local Setup

1. Install dependencies:

```powershell
npm.cmd install
```

2. Copy environment files:

```powershell
Copy-Item .env.example .env
Copy-Item apps/web/.env.example apps/web/.env.local
Copy-Item apps/api/.env.example apps/api/.env
```

3. Start the API:

```powershell
npm.cmd run start --workspace @rukhsar/api
```

4. Start the storefront in a second terminal:

```powershell
npm.cmd run dev:web
```

5. Open the app:

- Storefront: [http://localhost:3000](http://localhost:3000)
- Admin login: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- API health: [http://localhost:4000/health](http://localhost:4000/health)

## Preview Credentials

- Admin: `demo@rukhsar.in` / `password123`
- Customer: `shopper@rukhsar.in` / `password123`

## What Works In Preview

- Homepage and editorial storefront
- Product listing with category, fabric, price, and sort filters
- Product detail pages with in-stock size selection
- Cart and checkout flow
- Coupon validation and coupon-aware order totals
- Razorpay-ready checkout stub plus COD flow
- Order tracking and signed-in customer order history
- Admin dashboard, products, coupons, inventory, orders, customers, and analytics

## Data Layer Notes

- The current preview experience uses `apps/api/data/store.json` as the source of truth.
- Admin edits and newly placed orders update that JSON store immediately.
- Prisma and PostgreSQL remain in the repo as production scaffolding, but they are not required for local preview.
- If you want to adopt PostgreSQL later, treat the Prisma schema as the target model and migrate the file-store utilities gradually rather than mixing both write paths.

## Useful Commands

```powershell
npm.cmd run dev:web
npm.cmd run dev:api
npm.cmd run typecheck
npm.cmd run build --workspace @rukhsar/api
npm.cmd run build --workspace @rukhsar/web
```

## Production Deployment

### Frontend on Vercel

1. Import the repo into Vercel.
2. Set the root directory to `apps/web` if deploying as a standalone project.
3. Add environment variables:
   - `NEXT_PUBLIC_API_URL`
   - `NEXT_PUBLIC_SITE_URL`
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID`
4. Point `NEXT_PUBLIC_API_URL` to your deployed API base URL.

### API on Node Server / Render / Railway / VPS

1. Deploy `apps/api` as a Node service.
2. Install dependencies from the monorepo root or with workspace-aware CI.
3. Set environment variables:
   - `PORT`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `NEXT_PUBLIC_SITE_URL`
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
4. Start with:

```powershell
npm.cmd run build --workspace @rukhsar/api
npm.cmd run start --workspace @rukhsar/api
```

### Important Production Recommendation

Move the API away from file-backed JSON storage before handling real customer traffic. The current file store is good for preview, demos, and admin testing, but production should use PostgreSQL or another transactional database for orders, customers, and inventory.

## Environment Variables

Root `.env.example` includes the shared values used by both apps:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SITE_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `DATABASE_URL`

## Verification Status

- `npm.cmd run typecheck --workspace @rukhsar/web`: passes
- `npm.cmd run typecheck --workspace @rukhsar/api`: passes
- `npm.cmd run build --workspace @rukhsar/api`: passes

`next build` for `@rukhsar/web` compiles successfully in this environment, but the final process exits with a Windows `spawn EPERM` after compilation. That appears to be an environment/process-permission issue rather than an application compile failure.
