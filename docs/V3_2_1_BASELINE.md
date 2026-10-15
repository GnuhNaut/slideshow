# V3.2.1 BASELINE & RELEASE CANDIDATE SPECIFICATION
**WEDDING FILM STORY — TUẤN HÙNG & SAO MAI**
*Baseline Commit: `100e1dd` | Branch: `v3.2.1-release-candidate` | Date: 15/10/2026*

---

## 1. Baseline Git & Environment State
- **Initial Commit:** `100e1dd` (*feat(v3.2): final cinematic quality, 3D split curtain, unified virtualization & full acceptance test matrix*)
- **Base Branch:** `v3.2-final-acceptance` (preserved unchanged)
- **Active Branch:** `v3.2.1-release-candidate`
- **Existing Test Suite:** 9 test files, 41 unit/integration tests passing (Vitest v5.0.4, 230ms)
- **Production Build:** Vite v8.3.4 (TSC + Vite build output ~647kB JS bundle, built in ~258ms)
- **Dev Server:** Port 5173 active

---

## 2. Identified Root Causes & Identified Risks

### P0-01: Scene Lifecycle & Frame-Accurate Boundary Transitions
- **Root Cause:** `SceneRenderer` picks active/incoming scenes primarily based on `currentTime` passed via React state (updated at ~10Hz UI throttled ticks). While `MotionRuntime` updates transforms every RAF (60fps), when the clock crosses boundary $T$, React may mount the incoming scene with a 1-frame latency.
- **Risk:** Blank frame, flash of unstyled content, or delayed transition start at scene boundaries and seek operations ($T - 16\text{ms}$, $T$, $T + 16\text{ms}$).
- **Fix:** Implement lookahead scene preparation ($T - 300\text{ms}$) in `SceneRenderer` / `MotionRuntime` so the incoming scene is pre-mounted, images decoded, and ready prior to transition activation.

### P0-02: Filmstrip Wrap & Virtual Window Synchronization
- **Root Cause:** In `FilmRollScene.tsx`, the coordinate transform runs on RAF (`requestAnimationFrame`), but the virtual window items were updated with a displacement threshold (`Math.abs(currentX - lastOffset) > 160`). In sudden seeks, boundary jumps, or loop wraps, the RAF transform jumps immediately while the virtual window list lags by 1-2 frames. Additionally, `loading="lazy"` on rapidly scrolling film elements risks blank placeholder boxes.
- **Risk:** Empty photo slots on wrap, stutter on backward scroll, white flashes during fast translation.
- **Fix:** Separate coordinate calculations into pure, testable functions (`getTrackPosition`, `getVisibleWindowItems`, `getWrappedItemPosition`). Synchronize virtual window immediately upon seek/wrap/resume, and replace lazy loading with proactive asynchronous decoding (`decoding="async"` + lookahead buffer prefetch).

### P0-03: Split Curtain Double-Mounting Resource Spike
- **Root Cause:** In `SceneCompositor.tsx`, `GRAND_WEDDING_CURTAIN_REVEAL` mounts `{outgoingSceneNode || activeSceneNode}` in BOTH `leftCurtainRef` and `rightCurtainRef`.
- **Risk:** Outgoing scenes with GSAP animations, canvas, or audio hooks instantiate twice, doubling CPU/GPU memory and duplicating animation callbacks.
- **Fix:** Mount a single instance of the outgoing scene container and apply split-clipping/masking (or cached frame surface) across the left and right halves, ensuring single execution of GSAP timelines.

### P0-04: Atomic Project Import with Staging & Rollback
- **Root Cause:** `replaceProject` previously updated the in-memory store before completing or validating IndexedDB writes; if an import failed midway or storage quota was exceeded, store state could diverge from IndexedDB.
- **Risk:** Corrupted project state, missing media references, silent storage failures.
- **Fix:** 4-stage atomic workflow: **Prepare** (schema & blob validation) $\to$ **Stage** (compile timeline, check references) $\to$ **Commit** (Dexie transaction) $\to$ **Activate** (reset clock, atomic store update) with guaranteed **Rollback** on any error.

---

## 3. Scope Freeze & Preservation
- **Preserved Unchanged:**
  - Wedding palette: Warm Ivory `#FFF9F2`, Blush Pink `#F0DFD5`, Wedding Red `#C93442`, Champagne `#C5A16E`, Cocoa `#40322F`.
  - 6-Chapter narrative structure & emotional rhythm (Intro, Filmstrip, Proposal, Family, Wedding Montage, Thank You).
  - Studio controls & audio engine architecture.
  - Existing user data in IndexedDB and backup assets.
- **Components Target for Fixes:**
  - `src/scenes/SceneRenderer.tsx`
  - `src/transitions/TransitionDirector.ts`
  - `src/transitions/SceneCompositor.tsx`
  - `src/motion/MotionRuntime.ts`
  - `src/scenes/FilmRollScene.tsx` & new `src/scenes/filmstripMath.ts`
  - `src/app/store.ts`, `src/project/exportImport.ts`, `src/storage/db.ts`
