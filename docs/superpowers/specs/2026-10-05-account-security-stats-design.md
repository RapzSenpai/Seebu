# Account, Biometric, Stats, Interests — Design Spec

Date: 2026-10-05. Status: approved in chat, pending spec review.

Reading this as: account-danger actions + platform lock + honest activity stats for travelers, leaning toward existing SeeBu tokens + StyleSheet + BottomSheetModal + restrained motion.

Dials: VARIANCE 4 / MOTION 3 / DENSITY 5.

## 1. Intent

Settings gains Delete Account (auth + doc + my reviews, password-confirmed); optional biometric app lock; stats show the user's own activity (reviews written, average given, interests); interests become editable in Profile with the Settings row navigating there. No fake rows, no new stats invented.

## 2. Constraints

- Delete is irreversible: double-confirm (sheet + password), wrong-password inline, guides/spots/admin data never touched.
- Firebase requires recent login for delete: re-authenticate with password first; surface requires-recent-login honestly (should not occur after re-auth).
- Biometric is opt-in per uid, hardware + enrollment verified at toggle time; fallback is sign-out, never bypass.
- Stats strictly from real data: my reviews (count + avg), my interests count.
- Interests options identical to register: Beaches, Food, History, Nightlife, Mountains, Shopping.
- Copy: "Delete Account", "Delete forever", "Unlock with biometrics", stats labels "Reviews", "Avg given", "Interests".

## 3. Approaches

- Delete: client batch (query own reviews → WriteBatch ≤500 → deleteDoc users doc → deleteUser), re-auth first. No function needed at this scale.
- Biometric: expo-local-authentication + AsyncStorage per-uid flag + lock overlay in _layout. No SecureStore (flag is not secret; Firebase session is the credential).
- Stats: extend useReviewStats with mine(uid) → {count, avg}; Settings consumes.
- Interests: Profile edit-mode chips → setDoc merge → refresh; Settings row pushes /profile.

## 4. Pass 1 — Delete + stats + interests (no new deps)

Settings Session section: red "Delete Account" row under Log Out → BottomSheet: what gets wiped, SecureText password field, "Delete forever" (busy state), inline errors. On success user lands logged-out (auth deleted). Profile: INTEREST_OPTIONS chips in edit mode only, merge-save, refresh. Settings stats strip: three cells from mine(uid) + profile.interests. Interests row → /profile with values sub.

## 5. Pass 2 — Biometric (native module)

`npx expo install expo-local-authentication`. utils/biometric.js: supported/enrolled checks, per-uid flag get/set. Settings Preferences toggle: disabled with "Not available on this device" sub when unsupported; enabling runs one live authenticate check first. _layout: when user + flag on → BiometricLock overlay (Unlock button → authenticateAsync; "Sign out instead" → signOut). Rebuild dev client after install; Expo Go needs none.

## 6. Verification

Delete: wrong password blocked inline; correct wipes auth+doc+reviews (verify in console), guides/spots intact, logged out after. Biometric: toggle off on unsupported; on → kill/reopen app → lock shows → unlock works → sign-out-instead works; disabled toggle removes lock. Stats: post/delete review moves counts; interests edit reflects. Light/dark both.
