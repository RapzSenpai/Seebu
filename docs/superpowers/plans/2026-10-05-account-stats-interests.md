# Delete Account + Stats + Interests Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Delete-account flow, real activity stats, and editable interests with zero new dependencies.

**Architecture:** Settings owns a password-confirmed wipe (re-auth → batch-delete own reviews → delete users doc → deleteUser); `useReviewStats` gains `mine(uid)` feeding a 3-cell strip; Profile edit mode gains the register interest chips saved via setDoc merge.

**Tech Stack:** React Native + Expo SDK 54, firebase/auth (reauthenticateWithCredential, EmailAuthProvider, deleteUser), Firestore WriteBatch, existing BottomSheetModal.

**Spec:** `docs/superpowers/specs/2026-10-05-account-security-stats-design.md` (sections 4 only; section 5 is the biometric plan)

## Global Constraints

- Delete is irreversible: sheet + password, inline errors, guides/spots/admin data never touched.
- Stats strictly real: my reviews count + avg, my interests count.
- Interest options identical to register: Beaches, Food, History, Nightlife, Mountains, Shopping.
- Copy: "Delete Account", "Delete forever".
- No new dependencies; no test runner (babel parse gate + device matrix).

## Review Focus

- Wrong password must block inline without wiping anything (verify dry-run: nothing deleted) — owner Task 1.
- Stale auth (requires-recent-login despite re-auth race) must surface honestly, not half-wipe (order: re-auth FIRST, deletes after) — owner Task 1.
- >500 own reviews would overflow one WriteBatch (paginate batches of 400; realistic N is tiny) — owner Task 1.
- Interests edited but save fails offline must keep old values visible (no optimistic overwrite) — owner Task 3.
- Stats with zero reviews show count 0 and avg "—", never NaN — owner Task 2.

---

### Task 1: Delete account flow

**Files:**
- Modify: `screens/SettingsScreen.js` (Session section row + sheet + logic)

**Interfaces:**
- Consumes: `auth.currentUser` (uid, email); `firebase/auth` `EmailAuthProvider`, `reauthenticateWithCredential`, `deleteUser`; Firestore `collection/query/where/getDocs/writeBatch/doc/deleteDoc`, `db`.
- Produces: nothing downstream.

- [ ] **Step 1: Add Delete Account row + confirm sheet with password field**

Red row under Log Out; BottomSheet: wipe list (account, profile, N my reviews), SecureText password input, "Delete forever" button with busy state, inline error text.

- [ ] **Step 2: Implement wipe in strict order**

Re-auth with password first; on wrong-password show inline error and stop. Then query own reviews → WriteBatch deletes (chunks of 400) → deleteDoc users doc → deleteUser. Success lands logged-out via existing auth guard.

- [ ] **Step 3: Verify parse + dry-run safety**

Run: babel transformFileSync on SettingsScreen. Wrong-password attempt deletes nothing (device check).
Expected: PASS + zero deletions on bad password.

### Task 2: Real stats strip

**Files:**
- Modify: `utils/useReviewStats.js` (add `mine(uid)`), `screens/SettingsScreen.js` (3-cell strip)

**Interfaces:**
- Consumes: Task-1-independent; hook `reviews` state.
- Produces: `mine(uid)` → `{count, avg:number|null}`.

- [ ] **Step 1: Add `mine(uid)` selector (count + avg, avg null at zero)**
- [ ] **Step 2: Replace strip with Reviews / Avg given ("—" when null) / Interests cells**
- [ ] **Step 3: Verify parse + device (post/delete review moves numbers; zero shows "—", never NaN)**

### Task 3: Editable interests

**Files:**
- Modify: `screens/ProfileVIew.js` (edit-mode chips + merge-save), `screens/SettingsScreen.js` (row → /profile)

**Interfaces:**
- Consumes: `profile?.interests`; `setDoc(doc(db,'users',uid), {interests}, {merge:true})`; existing `refreshProfile`.

- [ ] **Step 1: Add 6 interest chips in Profile edit mode, merge on save, no optimistic overwrite**
- [ ] **Step 2: Point Settings interests row at /profile with values sub**
- [ ] **Step 3: Verify parse + device (toggle, save, refresh entangled screens)**
