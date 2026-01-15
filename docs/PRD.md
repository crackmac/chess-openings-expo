# Product Requirements Document (PRD)
## Chess Openings Learning Application

**Version:** 2.0
**Date:** January 2025
**Status:** MVP Complete - Planning Next Phases

---

## 1. Executive Summary

### 1.1 Product Vision
A mobile-first React Native application that gamifies chess opening learning through interactive play, with a freemium monetization model. Users practice openings by playing against an AI opponent that follows opening theory, with customizable visual themes and comprehensive progress tracking.

### 1.2 Problem Statement
Chess players struggle to memorize and recognize opening patterns. Traditional methods (books, videos) lack interactivity and repetition. Players need a tool that:
- Provides hands-on practice with immediate feedback
- Uses spaced repetition and gamification for engagement
- Offers flexible monetization (free tier + premium unlock)
- Allows visual customization for improved user experience
- Focuses specifically on opening theory including traps

### 1.3 Solution Overview
An interactive mobile app where users:
- Practice 10 free openings or unlock 30+ with one-time purchase
- Play against an AI that follows opening theory
- Receive real-time feedback and XP rewards
- Track progress with achievements and streaks
- Customize board themes and piece styles
- Learn chess traps and opening variations

---

## 2. Product Goals & Objectives

### 2.1 Primary Goals
1. **Learning Effectiveness**: Help users memorize 30+ popular chess openings
2. **Monetization**: Achieve 5-10% free-to-premium conversion rate
3. **Engagement**: Maintain user interest through gamification and customization
4. **Accessibility**: Mobile-first design for practice anywhere
5. **Revenue**: Generate sustainable income through one-time IAP

### 2.2 Success Metrics
- **User Retention**: 40%+ weekly active users
- **Learning Outcomes**: 70%+ users achieve 80%+ accuracy on practiced openings
- **Engagement**: Average 3+ practice sessions per week per user
- **Monetization**: 5-10% conversion rate (free to premium)
- **Revenue**: $0.30-0.50 average revenue per user
- **Customization**: 40%+ users customize themes
- **Premium Retention**: 2x retention vs free users

---

## 3. Current State (MVP Completed)

### 3.1 Completed Features (Phase 1-4) ✅

**Core Gameplay**
- Interactive chess board with touch/drag piece movement
- Board orientation toggle with rank/file labels (1-8, a-h)
- AI opponent following opening theory
- Real-time move validation and feedback
- Opening completion detection
- Session management

**Progress & Gamification**
- Progress tracking with AsyncStorage
- Difficulty rating system (Hard/Good/Easy)
- XP and leveling system
- Achievement system (15+ achievements)
- Daily streak tracking
- Opening roulette with weighted selection

**Content**
- 20+ openings across beginner/intermediate/advanced difficulties
- Main lines and alternate variations
- Opening browser with search and filtering

**Navigation & Polish**
- React Navigation with stack and tabs
- Polished UI with consistent styling
- Session statistics and accuracy tracking

---

## 4. Upcoming Features (Phase 5-9)

### Phase 5: Enhanced Session UX (Priority: P0 - Critical)

**Status**: Next Sprint
**Effort**: 1-2 weeks
**Dependencies**: None

#### Feature: Dynamic Session-End Buttons

**Problem**: Current buttons (Reset, Deselect, End Session) don't adapt to session outcomes, leading to confused user flows.

**Solution**: Context-aware buttons that change based on success or failure.

#### Requirements

**Success State** (opening completed successfully):
- **Primary Button**: "Next Opening"
  - Auto-selects next unpracticed or lowest-mastery opening using roulette algorithm
  - Immediate transition to new practice session
  - Maintains user momentum

- **Secondary Button**: "View Progress" (or "Browse Openings")
  - Navigate to progress screen or opening browser
  - For users wanting to take a break

**Failure State** (user makes mistake):
- **Primary Button**: "Try Again"
  - Resets current opening session
  - Keeps same opening for immediate retry
  - Clear, encouraging call-to-action

- **Secondary Button**: "Choose Different"
  - Returns to opening browser
  - Allows selection of easier opening

#### Technical Implementation
- Add `sessionOutcome` state: `'active' | 'completed' | 'failed'`
- Modify GameScreen.tsx button rendering conditional logic
- Integrate with OpeningRoulette for "Next Opening" selection
- Preserve existing `resetSession()` functionality

#### Acceptance Criteria
- [ ] Buttons change based on session outcome
- [ ] "Next Opening" intelligently selects next practice opening
- [ ] "Try Again" resets session cleanly
- [ ] Navigation flows are intuitive
- [ ] No UI glitches during state transitions
- [ ] CTR on "Next Opening" > 70%
- [ ] "Try Again" usage rate > 50%

---

### Phase 6: Monetization & IAP (Priority: P0 - Critical)

**Status**: Next Sprint (after Phase 5)
**Effort**: 2-3 weeks
**Dependencies**: Apple Developer account, App Store Connect setup

#### Feature: Free-to-Premium Model with In-App Purchase

**Business Model**
- **Free Tier**: 10 carefully selected openings (diverse difficulty mix)
- **Premium Unlock**: One-time purchase $2.99-$4.99
- **Product ID**: `com.crackmac.chessopenings.premium`

#### Free Opening Selection (10 Openings)

**Beginner (4 openings)**:
1. Italian Game
2. Scotch Game
3. London System
4. King's Indian Attack

**Intermediate (4 openings)**:
5. Sicilian Defense (Najdorf)
6. French Defense
7. Caro-Kann Defense
8. Queen's Gambit

**Advanced (2 openings)**:
9. Najdorf Sicilian
10. King's Indian Defense

**Rationale**: Diverse selection showing value, balanced difficulty distribution, popular openings that appeal to all levels.

#### Premium Content
- All remaining openings (~10-15 additional)
- Traps category (premium-only, 10-12 traps)
- Future opening additions
- Advanced variations and extended lines

#### Technical Implementation

**1. Opening Type Extension** (`src/types/opening.ts`):
```typescript
interface Opening {
  id: string;
  name: string;
  eco: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'traps';
  isPremium: boolean;  // NEW
  description: string;
  mainLine: Move[];
  alternateLines: AlternateLine[];
  tags: string[];
  category: string;
  color: 'white' | 'black';
}
```

**2. New Services**:

`src/services/iap/purchaseService.ts`:
- Initialize IAP (expo-in-app-purchases or react-native-iap)
- Handle purchase flow
- Receipt validation
- Restore purchases
- Check subscription status

`src/services/iap/accessControl.ts`:
- `canAccessOpening(opening: Opening): boolean`
- `isPremiumUnlocked(): Promise<boolean>`
- `getPremiumStatus(): Promise<PremiumStatus>`

**3. UI Components**:

`src/components/PremiumBadge.tsx`:
- Crown icon badge for premium openings
- Displayed on opening cards

`src/screens/PaywallScreen.tsx`:
- Shown when tapping premium opening while locked
- Feature highlights
- Purchase button
- Restore purchases button

`src/components/PurchaseModal.tsx`:
- IAP purchase flow
- Loading states
- Success/error handling

**4. Settings Integration**:
- Add "Restore Purchases" button
- Display premium status
- Manage subscription (if applicable)

#### IAP Configuration

**iOS (App Store Connect)**:
- Create IAP: Non-consumable
- Product ID: `com.crackmac.chessopenings.premium`
- Price tier: $2.99-$4.99
- Localized descriptions

**Android (Google Play Console)**:
- Create Managed product
- Same product ID
- Price equivalency

**Testing**:
- Sandbox users for iOS
- Test accounts for Android
- Test purchase flow end-to-end

#### Data Migration
- Update all opening files with `isPremium` field
- Mark 10 selected openings as `isPremium: false`
- All others `isPremium: true`

#### Acceptance Criteria
- [ ] Users can access 10 free openings without restriction
- [ ] Premium openings show paywall when tapped
- [ ] Purchase flow completes successfully
- [ ] Purchases persist across app restarts/reinstalls
- [ ] Restore purchases works correctly
- [ ] IAP works on both iOS and Android
- [ ] Progress/stats work for both free and premium
- [ ] 5-10% conversion rate achieved

---

### Phase 7: Board & Piece Customization (Priority: P1 - High)

**Status**: Following Sprint
**Effort**: 2 weeks
**Dependencies**: SVG assets for piece styles

#### Feature: Visual Customization Options

**Problem**: Current board/pieces have minor inconsistencies. Users want personalization for better engagement.

**Solution**: Multiple board color themes and piece style options with persistent preferences.

#### Board Color Themes (3-5 Presets)

1. **Classic Brown** (default)
   - Light squares: `#F0D9B5`
   - Dark squares: `#B58863`

2. **Modern Blue**
   - Light squares: `#E8EDF9`
   - Dark squares: `#7A9DD4`

3. **Dark Mode**
   - Light squares: `#3D3D3D`
   - Dark squares: `#1E1E1E`

4. **Forest Green**
   - Light squares: `#EEEED2`
   - Dark squares: `#769656`

5. **Tournament** (optional)
   - Light squares: `#FFFFFF`
   - Dark squares: `#4A4A4A`

#### Piece Style Sets (2-3 Presets)

1. **Classic** (current default)
   - Traditional Staunton-style pieces
   - Fix existing inconsistencies

2. **Modern**
   - Sleeker, simplified design
   - Flatter aesthetic

3. **Bold** (optional)
   - High contrast, thicker lines
   - Easier to see on small screens

#### Technical Implementation

**1. Theme System** (`src/services/theme/themeService.ts`):
```typescript
interface BoardTheme {
  id: string;
  name: string;
  lightSquare: string;
  darkSquare: string;
  preview: string;
}

interface PieceStyle {
  id: string;
  name: string;
  preview: string;
  svgSet: PieceSVGSet;
}

class ThemeService {
  getThemes(): BoardTheme[];
  getPieceStyles(): PieceStyle[];
  savePreferences(theme: string, style: string): Promise<void>;
  loadPreferences(): Promise<UserPreferences>;
}
```

**2. Settings Screen** (`src/screens/SettingsScreen.tsx`):
- New "Appearance" section
- Board theme selector (grid of preview thumbnails)
- Piece style selector (grid of previews)
- Live mini chessboard preview
- Save button

**3. Preferences Storage**:
```typescript
interface UserPreferences {
  boardTheme: string;     // theme ID
  pieceStyle: string;     // style ID
  soundEnabled: boolean;
  hapticFeedback: boolean;
  premiumUnlocked: boolean;
}
```

Stored in AsyncStorage: `user_preferences`

**4. ChessBoard Component Updates**:
- Accept `theme` and `style` props
- Load colors from theme configuration
- Load SVGs from piece style set
- Apply changes immediately

#### Asset Requirements
- Create SVG sets for Modern and Bold piece styles
- Generate preview thumbnails for each theme/style
- Ensure consistent styling across all pieces

#### Acceptance Criteria
- [ ] 3-5 board color themes available
- [ ] 2-3 piece style sets available
- [ ] Settings screen shows live previews
- [ ] Preferences persist across sessions
- [ ] Theme changes apply immediately to all boards
- [ ] Piece SVGs are consistent and high quality
- [ ] >40% users customize appearance
- [ ] Customization correlates with increased retention

---

### Phase 8: Traps Category (Priority: P1 - High)

**Status**: Following customization
**Effort**: 2-3 weeks (includes content creation)
**Dependencies**: Phase 6 (IAP) for premium gating

#### Feature: Chess Traps Opening Category

**Problem**: Users want to learn common chess traps for practical play.

**Solution**: New "Traps" category with 10-12 famous chess traps, all premium-only content.

#### Trap Openings (10-12 Traps)

1. **Scholar's Mate** - 4-move checkmate (ECO: C20)
2. **Legal's Mate Trap** - French Defense sacrifice
3. **Fried Liver Attack** - Italian Game tactical line
4. **Fishing Pole Trap** - Sicilian Defense trap
5. **Noah's Ark Trap** - Ruy Lopez bishop trap
6. **Lasker Trap** - Albin Counter-Gambit
7. **Siberian Trap** - Smith-Morra Gambit
8. **Mortimer Trap** - Ruy Lopez queen trap
9. **Elephant Trap** - Queen's Gambit Declined
10. **Rubinstein Trap** - Tarrasch Defense
11. **Blackburne Shilling Gambit** - Dubious but fun
12. **Halosar Trap** - Blackmar-Diemer Gambit

#### Technical Implementation

**1. Type Updates** (`src/types/opening.ts`):
```typescript
type OpeningDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'traps';
```

**2. New Data File** (`src/data/openings/traps.ts`):
```typescript
export const trapOpenings: Opening[] = [
  {
    id: 'scholars-mate',
    name: "Scholar's Mate",
    eco: 'C20',
    difficulty: 'traps',
    isPremium: true,
    description: 'The classic 4-move checkmate trap targeting f7...',
    mainLine: [/* moves */],
    alternateLines: [/* opponent avoids trap */],
    tags: ['trap', 'beginner', 'checkmate'],
    category: 'Traps',
    color: 'white',
  },
  // ... more traps
];
```

**3. Opening Browser Updates**:
- Add "Traps" filter button
- Update filter logic: `'all' | 'beginner' | 'intermediate' | 'advanced' | 'traps'`
- Display trap icon 🎯 badge on trap opening cards
- Premium lock icon for all traps

**4. Special Trap Features**:
- **Success Path**: Opponent falls for trap (checkmate or material win)
- **Failure Path**: Opponent avoids trap (continue with theory)
- Educational notes: "Why this trap works" explanations
- Highlight trap moment with special UI feedback

#### Content Creation
- Research each trap thoroughly
- Document both paths (success/failure)
- Write educational descriptions
- Add historical context where relevant
- Include common variations

#### Acceptance Criteria
- [ ] Traps category appears in opening browser
- [ ] 10-12 trap openings available
- [ ] All traps are premium-only
- [ ] Both success and failure paths work correctly
- [ ] Educational notes display properly
- [ ] Trap icon/badge displays on cards
- [ ] 30% of premium users engage with traps
- [ ] Traps drive measurable premium conversions

---

### Phase 9: Marketing Assets (Priority: P2 - Nice to Have)

**Status**: Parallel with development
**Effort**: External (AI generation) + 1 week for integration
**Dependencies**: None (can start anytime)

#### Feature: Professional Marketing Graphics

**Problem**: Need high-quality visual assets for App Store submission and marketing.

**Solution**: AI-generated graphics following brand guidelines (see `docs/MARKETING_ASSETS.md` for detailed prompts).

#### Assets Required

1. **App Icon** (1024x1024px)
   - Modern, minimalist chess-themed icon
   - Deep blue background with gold/white pieces
   - Must work at 60x60px

2. **App Store Screenshots** (5 screens)
   - Interactive learning (gameplay)
   - Progress tracking
   - Opening browser
   - Mid-session practice
   - Success/completion screen

3. **Feature Graphics**
   - Hero banner (2048x1536px)
   - Social media cards (1080x1080px)
   - App Store preview banner (4320x1080px)

4. **Optional Assets**
   - Onboarding illustrations
   - Tutorial graphics
   - Video thumbnail

#### Brand Guidelines
- **Colors**: Primary Blue (#2C3E50), Gold (#F39C12), White (#ECF0F1)
- **Style**: Modern, minimalist, professional yet approachable
- **Typography**: Modern sans-serif, clean and readable

#### Tools
- MidJourney for artistic assets
- DALL-E 3 for UI mockups
- Figma for actual screenshot composition
- Stable Diffusion for customization

#### Acceptance Criteria
- [ ] App icon meets iOS/Android guidelines
- [ ] 5 screenshots showing key features
- [ ] All assets maintain consistent branding
- [ ] Files properly named and organized
- [ ] Assets optimized for App Store submission

**Full details**: See `docs/MARKETING_ASSETS.md`

---

## 5. Technical Specifications

### 5.1 Technology Stack

**Framework**: React Native 0.81.5 with Expo SDK 54
**Language**: TypeScript (strict mode)
**Build System**: EAS Build

**Core Libraries**:
- `chess.js` ^1.4.0 - Chess engine
- `@react-navigation/native` ^7.1.26 - Navigation
- `@react-native-async-storage/async-storage` 2.2.0 - Local storage
- `react-native-svg` 15.12.1 - Graphics rendering
- `react-native-gesture-handler` ~2.28.0 - Touch interactions
- `react-native-reanimated` ~4.1.1 - Animations

**New Dependencies (Upcoming)**:
- `expo-in-app-purchases` or `react-native-iap` - IAP functionality
- Additional SVG assets for piece styles

### 5.2 Updated Data Models

#### Opening Interface (Extended)
```typescript
interface Opening {
  id: string;
  name: string;
  eco: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'traps';
  isPremium: boolean;  // NEW - for monetization
  description: string;
  mainLine: Move[];
  alternateLines: AlternateLine[];
  tags: string[];
  category: string;
  color: 'white' | 'black';
}
```

#### User Preferences (New)
```typescript
interface UserPreferences {
  boardTheme: string;      // Theme ID (e.g., 'classic', 'modern-blue')
  pieceStyle: string;      // Style ID (e.g., 'classic', 'modern')
  soundEnabled: boolean;
  hapticFeedback: boolean;
  premiumUnlocked: boolean;  // IAP status
}
```

#### Premium Status (New)
```typescript
interface PremiumStatus {
  isUnlocked: boolean;
  productId: string;
  purchaseDate?: Date;
  platform: 'ios' | 'android';
}
```

### 5.3 New Services Architecture

```
src/services/
├── chess/
│   ├── chessEngine.ts      (existing)
│   ├── aiOpponent.ts       (existing)
│   └── openingDatabase.ts  (existing)
├── storage/
│   └── progressTracker.ts  (existing)
├── gamification/
│   ├── gamificationTracker.ts  (existing)
│   └── openingRoulette.ts      (existing)
├── iap/                    NEW
│   ├── purchaseService.ts  - IAP initialization and purchase flow
│   └── accessControl.ts    - Premium access checking
└── theme/                  NEW
    └── themeService.ts     - Theme/preference management
```

### 5.4 File Structure Updates

```
chess-openings/
├── src/
│   ├── components/
│   │   ├── PremiumBadge/     NEW
│   │   ├── PurchaseModal/    NEW
│   │   └── (existing components)
│   ├── screens/
│   │   ├── PaywallScreen.tsx    NEW
│   │   ├── SettingsScreen.tsx   NEW/UPDATED
│   │   └── (existing screens)
│   ├── services/
│   │   ├── iap/              NEW
│   │   └── theme/            NEW
│   ├── data/
│   │   └── openings/
│   │       └── traps.ts      NEW
│   └── types/
│       ├── opening.ts        UPDATED
│       └── preferences.ts    NEW
├── docs/
│   ├── PRD.md               (this file)
│   ├── MARKETING_ASSETS.md  NEW
│   ├── APP_STORE.md
│   └── ARCHITECTURE.md
└── assets/
    └── pieces/              NEW (additional SVG sets)
```

---

## 6. Development Phases & Timeline

### Completed: Phase 1-4 (MVP) ✅

**Duration**: 6 weeks (Dec 2024)

**Delivered**:
- Core gameplay with chess engine
- Interactive board with AI opponent
- Progress tracking and statistics
- Gamification (XP, achievements, streaks)
- 20+ openings
- Opening roulette
- Difficulty rating system

---

### Phase 5: Enhanced Session UX 🎯

**Status**: Next Sprint
**Duration**: 1-2 weeks
**Priority**: P0 (Critical)

**Tasks**:
1. Add session outcome state tracking
2. Implement dynamic button logic in GameScreen
3. Integrate opening roulette for "Next Opening"
4. Update button styling and copy
5. Test all user flows
6. Measure CTR metrics

**Success Criteria**: >70% CTR on "Next Opening", >50% "Try Again" usage

---

### Phase 6: Monetization & IAP 💰

**Status**: Following Phase 5
**Duration**: 2-3 weeks
**Priority**: P0 (Critical)

**Tasks**:
1. Set up App Store Connect IAP
2. Implement IAP service (purchase, restore)
3. Mark 10 openings as free, rest as premium
4. Create paywall screen and purchase flow
5. Add premium badges to opening cards
6. Implement access control
7. Test IAP on both platforms
8. Submit for App Store review

**Success Criteria**: 5-10% conversion rate, smooth purchase flow

---

### Phase 7: Board & Piece Customization 🎨

**Status**: After Phase 6
**Duration**: 2 weeks
**Priority**: P1 (High)

**Tasks**:
1. Create theme service and data structure
2. Generate/create 2-3 piece style SVG sets
3. Build settings screen with theme selector
4. Implement preference persistence
5. Update ChessBoard to accept theme props
6. Create preview thumbnails
7. Test theme switching

**Success Criteria**: >40% users customize, retention increase

---

### Phase 8: Traps Category 🎯

**Status**: After Phase 7
**Duration**: 2-3 weeks
**Priority**: P1 (High)

**Tasks**:
1. Research and document 10-12 traps
2. Create trap opening data file
3. Update opening browser for "Traps" filter
4. Implement trap-specific UI (success/failure paths)
5. Add educational notes/descriptions
6. Mark all traps as premium
7. Test trap gameplay

**Success Criteria**: 30% premium user engagement, drives conversions

---

### Phase 9: Marketing Assets 📱

**Status**: Parallel (can start anytime)
**Duration**: External + 1 week
**Priority**: P2 (Nice to Have)

**Tasks**:
1. Generate AI assets using prompts
2. Refine and select best variations
3. Create actual screenshot mockups in Figma
4. Export in required formats
5. Optimize file sizes
6. Organize for App Store submission

**Success Criteria**: Complete asset library ready for launch

---

## 7. Success Metrics

### MVP Metrics (Current) ✅
- App runs on iOS and Android
- 20+ openings available
- AI follows theory correctly
- Progress tracking works
- Gamification active

### Phase 5-9 Metrics

**Phase 5 (Session UX)**:
- CTR on "Next Opening" button: >70%
- "Try Again" usage rate: >50%
- Session abandonment: -15%

**Phase 6 (Monetization)**:
- Free-to-premium conversion: 5-10%
- ARPU: $0.30-0.50
- Premium retention: 2x free users
- Purchase flow completion: >80%

**Phase 7 (Customization)**:
- Theme customization rate: >40%
- Settings screen engagement: >2 visits/user
- Retention lift from customization: +10%

**Phase 8 (Traps)**:
- Trap engagement (premium users): 30%
- Trap completion rate: Similar to other categories
- Premium conversion attribution: Measurable in A/B test

**Phase 9 (Marketing)**:
- App Store conversion rate: Baseline established
- A/B test winner identified
- Assets ready for launch

---

## 8. Dependencies & Risks

### Technical Dependencies

**Phase 6 (IAP)**:
- Apple Developer account ($99/year) ✅ Active
- Google Play Developer account ($25 one-time)
- App Store Connect IAP setup
- expo-in-app-purchases or react-native-iap library
- Sandbox testing accounts

**Phase 7 (Customization)**:
- SVG assets for 2-3 piece styles (design/creation)
- Theme preview image generation
- Additional storage for preferences

**Phase 8 (Traps)**:
- Research time for trap documentation
- Content creation for educational notes

### Business Dependencies

**Legal & Compliance**:
- Privacy policy update (if collecting payment data)
- Terms of service for IAP
- App Store review process for IAP features

**Pricing Strategy**:
- Finalize price point ($2.99 vs $4.99)
- Research competitive pricing
- A/B test pricing tiers

### Risks & Mitigation

**Risk: IAP Rejection**
- Impact: High - delays monetization
- Mitigation: Follow App Store guidelines exactly, test thoroughly, prepare for review

**Risk: Low Conversion Rate**
- Impact: High - revenue below target
- Mitigation: A/B test paywalls, optimize free content, add value to premium

**Risk: Theme/Customization Complexity**
- Impact: Medium - development time
- Mitigation: Start with simple themes, iterate based on feedback

**Risk: Trap Content Quality**
- Impact: Medium - user engagement
- Mitigation: Research thoroughly, test with chess players, iterate

---

## 9. Open Questions

1. **Pricing**: $2.99 or $4.99 for premium unlock? (Recommend $2.99 for higher conversion)
2. **Trial Period**: Offer 7-day free trial for premium? (Recommend no - complicates flow)
3. **Additional IAP**: Sell individual opening packs instead of full unlock? (Recommend no for MVP)
4. **Customization Premium**: Make some themes premium-only? (Recommend 1-2 premium themes)
5. **Trap Difficulty**: Add difficulty levels within traps category? (Defer to post-launch)
6. **Marketing Budget**: Allocate for paid ads/ASO? (TBD based on organic performance)

---

## 10. Out of Scope

**Not Included in Phases 5-9**:
- Multiplayer functionality
- Full game play beyond openings
- Cloud sync / backend infrastructure
- Social features (sharing, challenges)
- Video tutorials or animated explanations
- Advanced chess engine analysis
- Custom opening creation by users
- Subscription model (stick with one-time purchase)

**Future Consideration**:
- Backend for cloud sync
- Social features
- Advanced analytics dashboard
- Opening of the day feature
- Tournament/challenge mode

---

## 11. References & Resources

### Technical Documentation
- Expo IAP: https://docs.expo.dev/versions/latest/sdk/in-app-purchases/
- App Store Guidelines: https://developer.apple.com/app-store/review/guidelines/
- React Native IAP: https://github.com/dooboolab/react-native-iap

### Design Resources
- AI Prompts: `docs/MARKETING_ASSETS.md`
- App Store Screenshots: Apple HIG
- Brand Colors: See Section 5.4

### Business Resources
- Freemium Best Practices: Industry reports
- IAP Conversion Rates: Mobile gaming benchmarks (5-10% typical)
- Chess Opening Resources: Lichess opening database, Chess.com

---

## 12. Appendix

### 12.1 Glossary
- **ECO Code**: Encyclopedia of Chess Openings classification
- **FEN**: Forsyth-Edwards Notation (position notation)
- **SAN**: Standard Algebraic Notation (move notation)
- **IAP**: In-App Purchase
- **ARPU**: Average Revenue Per User
- **CTR**: Click-Through Rate

### 12.2 Version History
- **v1.0** (Dec 2024): Initial PRD for MVP
- **v2.0** (Jan 2025): Updated with Phase 5-9, monetization, customization, traps

---

**Document Owner**: Product Team
**Last Updated**: January 2025
**Next Review**: After Phase 6 (Monetization) completion

---

**Status Summary**:
- ✅ MVP Complete (Phase 1-4)
- 🎯 Next: Phase 5 (Session UX) - 1-2 weeks
- 💰 Then: Phase 6 (Monetization) - 2-3 weeks
- 🎨 Then: Phase 7 (Customization) - 2 weeks
- 🎯 Then: Phase 8 (Traps) - 2-3 weeks
- 📱 Parallel: Phase 9 (Marketing) - External
