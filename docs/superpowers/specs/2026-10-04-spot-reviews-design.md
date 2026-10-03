# Spot Reviews & Ratings — Design Spec

Date: 2026-10-04. Status: approved in chat, pending spec review.

Reading this as: traveler reviews on place profiles, with a premium calm language, leaning toward existing SeeBu tokens + StyleSheet + BottomSheetModal + restrained motion.

Dials: VARIANCE 4 / MOTION 3 / DENSITY 5 (match existing discovery/profile language; no new motion).

## 1. Intent

Real database-backed reviews per spot: write comment + 1–5 stars, submit. Detail page stats (average, count, badges) computed from real data. Small preview + "View More Comments" bottom sheet with full scrollable list. No mock data in the new flow; existing static samples remain only where zero real reviews exist.

Success: user posts/updates/deletes own review; averages move with real data; all rating surfaces agree; validation blocks empty/invalid submits.

## 2. Constraints (locked)

- One review per user per spot; resubmit updates in place; owner can delete.
- Static samples + hardcoded rating show only when a spot has zero real reviews; any real review replaces them (never averaged together).
- Full list in BottomSheetModal (existing component), vertically scrollable.
- Validation: star 1–5 required, text non-empty, max 500 chars, inline errors (no Alert for validation).
- Users docs are self-or-admin readable only → reviewer `displayName` snapshot stored on the review doc.
- No new dependencies. Offline/unreachable Firestore → static content shows, composer submit shows honest error.
- Copy: input labeled "Share your experience"; buttons "Post review" / "Update review"; list opener "View More Comments".

## 3. Approach (chosen: top-level collection + client aggregates)

A. `reviews` collection, deterministic doc IDs, client-side averages (chosen).
B. Subcollection under spot docs (rejected: static built-ins have no Firestore doc; Explore aggregate would need collectionGroup).
C. Stored aggregate via Cloud Function (rejected: no functions infra; small N makes client math fine).

## 4. Data + rules

Review doc: `{ spotId: number, uid: string, displayName: string, rating: int 1–5, text: string ≤500, createdAt: ISO, updatedAt: ISO }`. Doc ID `${spotId}_${uid}`.

`firestore.rules` adds `match /reviews/{rid}`: read any signed-in user; create/update allowed only when auth uid matches doc uid, rating is int 1–5, text is string length 1–500; delete own only. Human deploys rules via console/CLI (file alone does not enforce) — called out in plan verification.

## 5. Write flow (native + web detail screens)

Composer card above the Reviews preview: tappable 5-star row (44px targets, selected state from state, fully functional), multiline TextInput labeled "Share your experience", submit button ("Post review", or "Update review" when own review exists, prefilled). Own review deletable. Validation messages inline under the input. Unauthenticated state cannot occur (detail screens are behind auth guard).

## 6. Read / display

New `utils/useReviewStats.js`: one `getDocs(collection(db, 'reviews'))` load (plus refresh on demand), derives per-spot `{ avg, count }` and `listFor(spotId)` sorted newest-first. Rule applied at every surface: real count > 0 → show real avg/count and real list, hide static; else current static rendering unchanged.

Consumers: Explore rail/list/preview-sheet rating lines, detail hero info strip, detail Reviews preview (latest 2 + count + "View More Comments" → BottomSheetModal full list), web detail same, web Nearby list rating line. Existing `Stars`/`ReviewCard` presentational components reused.

## 7. Verification

No test runner in repo. Manual: post review as user A (appears, avg/count update everywhere incl. Explore card); resubmit updates (count unchanged, avg moves); user B posts (avg of two); delete own (reverts toward static when last removed); empty text / no star blocked inline; 501-char blocked; sign out/in per-user isolation holds; rules enforced (foreign uid write rejected — test via console or second account attempt); offline airplane submit shows error, no crash; light/dark composer + sheet render.
