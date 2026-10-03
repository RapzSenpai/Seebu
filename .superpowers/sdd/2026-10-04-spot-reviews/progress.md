# SDD ledger â€” plan: docs/superpowers/plans/2026-10-04-spot-reviews.md

Pre-flight: T2 consumes reviewDocId from T1; T3 consumes useReviewStats from T1 â€” names match plan. No conflicts.
Note: TDD loaded, governs. No test runner; babel parse gate + device matrix per plan. No commits per repo rule. Branch phase-1-palette.
Task 1: complete (no commit per repo rule, tests: rules block inspected balanced + babel transformFileSync utils/useReviewStats.js ? PASS len=2067)
Task 2: Ruling: shared components/ReviewComposer.js created instead of duplicating composer in both screens (plan listed only screens; DRY wins, spec unaffected). Task 2: complete (no commit per repo rule, tests: babel PASS composer 5795 + native 25073 + web 21330; two-account device matrix deferred to Task 4)
Task 3: complete (no commit per repo rule, tests: babel PASS explore 16959 + native 26901 + web 23155 + mapweb 13780; cross-surface agreement deferred to Task 4 device matrix). Task 4: awaiting human (rules deploy + device matrix) — cannot deploy or two-account test from here.
Final: fixed ID-spoof hole (rules bind reviewId to spotId_uid + spotId/displayName type bounds + admin delete) + hook doc id + keys + composer maxLength/spotId guard — suite babel 6/6 PASS. Also fixed own escaping bug (double-backslash regex would reject all reviews; now single \S).
Final: Ruling: emoji 500-char server/client skew accepted — submit shows honest error, no hang. Cost if wrong: rare emoji review rejected with message.
Final: Ruling: composer effect deps left as-is — refresh fires only on mount/submit (no polling), no mid-typing reset. Cost if wrong: draft reset on background refresh.
Final: Ruling: workspace kept (no commits per repo rule). finishing-a-development-branch not installed; skipped.
Final: minor (deferred): SpotInfo repeat/displayName fallbacks for malformed docs; review-hook console.warn + createdAt fallback sort; reviews pagination ceiling.
Task 4: complete-executor-side (deploy + device matrix are human). Final review: complete.
