<USER_REQUEST>
You are now performing a large-scale autonomous production-readiness pass on the MissingPiece project.

The user is going to be away for an extended period and will review the work later.

DO NOT STOP AND ASK THE USER ROUTINE QUESTIONS.

You have authority to make implementation decisions autonomously, but you MUST follow the decision rules below.

Your job is not simply to "make the website prettier".

Your job is to turn the existing MissingPiece frontend into a polished, coherent, production-quality e-commerce frontend that is correctly wired to the existing backend, while preserving the backend's existing contracts and business logic.

==================================================
0. CORE RULES — READ THESE FIRST
==================================================

1. INSPECT BEFORE MODIFYING.

Before changing anything, inspect:

- frontend architecture
- routing
- API client
- every feature
- contexts/providers
- existing components
- styling/theme system
- i18n system
- backend API routes
- backend schemas/models
- backend validation
- authentication/authorization
- database indexes relevant to frontend functionality
- existing tests
- package.json files
- TypeScript configuration
- environment configuration

Build a mental map of the entire application before performing broad changes.

2. DO NOT INVENT BACKEND CONTRACTS.

The backend is the source of truth.

Do not invent:
- endpoints
- request fields
- response fields
- database fields
- statuses
- permissions
- business rules
- product properties
- payment behavior

If the frontend expects something that the backend does not provide, inspect the backend and determine the correct existing contract.

Only modify the backend when absolutely necessary for a requirement explicitly described in this task.

3. DO NOT CREATE FAKE DATA.

Remove or replace:
- mock products
- fake users
- fake orders
- fake statistics
- fake categories
- fake API responses
- placeholder business data
- hardcoded fallback data pretending to be real data

If some
<truncated 23759 bytes>
if you only inspected it.

==================================================
FINAL PRINCIPLE
==================================================

Do not optimize for "how much code can I change".

Optimize for:

A coherent, production-quality MissingPiece website that feels intentionally designed around puzzles, works correctly with the existing backend, is accessible, responsive, secure, performant, multilingual, themeable, and free of generic AI-generated UI patterns.

Work autonomously and continuously until the meaningful work is complete.
Then make unit tests for all of the frontend run it and make me a walk through showing the results
</USER_REQUEST>
<ADDITIONAL_METADATA>
The current local time is: 2026-09-17T22:00:11+03:00.

The user's current state is as follows:
Active Document: /home/mohamedtalal/Documents/MissingPiece/frontend/src/shared/i18n/translations.ts (LANGUAGE_TYPESCRIPT)
Cursor is on line: 1
Other open documents:
- /home/mohamedtalal/Documents/MissingPiece/frontend/src/features/cart/CartContext.tsx (LANGUAGE_TSX)
- /home/mohamedtalal/Documents/MissingPiece/frontend/src/features/products/productsApi.ts (LANGUAGE_TYPESCRIPT)
- /home/mohamedtalal/Documents/MissingPiece/frontend/src/features/products/components/ProductFilters.tsx (LANGUAGE_TSX)
- /home/mohamedtalal/Documents/MissingPiece/backend/src/tests/features/wishlist/wishlist.service.test.ts (LANGUAGE_TYPESCRIPT)
- /home/mohamedtalal/Documents/MissingPiece/backend/src/tests/shared/middleware/requireAuth.test.ts (LANGUAGE_TYPESCRIPT)
Running terminal commands:
- npm run dev (in /home/mohamedtalal/Documents/MissingPiece/backend, running for 3h3m3s)
- npm run dev (in /home/mohamedtalal/Documents/MissingPiece/frontend, running for 1h51m2s)
</ADDITIONAL_METADATA>
<USER_SETTINGS_CHANGE>
The user changed setting `Model Selection` from None to Gemini 3.1 Pro (High). No need to comment on this change if the user doesn't ask about it. If reporting what model you are, please use a human readable name instead of the exact string.
</USER_SETTINGS_CHANGE>