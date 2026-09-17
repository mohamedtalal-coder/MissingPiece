# Frontend Contract Audit

## 1. Cart
**Backend Endpoints:**
- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/:productId`
- `DELETE /api/cart/items/:productId`
- `POST /api/cart/merge`
- `POST /api/cart/validate`

**Backend Request/Response Shape:**
- Cart Item Model: `{ productId: ObjectId, quantity: Number }`
- Validations:
  - Add item: `{ productId: objectId, quantity: quantity.default(1) }`
  - Update item: `{ quantity: quantity }`
  - Validate / Merge: `{ items: [{ productId: objectId, quantity: quantity }] }`
- Response Envelope: `{ success: true, items: [...] }`

**Frontend Mismatches:**
- `mergeCart` frontend passes `items` as `CartItemDto[]` which contains `{ productId, quantity }`. This seems to match, but we must ensure `items` array is passed. The frontend `cartApi.validateCart` expects `response.data.items` to have properties like `.valid` and `.product.name`, `.product.price`, etc., but we need to ensure the backend actually returns this rich object or if it just returns basic cart items.

## 2. Wishlist
**Backend Endpoints:**
- `GET /api/wishlist`
- `POST /api/wishlist/:productId`
- `DELETE /api/wishlist/:productId`

**Backend Request/Response Shape:**
- No body expected for POST/DELETE (uses URL params).
- The wishlist in the DB is an array of Product IDs: `wishlist: [{ type: Schema.Types.ObjectId, ref: "Product", default: [] }]`.
- Response Envelope: `{ success: true, data: wishlist }`

**Frontend Mismatches:**
- Frontend models `WishlistItem` as an object: `{ _id: string, user: string, product: Product, addedAt: string }`.
- Backend actually stores it as just an array of ObjectIds (which may be populated to `Product` objects, but it's an array of Products, NOT a separate collection object with `_id`, `user`, `addedAt`).

## 3. Products
**Backend Endpoints:**
- `GET /api/products`
- `GET /api/products/categories`
- `GET /api/products/:slug`
- `GET /api/products/:slug/reviews`
- `POST /api/products/:slug/reviews`

**Backend Request/Response Shape:**
- `listProductsQuerySchema`: `{ page, limit, cursor, category, minPrice, maxPrice, sort, search }`
- Response Envelope (List): `{ success: true, ...paginatedResult }` (i.e. `{ success: true, items, total, page, limit, totalPages }`)
- Response Envelope (Single): `{ success: true, product }`

**Frontend Mismatches:**
- Frontend list response matches structurally (it assumes it gets `{ success, ...ProductListResult }`).
- Wait, the frontend `productsApi.getAll` expects `{ success, items, total, page, limit, totalPages, nextCursor }`, which likely aligns.

## 4. Auth
**Backend Endpoints:**
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`

**Backend Request/Response Shape:**
- `registerSchema`: `{ name, email, password }`
- `loginSchema`: `{ email, password }`
- Response Envelope: `{ success: true, message: string, data: { token, user } }`

**Frontend Mismatches:**
- Frontend `authApi.register` and `login` return `response.data`, expecting `response.data` to be `{ token, user }`. However, the backend returns `{ success: true, message: string, data: { token, user } }`.
- This means the frontend actually receives `{ success: true, message: string, data: {...} }` and incorrectly types it as `AuthResponse`.

## 5. Account
**Backend Endpoints:**
- `GET /api/account/profile`
- `PUT /api/account/profile`

**Backend Request/Response Shape:**
- `updateProfileSchema`: `{ name?: string, email?: string, addresses?: addressSchema[] }`
- `addressSchema`: `{ street, city, state, zipCode, country }`
- Response Envelope: `{ success: true, data: user }`

**Frontend Mismatches:**
- Frontend expects `apiClient.get<UserProfile>('/account/profile')` to return `response.data` directly as the user profile, but backend returns `{ success: true, data: user }`.
- Frontend `updateProfile` passes `{ name: string, address: Address }`. However, the backend `updateProfileSchema` expects `addresses` (array), not a single `address` field!

## 6. Contact
**Backend Endpoints:**
- `POST /api/contact`
- `GET /api/contact`
- `PATCH /api/contact/:id/status`

**Backend Request/Response Shape:**
- `contactSchema`: `{ name, email, subject, message }`
- Response Envelope (POST): `{ success: true, message: "Message sent successfully" }`
- Response Envelope (GET): `{ success: true, items, total, page, limit, totalPages }`

**Frontend Mismatches:**
- Frontend `sendMessage` passes `ContactMessageDto` which misses the `subject` field required by backend.
- Frontend `getContactMessages` calls `GET /admin/messages` (which doesn't exist). The real backend route is `GET /contact`.
- Response envelopes are completely mismatched (frontend assumes it gets the data directly instead of the `{ success, ... }` envelope).

## 7. Orders (Revisited from 0.5)
**Backend Endpoints:**
- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/:id`
- `PATCH /api/orders/:id/status`

**Frontend Mismatches:**
- Frontend has `paymentMethod` field, not supported by backend.
- Status enum casing and spelling mismatch.
- `ShippingAddress.postalCode` vs `zipCode`.
- `cancelOrder` calls non-existent `PUT /orders/:id/cancel`.
- `getAllOrders` calls non-existent `GET /admin/orders`.
- Missing success envelope in response handling.

## Conclusion
Most frontend API implementations fail to account for the backend's standard `{ success: true, data }` or `{ success: true, items }` envelope, incorrectly assuming Axios's `response.data` is the entity directly. The wishlist and account models are fundamentally mismatched with backend schemas (e.g. `addresses` array vs single `address`). Missing required fields (e.g., `subject` in contact). Admin endpoints are pointing to fabricated paths.
