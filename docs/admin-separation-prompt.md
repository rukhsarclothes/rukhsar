# Prompt: Separate Customer Storefront and Admin Portal

Use this prompt when you want an AI coding agent to properly separate a customer-facing commerce frontend from an internal admin system.

```text
Refactor the application so the customer storefront and admin portal are clearly separated products inside the same codebase.

Requirements:

1. Customer storefront
- Keep customer pages under the public shopping experience
- Use customer navigation only
- Do not expose admin links in the storefront header or footer
- Keep customer login and account flows separate from admin authentication
- If an admin account attempts to use the customer login, show a message directing them to the admin portal

2. Admin portal
- Admin must have a dedicated login route such as /admin/login
- Admin dashboard must live under /admin/dashboard
- /admin should redirect to /admin/login when logged out and /admin/dashboard when logged in
- Admin pages must not render the customer header, footer, or storefront navigation
- Use a dedicated admin shell with its own sidebar or top navigation
- Protect admin routes so unauthenticated users are redirected to the admin login
- If a non-admin customer account attempts to use the admin login, block access

3. Session separation
- Maintain separate storage and session state for customer users and admin users
- Customer logout must not affect admin login state
- Admin logout must not affect customer session state

4. UX and architecture
- Use a different visual shell for admin so it feels like an internal operations workspace
- Keep admin pages focused on products, orders, inventory, coupons, customers, and analytics
- Preserve existing customer shopping flows
- Ensure route structure, redirects, and protected navigation work in production builds

5. Verification
- Run typecheck
- Run production build
- Verify storefront routes still work
- Verify /admin, /admin/login, and /admin/dashboard route behavior
- Verify customer and admin logins remain isolated
```
