# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React Native Expo mobile app that gamifies chess opening learning through interactive practice. Users play against an AI opponent that follows opening theory, with real-time feedback, progress tracking, and Anki-style difficulty ratings.

**Tech Stack**: React Native 0.81.5, Expo SDK 54, TypeScript (strict mode), chess.js, React Navigation, AsyncStorage

## Development Commands

### Core Development
```bash
npm install               # Install dependencies (ALWAYS verify node_modules/ exists before running other commands)
npm start                 # Start Metro bundler
npm start -- --clear      # Clear Metro cache and start (use when encountering module resolution errors)
npm run ios               # Run on iOS simulator
npm run android           # Run on Android emulator
```

### Testing
```bash
npm test                  # Run all tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run tests with coverage report
```

### TypeScript
```bash
npx tsc --noEmit         # Type-check without emitting files
```

### Cache Management
```bash
expo start -c            # Clear Expo cache
rm -rf node_modules && npm install  # Complete dependency refresh
```

### Build & Deployment (EAS)
```bash
npm install -g eas-cli          # Install EAS CLI globally
eas login                        # Login to Expo account
eas build --platform ios --profile production   # Build for iOS App Store
eas submit --platform ios --profile production  # Submit to App Store
npx expo prebuild --platform ios # Generate native iOS project for Xcode
```

**Build Profiles** (defined in `eas.json`):
- `development`: Dev client with internal distribution
- `preview`: Internal testing builds
- `production`: App Store builds with auto-increment version

**iOS Configuration**:
- Bundle ID: `com.crackmac.chessopenings`
- App Store ID: `6757377926`
- See `docs/APP_STORE.md` for complete submission workflow

## Architecture

### Core Chess Logic Flow
```
User Move → useOpeningPractice hook
           ↓
      ChessEngine (validates move)
           ↓
      OpeningDatabase (checks theory)
           ↓
      AIOpponent (responds if in theory)
           ↓
      ProgressTracker (saves stats to AsyncStorage)
```

### Key Services

**ChessEngine** (`src/services/chess/chessEngine.ts`)
- Wraps chess.js library with typed interface
- Handles move validation, FEN generation, and game state
- All chess logic is centralized here

**OpeningDatabase** (`src/services/chess/openingDatabase.ts`)
- Manages opening definitions (main lines + alternate variations)
- Line matching algorithm: checks alternate lines first (they can deviate), then main line
- `getExpectedMove()`: Returns next move in theory for current position
- `isMoveInTheory()`: Validates if user move follows opening theory

**AIOpponent** (`src/services/chess/aiOpponent.ts`)
- Follows opening theory when possible
- Falls back to reasonable moves when theory exhausted
- Records move history for context

### Hook Architecture

**useOpeningPractice** (`src/hooks/useOpeningPractice.ts`) - Master orchestration hook
- Manages entire practice session lifecycle
- Coordinates between chess engine, AI opponent, and progress tracking
- Handles opening completion detection and session endings
- Important: Checks opening completion after BOTH user and AI moves

**useChessGame** (`src/hooks/useChessGame.ts`)
- Lower-level chess game state (position, turn, move history)
- Wraps ChessEngine in React state management

**useProgress** (`src/hooks/useProgress.ts`)
- Persistence layer for progress tracking
- Interfaces with AsyncStorage
- Calculates mastery levels, accuracy, ratings

**useGamification** (`src/hooks/useGamification.ts`)
- Manages XP, levels, achievements, and daily streaks
- Interfaces with GamificationTracker service
- Awards XP based on session completion and accuracy
- Checks and unlocks achievements after each session
- Tracks daily practice streaks

### Gamification Services

**GamificationTracker** (`src/services/gamification/gamificationTracker.ts`)
- XP calculation: Base XP + accuracy bonus + difficulty multiplier
- Level progression: Exponential XP requirements (100 * level^1.5)
- Achievement system: 15+ achievements with progressive tiers
- Achievement unlocking logic based on stats thresholds

**OpeningRoulette** (`src/services/gamification/openingRoulette.ts`)
- Weighted random opening selection
- Prioritizes lower-mastery openings (0-2 stars)
- Filters by difficulty level
- Uses inverse mastery weights to encourage practice of weaker openings

### Opening Data Structure

Openings are defined in `src/data/openings/` organized by difficulty:
- Each opening has a `mainLine` (array of moves)
- `alternateLines` contain variations that can deviate from main line
- `deviationMove` property indicates where alternate line branches
- Line matching prioritizes alternate lines to handle variations correctly

### Session Flow States

1. **Session Start**: Opening loaded, AI makes first move if user is black
2. **Active Practice**: User makes moves, validated against theory
3. **Move Validation**: Correct moves continue, mistakes trigger expected move display
4. **Opening Completion**: Detected when move history matches full line length
5. **Session End**: Either by completion, mistake, or theory exhaustion
6. **Rating Prompt**: Shows after completion or mistake (waits for user interaction first)

### ChessBoard Component

Located in `src/components/ChessBoard/`:
- **ChessBoard.tsx**: Main board with rank/file labels (1-8, a-h)
- **Square.tsx**: Individual square component with highlighting
- **Piece.tsx**: SVG-based chess piece rendering
- Supports board flipping for black perspective
- Highlights: valid moves, selected square, last move

## Critical Implementation Details

### Opening Completion Detection
Opening completion is checked in two places in `useOpeningPractice.ts`:
1. After user move (line ~186)
2. After AI move (line ~250)
Both use `checkOpeningCompletionWithHistory()` with manually updated move arrays because React state updates are asynchronous.

### Turn Management
Always use `engine.getTurn()` directly in callbacks to avoid stale closures. The `currentTurn` state in `useChessGame` triggers re-renders but may be stale in async callbacks.

### Session Ending Logic
- Mistakes: Show expected move, wait 100ms, end session with rating prompt
- Completion: End immediately with rating prompt
- Theory exhausted: End without rating prompt (only if neither player has expected moves)
- Rating prompt shows AFTER user taps the board (via `waitingForInteraction` state)

### AsyncStorage Schema
Progress and gamification data stored with these key patterns:
- `opening_progress_${openingId}`: Opening stats (attempts, accuracy, mastery, ratings)
- `session_stats_${sessionId}`: Historical session data
- `opening_rating_${openingId}`: User difficulty ratings (hard/good/easy)
- `gamification_data`: XP, level, total XP earned
- `achievements_${achievementId}`: Achievement unlock status
- `daily_streak_data`: Current streak, last practice date
- `user_stats`: Global statistics (total sessions, openings completed, etc.)

## Testing

### Test Structure
- Unit tests in `__tests__/` directories next to source files
- Jest configuration in `package.json`
- Test setup in `jest.setup.js` (mocks AsyncStorage, react-native-reanimated)

### Running Specific Tests
```bash
npm test -- useOpeningPractice.test.ts     # Run single test file
npm test -- --testNamePattern="should handle user moves"  # Run tests matching pattern
npm run test:watch                          # Watch mode for development
npm run test:coverage                       # Generate coverage report
```

### Common Test Patterns
- Mock AsyncStorage is automatically configured in `jest.setup.js`
- Use `@testing-library/react-native` for component testing
- Console warnings/errors are silenced in test environment
- Tests use `jest-expo` preset for Expo-specific transformations

### Mocked Modules
Tests automatically mock:
- `@react-native-async-storage/async-storage`
- `react-native-reanimated`
- `react-native-worklets/plugin`

## Development Workflow Requirements

### Before Running ANY npm/node Command
1. Verify `node_modules/` exists and is not empty
2. Check critical packages: `ls node_modules/expo node_modules/react node_modules/react-native`
3. If missing or incomplete, run `npm install` FIRST
4. Verify `package.json`, `app.json`, `tsconfig.json` exist

### Common Error Resolution
- **Module resolution errors**: Check node_modules → Run npm install → Clear cache
- **Metro bundler errors**: `npm start -- --clear` → Verify config → Reinstall if needed
- **Type errors**: Run `npx tsc --noEmit` to see all TypeScript errors
- Never skip verification steps before proceeding

## Adding New Features

### Adding a New Opening
1. Create opening definition in `src/data/openings/[difficulty].ts`
2. Follow `Opening` interface in `src/types/opening.ts`
3. Include `mainLine` (Move[]) and optional `alternateLines`
4. Export from `src/data/openings/index.ts`
5. Opening automatically appears in browser

### Adding a New Screen
1. Create in `src/screens/[ScreenName].tsx`
2. Add to `AppNavigator.tsx` stack
3. Add route type to `RootStackParamList` in `src/types/navigation.ts`
4. Use existing screens as templates for styling consistency

### Move Notation Format
Moves use chess.js format:
```typescript
{
  from: string;      // e.g., "e2"
  to: string;        // e.g., "e4"
  san: string;       // Standard Algebraic Notation, e.g., "e4"
  color: 'white' | 'black';
  promotion?: 'q' | 'r' | 'b' | 'n';
}
```

## Code Style

- **TypeScript**: Strict mode enabled, avoid `any` types
- **Components**: Functional components with hooks only
- **File naming**: PascalCase for components, camelCase for utilities
- **Imports**: Group by React, third-party, local
- **One component/hook per file** with index.ts exports

## Project-Specific Patterns

### Hook Dependencies
When using `useCallback`/`useEffect`, include all dependencies even if it causes re-renders. Stale closures are a common bug source, especially with turn management and move validation.

### Error Handling
Use try-catch blocks around AsyncStorage operations. Log errors to console (appears in Metro bundler).

### Board State
Never mutate chess.js game instance directly. Always use ChessEngine wrapper methods which return new state.

### Move Feedback Timing
Use setTimeout delays for AI moves (500ms) and session endings (100ms) to give users time to see board state changes before UI updates.

## Common Issues & Solutions

### "Cannot find module" Errors
1. Verify `node_modules/` exists: `ls node_modules | wc -l` (should show ~100+ packages)
2. Run `npm install` to reinstall dependencies
3. Clear Metro cache: `npm start -- --clear`
4. If persists, delete and reinstall: `rm -rf node_modules && npm install`

### Metro Bundler Not Starting
- Check that `metro.config.js` exists
- Clear watchman: `watchman watch-del-all` (if watchman installed)
- Reset bundler: `npx react-native start --reset-cache`

### iOS Build Fails
- Ensure Xcode command line tools installed: `xcode-select --install`
- Generate iOS project: `npx expo prebuild --platform ios --clean`
- Clear derived data: `rm -rf ~/Library/Developer/Xcode/DerivedData`

### Type Errors After Changes
- Run `npx tsc --noEmit` to see all TypeScript errors
- Check that all imports are correct
- Verify type definitions in `src/types/` match usage

# Agent Instructions

This project uses **bd** (beads) for issue tracking. Run `bd onboard` to get started.

## Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --status in_progress  # Claim work
bd close <id>         # Complete work
bd sync               # Sync with git
```

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**
- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds

