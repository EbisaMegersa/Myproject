# Security Specification - AdWatch Rewards

## 1. Data Invariants
- A user document must have a valid `username` (string), `adsWatched` (integer >= 0), and `updatedAt` (timestamp).
- The `telegramId` must be a valid integer or string representative.
- Users can only read and write their own document (based on Auth UID mapping).
- `adsWatched` can only be incremented by 1 in each update.

## 2. The Dirty Dozen Payloads
- **P1: Identity Spoofing** - Attempting to write to another user's `userId` document.
- **P2: Bulk Increment** - Attempting to set `adsWatched` to 999999 in one go.
- **P3: Value Poisoning** - Setting `adsWatched` to a string "lots".
- **P4: Ghost Fields** - Injection of `isVerified: true` into the user doc.
- **P5: Future Timestamp** - Setting `updatedAt` to a year in the future.
- **P6: Negative Balance** - Setting `adsWatched` to -1.
- **P7: ID Poisoning** - Using a document ID that is 1MB in size.
- **P8: Unauthorized Read** - Authenticated User A reading User B's profile.
- **P9: Unauthenticated Write** - Writing to `/users/any` without logging in.
- **P10: Immutable Field Breach** - Attempting to change `telegramId` after creation.
- **P11: Large Field Content** - Setting `username` to 10MB of data.
- **P12: Status Overwrite** - (N/A for this app, but if it had a 'banned' status, trying to unset it).

## 3. The Test Runner
Tests will verify that these payloads return PERMISSION_DENIED.
