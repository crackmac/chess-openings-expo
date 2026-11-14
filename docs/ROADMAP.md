# Roadmap & Implementation Plan

Single source of truth for planned work, implementation specs, active priorities, and completed milestones. Read `GLOSSARY.md`, `AGENTS.md`, and `docs/adr/` before implementing any phase.

---

## Implementation Guardrails (For Coding Agents)

1. **Styling & Animation Stack (`docs/adr/0001-in-house-theme-tokens-and-svg-board.md`)**:
   - Do **not** install UI component frameworks (`NativeWind`, `Tamagui`, `Paper`, etc.) or WebView boards.
   - Use typed `StyleSheet` tokens (`src/theme/`), `react-native-svg`, `react-native-reanimated`, and `react-native-gesture-handler`.
   - Install new Expo modules strictly via `npx expo install <pkg>` (`@expo/vector-icons`, `expo-haptics`, `expo-audio`) so SDK 54 versions stay aligned, and add corresponding Jest mocks in `jest.setup.js`.
2. **Domain Vocabulary (`GLOSSARY.md`)**:
   - Use canonical terms in types, props, and UI copy: **Skill Tier** (`Beginner` | `Intermediate` | `Advanced` | `Traps`), **Recall Rating** (`Hard` | `Good` | `Easy`), **Repertoire Side** (`White` | `Black`), **Study Walkthrough**, **Practice Drill**, **Drill Summary**, **App Theme**, **Board Theme**, **Piece Set**.
3. **Critical Existing Invariants (`AGENTS.md`)**:
   - Inside callbacks/timers in `src/hooks/useOpeningPractice.ts` and `src/screens/GameScreen.tsx`, always read `engine.getTurn()` directly instead of React `currentTurn` state.
   - Run `checkOpeningCompletionWithHistory([...moveHistory, move])` after **both** player moves and opponent moves.
   - Preserve ISO string <-> `Date` hydration in `ProgressTracker` and `GamificationTracker`, and follow the `@chess_openings:<feature>` AsyncStorage key convention.
   - Keep the `babel-jest` / `NODE_ENV === 'test'` guard **above** `api.cache(true)` in `babel.config.js`.
   - Every task/PR must pass `npx tsc --noEmit` and `npm test`.

---

## Active Plan (Prioritized)

### 0. Migrate off Beads (`bd`) to Written Plan (P0) — Completed
- [x] Export all open and closed issues from `.beads/issues.jsonl` into `docs/ROADMAP.md`.
- [x] Remove `.beads/`, `.gitattributes`, `.git/hooks/` `bd` shims, and `.git/config` `[beads]` / `[merge "beads"]` sections.
- [x] Update `AGENTS.md`, `CLAUDE.md`, `.gitignore`, and `.claude/settings.local.json`, and configure `docs/agents/` + `GLOSSARY.md` + `docs/adr/`.

---

### 1. Phase 6: Design System, App Theme & Vector Chess Board (P0)

**Goal**: Replace raw Unicode pieces, static tap-only squares, emoji navigation, and hardcoded 2014 Material colors with a dark-first modern chess **App Theme**, real Staunton SVG **Piece Set**, 60fps board animations + drag-and-drop, tactile haptics/audio, and a zero-layout-shift **Practice Drill** viewport.

#### 6.1 Typed Design System & App Theme (`src/theme/`)
- [x] Create `src/theme/tokens.ts` defining semantic tokens (structured for dark default + future light palette):
  - **Surfaces**: `bgPrimary: '#12161F'`, `bgSecondary: '#1C2230'`, `bgElevated: '#252D3D'`, `borderSubtle: '#2E384D'`
  - **Brand & Accents**: `accentGold: '#F39C12'`, `accentGoldMuted: 'rgba(243, 156, 18, 0.16)'`, `info: '#4A9EFF'`
  - **Semantic Status**: `success: '#2ECC71'`, `warning: '#F59E0B'`, `danger: '#EF4444'`
  - **Skill Tier Colors**: `beginner: '#2ECC71'`, `intermediate: '#F59E0B'`, `advanced: '#EF4444'`, `traps: '#A855F7'`
  - **Text**: `textPrimary: '#F8FAFC'`, `textSecondary: '#94A3B8'`, `textMuted: '#64748B'`, `textOnAccent: '#12161F'`
  - **Scale**: spacing (`4, 8, 12, 16, 20, 24, 32`), radii (`sm: 6, md: 10, lg: 14, pill: 999`), typography presets (title, heading, body, caption, mono).
- [x] Create `src/theme/ThemeContext.tsx` (`useAppTheme()` hook) and wrap `App.tsx` (configure `<StatusBar style="light" />` and `@react-navigation/native` `DarkTheme` nav header/tab colors so transitions have no white flashes).
- [x] Create reusable UI primitives in `src/components/ui/`: `Badge` (Skill Tier, Recall Rating, Repertoire Side), `Button` (`primary`, `secondary`, `ghost`, `icon`), `Card`, and `SegmentedPills`.

#### 6.2 Vector Navigation & `SettingsScreen`
- [x] Install `@expo/vector-icons` (`npx expo install @expo/vector-icons`) and mock it in `jest.setup.js`.
- [x] Update `MainTabParamList` and `MainTabs` in `src/navigation/AppNavigator.tsx` from 2 emoji tabs to 3 vector-icon tabs:
  - `Openings` (repertoire/book icon)
  - `Progress` (stats/chart icon)
  - `Settings` (sliders/cog icon)
- [x] Create `src/services/preferences/preferencesTracker.ts` persisted under `@chess_openings:preferences` (`{ hapticsEnabled: boolean, soundEnabled: boolean, boardThemeId: string, pieceSetId: string }`).
- [x] Build `src/screens/SettingsScreen.tsx` with Sound & Haptics switches (and reserved sections for Phase 8 `Premium / Restore Purchases` and Phase 9 `Board Theme` & `Piece Set` selectors).

#### 6.3 Vector Staunton `Piece Set` & Board Visuals (`src/components/ChessBoard/`)
- [x] Replace Unicode `<Text>` glyphs in `src/components/ChessBoard/Piece.tsx` (`♙ ♟`) with crisp multi-path `react-native-svg` Staunton vector silhouettes (`src/components/ChessBoard/pieces/staunton/*.tsx`) for `p, n, b, r, q, k` in both `white` (ivory fill + dark stroke/detail lines so pieces never wash out on light squares) and `black` (charcoal fill + subtle inner highlight strokes).
- [x] Refactor `src/components/ChessBoard/Square.tsx` and `ChessBoard.tsx`:
  - Replace full-square neon-green legal move fills (`#90ee90`) with chess-standard indicators: semi-transparent center dot (`r = size * 0.14`) on empty target squares, and corner ring/halo (`r = size * 0.42`, `strokeWidth = size * 0.08`) on capture squares.
  - Render subtle warm amber/gold translucent overlays for `isSelected` and `isLastMove` (`from` and `to`) and red radial/square highlight when a King is in check (`engine.isCheck()`).
  - Move rank (`1-8`) and file (`a-h`) coordinates **inside** the edge squares (top-left of `a-file` squares for ranks, bottom-right of bottom-rank squares for files, alternating square contrast color) so the board uses full horizontal width (`Dimensions.get('window').width - 24`) instead of wasting 48px on outer margins.

#### 6.4 Smooth Piece Animation, Drag-and-Drop & Sensory Feedback
- [x] Animate piece movement (`150-180ms` ease-out `withTiming` in `react-native-reanimated`) on programmatic/AI moves and tap-to-move transitions so pieces glide rather than teleport.
- [x] Wrap `ChessBoard` in `GestureDetector` (`Gesture.Pan()` + `Gesture.Tap()` from `react-native-gesture-handler`, ensuring `<GestureHandlerRootView style={{ flex: 1 }}>` wraps `App.tsx`):
  - Keep two-tap move (`select square -> tap destination`) working identically.
  - Support drag-and-drop: lift dragged piece at `1.15x` scale slightly above finger offset, highlight hovered target square, snap to target if legal or spring back to origin if illegal.
- [x] Install `expo-haptics` and `expo-audio` (`npx expo install expo-haptics expo-audio`), add `src/services/feedback/sensoryFeedback.ts` (respecting `preferencesTracker`), and trigger distinct feedback for `move`, `capture`, `check`, `mistake`, and `drillComplete` (plus Jest mocks in `jest.setup.js`).

#### 6.5 Fixed Non-Scrolling `GameScreen` Viewport
- [x] Replace the `<ScrollView>` wrapper in `src/screens/GameScreen.tsx` with a `<SafeAreaView>` flex column (`flex: 1`) with 4 fixed/reserved zones so the board **never shifts vertically**:
  1. **Compact Top Bar**: Back button, opening name + ECO, Repertoire Side pill (`White` / `Black`), and progress counter (`Move X of Y`).
  2. **Reserved Status / Feedback Strip** (fixed height ~52px): Shows turn prompt (`Your move` / `Opponent thinking...`) or inline correct/mistake status without changing height.
  3. **Centered Full-Width Board Zone**: `<ChessBoard />` + horizontal single-line PGN move tape directly underneath (auto-scrolling to latest move).
  4. **Pinned Bottom Control Bar**: Active drill controls (`Restart`, `End Drill`; `Hint` added in Phase 7).
- [x] Restyle `OpeningBrowserScreen`, `OpeningDetailScreen`, `ProgressScreen`, `OpeningCard`, `XPProgressBar`, and `AchievementCard` onto `useAppTheme()` tokens so 100% of screens share the dark-first App Theme.

**Phase 6 Acceptance Criteria**:
- Zero emoji icons in navigation/buttons; zero Unicode text chess pieces; zero board layout shift during play; tap and drag-and-drop both execute legal moves smoothly; `npx tsc --noEmit` and `npm test` pass.

---

### 2. Phase 7: Study Walkthrough, Assisted Drills & Repertoire UX (P0)

**Goal**: Close the learning-to-recall UX gap so players can visually study lines before drilling, target specific variations, see SVG move arrows on hints/mistakes, rate recall in one tap without modal friction, and browse openings visually.

#### 7.1 `Repertoire Side` Correctness (Bug Fix + UX Guardrail)
- [ ] Add helper `hasCompleteTwoSidedMoves(opening: Opening): boolean` in `src/services/chess/openingDatabase.ts` (returns `false` when consecutive moves share the same `color`, such as system openings like `london-system`).
- [ ] Fix random 50/50 color assignment bugs in **both** `src/screens/OpeningBrowserScreen.tsx` (`handleRoulettePress`, line 88) and `src/screens/GameScreen.tsx` (`loadNextOpening`, line 127): always default `userColor` to `opening.color`.
- [ ] On `OpeningDetailScreen`, display `You play White` / `You play Black` (`opening.color`) by default; only show a secondary `Practice opposite side` toggle when `hasCompleteTwoSidedMoves(opening)` is `true`.

#### 7.2 `Study Walkthrough` & Targeted Line Selection (`OpeningDetailScreen`)
- [ ] Embed `<ChessBoard />` at the top of `src/screens/OpeningDetailScreen.tsx` (flipped automatically when `selectedColor === 'black'`).
- [ ] Add **Line Selector Pills**: `Main Line` plus one pill per `opening.alternateLines` entry, showing that line's `description` and formatted move list with the current ply highlighted.
- [ ] Add **Playback Controls**: `|<` (start), `<` (prev ply), `Play/Pause` (auto-step ~900ms/move), `>` (next ply), `>|` (end of line), syncing board state + move sound/haptics.
- [ ] Update `RootStackParamList['Game']` in `src/navigation/AppNavigator.tsx` to accept optional `targetLineId?: 'main' | string` (or line index):
  - Primary CTA: **`Drill This Line`** (passes the active `Main Line` or selected `AlternateLine` so `AIOpponent` follows that exact branch deterministically).
  - Secondary CTA (when `alternateLines.length > 0`): **`Drill All Lines`** (opponent randomizes across main line + variations).
- [ ] Update `AIOpponent` (`src/services/chess/aiOpponent.ts`) and `useOpeningPractice` (`src/hooks/useOpeningPractice.ts`) to honor `targetLine` when provided, with unit tests in `src/services/chess/__tests__/`.

#### 7.3 SVG Board Arrows & Assisted `Hint` (`ChessBoard` + `GameScreen`)
- [ ] Add `arrows?: Array<{ from: string; to: string; color?: string }>` prop to `ChessBoard.tsx`, rendering an SVG `<Line>` + arrowhead `<Polygon>` layer above pieces (`pointerEvents="none"`).
- [ ] On `Practice Drill` mistake (`sessionOutcome === 'failed'` and `expectedMove` exists), draw a high-contrast gold/green arrow (`expectedMove.from -> expectedMove.to`) directly on the board alongside the mistake message.
- [ ] Add **`Hint`** button to the active bottom control bar in `GameScreen` and `requestHint()` in `useOpeningPractice`:
  - Reveals the next expected player move via an SVG arrow on the board.
  - Tracks `hintsUsed: number` on the session (`SessionStats.hintsUsed?: number` in `src/types/progress.ts`), capping/penalizing unassisted accuracy & `perfect_session` XP bonus when `hintsUsed > 0` (unit-tested in `gamificationTracker.test.ts`).

#### 7.4 Inline `Drill Summary` Sheet (Replaces Delayed Blocking Modal)
- [ ] Replace `src/components/DifficultyRating/DifficultyRating.tsx` full-screen blocking `<Modal>` and the two-step `pendingAction` deferral in `GameScreen.tsx` with `src/components/DrillSummary/DrillSummarySheet.tsx` — an animated Reanimated bottom sheet anchored over the bottom control zone as soon as `sessionOutcome` enters `completed`, `failed`, or `theory_exhausted`:
  - Displays outcome header, accuracy, `hintsUsed`, XP gained, and current streak.
  - Displays inline single-tap **`Recall Rating`** pills (`Hard`, `Good`, `Easy` — pre-highlighting existing rating if set, saving immediately on tap without closing the sheet).
  - Displays immediate primary/secondary action buttons (`Next Drill` + `Retry` on completed; `Retry` + `Study Line` on failed).

#### 7.5 Visual Browse (`OpeningCard` Mini-Board + Carousel) & `ProgressScreen`
- [ ] Build lightweight static `MiniChessBoard` (`src/components/ChessBoard/MiniChessBoard.tsx`, ~72x72px pure SVG from final FEN of `opening.mainLine`, flipped for Black openings, memoized with `React.memo`).
- [ ] Redesign `OpeningCard.tsx`: left `MiniChessBoard` thumbnail, title + ECO, `Repertoire Side` king icon badge (`White` / `Black`), `Skill Tier` badge, mastery progress dots/stars, and `Recall Rating` chip.
- [ ] Redesign `OpeningBrowserScreen.tsx`:
  - Replace the 10-card vertical "Recommended for You" wall with a compact **Hero "Quick Drill" Card** (weighted roulette) + **horizontal `FlatList` carousel** (5 recommended cards).
  - Fix combined `Skill Tier` filter + `searchQuery` bug so text search filters *within* the active `difficultyFilter` instead of searching all openings globally.
  - Convert the main catalog list from `<ScrollView>` `.map()` to `<FlatList>` for smooth 60fps scrolling.
- [ ] Redesign `ProgressScreen.tsx`:
  - Top hero row: **Level + XP bar** paired with **Day Streak** card.
  - Segmented **Practiced Repertoire** filter (`Needs Review` = rated `Hard` or `<70%` accuracy, `In Progress`, `Mastered` = 4-5 stars; hide unpracticed openings by default with an empty-state CTA to start first drill).
  - Full **Achievements** modal/view showing **all** `ACHIEVEMENTS` (unlocked badges + locked achievements with progress bars from `AchievementProgressTracker`).

**Phase 7 Acceptance Criteria**:
- Every opening can be stepped through visually in `Study Walkthrough`; `Drill This Line` deterministically tests the chosen variation; mistakes and `Hint` render SVG arrows on the board; `Drill Summary` requires 1 tap (not 2) to rate and continue; combined search + `Skill Tier` filter works; `npx tsc --noEmit` and `npm test` pass.

---

### 3. Phase 8: Monetization & In-App Purchases (P0)
- **Goal**: Freemium model with 10 free openings and a one-time premium unlock (`com.crackmac.chessopenings.premium`, $2.99-$4.99) built on `useAppTheme()` and `SettingsScreen`.
- **Dependencies**: Phase 6 & Phase 7, Apple Developer account (`eas.json` configured), Google Play Developer account, `react-native-iap` or `expo-in-app-purchases`.
- **Tasks**:
  - [ ] Configure non-consumable IAP (`com.crackmac.chessopenings.premium`) in App Store Connect and Google Play Console.
  - [ ] Add `isPremium: boolean` to `Opening` in `src/types/opening.ts` and mark 10 openings free (4 Beginner, 4 Intermediate, 2 Advanced) and remaining openings premium across `src/data/openings/*.ts`.
  - [ ] Implement `src/services/iap/purchaseService.ts` (init, purchase, receipt check, restore purchases) and `src/services/iap/accessControl.ts` (`canAccessOpening`, `isPremiumUnlocked`, `getPremiumStatus`).
  - [ ] Build `PremiumBadge`, `PurchaseModal`, and `src/screens/PaywallScreen.tsx` using `src/theme/tokens.ts`, and wire locked `OpeningCard` taps + `SettingsScreen` "Restore Purchases".
  - [ ] Validate sandbox purchases and restore persistence across restarts/reinstalls on iOS and Android.

---

### 4. Phase 9: `Board Theme` & `Piece Set` Customization (P1)
- **Goal**: Additional selectable **Board Themes** and SVG **Piece Sets** plugging into Phase 6's `preferencesTracker` and vector piece architecture.
- **Dependencies**: Phase 6 (`preferencesTracker`, SVG `Piece` architecture, `SettingsScreen`).
- **Tasks**:
  - [ ] Define 5 `BoardTheme` presets in `src/theme/boardThemes.ts`: Classic Walnut (`#F0D9B5` / `#B58863`), Midnight Slate (`#CBD5E1` / `#475569`), Emerald Club (`#EEEED2` / `#769656`), Ocean Ice (`#E8EDF9` / `#6C8EBF`), and Tournament Contrast (`#F8FAFC` / `#334155`).
  - [ ] Add 2 additional SVG `Piece Set`s alongside Classic Staunton in `src/components/ChessBoard/pieces/`: `Modern` (geometric minimalist) and `Bold` (high-contrast thick-stroke).
  - [ ] Populate the `SettingsScreen` Appearance section with a live interactive mini-board preview and `Board Theme` / `Piece Set` pickers (optionally gating premium skins via Phase 8 `accessControl` if desired).

---

### 5. Phase 10: `Traps` Skill Tier Implementation (P1)
- **Goal**: Add a premium-only `Traps` **Skill Tier** featuring 10-12 classic opening traps with both opponent-falls-for-trap and opponent-refutes-trap lines.
- **Dependencies**: Phase 7 (`Study Walkthrough`, SVG arrows) & Phase 8 (`isPremium` access control).
- **Target Traps**: Scholar's Mate, Legal's Mate, Fried Liver Attack, Fishing Pole, Noah's Ark, Lasker Trap, Siberian Trap, Mortimer Trap, Elephant Trap, Rubinstein Trap, Blackburne Shilling Gambit, Halosar Trap.
- **Tasks**:
  - [ ] Extend `Opening['difficulty']` in `src/types/opening.ts` to include `'traps'` (and `XPConfig.difficultyMultipliers` in `src/types/gamification.ts`).
  - [ ] Author `src/data/openings/traps.ts` (`isPremium: true`) with main trap lines, refutation/avoidance `alternateLines` (full move arrays from move 1), and tactical explanations; register in `src/data/openings/index.ts`.
  - [ ] Add `Traps` pill to `OpeningBrowserScreen` and highlight the key tactical blow ply in `Study Walkthrough` and `Practice Drill`.

---

### 6. Unify Streak Calculation in `useProgress` (P2)
- **Goal**: Eliminate the duplicate stubbed streak fields in `useProgress`.
- **Tasks**:
  - [ ] Replace hardcoded `currentStreak: 0` / `longestStreak: 0` in `src/hooks/useProgress.ts` (lines 136-137) by computing consecutive local practice days from `sessionHistory` (or reading directly from `GamificationTracker` as single source of truth) and add unit tests in `src/hooks/__tests__/useProgress.test.tsx`.
  - [x] Fix `GamificationTracker.updateStreak()` in `src/services/gamification/gamificationTracker.ts` so the first practice session sets `currentStreak = 1`.

---

### 7. Phase 11: App Store Marketing Assets & New-UI Screenshots (P2)
- **Goal**: Re-capture all App Store / Play Store screenshots and promotional graphics once Phases 6-9 land so store listings showcase the dark-first App Theme, vector Staunton board, `Study Walkthrough`, and `Drill Summary`.
- **Dependencies**: Phases 6 & 7 (minimum), Phases 8 & 9 (ideal).
- **Tasks**:
  - [ ] Verify 1024x1024 app icon against iOS/Android guidelines.
  - [ ] Capture fresh 6.9" / 6.7" iPhone and Android screenshots showcasing Browse (mini-boards + carousel), `Study Walkthrough`, `Practice Drill` with SVG move arrows, `Drill Summary` + XP/Streak, and `Board Theme` customization (`docs/SCREENSHOT_GUIDE.md`, `docs/APP_STORE.md`).

---

## Completed Milestones

- [x] **Phases 1-4: MVP Core, Progress & Gamification** — `ChessEngine` (`chess.js` wrapper), `OpeningDatabase`, theory-following `AIOpponent`, initial `ChessBoard`, 20+ openings across Beginner/Intermediate/Advanced, AsyncStorage `ProgressTracker`, `Recall Rating` storage, XP/levels, and 15+ achievements.
- [x] **Phase 5: Session Outcome State Machine** — `sessionOutcome` (`active` / `completed` / `failed` / `theory_exhausted`) and post-session navigation flows.
- [x] **Intelligent Browse Recommendations** — `OpeningRoulette.selectTopOpenings()` weighted without-replacement selection (`hard` 3x, `good`/unrated 1x, `easy` 0.3x).
