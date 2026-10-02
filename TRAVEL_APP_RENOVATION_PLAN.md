# Travel App Renovation Plan

Existing Expo Go travel/tourist app. Core features already work. Goal: UI/UX renovation + feature enhancements.

**Read this whole file first. Start with Phase 0 only. Stop after each phase and wait for my approval.**

---

## Rules

- One phase at a time. Do not start the next until I approve.
- Reuse the existing project and installed packages. Before adding any package, check if an installed one already does the job. No new packages without my approval.
- Must work in Expo Go. No custom native modules or dev-build-only features. Flag it if a feature needs one.
- Don't rewrite working systems without a clear reason. Preserve existing functionality.
- Keep UI consistent across the whole app. Use theme tokens, no hardcoded colors.
- Prioritize performance and maintainability.
- Use a git branch per phase. Commit before starting each phase.
- End each phase with a short report: what changed, files touched, anything new added and why, known issues, questions.

---

## Phase 0 — Audit (read-only)

- Read `package.json`. List installed libraries and what each is used for.
- Map folder structure, theme/color files, navigation, map integration, spot data model, AI entry points.
- Note how light/dark mode currently works.
- Note where colors are hardcoded.
- Output a short audit with a "reuse list". Change no files.

---

## Phase 1 — Color Palette and Visual Identity

Redesign around three colors:
- Sky blue (primary)
- Smoky white (app background)
- Soft violet/purple (accent)

Palette must look modern and read as travel/tourism. Not too bright or washed out, not too dark or heavy. Readable (WCAG AA contrast). Cohesive, not random.

Tasks:
- Define tokens in one central theme file (extend the existing one if present): background, surface, primary, accent, text, border, status colors.
- Add a subtle island illustration to the background: faded, low opacity, small area only (e.g. a corner), never blocks touches or hurts readability. One reusable background component, not per screen.
- Replace hardcoded colors with tokens.
- Apply to buttons, cards, nav bar, headers, chips, inputs, modals, highlights.

Done when: no hardcoded colors left, palette consistent on all screens, island visual is subtle, no regressions.

---

## Phase 2 — Light and Dark Mode

- Reuse the existing theme-switching mechanism.
- Two token sets (light, dark) with the same structure.
- Dark mode is its own design, not inverted colors: deep blue-slate base (not pure black), layered surfaces, accents retuned so they aren't harsh. Island visual gets a dark variant.
- Check contrast in both themes.
- Test every screen and shared component in both. Test live theme switching (no flicker, nothing breaks).

Done when: both themes polished, readable, consistent, and switching is stable.

---

## Phase 3 — AI Features (placeholder)

Do not implement. When we reach it: re-audit the current AI features, propose options, wait for my direction.

---

## Phase 4 — Map Improvements

Keep the existing map library. Extend it.

- Interactive tourist markers: styled with theme, tap opens preview (name, photo, rating, distance, Directions/Details buttons).
- User location with proper permission handling.
- Routing to a selected spot: route line, distance, ETA, error states. Tell me which routing API you plan to use (cost, key, Expo Go support) before building.
- Navigation basics: recenter, route progress, hand off to external maps app if in-app turn-by-turn isn't feasible.
- Search/filter spots on the map.
- Map UI matches light and dark themes.
- Keep performance good: memoize markers, cluster if many.

---

## Phase 5 — Tourist Spot Details

Reuse the existing add-spot flow. Extend the data model and propose the schema to me before changing stored data.

- New fields: detailed description, photos, category, ratings, address/location info, how to get there, hours, fees, best time to visit, duration, tips, suggested itinerary.
- Existing spots must keep working (new fields optional).
- Redesign the spot detail screen: photo header, rating, sections for About, Location, Hours/Fees, Tips, Itinerary, Reviews. Directions button uses Phase 4 routing.
- Update the add/edit form for the new fields.
- Handle loading and empty states. Lazy-load images.

---

## Order

Phase 0 → 1 → 2 → 3 (planning only) → 4 → 5. Approval needed between each.
