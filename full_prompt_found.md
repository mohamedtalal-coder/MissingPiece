<USER_REQUEST>
Don't make a plan just do this prompt as it says
# MissingPiece — Frontend Production-Readiness Prompt (v3)

## Why this version exists

Two prior autonomous passes produced confident final reports ("Production
Readiness Achieved", "Everything is complete", "No bad data can leave the
client") describing work that does not exist in the repository:
`zod`/`react-hook-form` were never installed, `frontend/src/features/{reviews,
discounts,payments}` were never created, and `CheckoutPage.tsx` has no order,
payment, or discount logic beyond a translation label. Separately, the
**already-merged** `frontend/src/features/orders/ordersApi.ts` invents fields
that don't exist on the backend (`paymentMethod`), uses status values the
backend doesn't have (`'Canceled'` instead of `cancelled`, and it's missing
`paid` entirely), and calls endpoints that don't exist (`PUT /orders/:id/cancel`,
`GET /admin/orders`).

Root cause: a single long autonomous run with no checkpoint has no
opportunity to catch drift between what it *thinks* it did and what it
*actually* wrote to disk. This prompt fixes that by:

1. Locking the real backend contracts up front (Section 0), sourced directly
   from the backend code, not inferred or remembered.
2. Splitting work into small phases, each ending in a **mandatory proof-of-work
   checkpoint** — actual command output, not a narrative summary.
3. Requiring a commit + push after every phase, to a feature branch, so work
   is never sitting only in an agent's local, unsynced state again.
4. Banning specific phrases from any status report unless the exact command
   output proving them is pasted directly above.

Do not skip Section 0. Do not skip any checkpoint. Do not batch multiple
phases into one commit.

---

## 0. LOCKED CONTRACTS — read-only ground truth

These were extracted directly from `backend/src` on the current `main`
branch. Treat any existing frontend code that contradicts this section as
**wrong**, not as an alternate valid contract — including `ordersApi.ts`,
whic
<truncated 17548 bytes>
't just assert "secure."
- Run the full checklist from the original brief (build, tests, lint, no
  console errors, no fake data, no dead buttons, no `alert()`, Arabic/English/
  RTL/light/dark/mobile/desktop all checked) — each item in the final report
  must cite the phase checkpoint where it was actually verified, or say it
  wasn't.

---

## Final report format

Not a narrative. A table or list, one row per checklist item from Phase 9,
each with: status (verified / not verified / deferred), and a pointer to the
specific checkpoint (phase number + command output) that backs it up. Anyone
reading it should be able to go find the exact diff and test output for any
claim without re-running the agent.
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-09-17T23:06:19+03:00.

The user's current state is as follows:
Active Document: /home/mohamedtalal/Documents/MissingPiece/frontend/src/features/orders/CheckoutSuccessPage.tsx (LANGUAGE_TSX)
Cursor is on line: 1
Other open documents:
- /home/mohamedtalal/Documents/MissingPiece/frontend/src/index.css (LANGUAGE_CSS)
- /home/mohamedtalal/Documents/MissingPiece/frontend/extract_i18n.ts (LANGUAGE_TYPESCRIPT)
- /home/mohamedtalal/Documents/MissingPiece/backend/src/features/payments/payment.model.ts (LANGUAGE_TYPESCRIPT)
- /home/mohamedtalal/Documents/MissingPiece/backend/src/features/checkout/checkout.routes.ts (LANGUAGE_TYPESCRIPT)
- /home/mohamedtalal/Documents/MissingPiece/frontend/src/features/checkout/checkoutApi.ts (LANGUAGE_TYPESCRIPT)
Running terminal commands:
- npm run dev (in /home/mohamedtalal/Documents/MissingPiece/backend, running for 4h9m11s)
- npm run dev (in /home/mohamedtalal/Documents/MissingPiece/frontend, running for 2h57m10s)
</ADDITIONAL_METADATA>
<USER_SETTINGS_CHANGE>
The user changed setting `Model Selection` from None to Gemini 3.1 Pro (High). No need to comment on this change if the user doesn't ask about it. If reporting what model you are, please use a human readable name instead of the exact string.
</USER_SETTINGS_CHANGE>