# Agent Rules

## Ground Truth (Verified from Backend)

- Products: GET /api/products (public, filterable/sortable), GET /api/products/categories, GET /api/products/:slug, GET /api/products/admin/all (admin, includes inactive), POST/PATCH/DELETE /api/products (admin). Product fields: name, slug, description, price, images[], category, stock, isActive, averageRating, reviewCount. There is NO SKU field, NO material/wood-type field, NO piece-count field.
- Cart: all routes require auth (GET /cart, POST /cart/items, PATCH /cart/items/:productId, DELETE /cart/items/:productId, POST /cart/merge, POST /cart/validate [public]). No guest cart is persisted server-side.
- Wishlist: GET/POST/DELETE /wishlist(/:productId), all auth-required, backed by User.wishlist: ObjectId[].
- Reviews: GET /api/reviews?product=&page=&limit= (public), POST/PATCH/DELETE /api/reviews (auth; PATCH/DELETE owner-or-admin). createReviewSchema: {product: ObjectId, rating: int 1-5, comment: string <=1000, default ""}. One review per user per product is enforced by a unique index — a second POST for the same product must be treated as "edit your existing review," not a generic error. List response: {success, items, total, page, limit, totalPages}. Single: {success, review}.
- Discounts: POST /api/discounts/validate (public, rate-limited) — body {code: string, items: [{product: ObjectId, quantity: int>=1}]}, recomputes pricing server-side. POST/GET/PATCH/DELETE /api/discounts (admin only).
- Orders: POST/GET /api/orders (auth, own orders only — GET is hardcoded to the requesting user, there is NO "list all orders" endpoint for admins). GET /api/orders/:id (owner or admin). PATCH /api/orders/:id/status (admin only). Status enum is EXACTLY: pending | paid | shipped | delivered | cancelled. Legal transitions: pending->paid|cancelled, paid->shipped|cancelled, shipped->delivered, delivered/cancelled terminal. createOrderSchema: {items: [{product, quantity 1-100}] (1-50 items), shippingAddress: {street, city, state, zipCode, country}, discountCode?}. There is NO paymentMethod field anywhere in this schema.
- Payments: POST /api/payments/checkout-session (auth) — body {orderId} ONLY, response {success, url}. Redirect the browser to url. Order becomes "paid" asynchronously via Stripe webhook, never synchronously from this call. Return URLs: /orders/:id?payment=success|cancelled — always re-fetch the order on return, never trust the query param as the actual status.
- Account: GET/PUT /api/account/profile. updateProfileSchema: {name?, email?, addresses?: Address[] max 10}. Address: {street, city, state, zipCode, country}. There is NO password-change endpoint and NO notification-preferences field anywhere on the User model.
- Contact: POST /api/contact (public) — {name, email, subject, message}. GET /api/contact and PATCH /api/contact/:id/status (admin only, status: unread|read|resolved). This is a FLAT one-shot message inbox — there is no reply field, no conversation thread, no attachments, no linkage to orders.
- Auth: POST /auth/register, /auth/login, /auth/logout only.
- Error envelope everywhere: {success: false, message, errors?: [{path, message}]}. 400 for Zod validation, 409 for duplicate key.

## Known-Broken Existing Code

frontend/src/features/orders/ordersApi.ts currently invents a paymentMethod field, uses a wrong status enum (missing "paid", misspells cancelled), uses postalCode instead of zipCode+state, and calls two endpoints that don't exist (PUT /orders/:id/cancel, GET /admin/orders). Do not fix it in this phase — just note it in the audit doc; Phase 3 fixes it.

## Cut List (Blocked/No backend support)

- Admin dashboard revenue/AOV/analytics (no aggregation endpoint)
- Admin "all orders" table (no list-all endpoint)
- CSV export, Invoice PDF download
- Live courier map / waybill tracking
- Two-way support ticket conversation UI, reply threads, templates, memos
- "Missing Piece Guarantee" replacement-piece claims tied to CNC coordinates
- Saved Payment Methods tab
- Security & Keys / change-password tab
- Notification-preferences ("Atelier Preferences") toggles
- Product SKU / material / piece-count display or admin fields

## Standing Rules (For Every Future Phase)

- Inspect the actual backend file before writing frontend code against anything not already locked above.
- No fake/mock/hardcoded data standing in for a real API response.
- No AI-slop visuals (no purple glow, glassmorphism, giant rounded containers, glowing buttons).
- Decision order when ambiguous: real backend contract > existing app behavior > existing architecture > design intent > least invasive > best UX > best performance > best maintainability.
- Work on branch frontend-completion. Commit and push after this phase.
- End this phase with a checkpoint in exactly this format:

  ### Checkpoint — Phase 1
  git diff --stat (real output): <paste>
  Build output (real `npm run build` log): <paste>
  Commit: <hash> — pushed to frontend-completion
  Verified: <only claims backed by the output above>
  Deferred/blocked: <anything you couldn't verify>
