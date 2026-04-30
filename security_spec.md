# Security Specification - Task Tuner

## 1. Data Invariants
- A User document must have a `telegramId` (number) and `username` (string).
- Users can only modify their own profile data (self-update).
- Joining users can reward their inviter (external-update) by exactly 50 points.
- Withdrawals must be at least 30 points.
- Notifications can be created by anyone (for referral alerts) but only read by the owner.

## 2. The "Dirty Dozen" Payloads (Denial Tests)
1. **Identity Spoofing**: Attempt to update `users/userA` as `userB`.
2. **Infinite Money**: Attempt to update `balance` by more than allowed (e.g., +1000 instead of +50 for referral).
3. **Privilege Escalation**: Attempt to set `isAdmin: true` in user profile.
4. **ID Poisoning**: Attempt to create a document with a 2MB ID string.
5. **Shadow Update**: Attempt to update `balance` and hidden field `isVerified: true`.
6. **State Shortcut**: Attempt to update withdrawal status from `Pending` to `Success` directly (client-side).
7. **Resource Poisoning**: Attempt to write a 1MB string into a `message` field.
8. **PII Leak**: Attempt to `get` another user's document.
9. **Referral Theft**: Attempt to update an inviter's balance as a user who wasn't referred by them (logic guard).
10. **Negative Withdrawal**: Attempt to withdraw -100 points.
11. **Massive Streak**: Attempt to set `dailyStreak` to 999999.
12. **Metadata Tampering**: Attempt to change `createdAt` on an existing withdrawal.

## 3. Test Runner (Draft)
A `firestore.rules.test.ts` file will be generated to verify these cases.
