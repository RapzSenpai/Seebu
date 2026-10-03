# Explore + Spot Detail Renovation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reskin Explore and Spot Detail (native + web) into discovery and place-profile experiences without changing behavior, data, or navigation.

**Architecture:** Reskin in place per spec: visual-layer-only edits in 3 screen files, reusing `SpotInfo`, `GuideList`, `useSpots`, `IslandBackground`, theme tokens. No new files, no new deps.

**Tech Stack:** React Native + Expo SDK 54, expo-router, StyleSheet + Nativewind tokens, react-native-maps (untouched), lucide-react-native + Expo Vector Icons (installed).

**Spec:** `docs/superpowers/specs/2026-10-03-explore-spot-renovation-design.md`

## Global Constraints

- Categories derive from data only: All, Beach, History, Nature, Adventure with live counts; no fake chips.
- Keep Route/Details/Guides tab IA and order on both detail screens.
- Theme tokens only, one accent; light default + per-user theme untouched.
- Shape rule: featured cards 20px, rows 16px, buttons 16px, filter chips pill.
- Motion budget MOTION 3: snap rails, fade tab switch, existing sheet spring, press states only.
- Max 1 eyebrow per 3 sections; headlines ≤ 8 words; real counts only.
- No test runner in repo (scripts: start/android/ios/web) — verification steps are render/manual checks, not pytest.

## Review Focus

- Search text + chip combined yielding zero must show the composed empty state, not a blank list (owner: Task 1).
- Custom/admin spots missing `rating`/`reviewsCount` must omit rating UI gracefully, never call `toFixed` on undefined (owner: Tasks 1, 2, 3).
- Missing/invalid `/spot` params (deep link) must render via existing `DEFAULT_SPOT` fallback (owner: Tasks 2, 3).
- Long titles/descriptions on narrow screens must truncate/wrap without overlapping pins, chips, or CTAs (owner: Tasks 1, 2, 3).
- Hero scrim + title must stay readable in both light and dark modes (owner: Tasks 2, 3).

---

### Task 1: Explore discovery reskin

**Files:**
- Modify: `screens/ExploreScreen.js` (hero header, chip row, featured cards, discover rows, preview sheet, empty state — full visual layer)

**Interfaces:**
- Consumes: `useSpots()` → `{ spots }` (spot: `{ id, type, title, loc, img, desc, estimatedExpense, rating, coords }`); `useTheme()` → `{ colors, isDarkMode }`; `useColorScheme()` → `{ colors: full }`; `router.push({ pathname: '/spot', params: { spot: JSON.stringify(s) } })`; `MapComponent` (props `{ spots, onSpotPress }` — unchanged).
- Produces: filtered list contract `spots.filter(text AND chip)` reused by rail + list + map modal; nothing later tasks consume (screens independent).

- [ ] **Step 1: Add category chip row under search with live counts**

Implement `activeCat` state (`'All'` default) + derived `TYPES = ['Beach','Nature','History','Adventure']` with counts from `spots`; horizontal pill row, active = accent bg + accentForeground text. Filtering becomes text AND chip.

- [ ] **Step 2: Verify chip + search combo filters and empty state shows**

Run: `npx expo start`, search `zzz` with any chip.
Expected: composed empty state text shows ("No matches…"), no blank screen, no crash.

- [ ] **Step 3: Upgrade featured rail to editorial cards**

Taller cards (~300px), image + bottom scrim, type badge, `★ rating` only when `spot.rating != null`, title, loc row, expense line. Keep `snapToInterval`, `onPress → setSelectedSpot`.

- [ ] **Step 4: Verify rail renders ratings safely**

Run: `npx expo start`, scroll featured rail in light + dark.
Expected: cards with images/titles/ratings; spots without rating show no star row and never crash.

- [ ] **Step 5: Upgrade Discover More rows + preview sheet**

Rows: 64px thumbs radius 12, title + loc + meta (`★4.8 · Est. ₱…`, rating omitted when absent), chevron. Preview sheet: 200px image, rating + expense row, Start Navigation CTA → existing `router.push('/spot', …)` unchanged.

- [ ] **Step 6: Verify end-to-end Explore flow**

Run: `npx expo start`, chip filter → map modal open/close → preview → Start Navigation → spot page.
Expected: each step works as before; only visuals changed.

### Task 2: Spot Detail native place profile

**Files:**
- Modify: `screens/SpotDetailScreen.native.js` (hero, info strip, tab bar, route/details/guides polish)

**Interfaces:**
- Consumes: `useLocalSearchParams().spot` (JSON string) + existing `parseSpotParam`/`DEFAULT_SPOT` fallback (unchanged); `GuideList` (props `{ spot, theme }` — unchanged); `SpotInfo` `Section/FactRow/Stars/ReviewCard/EmptyState` (unchanged); `Linking.openURL` Go Now + `tel:` book (unchanged).
- Produces: nothing downstream; mirrors Task 3 visually.

- [ ] **Step 1: Rebuild hero as place-profile header**

320px image, theme-token scrim, back + theme toggle stay, title 34px + loc row, overlapping info strip (rating chip guarded by `spot.rating != null`, expense chip). Rating chip never calls `toFixed` on undefined.

- [ ] **Step 2: Verify hero in both modes + invalid params**

Run: `npx expo start`, open a spot with and without rating, toggle theme, open `/spot` with no params.
Expected: readable title both modes; no-rating spot shows no rating chip; missing params render `DEFAULT_SPOT`.

- [ ] **Step 3: Polish tab bar + Route tab**

Pill container, same 3 tabs + order, active accent fill. Route tab keeps MapView/GPS/distance/Go Now/transport rows; option boxes become bordered rows. No logic change.

- [ ] **Step 4: Verify Route tab behavior**

Run: `npx expo start`, open spot → Route tab → Go Now.
Expected: map loads, distance computes, Go Now opens external maps; permission-denied path still alerts gracefully.

- [ ] **Step 5: Polish Details timeline + Guides cards**

About lead paragraph styling; itinerary becomes timeline rail (accent dot + hairline). Guides: `GuideList` untouched except card polish via existing `theme` adapter prop (photo 96px, verified row).

- [ ] **Step 6: Verify Details + Guides tabs**

Run: `npx expo start`, switch Details → Guides on a spot with and without guides.
Expected: sections render, empty states (`EmptyState`, GuideList empty card) show correctly.

### Task 3: Spot Detail web mirror

**Files:**
- Modify: `screens/SpotDetailScreen.web.js` (same hero/tab/card treatment as Task 2, `MapComponent.web` untouched)

**Interfaces:**
- Consumes: same params/fallback, `GuideList`, `SpotInfo` as Task 2; `MapComponent.web` as-is.
- Produces: nothing downstream.

- [ ] **Step 1: Mirror native hero + tab bar on web**

Same 320px hero, scrim, info strip with guarded rating, same 3-tab pill bar.

- [ ] **Step 2: Verify web render**

Run: `npx expo start --web`, open a spot, switch all 3 tabs in light + dark, then open `/spot` with no params.
Expected: no console errors, readable hero both modes, tabs switch, guides/book work, missing params render fallback.
