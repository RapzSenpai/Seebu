# Explore + Spot Detail Renovation — Design Spec

Date: 2026-10-03. Status: approved in chat, pending spec review.

Reading this as: in-app discovery + place profiles for travelers, with a premium calm language, leaning toward existing SeeBu tokens + StyleSheet + restrained motion.

Dials: VARIANCE 5 / MOTION 3 / DENSITY 5 (redesign-preserve: match existing, +1 motion only as press states).

## 1. Intent

Explore feels like a list of cards leading into navigation. Spot Detail feels plain. Goal: Explore reads as tourism discovery, Spot Detail reads as a place profile. Keep every working behavior, reuse `cebuSpots` / `useSpots`, `GuideList`, `SpotInfo`, maps, theme. No new features, no new deps, no nav or Firestore changes.

Success: same taps work (search, chip filter, map modal, preview sheet → `/spot` push, tab switch, Go Now, tel: book), but both screens feel polished, modern, intentional, not crowded.

## 2. Constraints (locked by user + skills)

- Categories derive from data only: All, Beach (3), Nature (3), History (4), Adventure (2). No Food/Mountain chips (would render empty).
- Keep Route/Details/Guides tab IA on both native + web detail screens.
- One accent, theme tokens only, light default + per-user theme untouched.
- Shape rule: featured cards 20px, rows 16px, buttons 16px, filter chips pill. No mixed radii outside this rule.
- Motion budget (MOTION 3): snap rails, fade tab switch, existing sheet spring, press `scale 0.98`/`active` states only. No scroll-hijack, no marquees, no infinite loops.
- Copy: max 1 eyebrow per 3 sections; headlines ≤ 8 words; no duplicate CTA intents; real counts only (12 spots), no invented stats.

## 3. Approach (chosen: reskin in place)

A. Reskin in place — rebuild visual layer in `screens/ExploreScreen.js`, `screens/SpotDetailScreen.native.js`, `screens/SpotDetailScreen.web.js`. Reuse `SpotInfo`, `GuideList`, `IslandBackground`, tokens. Smallest diff, least risk.
B. Shared discovery kit (rejected for now) — `components/discovery/` extraction; more files for same pixels.
C. IA restructure (rejected) — single scrolling profile; breaks working preview→push flow.

## 4. Explore layout (`screens/ExploreScreen.js`)

- Hero header: SEEBU wordmark + "Premium Travel Guide" + greeting "Where to in Cebu?" + avatar (unchanged route `/profile`). Search bar keeps behavior, gains chip row beneath: All + 4 types with live counts from `useSpots`, single-select, horizontal scroll, active = accent pill.
- Featured rail: taller editorial cards (300px), image with bottom scrim, type badge, star rating (from `spot.rating`), title, loc row, expense line. Snap scroll kept. Tapping opens existing preview sheet (upgraded: 200px image, rating + expense row, Start Navigation CTA).
- Discover More: rows keep data, 64px thumbs radius 12, title + loc + meta (`★4.8 · Est. ₱250–₱450`), chevron. Section header "Discover More" without eyebrow.
- Map modal unchanged functionally (full `MapComponent` + close). Empty search: composed empty state ("No matches for X — try a place or town.") replacing bare "No places found...".
- Filtering = search text AND selected chip (both must match; All = text only).

## 5. Spot Detail layout (native + web mirrored)

- Hero 320px: full-bleed image, theme scrim (foreground token, not pure black), back + theme toggle stay, title 34px + loc row + overlapping info strip (rating chip, expense chip) straddling hero bottom.
- Tab bar: same 3 tabs + order, pill container, active = accent fill, inactive = subText. Sticky under hero (current `-30` overlap kept).
- Route tab: live-tracking card (MapView + GPS + distance + Go Now via `Linking`), expense card, public-transport card — same data/rows, bordered option rows, instruction box kept.
- Details tab: `SpotInfo` sections unchanged in content; About lead paragraph 15px/24px; itinerary becomes timeline rail (accent dot + hairline, time + title + text).
- Guides tab: `GuideList` kept as-is behaviorally; card polish only (photo 96px, verified row, Book Guide `tel:` unchanged).
- Web file gets same hero/tab/card treatment with `MapComponent.web` untouched.

## 6. Shared system

- No new files except none; edits confined to the 3 screen files. `SpotInfo`/`GuideList`/`IslandBackground` untouched unless a token prop is required.
- Contrast: CTA text on accent uses `accentForeground`; chips active same; scrim keeps title ≥ 4.5:1.
- Copy register: plain functional traveler tone, same as Welcome ("Your favorite spot is waiting").

## 7. Verification

No test runner in repo (scripts: start/android/ios/web). Verify manually: cold start → tabs; search + chip combo filters; map modal opens/closes; preview sheet → Start Navigation pushes `/spot` with params; tabs switch; Go Now opens external maps; guide Book dials; light/dark both modes; web `expo start --web` renders both screens without errors. `cebuSpots` length stays 12; no Firestore rule change needed (no schema change).
