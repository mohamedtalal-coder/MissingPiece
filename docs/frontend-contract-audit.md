# Frontend Contract Audit

## Products
* **Real Backend Endpoints:**
  - `GET /api/products` (public, filterable/sortable)
  - `GET /api/products/categories`
  - `GET /api/products/:slug`
  - `GET /api/products/admin/all` (admin, includes inactive)
  - `POST/PATCH/DELETE /api/products` (admin)
* **Real Shape:**
  Product fields: `name`, `slug`, `description`, `price`, `images[]`, `category`, `stock`, `isActive`, `averageRating`, `reviewCount`.
* **Mismatches in Frontend:**
  - There is NO `SKU` field, NO `material/wood-type` field, and NO `piece-count` field on the backend product model. Any frontend UI elements expecting these are blocked.

## Cart
* **Real Backend Endpoints:**
  - `GET /cart`
  - `POST /cart/items`
  - `PATCH /cart/items/:productId`
  - `DELETE /cart/items/:productId`
  - `POST /cart/merge`
  - `POST /cart/validate` (public)
  (All other routes require auth)
* **Real Shape:**
  - Request for Add: `{ productId, quantity }`
  - Request for Merge: `{ items: [{ productId, quantity }] }`
  - Response shape: `{ success, items: [...] }`
* **Mismatches in Frontend:**
  - No guest cart is persisted server-side; it must be held in local state and merged via `/cart/merge` upon login. 

## Wishlist
* **Real Backend Endpoints:**
  - `GET /wishlist`
  - `POST /wishlist/:productId`
  - `DELETE /wishlist/:productId`
  (All auth-required)
* **Real Shape:**
  - Backed by `User.wishlist: ObjectId[]`
* **Mismatches in Frontend:**
  - None explicitly noted, but the frontend expects `data: Product[]`. The backend must populate the `ObjectId[]` to match this, or the frontend needs to handle resolving IDs.

## Reviews
* **Real Backend Endpoints:**
  - `GET /api/reviews?product=&page=&limit=` (public)
  - `POST/PATCH/DELETE /api/reviews` (auth; PATCH/DELETE owner-or-admin)
* **Real Shape:**
  - `createReviewSchema`: `{product: ObjectId, rating: int 1-5, comment: string <=1000, default ""}`
  - List response: `{success, items, total, page, limit, totalPages}`
  - Single: `{success, review}`
* **Mismatches in Frontend:**
  - The backend enforces one review per user per product via a unique index. A second POST must be handled gracefully as "edit your existing review," not a generic error.

## Discounts
* **Real Backend Endpoints:**
  - `POST /api/discounts/validate` (public, rate-limited)
  - `POST/GET/PATCH/DELETE /api/discounts` (admin only)
* **Real Shape:**
  - Validate Body: `{code: string, items: [{product: ObjectId, quantity: int>=1}]}`
* **Mismatches in Frontend:**
  - Validation recomputes pricing server-side.

## Orders
* **Real Backend Endpoints:**
  - `POST /api/orders` (auth)
  - `GET /api/orders` (auth, own orders only — NO "list all orders" endpoint for admins)
  - `GET /api/orders/:id` (owner or admin)
  - `PATCH /api/orders/:id/status` (admin only)
* **Real Shape:**
  - Status enum EXACTLY: `pending | paid | shipped | delivered | cancelled`
  - `createOrderSchema`: `{items: [{product, quantity 1-100}] (1-50 items), shippingAddress: {street, city, state, zipCode, country}, discountCode?}`
* **Mismatches in Frontend (frontend/src/features/orders/ordersApi.ts):**
  - **Payment Method:** Invents a `paymentMethod` field, which does not exist in the schema.
  - **Status Enum:** Uses a wrong status enum (missing "paid", misspells cancelled).
  - **Address Fields:** Uses `postalCode` instead of `zipCode` + `state`.
  - **Phantom Endpoints:** Calls two endpoints that do not exist: `PUT /orders/:id/cancel` and `GET /admin/orders`.
  - *Note: These are to be fixed in Phase 3.*

## Payments
* **Real Backend Endpoints:**
  - `POST /api/payments/checkout-session` (auth)
* **Real Shape:**
  - Body: `{orderId}` ONLY
  - Response: `{success, url}` (Redirect browser to url)
* **Mismatches in Frontend:**
  - Return URLs (`/orders/:id?payment=success|cancelled`) must trigger a re-fetch of the order to check the Stripe webhook status. Never trust the query param synchronously.

## Account
* **Real Backend Endpoints:**
  - `GET /api/account/profile`
  - `PUT /api/account/profile`
* **Real Shape:**
  - `updateProfileSchema`: `{name?, email?, addresses?: Address[] max 10}`
  - Address: `{street, city, state, zipCode, country}`
* **Mismatches in Frontend:**
  - NO password-change endpoint exists.
  - NO notification-preferences field exists anywhere on the User model.
  - Any UI for "Security & Keys" or "Atelier Preferences" is blocked.

## Contact
* **Real Backend Endpoints:**
  - `POST /api/contact` (public)
  - `GET /api/contact` (admin only)
  - `PATCH /api/contact/:id/status` (admin only)
* **Real Shape:**
  - POST Body: `{name, email, subject, message}`
  - Status enum: `unread | read | resolved`
* **Mismatches in Frontend:**
  - This is a FLAT one-shot message inbox. There is no reply field, no conversation thread, no attachments, and no linkage to orders. Two-way support ticket UIs are blocked.

## Auth
* **Real Backend Endpoints:**
  - `POST /auth/register`
  - `POST /auth/login`
  - `POST /auth/logout`

## General
* **Real Shape:**
  - Error envelope everywhere: `{success: false, message, errors?: [{path, message}]}`
  - `400` for Zod validation, `409` for duplicate key.
