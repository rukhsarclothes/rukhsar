# Architecture Notes

## Storefront

- App Router storefront and admin routes live in `apps/web/app`
- Shared catalog seed data currently powers the initial UI
- Routes are organized for store, auth, and admin experiences

## API

- Express app mounts versioned REST routes at `/api/v1`
- Service modules currently use mock-friendly sample data while Prisma schema is prepared for persistent storage
- JWT auth scaffolding is in place for customer and admin access

## Integrations

- Razorpay, Shiprocket, and notification providers are represented through payment and shipping route contracts
- The repository is ready for service-layer expansion once credentials are configured
