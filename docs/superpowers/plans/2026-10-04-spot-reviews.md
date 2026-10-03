# Spot Reviews & Ratings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Real Firestore-backed reviews (1–5 stars + comment) per spot with real averages everywhere.

**Architecture:** Top-level `reviews` collection with deterministic `${spotId}_${uid}` IDs (one-per-user structural); `utils/useReviewStats.js` aggregates client-side; detail screens gain composer + preview + bottom-sheet list; Explore surfaces switch to real stats when present.

**Tech Stack:** React Native + Expo SDK 54, Cloud Firestore (getDocs/query/where/setDoc/deleteDoc, merge), BottomSheetModal, lucide Star icons.

**Spec:** `docs/superpowers/specs/2026-10-04-spot-reviews-design.md`

## Global Constraints

- One review per user per spot; resubmit updates; owner can delete.
- Static samples show only at zero real reviews; never averaged with real.
- Full list in BottomSheetModal, scrollable.
- Validation: star required, text 1–500 chars, inline errors.
- Reviewer displayName snapshot on doc.
- No new dependencies; offline → static shows, submit errors honestly.
- Copy: "Share your experience", "Post review"/"Update review", "View More Comments".

## Review Focus

- Two users reviewing the same spot concurrently must not create dupes (deterministic IDs make it last-write-wins per user; verify two accounts) — owner Task 2.
- displayName changed after reviewing leaves stale snapshot on old reviews (accepted; verify old review keeps old name without crash) — owner Task 3.
- spotId string-vs-number mismatch hides reviews (admin customs use numeric ids; always store/query `Number(spot.id)`) — owner Task 1.
- 500-char boundary with emoji (JS length counts UTF-16 units; 501+ blocked, exactly 500 passes) — owner Task 2.
- Rules file not yet deployed makes every write fail permission-denied (composer must show honest error, not hang; human deploys rules) — owner Task 4.

---

### Task 1: Rules + stats hook

**Files:**
- Modify: `firestore.rules` (append `match /reviews/{rid}` block)
- Create: `utils/useReviewStats.js`

**Interfaces:**
- Consumes: `db` from `firebase.js`; Firestore `collection/getDocs/setDoc/deleteDoc/doc/query/where`.
- Produces: `useReviewStats()` → `{ stats: Record<number,{avg,count}>, listFor(spotId:number): Review[], loading, refresh() }`; `reviewDocId(spotId, uid)` → `` `${Number(spotId)}_${uid}` ``; Review = `{spotId:number, uid, displayName, rating:1-5, text, createdAt:ISO, updatedAt:ISO}`.

- [ ] **Step 1: Append reviews rules block to `firestore.rules`**

Exact semantics: read any `request.auth != null`; create/update only when `request.auth.uid` equals doc `uid`, `rating` is int 1–5, `text` is string size 1–500; delete own only.

- [ ] **Step 2: Verify rules file parses (no deploy here)**

Run: `node -e` brace-balance scan of `firestore.rules` (open/close count equal).
Expected: counts match.

- [ ] **Step 3: Create `utils/useReviewStats.js`**

One `getDocs(collection(db,'reviews'))` on mount + `refresh()`; `Number()` all spotIds; `listFor` newest-first by `createdAt`; empty/error → `{}` (static fallback downstream). Follow `useSpots.js` catch-and-fallback style.

- [ ] **Step 4: Verify hook module parses**

Run: `node -e "require('@babel/core').transformFileSync('utils/useReviewStats.js')"` (repo preset).
Expected: PASS with code length printed.

### Task 2: Composer (native + web)

**Files:**
- Modify: `screens/SpotDetailScreen.native.js`, `screens/SpotDetailScreen.web.js` (composer card above Reviews preview)

**Interfaces:**
- Consumes: Task 1 `reviewDocId`; `auth.currentUser` (uid, displayName/email fallback); `users/{uid}` displayName via existing profile (fallback auth displayName/email prefix); `setDoc(doc(db,'reviews',id), data, {merge:true})`, `deleteDoc`.

- [ ] **Step 1: Add composer UI to both detail screens**

Label "Share your experience"; 5 tappable stars (44px targets, `Star` lucide, fill when ≤ selected); multiline input; button "Post review"/"Update review" (own review prefills + delete option).

- [ ] **Step 2: Add validation + submit logic**

Star required, text trim non-empty, length ≤ 500, inline error text; `spotId: Number(spot.id)`; timestamps ISO; errors from Firestore shown honestly, no hang.

- [ ] **Step 3: Verify both files parse**

Run: babel transformFileSync on both screens.
Expected: PASS x2.

- [ ] **Step 4: Verify one-per-user + boundary (device, two accounts)**

Post as A, resubmit as A (count stays 1, avg moves), 500-char passes / 501-char blocked inline, empty/no-star blocked.
Expected: all hold.

### Task 3: Read/display wiring everywhere

**Files:**
- Modify: `screens/ExploreScreen.js` (rail/list/preview-sheet ratings), `screens/SpotDetailScreen.native.js` + `.web.js` (hero strip, Reviews preview + sheet), `screens/MapComponent.web.js` (Nearby rating line)

**Interfaces:**
- Consumes: Task 1 `useReviewStats()`; existing `Stars`/`ReviewCard`; `BottomSheetModal`.

- [ ] **Step 1: Wire real stats with static fallback at every surface**

Rule: real count > 0 → real avg/count/list, hide static; else byte-identical current rendering. Detail preview shows latest 2 + count + "View More Comments" → BottomSheetModal scrollable list. Stale displayName snapshots render as-is.

- [ ] **Step 2: Verify files parse**

Run: babel transformFileSync on all four files.
Expected: PASS x4.

- [ ] **Step 3: Verify agreement across surfaces (device)**

Post review → Explore card, preview sheet, hero strip, Reviews preview/sheet, web list all show same avg/count; last-review deleted → surfaces revert to static.
Expected: unanimous.

### Task 4: Rules deploy + full matrix

**Files:** none (human runs deploy; executor confirms behavior after).

- [ ] **Step 1: Human deploys `firestore.rules`** (Firebase console or `firebase deploy --only firestore:rules`); executor does not deploy.
- [ ] **Step 2: Run full spec section-7 matrix on device** (two accounts, resubmit, delete, validation blocks, offline submit error, light/dark).
Expected: every line passes; failures return to Task owning the surface.
