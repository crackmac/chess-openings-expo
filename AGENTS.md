# Agent Instructions

React Native 0.81.5 + Expo SDK 54 (`newArchEnabled: true`) + React 19 + TypeScript (`strict: true`) mobile app for practicing chess openings against a theory-following AI opponent.

## Commands & Verification

No lint or format scripts are configured; TypeScript and Jest are the quality gates:

```bash
npx tsc --noEmit                                                    # Typecheck (no npm script in package.json)
npm test                                                            # Run all Jest suites
npm test -- src/services/chess/__tests__/openingDatabase.test.ts    # Run a single test file
npm test -- -t "should detect deviation"                            # Run tests matching name pattern
npm run test:coverage                                               # Coverage over src/**/*.{ts,tsx}
npm start -- --clear                                                # Start Metro with cleared cache
npx expo prebuild --platform ios                                    # Regenerate gitignored ios/ project
```

- Native `/ios` and `/android` folders are generated artifacts (gitignored). Production builds use EAS (`eas.json`, `appVersionSource: "remote"`).

## Architecture & Repo Gotchas

- **Entrypoints & Navigation**: `index.ts` -> `App.tsx` -> `src/navigation/AppNavigator.tsx`. Uses `@react-navigation/native` (`native-stack` + `bottom-tabs`). Ignore `.cursorrules` (generic boilerplate referencing Expo Router and `App.js`) and stale paths in `CLAUDE.md` (`RootStackParamList` and `MainTabParamList` are exported from `src/navigation/AppNavigator.tsx`, not `src/types/navigation.ts`).
- **Turn state & stale closures (`src/hooks/useOpeningPractice.ts`, `src/screens/GameScreen.tsx`)**: Inside callbacks and AI `setTimeout`s (300ms initial black move, 500ms AI reply), always read `engine.getTurn()` directly instead of React `currentTurn` state from `useChessGame`.
- **Opening completion checks (`src/hooks/useOpeningPractice.ts`)**: Must run after **both** user moves and AI moves via `checkOpeningCompletionWithHistory([...moveHistory, move])` because React `moveHistory` state has not updated yet in the same tick.
- **Deferred rating prompt flow**: `endSession(false)` ends completed/failed sessions without showing the rating modal. `GameScreen` defers `triggerRatingPrompt()` until the user taps `Try Again`, `Next Opening`, or `Browse Openings`, storing the follow-up in `pendingAction`.
- **Variation matching (`src/services/chess/openingDatabase.ts`)**: `findMatchingLine()` checks `alternateLines` **before** `mainLine`. Each `AlternateLine.moves` must contain the full move list from move 1 (including shared prefix moves before `deviationMove`), not just the deviating suffix.
- **System openings**: Openings like `london-system` (`src/data/openings/beginner.ts`) omit flexible opponent replies by listing consecutive same-color moves in `mainLine` (rendered as `... (any)` in `OpeningDetailScreen`).
- **AsyncStorage keys & Date hydration** (`CLAUDE.md` lists outdated key names; trust the trackers):
  - `ProgressTracker` (`src/services/storage/progressTracker.ts`): `@chess_openings:progress` (map keyed by `openingId`) and `@chess_openings:session_history` (`SessionStats[]`).
  - `GamificationTracker` (`src/services/gamification/gamificationTracker.ts`): `@chess_openings:gamification` (`GamificationData`) and `@chess_openings:xp_history` (capped at 100 `XPEvent`s).
  - Both trackers serialize `Date` fields to ISO strings on write and rehydrate `new Date(...)` on read; preserve this conversion when adding date fields.
- **Adding openings**: Define in `src/data/openings/{beginner,intermediate,advanced}.ts` using `Move` objects (`{ from, to, san, color, promotion? }`) and ensure inclusion in `allOpenings` (`src/data/openings/index.ts`). Note: in `OpeningBrowserScreen`, setting both `difficultyFilter` and `searchQuery` currently lets `searchOpenings()` search only `this.openings` without chaining the difficulty filter.

## Testing Quirks

- **`babel.config.js` ordering**: Detects `babel-jest` / `NODE_ENV === 'test'` **before** `api.cache(true)` so `react-native-reanimated/plugin` is skipped in Jest. Do not move `api.cache(true)` above `api.caller(...)`.
- **Global mocks (`jest.setup.js`)**: Automatically mocks `@react-native-async-storage/async-storage`, `react-native-reanimated`, and `react-native-worklets/plugin`, and silences `console.warn` and `console.error`.

## Domain Docs, Roadmap & Issue Tracking

- **Domain Vocabulary & ADRs**: Read `GLOSSARY.md` (canonical terms: `Skill Tier`, `Recall Rating`, `Repertoire Side`, `Study Walkthrough`, `Practice Drill`, `Drill Summary`, `App Theme`, `Board Theme`, `Piece Set`) and `docs/adr/` (`0001-in-house-theme-tokens-and-svg-board.md`) before designing or implementing features (`docs/agents/domain.md`).
- **Roadmap & Specs**: Implementation-ready phase specs and prioritized backlog live in `docs/ROADMAP.md` (background product context in `docs/PRD.md`). Keep `docs/ROADMAP.md` updated as tasks complete.
- **Issue Tracker**: GitHub Issues on `crackmac/chess-openings-expo` via `gh` CLI (`docs/agents/issue-tracker.md`, `docs/agents/triage-labels.md`) — run `/to-tickets` or `/implement` when ready to break a `docs/ROADMAP.md` phase into executable vertical slices.
- **Quality Gates**: Run `npx tsc --noEmit` and `npm test` whenever code changes.


