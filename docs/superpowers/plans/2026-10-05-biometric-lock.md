# Biometric App Lock Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Optional per-user biometric lock over the app with sign-out fallback.

**Architecture:** `expo-local-authentication` for hardware checks + prompts; per-uid flag in AsyncStorage; lock overlay mounted in `_layout` RootNavigator; Settings toggle verifies capability live and runs one check before enabling.

**Tech Stack:** React Native + Expo SDK 54, expo-local-authentication (new), AsyncStorage (installed), existing _layout/Settings.

**Spec:** `docs/superpowers/specs/2026-10-05-account-security-stats-design.md` (section 5 only)

## Global Constraints

- Opt-in per uid; fallback is sign-out, never bypass.
- Toggle disabled with "Not available on this device" when unsupported/unenrolled.
- Copy: "Unlock with biometrics".
- Rebuild dev client after install; Expo Go needs none. No test runner (babel parse + device).

## Review Focus

- Enabling on a device that loses enrollment later must fail closed (lock shows, authenticate fails, sign-out offered — never open) — owner Task 2.
- Toggling off must immediately remove the lock (flag write confirmed before UI flips) — owner Task 1.
- Web build must never import the native module path unguarded (Platform gate) — owner Task 1.
- Lock must re-engage on foreground return, not just cold start (AppState listener) — owner Task 2.
- Biometric prompt cancelled repeatedly must not loop prompts (one prompt per unlock tap) — owner Task 2.

---

### Task 1: Capability, flag, toggle

**Files:**
- Install: `expo-local-authentication` via `npx expo install`
- Create: `utils/biometric.js` (`isAvailable()`, `getFlag(uid)`, `setFlag(uid, on)`)
- Modify: `screens/SettingsScreen.js` (Preferences toggle row)

**Interfaces:**
- Produces: `isAvailable()` → `{ok, reason}`; `getFlag/setFlag` per-uid string storage.

- [ ] **Step 1: Install package + create `utils/biometric.js` (Platform-gated imports)**
- [ ] **Step 2: Add Settings toggle (disabled + sub when unavailable; live check before enabling)**
- [ ] **Step 3: Verify parse + device (toggle on/off, unsupported-device row state)**

### Task 2: Lock overlay

**Files:**
- Create: `components/BiometricLock.js`
- Modify: `app/_layout.tsx` (mount when user + flag on; AppState re-lock)

**Interfaces:**
- Consumes: Task 1 `utils/biometric.js`; `signOut`.

- [ ] **Step 1: Build lock overlay (Unlock → authenticateAsync once per tap; Sign out instead)**
- [ ] **Step 2: Mount in RootNavigator with foreground re-engagement**
- [ ] **Step 3: Verify parse + device matrix (kill/reopen, foreground return, cancel loop, toggle-off immediate)**
