# App Store Screenshot Capture Guide

## Overview
This guide will help you capture 15 high-quality screenshots (5 per device size) for App Store submission.

## Required Device Sizes

| Device | Resolution | Aspect Ratio |
|--------|------------|--------------|
| iPhone 15 Pro Max | 2796 × 1290 px | 6.7" |
| iPhone 15 Pro | 2556 × 1179 px | 6.1" |
| iPhone SE (2nd gen) | 2208 × 1242 px | 5.5" |

---

## Screenshot Capture Workflow

### Step 1: Open Correct Simulator

1. Launch iOS Simulator (should auto-open when running `npm run ios`)
2. Change device: **File → Open Simulator → iOS 18.0 → [Select Device]**
3. Start with **iPhone 15 Pro Max (6.7")**

### Step 2: Navigate to Key Screens

Capture these 5 screens in order:

#### Screenshot 1: Interactive Learning (Game Screen)
**Navigate**: Browse tab → Select "Italian Game" → Tap piece → Show valid moves

**What to capture**:
- Chess board mid-game (around move 6-8)
- Piece selected with valid moves highlighted
- Green feedback banner showing "✓ Correct Move!"
- Stats visible at top (Accuracy, Correct moves, Turn indicator)

**Simulator Actions**:
1. Tap "Browse" tab
2. Scroll to "Italian Game" (beginner)
3. Tap to open detail screen
4. Tap "Start Practice"
5. Make 5-6 correct moves to get into opening
6. Select a piece (shows valid moves)
7. **Press Cmd+S to save screenshot**

---

#### Screenshot 2: Progress Tracking (Profile Screen)
**Navigate**: Profile tab → Main stats dashboard

**What to capture**:
- Level and XP progress bar
- Current streak (🔥 Days)
- Overall statistics card
- Mastery level indicators
- Recent achievements

**Simulator Actions**:
1. Tap "Profile" tab (bottom navigation)
2. Ensure you have some progress data visible
3. **Press Cmd+S to save screenshot**

---

#### Screenshot 3: Opening Browser (Recommended Section)
**Navigate**: Browse tab → Main screen with "Recommended for You"

**What to capture**:
- "✨ Recommended for You" section header
- 3-4 opening cards visible in recommended section
- "All Openings" section below
- Opening cards showing difficulty badges and progress indicators

**Simulator Actions**:
1. Tap "Browse" tab
2. Scroll to top to show "Recommended for You" section
3. Ensure multiple opening cards are visible
4. **Press Cmd+S to save screenshot**

---

#### Screenshot 4: Gamification Features
**Navigate**: Profile tab → Achievements section

**What to capture**:
- Achievement cards with icons
- Unlocked vs locked achievements
- XP rewards and progress
- Level progression

**Simulator Actions**:
1. Tap "Profile" tab
2. Scroll down to achievements section
3. Show 3-4 achievement cards
4. **Press Cmd+S to save screenshot**

---

#### Screenshot 5: Success State (Completion)
**Navigate**: Game screen → Complete an opening

**What to capture**:
- Completion banner: "🎉 You know the [Opening Name] opening!"
- Final board position
- Action buttons ("Next Opening", "Browse Openings")
- High accuracy percentage if visible

**Simulator Actions**:
1. From Browse tab, select a short beginner opening
2. Play through all moves correctly
3. Capture the completion celebration screen
4. **Press Cmd+S to save screenshot**

---

### Step 3: Locate Screenshots

All screenshots save to: **Desktop**
- Naming format: `Simulator Screen Shot - [Device] - [Date] [Time].png`
- Example: `Simulator Screen Shot - iPhone 15 Pro Max - 2026-01-14 at 18.30.45.png`

### Step 4: Repeat for Other Devices

After capturing all 5 screenshots on iPhone 15 Pro Max:
1. **File → Open Simulator → iPhone 15 Pro**
2. Repeat the 5 screenshots above
3. **File → Open Simulator → iPhone SE (2nd generation)**
4. Repeat the 5 screenshots again

**Total Screenshots**: 15 (5 screens × 3 device sizes)

---

## Screenshot Organization

After capturing, organize them into the project:

```bash
# Create device-specific folders
mkdir -p assets/screenshots/iphone-15-pro-max
mkdir -p assets/screenshots/iphone-15-pro
mkdir -p assets/screenshots/iphone-se

# Move and rename screenshots
mv ~/Desktop/Simulator\ Screen\ Shot*.png assets/screenshots/

# Then manually organize by device and rename clearly:
# - 01-interactive-learning.png
# - 02-progress-tracking.png
# - 03-opening-browser.png
# - 04-gamification.png
# - 05-success-state.png
```

---

## Post-Processing (Optional)

### Add Text Captions

Use **Figma, Canva, or Photoshop** to add text overlays:

**Screenshot 1**: "Real-time Feedback on Every Move"
**Screenshot 2**: "Track Your Progress & Achievements"
**Screenshot 3**: "Personalized Opening Recommendations"
**Screenshot 4**: "Earn XP & Unlock Achievements"
**Screenshot 5**: "Celebrate Your Mastery"

### Design Guidelines for Captions
- Font: SF Pro Display (iOS system font) or Helvetica Neue
- Size: 48-60px for headlines
- Color: White text with subtle shadow for readability
- Position: Top 1/4 of image or bottom 1/4
- Background: Semi-transparent overlay (optional)

---

## Quality Checklist

Before uploading to App Store Connect, verify:

- [ ] 15 total screenshots (5 per device size)
- [ ] All screenshots show actual app functionality
- [ ] No placeholder or test data visible
- [ ] High contrast and visibility
- [ ] Consistent branding (colors match app)
- [ ] UI elements are clear and readable
- [ ] No simulator chrome/bezels visible
- [ ] Files are PNG format
- [ ] Correct dimensions for each device
- [ ] Screenshots showcase key features

---

## Troubleshooting

### Screenshot doesn't save
- **Fix**: Ensure Desktop has write permissions
- **Alternative**: Use Window → Screenshot (Shift+Cmd+4) and crop manually

### Wrong resolution
- **Fix**: Verify correct simulator device is selected
- **Check**: Device → [Model Name] in simulator menu

### Simulator performance issues
- **Fix**: Restart simulator, close other apps
- **Alternative**: Use `xcrun simctl` commands to reset

### Can't find screenshots
- **Check**: ~/Desktop
- **Check**: ~/Pictures
- **Fix**: Look in Finder sidebar under "Recent Files"

---

## Quick Reference Commands

```bash
# Start iOS simulator
npm run ios

# List available simulators
xcrun simctl list devices available

# Take screenshot programmatically
xcrun simctl io booted screenshot screenshot.png

# Reset simulator (if needed)
xcrun simctl erase all
```

---

## Time Estimate

- Device 1 (iPhone 15 Pro Max): 30-45 minutes
- Device 2 (iPhone 15 Pro): 20-30 minutes (faster, same screens)
- Device 3 (iPhone SE): 20-30 minutes
- **Total**: 1.5-2 hours for all 15 screenshots

---

## Next Steps

After capturing all screenshots:
1. Organize into device folders
2. Rename clearly (01-interactive-learning.png, etc.)
3. Add text captions (optional but recommended)
4. Upload to App Store Connect (Phase 5)
5. Save originals as backup before editing

Good luck! 🎯
