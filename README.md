# Chess Openings Learning App

A mobile-first React Native application that gamifies chess opening learning through interactive play. Practice openings by playing against an AI opponent that follows opening theory, helping you recognize patterns and memorize main lines and alternate variations through repetition.

## 📱 Overview

This app helps chess players of all levels learn and memorize chess openings through hands-on practice. Key features include:

- **Interactive Practice**: Play against an AI that follows opening theory
- **Real-time Feedback**: Immediate validation of moves with visual indicators
- **Progress Tracking**: Track your mastery level, accuracy, and practice history
- **Difficulty Rating**: Rate openings as Hard/Good/Easy (Anki-style) for personalized learning
- **Opening Browser**: Browse 20+ openings organized by difficulty level
- **Offline Support**: All features work without internet connection

## 🎯 Features

### Core Features (MVP)
- ✅ Interactive chess board with touch/drag piece movement
- ✅ Chess board with rank/file labels (1-8, a-h) for easy square identification
- ✅ AI opponent that follows opening theory
- ✅ Real-time move validation and feedback
- ✅ Opening completion detection
- ✅ Session management with automatic end detection
- ✅ Difficulty rating system (Hard/Good/Easy)
- ✅ Progress tracking with AsyncStorage
- ✅ Opening browser with search and filtering
- ✅ Mastery level system (0-5 stars)
- ✅ Session statistics tracking
- ✅ Smart move notation showing "... (any)" for system openings where black's moves are flexible

### Gamification Features
- ✅ XP and leveling system with progress tracking
- ✅ Achievement system with 15+ unlockable achievements
- ✅ Daily streak tracking with visual indicators
- ✅ Opening roulette with weighted random selection (favors lower mastery)
- ✅ Session XP rewards based on accuracy and difficulty
- ✅ Level-up celebrations and achievement notifications

### Planned Features
- Cloud sync and cross-device progress
- Custom opening sets
- Opening explanations and theory notes
- Social features and leaderboards

## 🛠️ Tech Stack

- **Framework**: React Native with Expo SDK 54
- **Language**: TypeScript
- **Navigation**: React Navigation (Stack & Tabs)
- **Chess Engine**: chess.js
- **Storage**: AsyncStorage
- **UI**: React Native components with SVG rendering

### Key Dependencies
- `expo` ~54.0.30
- `expo-dev-client` ~6.0.20
- `react-native` 0.81.5
- `chess.js` ^1.4.0
- `@react-navigation/native` ^7.1.26
- `@react-native-async-storage/async-storage` 2.2.0
- `react-native-svg` 15.12.1

### Build & Deployment
- **EAS Build**: Cloud-based iOS/Android builds
- **EAS Submit**: Automated App Store submission
- **Xcode Integration**: Native iOS project generation via `expo prebuild`
- **Bundle ID**: `com.crackmac.chessopenings`

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator
- For iOS: Xcode 14+
- For Android: Android Studio

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chess-openings
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

   ⚠️ **Important**: Always verify `node_modules/` exists and is not empty before proceeding.

3. **Verify installation**
   ```bash
   # Check critical packages exist
   ls node_modules/expo
   ls node_modules/react
   ls node_modules/react-native
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

   Or for specific platforms:
   ```bash
   npm run ios      # iOS Simulator
   npm run android  # Android Emulator
   npm run web      # Web browser (limited support)
   ```

### Building for Production

This project uses **EAS Build** for production iOS and Android builds.

1. **Install EAS CLI**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo**
   ```bash
   eas login
   ```

3. **Build for iOS**
   ```bash
   eas build --platform ios --profile production
   ```

4. **Submit to App Store**
   ```bash
   eas submit --platform ios --profile production
   ```

For detailed build and submission instructions, see **[docs/APP_STORE.md](docs/APP_STORE.md)**.

### Xcode Integration

To open the project in Xcode (for debugging or local builds):

```bash
# Generate native iOS project
npx expo prebuild --platform ios

# Open in Xcode
open ios/chessopenings.xcworkspace
```

**Note**: The `ios/` directory is generated and excluded from git. Use `expo prebuild` to regenerate when needed.

### First Run Checklist

Before running the app, verify:
- ✅ `node_modules/` directory exists and contains packages
- ✅ `package.json` exists and is valid JSON
- ✅ `app.json` exists and is properly formatted
- ✅ `tsconfig.json` exists
- ✅ Entry point file exists (`index.ts`)

If you encounter issues:
1. Clear Metro cache: `npm start -- --clear`
2. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
3. Clear Expo cache: `expo start -c`

## 📁 Project Structure

```
chess-openings/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ChessBoard/      # Chess board with piece rendering
│   │   ├── DifficultyRating/# Rating modal component
│   │   ├── OpeningCard/     # Opening card display
│   │   ├── AchievementCard/ # Achievement display component
│   │   └── XPProgressBar/   # XP and level progress bar
│   ├── screens/              # Screen components
│   │   ├── GameScreen.tsx   # Main gameplay screen
│   │   ├── OpeningBrowserScreen.tsx # Browse/search openings + roulette
│   │   ├── OpeningDetailScreen.tsx
│   │   └── ProgressScreen.tsx # Stats, XP, streaks, achievements
│   ├── hooks/                # Custom React hooks
│   │   ├── useChessGame.ts  # Chess game state management
│   │   ├── useOpeningPractice.ts # Opening practice logic
│   │   ├── useProgress.ts   # Progress tracking
│   │   └── useGamification.ts # XP, achievements, streaks
│   ├── services/             # Business logic
│   │   ├── chess/           # Chess-related services
│   │   │   ├── chessEngine.ts
│   │   │   ├── aiOpponent.ts
│   │   │   └── openingDatabase.ts
│   │   ├── storage/         # Storage services
│   │   │   └── progressTracker.ts
│   │   └── gamification/    # Gamification services
│   │       ├── gamificationTracker.ts # XP, achievements logic
│   │       └── openingRoulette.ts # Weighted random selection
│   ├── types/                # TypeScript definitions
│   │   ├── chess.ts
│   │   ├── opening.ts
│   │   ├── progress.ts
│   │   └── gamification.ts
│   ├── data/                 # Static data
│   │   ├── openings/        # Opening definitions
│   │   │   ├── beginner.ts
│   │   │   ├── intermediate.ts
│   │   │   └── advanced.ts
│   │   └── achievements.ts  # Achievement definitions
│   └── navigation/          # Navigation setup
│       └── AppNavigator.tsx
├── docs/                     # Documentation
│   ├── PRD.md               # Product requirements
│   ├── ARCHITECTURE.md      # Architecture overview
│   └── APP_STORE.md         # Build & submission guide
├── assets/                   # Images, icons
├── App.tsx                   # Root component
├── index.ts                  # Entry point
├── app.json                  # Expo configuration
├── eas.json                  # EAS Build configuration
├── package.json
├── tsconfig.json
└── metro.config.js
```

## 🧑‍💻 Developer Onboarding

### Step 1: Environment Setup

1. **Install Node.js** (v18 or higher)
   ```bash
   node --version  # Should be 18+
   ```

2. **Install Expo CLI globally**
   ```bash
   npm install -g expo-cli
   ```

3. **Install iOS Simulator** (Mac only)
   - Install Xcode from App Store
   - Open Xcode → Preferences → Components → Install iOS Simulator

4. **Install Android Studio** (for Android development)
   - Download from [developer.android.com](https://developer.android.com/studio)
   - Install Android SDK and create an emulator

### Step 2: Project Setup

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd chess-openings
   npm install
   ```

2. **Verify setup**
   ```bash
   # Check package.json main field
   cat package.json | grep '"main"'
   # Should show: "main": "index.ts"

   # Verify critical packages
   ls node_modules/expo
   ls node_modules/react-native
   ```

3. **Start development server**
   ```bash
   npm start
   ```

   This opens Expo DevTools. Press `i` for iOS simulator or `a` for Android emulator.

### Step 3: Understanding the Codebase

#### Key Concepts

**1. Chess Engine (`src/services/chess/chessEngine.ts`)**
- Wraps `chess.js` library
- Handles move validation, game state, FEN generation
- Provides turn tracking and game status

**2. Opening Database (`src/services/chess/openingDatabase.ts`)**
- Manages opening definitions (main lines, alternate lines)
- Provides theory validation and expected move lookup
- Handles line matching and branching logic

**3. AI Opponent (`src/services/chess/aiOpponent.ts`)**
- Follows opening theory when possible
- Falls back to reasonable moves when theory exhausted
- Records move history for context

**4. Chess Board Component (`src/components/ChessBoard/ChessBoard.tsx`)**
- Renders interactive chess board with SVG
- Displays rank numbers (1-8) on left/right sides
- Displays file letters (a-h) on top/bottom
- Supports board flipping for black perspective
- Highlights valid moves, selected squares, and last move

**5. Game Hooks**
- `useChessGame`: Manages chess game state (moves, turn, board position)
- `useOpeningPractice`: Orchestrates opening practice session (validation, AI moves, completion, XP rewards)
- `useProgress`: Handles progress tracking and persistence
- `useGamification`: Manages XP, levels, achievements, and streaks

**6. Progress Tracking (`src/services/storage/progressTracker.ts`)**
- Uses AsyncStorage for local persistence
- Tracks per-opening statistics (accuracy, mastery, ratings)
- Stores session history

**7. Gamification System (`src/services/gamification/`)**
- `gamificationTracker.ts`: XP calculation, level progression, achievement checking
- `openingRoulette.ts`: Weighted random opening selection based on mastery
- Achievement system with progressive tiers and unlocking logic

#### Data Flow

```
User Action → GameScreen → useOpeningPractice → ChessEngine
                                      ↓
                              AI Opponent (if AI turn)
                                      ↓
                              Progress Tracker (save stats)
```

### Recent Improvements

- **Gamification System**: Complete XP/leveling system with 15+ achievements and daily streak tracking
- **Opening Roulette**: Weighted random opening selection that favors lower-mastery openings
- **XP Rewards**: Session-based XP calculation considering accuracy, completion, and difficulty
- **Achievement Tracking**: Progressive achievements from "First Steps" to "Chess Grandmaster"
- **Board Labels**: Rank numbers (1-8) and file letters (a-h) for better square identification
- **EAS Build Integration**: Cloud-based iOS/Android builds with automated submission
- **Xcode Support**: Native project generation for direct Xcode access and debugging

### Step 4: Development Workflow

1. **Make changes**
   - Edit files in `src/`
   - TypeScript will catch type errors
   - Metro bundler will reload automatically

2. **Test changes**
   - Use iOS Simulator for quick iteration
   - Test on Android emulator before committing
   - Check console logs for debugging

3. **Common Commands**
   ```bash
   npm start              # Start Metro bundler
   npm start -- --clear   # Clear cache and start
   npm run ios            # Start iOS simulator
   npm run android        # Start Android emulator
   ```

4. **Debugging**
   - Use `console.log()` for debugging (will show in Metro console)
   - React Native Debugger for advanced debugging
   - Check Metro bundler output for errors

### Step 5: Adding New Features

#### Adding a New Opening

1. **Create opening definition** in `src/data/openings/`:
   ```typescript
   export const myOpening: Opening = {
     id: 'my-opening',
     name: 'My Opening',
     eco: 'A00',
     difficulty: 'beginner',
     mainLine: [/* moves */],
     alternateLines: [/* variations */],
     // ...
   };
   ```

2. **Add to index** (`src/data/openings/index.ts`):
   ```typescript
   export * from './myOpening';
   ```

3. **Import in opening browser** - openings are automatically loaded

#### Adding a New Screen

1. **Create screen component** in `src/screens/`:
   ```typescript
   export const MyScreen: React.FC = () => {
     // Screen implementation
   };
   ```

2. **Add to navigation** (`src/navigation/AppNavigator.tsx`):
   ```typescript
   <Stack.Screen name="MyScreen" component={MyScreen} />
   ```

3. **Add route type** to `RootStackParamList`

#### Adding a New Hook

1. **Create hook** in `src/hooks/`:
   ```typescript
   export const useMyHook = () => {
     // Hook implementation
   };
   ```

2. **Use in components**:
   ```typescript
   const { data } = useMyHook();
   ```

### Step 6: Code Style Guidelines

- **TypeScript**: Use strict typing, avoid `any`
- **Components**: Functional components with hooks
- **Naming**: PascalCase for components, camelCase for functions
- **File Structure**: One component/hook per file
- **Imports**: Group by type (React, third-party, local)
- **Comments**: Document complex logic, avoid obvious comments

### Step 7: Testing Your Changes

Before committing:
1. ✅ App starts without errors
2. ✅ Can navigate to all screens
3. ✅ Can start a practice session
4. ✅ Can make moves and see feedback
5. ✅ Progress saves correctly
6. ✅ Rating system works
7. ✅ No TypeScript errors (`tsc --noEmit`)

## 🐛 Troubleshooting

### Metro Bundler Issues
```bash
# Clear cache and restart
npm start -- --clear

# Or clear Expo cache
expo start -c
```

### Module Resolution Errors
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### iOS Simulator Not Starting
```bash
# Reset simulator
xcrun simctl shutdown all
xcrun simctl erase all
```

### Android Build Issues
```bash
# Clear Gradle cache
cd android
./gradlew clean
```

## 📚 Documentation

- **README.md** (this file): Getting started, features, and developer onboarding
- **CLAUDE.md**: Claude Code integration guide and development patterns
- **docs/PRD.md**: Product Requirements Document with full specifications
- **docs/ARCHITECTURE.md**: Architecture evaluation and design patterns
- **docs/APP_STORE.md**: iOS build and App Store submission guide

### Key Files Reference

- **Entry Point**: `index.ts` → `App.tsx`
- **Navigation**: `src/navigation/AppNavigator.tsx`
- **Chess Logic**: `src/services/chess/chessEngine.ts`
- **Opening Data**: `src/data/openings/`
- **Progress Storage**: `src/services/storage/progressTracker.ts`
- **Gamification**: `src/services/gamification/gamificationTracker.ts`
- **Main Game Hook**: `src/hooks/useOpeningPractice.ts`
- **Build Config**: `app.json`, `eas.json`

## 🤝 Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly
4. Commit with descriptive messages
5. Push and create a pull request

## 📝 License

[Add your license here]

## 🔗 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [chess.js Documentation](https://github.com/jhlywa/chess.js)
- [React Navigation](https://reactnavigation.org/)

---

**Happy Coding! 🎉**

