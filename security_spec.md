# Security Specification — Пелемешка Firestore Rules

## 1. Data Invariants
1. `menu_items/{itemId}`, `categories/{categoryId}`, and `hero_slides/{slideId}` can only be created, updated, or deleted by an authenticated, email-verified administrator (`mode199124@gmail.com` or an existing UID in `/admins/{uid}`).
2. Public storefront visitors can read (`get`, `list`) `menu_items`, `categories`, and `hero_slides`; all three collections contain zero PII.
3. Document IDs and `categoryId` references on all target operations must match `^[a-zA-Z0-9_-]+$` and satisfy length limits (`<= 64` for `categoryId`, `<= 80` for item/slide IDs, `<= 128` general max).
4. `createdAt` and `updatedAt` must strictly equal `request.time` on creation; `createdAt` and `id` are immutable on update, and `updatedAt` must equal `request.time`.
5. `sizes` array is capped at 6 entries and validated for map structure and numeric prices.
6. `/admins/{userId}` can only be listed/read by the owning user or an admin, and modified only by the bootstrapped primary admin (`mode199124@gmail.com` with `email_verified == true`).

## 2. Dirty Dozen Payloads (Expected: PERMISSION_DENIED)
1. Unauthenticated `create` on `/menu_items/hack-item`, `/categories/hack-cat`, or `/hero_slides/hack-slide`.
2. Signed-in non-admin user `update` on `/menu_items/pelmeni-beef` changing `price` to `1`.
3. Signed-in user with unverified email matching admin email (`email_verified: false`) attempting `create` on `/categories/spoof`.
4. Admin sending a shadow/ghost field `isAdminHack: true` in `/menu_items/burger-s`, `/categories/cat-1`, or `/hero_slides/slide-1`.
5. Admin injecting oversized 5KB `name` or `title` string in `/menu_items`, `/categories`, or `/hero_slides`.
6. Admin injecting invalid negative price `-50` or negative `sortOrder` `-1`.
7. Admin setting malformed `categoryId: "../evil"` or non-ASCII `categoryId` violating `^[a-zA-Z0-9_-]+$`.
8. Admin spoofing client-side `createdAt` timestamp instead of `serverTimestamp()` (`request.time`).
9. Admin attempting to mutate immutable `createdAt` or `id` on `update`.
10. Admin sending `sizes` array with 7 items (exceeding max 6) or invalid non-map element at index 0.
11. Signed-in non-admin attempting to self-assign admin role by writing `/admins/{theirUid}`.
12. Unauthenticated `list` on `/admins`.
