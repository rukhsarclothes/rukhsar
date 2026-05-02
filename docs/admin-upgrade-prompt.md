# Prompt: Upgrade Rukhsar Admin Panel Into a Launch-Ready Operations System

```text
Upgrade the existing Rukhsar admin portal into a clean, premium, fully functional internal operations platform for day-to-day business management.

Project context:
- Brand: Rukhsar, a premium women's ethnic and contemporary clothing brand from Aurangabad, Maharashtra, India
- Frontend storefront and admin portal must remain clearly separated
- Admin login/session must remain isolated from customer login/session
- The admin panel is an internal business tool, not a themed extension of the customer storefront
- The design language should feel refined, confident, operational, and fast to scan

Technology decisions already made:
- Frontend: Next.js App Router with TypeScript and Tailwind CSS
- API: Node.js + Express + TypeScript
- Shared types package for Products, Orders, Coupons, Users, Inventory, and Reviews
- Current persistence layer: file-backed JSON store for local/dev preview, but structure all APIs as if they can later move to PostgreSQL without changing the admin UX contract
- Protected admin APIs use bearer token auth and role checks

Implementation goal:
Turn the admin area into a launch-ready operational workspace that supports the founder or operations manager running catalog, fulfillment, promotions, customer follow-up, and business monitoring smoothly.

Non-negotiable product requirements:

1. Admin separation and access control
- Keep `/admin/*` on its own shell and layout
- Keep admin auth and customer auth fully separate in storage, routing, and guard logic
- Redirect unauthenticated admin users to `/admin/login`
- Do not expose admin components or admin navigation in the customer storefront

2. Dashboard
- Build a real operations dashboard, not a decorative analytics page
- Show summary cards for:
  - Total revenue
  - Total orders
  - Customer count
  - Low-stock SKU count
  - Open or in-progress orders
- Include:
  - Recent orders feed
  - Top-performing products
  - Customer highlights
  - Action queue / alert cards for low stock, pending payments, or fulfillment backlog
- Labels must be business-friendly and immediately understandable by a non-technical founder

3. Product operations
- Show a searchable, filterable product catalog
- Support create product flow with:
  - Name
  - Slug
  - Category
  - Collection
  - Base price
  - Sale price
  - Fabric
  - Color
  - Short description
  - Long description
  - Sizes
  - Product status: active, draft, archived
- Support editing existing products
- Support soft-archive behavior instead of destructive deletion
- Keep archived products out of storefront-facing product APIs
- Show useful operational metadata such as total stock and status

4. Order operations
- Show a searchable, filterable order queue
- Each order card or row should clearly show:
  - Order number
  - Customer name
  - Total amount
  - Payment status
  - Fulfillment status
  - Tracking number
  - Order date
- Allow inline fulfillment status updates
- Persist order status updates
- Display order timeline entries
- If order items are available, show product lines with quantity and unit price

5. Inventory operations
- Show SKU-level stock across variants
- Include search by style, size, color, or SKU
- Include low-stock filtering
- Visually highlight urgent low-stock rows
- Allow inline stock updates with persistence

6. Coupon and promotion operations
- Show a promotions library with search
- Support create and edit flows for coupons
- Coupon fields:
  - Code
  - Description
  - Discount type
  - Discount value
  - Minimum order value
  - Active / inactive state
- Support pausing and reactivating coupons without deleting them
- Coupon validation logic must reject inactive coupons

7. Customer operations
- Show customer list separately from admin users
- Support search by name or email
- Show operational CRM signals:
  - Order count
  - Total spend
  - Last order date
- Surface top customers on dashboard and analytics pages

8. Analytics
- Keep analytics pragmatic and operational
- Include:
  - Average order value
  - Repeat customer rate
  - Conversion proxy or placeholder if live traffic analytics is unavailable
  - Top products by revenue/units sold
  - Best customers by spend
- If historical order item data is incomplete, calculate what is reliable and clearly structure the code to improve accuracy later

9. API requirements
- Replace any placeholder admin endpoints with real persistent behavior
- Admin APIs should include:
  - `GET /admin/dashboard`
  - `GET /admin/products`
  - `GET /admin/orders`
  - `GET /admin/inventory`
  - `GET /admin/coupons`
  - `GET /admin/customers`
  - `GET /admin/analytics`
  - `POST /products`
  - `PATCH /products/:id`
  - `DELETE /products/:id` as soft-archive
  - `PATCH /orders/:id/status`
  - `PATCH /admin/inventory/:variantId`
  - `POST /coupons/admin/coupons`
  - `PATCH /coupons/admin/coupons/:id`
- All admin write operations must require authenticated admin access

10. UX and design direction
- Make the admin visually distinct from the storefront
- Use compact but elegant layouts that prioritize scan speed and confidence
- Prefer cards, sections, toolbars, status pills, and operational forms
- Provide strong loading states and clear success feedback
- Avoid storefront hero-style composition inside the admin area
- Keep spacing, typography, and action placement consistent

11. Code organization
- Keep reusable admin data fetchers in a dedicated admin API utility file
- Keep major admin screens implemented as dedicated client components
- Separate shared UI helpers from API logic
- Keep file naming predictable and maintainable

Suggested file ownership:
- `apps/api/src/common/utils/file-store.ts`
- `apps/api/src/modules/admin/admin.routes.ts`
- `apps/api/src/modules/products/products.routes.ts`
- `apps/api/src/modules/orders/orders.routes.ts`
- `apps/api/src/modules/coupons/coupons.routes.ts`
- `apps/api/src/modules/inventory/inventory.routes.ts`
- `apps/web/lib/admin-api.ts`
- `apps/web/components/admin/admin-clients.tsx`
- `apps/web/app/admin/dashboard/page.tsx`
- `apps/web/app/admin/products/page.tsx`
- `apps/web/app/admin/orders/page.tsx`
- `apps/web/app/admin/inventory/page.tsx`
- `apps/web/app/admin/coupons/page.tsx`
- `apps/web/app/admin/customers/page.tsx`
- `apps/web/app/admin/analytics/page.tsx`

Expected outcome:
- The admin panel should feel ready for real business use by a small fashion brand
- Founders should be able to manage stock, products, orders, offers, and customer insights without touching code
- The implementation should compile, typecheck, build, and run locally with a clean preview
```
