# MissingPiece — Engineering Documentation

MissingPiece is a full-stack e-commerce application for custom/artisan wooden puzzles. It has a feature-based Node.js/Express/MongoDB backend and a React/TypeScript frontend, deployed as separate Vercel projects (serverless backend, static frontend).

This document is written for engineers working on the codebase: what each feature does, how it's secured, how it performs under load, what data-integrity guarantees exist, and what real problems came up building it (with the fixes).

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Architecture](#architecture)
3. [Cross-Cutting Security](#cross-cutting-security)
4. [Feature-by-Feature Breakdown](#feature-by-feature-breakdown)
5. [Performance Notes](#performance-notes)
6. [Data Integrity & Concurrency](#data-integrity--concurrency)
7. [Testing Strategy](#testing-strategy)
8. [Deployment (Vercel)](#deployment-vercel)
9. [Known Limitations & Trade-offs](#known-limitations--trade-offs)
10. [Engineering Challenges We Hit](#engineering-challenges-we-hit)
11. [Setup Instructions](#setup-instructions)

---

## Tech Stack

**Backend:** Node.js, Express 5, TypeScript, MongoDB (Mongoose 9), Redis (ioredis), Stripe, Nodemailer (Gmail SMTP), Cloudinary, Zod, Jest + Supertest + mongodb-memory-server.

**Frontend:** React 19, TypeScript, Vite, TailwindCSS 4, React Router 7, Axios, Vitest + React Testing Library.

**Infra:** Vercel (serverless functions for the API, static hosting for the SPA), MongoDB Atlas, a managed Redis instance, Stripe Checkout, Cloudinary for image storage.

---

## Architecture

Both `backend/` and `frontend/` use a **feature-based** structure instead of a layer-based one (no global `controllers/`, `models/`, `services/` folders). Each domain owns its own slice:

```
backend/src/features/<feature>/
  <feature>.model.ts       # Mongoose schema
  <feature>.controller.ts  # HTTP layer — parses input, calls service, shapes response
  <feature>.service.ts     # Business logic, DB access
  <feature>.validation.ts  # Zod schemas
  <feature>.routes.ts      # Route wiring + middleware composition
```

Cross-feature code lives in `backend/src/shared/` (middleware, config, utils) and `frontend/src/shared/` (UI kit, hooks, context, i18n).

**Why this matters:** every route's authorization and validation is visible in one file (`*.routes.ts`) instead of scattered across a global router. When reviewing a PR that touches an endpoint, you can see the full middleware chain — auth, rate limiting, admin check, step-up — in one line.

The controller/service split is consistent everywhere: **controllers never touch Mongoose directly**, and **services never touch `req`/`res`**. This keeps business logic testable in isolation (see [Testing Strategy](#testing-strategy)) and keeps HTTP concerns (status codes, `req.userId`) out of anything reusable.

---

## Cross-Cutting Security

These apply across nearly every route, so they're documented once here rather than repeated per feature.

### Authentication
- **JWT, HS256, 7-day expiry**, signed with `JWT_SECRET`. Verified with an explicit `algorithms: ["HS256"]` allow-list (`requireAuth.ts`) — this blocks the classic **JWT `alg: none` / algorithm-confusion attack**, where a token with no signature or a mismatched algorithm is accepted.
- **Server-side token revocation.** Because JWTs are stateless, logging out, changing a password, or being suspended can't invalidate an existing token by itself. We solve this with a **Redis-backed revocation timestamp** per user (`tokenRevocation.ts`): every token's `iat` is checked against `revoke:user:<id>` on each authenticated request. Changing your password, logging out, or an admin suspending your account all bump this timestamp, which invalidates *every* previously issued token immediately — not just the one in the current request.
- **Fail-open on Redis outage for revocation checks**, but **fail-closed on Redis outage for rate limiting** (see below) — a deliberate asymmetry: a Redis outage should not lock every user out of the app, but it also shouldn't let brute-force traffic through unlimited.

### Authorization
- **Role-based access control** (`buyer` / `admin`) enforced server-side via `requireAdmin` middleware on every admin route — never inferred from the frontend.
- **IDOR protection.** Every resource that belongs to a user (orders, cart, wishlist, addresses) is fetched scoped to `req.userId` at the query level (e.g. `Order.findOne({ _id, user: userId })`), not fetched by ID and checked after the fact. This is enforced consistently across `orders`, `cart`, `wishlist`, and `reviews` (ownership or admin check before mutation).
- **Step-up (re-authentication) for destructive actions.** `requireStepUp` demands the user's current password in the request body before: promoting/demoting an admin, suspending/reactivating a user, or cancelling/refunding an order. This limits the blast radius of a stolen session token for the highest-impact actions.
- **Self-protection guards** — an admin cannot demote their own role or suspend their own account (`admin.controller.ts`), preventing accidental lockout.

### Input Validation
- **Every request body/query is parsed through a Zod schema** before touching a service — nothing reaches Mongoose unvalidated. Errors are converted to structured `400` responses (`errorHandler.ts`) with field-level messages, so the frontend never has to guess what failed.
- **Regex-escaped search input.** `product.service.ts` escapes user search terms (`replace(/[.*+?^${}()|[\]\\]/g, '\\$&')`) before building a MongoDB `$regex` filter — without this, a search string like `(a+)+$` could be used for a **ReDoS (Regular Expression Denial of Service)** attack against Mongo's regex engine.
- **Password policy** enforced by Zod (min 8 chars, upper/lower/symbol) on register, reset, and change-password — consistently, not duplicated with different rules in different places.

### Rate Limiting
All limiters are Redis-backed (`rate-limit-redis`) so they work correctly across multiple serverless instances — an in-memory limiter would reset per cold start and be trivially bypassed. Highlights:

| Route | Limit | Why |
|---|---|---|
| `POST /auth/login` | 10 / 15 min per IP | brute-force protection |
| `POST /auth/register` | 10 / 15 min per IP | signup abuse / spam accounts |
| `POST /auth/resend-verification` | 3 / 5 min per IP | prevents OTP email flooding |
| `POST /contact` | 5 / 15 min per IP | spam form submissions |
| `POST /payments/checkout-session` | 10 / min per user | Stripe API abuse |
| Admin write routes | 50 / 15 min per user | protects DB + audit log from scripted abuse |

Limiters key by **user ID when authenticated, IP bucket otherwise** — an authenticated user can't dodge their limit by rotating IPs behind a shared connection.

**Explicit fail-open policy** (`passOnStoreError: true`): if Redis is unreachable, requests are allowed through rather than the whole API 503-ing. This is a deliberate availability-over-strictness trade-off — see [Known Limitations](#known-limitations--trade-offs).

### Transport & Headers
- **Helmet** for standard security headers, with `crossOriginResourcePolicy: cross-origin` explicitly set because the API and frontend are on different origins (Vercel projects) and the frontend needs to read API responses.
- **Strict CORS allow-list** built from `CORS_ORIGIN` env var, not a wildcard — falls back to known dev/prod origins only if unset.
- **`trust proxy` set to `1`** so `req.ip` reflects the real client IP behind Vercel's proxy — without this, every request would appear to come from the same IP and per-IP rate limiting would be useless.
- **Body size capped at 100kb** (`express.json({ limit: "100kb" })`) to blunt large-payload DoS attempts.
- **Stripe webhook route is registered with `express.raw()` *before* the global `express.json()` middleware.** Stripe signature verification requires the exact raw request bytes — if JSON body parsing ran first, the signature check would always fail (or worse, be silently skippable).

### Secrets & Error Handling
- No secrets are ever hardcoded; all read from `process.env` with explicit "missing env var" errors at startup/first-use rather than failing silently or falling back to an insecure default.
- The global error handler returns the real error message only when it's a deliberately-thrown `ApiError` with a status code; any unexpected (`500`) error is logged server-side and returned to the client as a generic `"Internal Server Error"` — stack traces and internal details never leak to the response body.
- Mongoose `CastError` (malformed ObjectId) and duplicate-key errors (`code 11000`) are caught centrally and converted to proper `400`/`409` responses instead of leaking as `500`s with driver internals.

### File Uploads
- `multer` with **memory storage** (never written to disk on the serverless function), a **5MB per-file / 10-file cap**, and a MIME-type filter that only accepts `image/*` — rejecting anything else before it reaches Cloudinary.

---

## Feature-by-Feature Breakdown

### Auth (`features/auth`)
Register, login, logout, forgot/reset password, email verification — all OTP-based (6-digit code, 10-minute expiry, **bcrypt-hashed at rest**, never stored or logged in plaintext).

- **Security:** Passwords hashed with bcrypt (cost factor 12). Login and registration responses never reveal *which* field was wrong ("Invalid email or password" for both). `forgotPassword` and `resendVerificationCode` always return a generic success message regardless of whether the account exists — this prevents **user enumeration** via timing or response differences.
- **Data integrity:** Email verification is idempotent — calling it twice on an already-verified account is a no-op rather than an error, so a user double-clicking a verification link doesn't get a confusing failure.
- **Performance:** OTP generation and hashing happen synchronously in the request; registration doesn't block on the email actually sending — if the email provider is down, the account is still created and `emailSent: false` is returned, with the user able to request a resend.

### Account (`features/account`)
Profile view/edit, password change, avatar upload, address book.

- **Security:** Changing your password calls `revokeAllUserTokens`, invalidating every other active session — closing the window where a stolen token would otherwise keep working after the legitimate user changes their password. New password is checked to differ from the current one.
- **Data integrity:** Addresses are **soft-deleted** (`deletedAt` timestamp) rather than removed from the array, so historical orders that reference a shipping address by value (not reference — see Orders below) are unaffected by a user deleting an address later.

### Products (`features/products`)
Public catalog with filtering, category aliasing, text search, and cursor/offset pagination; admin CRUD with image upload.

- **Performance:** Compound indexes on `{isActive, category, price}` and `{isActive, price}` support the common filter+sort combinations without a collection scan. A **weighted text index** (`name` ×10, `slug` ×5, `description` ×1) means a product name match ranks above an incidental description match. List queries run `.lean()` (skip Mongoose document hydration) since results are read-only JSON.
- **Data integrity:** Product deletion is a **soft delete** (`isActive: false`) — a discontinued product still resolves correctly in historical orders and reviews instead of leaving a dangling reference. Slug is **not regenerated on rename**, so existing bookmarks/links to a product stay valid even after its name changes. Slug collisions on creation are handled by retrying with a numeric suffix (`-1`, `-2`) rather than failing the request.

### Cart (`features/cart`)
Per-user server-side cart (not client-only), with add/update/remove/merge (guest → account) and a stock/availability re-validation endpoint.

- **Concurrency:** `addItem` uses an **atomic aggregation-pipeline `findOneAndUpdate`** to increment quantity if the item already exists, falling back to an atomic `$push` with an `upsert` if it doesn't — with a bounded retry loop (max 3 attempts) to handle the race where two "add to cart" clicks land concurrently and both miss the increment branch. This avoids the classic read-modify-write race (read cart → mutate in app code → write back) that would silently drop one of two concurrent adds.
- **Data integrity:** `validateCartItems` re-checks live stock/price/active-status right before checkout, so a stale client-side cart (item went out of stock or was discontinued minutes ago) is caught before an order is created rather than after payment.

### Orders (`features/orders`)
Order creation, listing (own + admin), cancellation, and a strict admin status **state machine**.

- **Data integrity:** `createOrder` runs inside a **MongoDB transaction** (`withTransaction`, with retry on `TransientTransactionError` and a resilient `commitWithRetry` for `UnknownTransactionCommitResult`): stock is decremented, the discount usage counter is incremented, and the order document is created **atomically** — if any step fails (e.g. insufficient stock on item 3 of 5), the whole order and all prior stock decrements roll back. Without this, a partial failure could silently oversell stock.
- **Authorization / state machine:** Status transitions are governed by an explicit allow-list (`pending → paid/cancelled`, `paid → shipped/cancelled/refunded`, etc.) — an admin cannot skip a shipped order straight to refunded without it having been paid first, and a delivered order can't be "cancelled." Buyers can only self-cancel their *own* order, and only while it's still `pending`.
- **Data integrity:** Cancelling or refunding an order **restores stock** for every line item, and `priceAtPurchase` is snapshotted onto the order at creation time — later product price changes never retroactively affect an existing order's total.
- **Performance:** Admin listing supports filtering by status/date range/amount and a text-ish user search, backed by `{user, createdAt}` and `{status, createdAt}` indexes. CSV export is capped at 5,000 rows and properly escapes quotes/commas per RFC 4180 to prevent a malformed export (and incidentally guards against **CSV/formula injection** into fields like customer name if opened in Excel — values are quoted, though a defense-in-depth improvement would be to prefix leading `=`/`+`/`-`/`@` characters).
- **A pragmatic simplification worth flagging:** orders auto-transition to `delivered` on a short timer (`AUTO_DELIVERY_DELAY_MS`, currently 90 seconds) rather than via a real shipping/carrier integration. This is clearly a placeholder for demo/dev purposes — see [Known Limitations](#known-limitations--trade-offs).

### Payments (`features/payments`)
Stripe Checkout session creation + webhook handling.

- **Security:** The webhook handler verifies the Stripe signature (`stripe.webhooks.constructEvent`) against `STRIPE_WEBHOOK_SECRET` before trusting *any* payload — an unsigned or forged webhook is rejected with `400` before it can mark an order paid.
- **Data integrity — idempotency:** Every processed webhook event ID is written to a **unique-indexed** `WebhookEvent` collection first; a duplicate event ID (Stripe *will* retry deliveries) hits a `code 11000` and is treated as already-processed, so a retried webhook can never double-fulfill an order. The order is only flipped `pending → paid` (never paid twice, and only from `pending`), which also protects against replaying an old event out of order.
- **Trust boundary:** The checkout total is **never** taken from the client — it's read from `order.totalAmount`, which was computed server-side in `order.service.createOrder` from live product prices and validated discount logic. The client can never manipulate what it pays.
- **Environment safety:** `getFrontendBaseUrl()` explicitly refuses to redirect a *production* Stripe session back to `localhost`, even if `FRONTEND_URL` is misconfigured — falling back to the CORS origin list or a hardcoded production URL instead. (This exact bug — a prod checkout redirecting to a dev URL — is captured in the commit history; see [Engineering Challenges](#engineering-challenges-we-hit).)

### Discounts (`features/discounts`)
Admin-managed percentage/fixed codes, product-scoped or storewide, with usage caps and validity windows.

- **Data integrity:** `incrementDiscountUsage` is an **atomic conditional update** (`$expr: { $lt: ["$usesCount", "$maxUses"] }` in the query filter, not checked-then-incremented in application code) — this closes a **TOCTOU (time-of-check-to-time-of-use) race** where two concurrent checkouts using the last remaining use of a capped code could otherwise both succeed and push usage over the cap.
- **Correctness:** Discount math is centralized in one pure function (`calculateDiscount`) used identically by both the pre-checkout `/discounts/validate` preview endpoint and the actual `order.service.createOrder` — so what the user is shown before paying is guaranteed to match what they're actually charged. The amount is clamped to never exceed the applicable subtotal or go negative.

### Reviews (`features/reviews`)
Product reviews with a moderation workflow.

- **Business rule enforcement:** A review can only be created if the user has a **delivered** order containing that product (`Order.exists({ user, status: "delivered", "items.product" })`) — this isn't just a UX nicety, it's checked server-side and prevents fake/incentivized reviews from non-purchasers.
- **Data integrity:** One review per user per product is enforced with a **unique compound index** (`{product, user}`), not just application logic — so even a race between two rapid duplicate submissions can't create two reviews.
- **Consistency:** `Product.averageRating`/`reviewCount` are denormalized onto the product document for fast reads on the product list, and recalculated via a Mongo aggregation every time a review is created/updated/deleted/moderated — keeping the read-heavy product list fast without a live join on every request.
- **Moderation:** Public listing only ever returns `status: "approved"` reviews; pending/flagged/rejected ones are only visible via the admin endpoint.

### Wishlist (`features/wishlist`)
Simple add/remove backed by `$addToSet`/`$pull` on the user document — inherently idempotent and race-safe (adding the same product twice, even concurrently, can't create duplicates).

### Contact (`features/contact`)
Public contact form + admin inbox (status, assignment, notes).

- **Security:** Submission is the most heavily rate-limited public write in the app (5 / 15 min per IP) since it's an unauthenticated write endpoint and an obvious spam target.

### FAQ (`features/faq`)
Bilingual (EN/AR) content management with a draft/published workflow. `localizeFaq` gracefully degrades legacy single-language records so an older document (from before bilingual fields existed) doesn't break the API contract — a small but deliberate backward-compatibility shim.

### Admin Dashboard (`features/admin`)
Aggregated metrics (today's orders/revenue, pending reviews, unread inquiries, user/product counts, order-status breakdown, recent orders) — all queries run in parallel with `Promise.all` rather than sequentially, and use Mongo aggregation (`$group`, `$sum`) for the revenue total instead of pulling documents into Node to sum in application code.

### Audit Log (`features/audit`)
Every admin mutation (role change, suspension, product/discount/FAQ CRUD, order status change, CSV export) is written to an immutable, admin-only-readable log with actor, action, target resource, a details payload, and IP address.

- **Security posture:** Logging is deliberately **best-effort and non-blocking** — a failure to write the audit log is caught and logged to the server console, but never throws, so an audit-log outage can't be used to block or roll back the underlying admin action. This is a conscious availability/auditability trade-off, called out explicitly in a code comment for future reviewers.

---

## Performance Notes

- **Indexing is deliberate, not default.** Every list/filter endpoint has a matching compound index reflecting its actual query shape (see Products, Orders above) rather than relying on single-field indexes and letting Mongo figure it out.
- **`.lean()` everywhere reads outnumber writes.** List and detail GET endpoints skip Mongoose document hydration since the data is serialized straight to JSON and never mutated in-process.
- **Parallel independent queries** via `Promise.all` throughout (admin dashboard, paginated list + count, order + CSV export) instead of sequential `await`s.
- **Cursor-friendly pagination** is available on the product list (`nextCursor` based on `_id`) alongside classic page/limit, for infinite-scroll-style UIs without the "skip N" performance cliff on deep pages.
- **Images are offloaded to Cloudinary**, never stored in Mongo or served from the API process — uploads stream directly from memory to Cloudinary without touching disk.
- **Denormalized aggregates** (product `averageRating`/`reviewCount`) trade a small amount of write-time cost (recalculate on every review change) for cheap reads on the highest-traffic page (product list).
- **Serverless cold-start awareness:** Redis uses `lazyConnect: true` so a TCP connection isn't opened at module-import time (which would slow every cold start); MongoDB connection is checked/established per-request via middleware (`connectDB()` is idempotent — see `db.ts`) since serverless functions don't have a long-lived process to hold a connection open between invocations.

---

## Data Integrity & Concurrency

Summarizing the mechanisms used across features, since they follow a consistent philosophy:

| Mechanism | Used for | Prevents |
|---|---|---|
| MongoDB multi-document transactions (`withTransaction`, with commit/transient-error retry) | Order creation | Partial writes (stock decremented but order not created, or vice versa) |
| Atomic aggregation-pipeline update | Cart item increment | Lost updates from concurrent "add to cart" |
| Atomic conditional update (`$expr` in filter) | Discount usage cap | TOCTOU race on the last use of a capped code |
| Unique compound index | Reviews (`product`+`user`), Cart (`userId`) | Duplicate rows even under a race, at the DB layer, not just app logic |
| Unique index + idempotency check | Stripe webhook events | Double-processing a retried webhook |
| Explicit status state machine | Order status transitions | Invalid/out-of-order state changes |
| Soft deletes | Products, addresses | Dangling references in historical orders/reviews |
| Server-recomputed totals | Cart validation, order creation, discount calculation | Client-supplied prices ever being trusted |

---

## Testing Strategy

**Backend** (`Jest` + `Supertest` + `mongodb-memory-server`, run via `npm test` in `backend/`): tests spin up a real in-memory MongoDB instance rather than mocking Mongoose, so query behavior (indexes, unique constraints, transactions) is exercised for real. Redis is mocked (`ioredis-mock`) in tests since it doesn't support transactions the same way and isn't the focus of most test scenarios — documented in `backend/.npmrc` as a known, intentional peer-dependency pin.

Current coverage focuses on the highest-risk logic:
- `order.service` — including a dedicated `orderStateMachine.test.ts` for the transition allow-list
- `auth.service`, `auth.routes` — registration/login/OTP flows
- `account.service`, `cart.service`, `discount.service`, `payment.service`, `product.service` (including the category-filter aliasing), `review.service`, `wishlist.service`, `contact.service`
- `requireAuth` / `requireAdmin` middleware in isolation
- A top-level `app.test.ts` smoke test for the Express app wiring

**Frontend** (`Vitest` + `React Testing Library`, `npm test` in `frontend/`): component and integration tests for the login form, admin products page (including an auth-gating test — `AdminMessagesPageAuth.test.tsx`), storefront flows, order flows, and shared UI primitives (`Button`, `SearchInput`, `useDebounce`, `ThemeContext`).

**CI** (`.github/workflows/ci.yaml`): both backend and frontend jobs run **lint → build → test** on every push/PR to `main`, backend against a real Redis service container. This is a hard gate — a change that breaks the type build or a test fails CI before merge.


---

## Deployment (Vercel)

Backend and frontend are **separate Vercel projects** (`backend/vercel.json`, `frontend/vercel.json`), not a monorepo single deploy — this is why CORS, not same-origin cookies, is the security boundary between them (see [Known Limitations](#known-limitations--trade-offs)).

The backend runs as Vercel serverless functions, which shapes several decisions already covered above: lazy Redis connection, idempotent per-request Mongo connection, and a `/api/health` liveness endpoint that doesn't depend on Mongo being reachable (so it can't falsely report unhealthy during a DB blip).

---

## Known Limitations & Trade-offs

Being direct about these, since a README that only lists strengths isn't useful to the next engineer:

- **JWT is stored in `localStorage` on the frontend** (`api/client.ts`, `AuthContext.tsx`), not an `httpOnly` cookie. This is simpler across two different Vercel origins (no cross-site cookie complexity) but means **a successful XSS on the frontend can steal the token directly** via JavaScript. An `httpOnly` cookie would not eliminate XSS risk entirely but would prevent token theft specifically. If the frontend ever takes on more third-party scripts or user-generated HTML rendering, this should be revisited.
- **Admin route protection in the frontend (`ProtectedRoute`) is UX-only.** The real enforcement is `requireAdmin` on the backend — this is correct and by design, but worth stating explicitly so nobody mistakes the frontend guard for a security boundary.
- **Rate limiting fails open if Redis is down.** This is a deliberate availability trade-off (documented above), but it does mean a simultaneous Redis outage + brute-force attempt would go unthrottled. Worth monitoring Redis availability as its own alert.
- **OTP codes (login reset / email verification) have no per-account lockout after N wrong guesses** — only the surrounding endpoint's IP-based rate limit (`verifyEmailLimiter`: 10/15min) constrains brute-forcing a 6-digit code. Combined with the rate limit and 10-minute expiry this is a reasonable posture (1,000,000 possible codes, ≤10 guesses per 15 minutes per IP), but a dedicated per-OTP attempt counter would be stronger.
- **Order auto-delivery is a timer (90 seconds), not a real fulfillment/carrier integration.** Fine for demo/dev; would need replacing with real shipment tracking before this could be a production storefront.
- **Audit logging is best-effort, not guaranteed.** A logging failure never blocks the admin action it's describing (a deliberate choice — see Audit Log section), but that also means the audit trail isn't a strict compliance-grade guarantee.
- **Admin CSV exports quote fields but don't explicitly neutralize leading `=`/`+`/`-`/`@` characters**, which is the standard mitigation for CSV/formula-injection when a file is opened in Excel/Sheets. Low risk here since the exported fields are names/emails/addresses rather than admin-controlled free text, but worth hardening if export scope grows.

---

## Engineering Challenges We Hit

These are grounded in the actual commit history, not hypothetical — real problems that came up getting this deployed and stable:

- **Email provider swap mid-build.** The project started on Resend, but hit sandbox-mode restrictions that blocked real delivery without a verified domain. It was replaced with Nodemailer over Gmail SMTP, with a **visible console fallback** (`logDevFallback`) that prints the OTP directly when no email credentials are configured — so local development never blocks on having a working mailbox.
- **Vercel serverless + Express friction.** Several fixes were needed to get Express 5 running cleanly as a Vercel function: `helmet`'s CJS-only type definitions didn't resolve correctly under `NodeNext` module resolution on Vercel's build (worked around with an explicit cast — see the comment in `app.ts`), `express-rate-limit`'s named import needed adjusting for the Vercel TypeScript build, and Redis needed `lazyConnect: true` to avoid opening a connection at cold-start import time.
- **CORS + `helmet`'s Cross-Origin-Resource-Policy interaction.** Because the frontend and backend are deployed as separate Vercel projects (different origins), `helmet`'s default CORP header initially blocked the frontend from reading API responses even with CORS configured correctly — resolved by explicitly setting `crossOriginResourcePolicy: { policy: "cross-origin" }`.
- **Stripe redirecting to the wrong environment.** A misconfigured/missing `FRONTEND_URL` in production could cause a live Stripe Checkout session to redirect back to `localhost` after payment. Fixed with `getFrontendBaseUrl()`'s explicit production/localhost guard, falling back through `CORS_ORIGIN` and finally a hardcoded production URL rather than ever trusting an unsafe configured value in prod.
- **TypeScript strict-mode cleanup.** An early pass through the codebase replaced `any` types and loose `FilterQuery` usage with proper typed interfaces (`AppError`, typed service params) — this is why controllers and services consistently type their inputs/outputs today rather than passing `any` through the stack.
- **Merging parallel feature branches.** Multiple commits ("perfectly merge PR 19 logic keeping local UI", "save local frontend and backend improvements before merging") reflect integrating concurrent work on cart/wishlist API contracts, i18n/RTL support, and the account/orders UI without regressing either side — a reminder that the feature-based folder structure (each domain self-contained) made these merges tractable rather than one giant conflicting diff.
- **Bilingual (EN/AR) content and RTL support** were added as a dedicated phase rather than bolted on — this is reflected in the FAQ model's `questionEn`/`questionAr` split (with a compatibility shim for older single-language records) and the frontend's full `en`/`ar` locale tree under `shared/i18n/locales/`.

---

## Setup Instructions

### Environment Variables

**Backend (`backend/.env`)** — see `backend/.env.example`:
`MONGO_URI`, `PORT`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `FRONTEND_URL`, `CORS_ORIGIN`, `REDIS_URL`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

**Frontend (`frontend/.env`)** — see `frontend/.env.example`:
`VITE_API_BASE_URL` (e.g. `http://localhost:5000/api` locally, or the deployed backend's `/api` URL in production).

### Installation

```bash
cd backend
npm install

cd ../frontend
npm install
```

### Running Development Servers

```bash
# Backend
cd backend
npm run dev

# Frontend
cd ../frontend
npm run dev
```

### Running Tests

```bash
# Backend (spins up an in-memory MongoDB)
cd backend
npm test

# Frontend
cd ../frontend
npm test
```

### Seeding Data

```bash
cd backend
npm run seed
```