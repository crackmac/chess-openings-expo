# iOS App Store Build & Submission Guide

This guide covers building and submitting the Chess Openings app to the Apple App Store using Expo's EAS (Expo Application Services) and Xcode.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [EAS Build Setup](#eas-build-setup)
- [Building for App Store](#building-for-app-store)
- [Xcode Integration](#xcode-integration)
- [App Store Connect Setup](#app-store-connect-setup)
- [Submission Process](#submission-process)
- [TestFlight Beta Testing](#testflight-beta-testing)
- [Troubleshooting](#troubleshooting)
- [Version Management](#version-management)

---

## Prerequisites

### Required Accounts

1. **Apple Developer Account** ($99/year)
   - Sign up at https://developer.apple.com
   - Complete enrollment and payment
   - Agree to all agreements

2. **Expo Account** (Free)
   - Create at https://expo.dev
   - Already linked to this project via `eas.json`

### Required Software

- **macOS** (for Xcode)
- **Node.js** 18+
- **EAS CLI**: `npm install -g eas-cli`
- **Xcode** 14+ (from App Store)

### Current Configuration

This project is already configured with:
- ✅ Bundle ID: `com.crackmac.chessopenings`
- ✅ EAS Project ID: `277776ff-d155-4219-80e2-46494073e9c4`
- ✅ Build profiles (development, preview, production)
- ✅ Auto-increment build numbers
- ✅ Non-exempt encryption declaration

---

## Quick Start

For experienced developers, here's the fast path:

```bash
# 1. Install EAS CLI and login
npm install -g eas-cli
eas login

# 2. Build for production
eas build --platform ios --profile production

# 3. Submit to App Store
eas submit --platform ios --profile production
```

For first-time submissions or detailed steps, continue reading below.

---

## EAS Build Setup

### 1. Install EAS CLI

```bash
npm install -g eas-cli
```

Verify installation:
```bash
eas --version
```

### 2. Login to Expo

```bash
eas login
```

Enter your Expo account credentials.

### 3. Configure Apple Credentials

EAS needs access to your Apple Developer account to sign the app:

```bash
eas credentials
```

Follow the prompts to:
- Select your Apple ID
- Provide App Store Connect API Key (or use interactive login)
- Let EAS manage certificates and provisioning profiles (recommended)

**Recommended**: Let EAS manage your credentials automatically. This handles:
- iOS Distribution Certificate
- Provisioning Profile
- Push Notification Certificate (if needed)

### 4. Verify Configuration

The project's `eas.json` contains three build profiles:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

- **development**: For local testing with expo-dev-client
- **preview**: For internal TestFlight testing
- **production**: For App Store submission (auto-increments build number)

---

## Building for App Store

### Production Build

Create a production build ready for App Store submission:

```bash
eas build --platform ios --profile production
```

This command:
1. Uploads your code to EAS servers
2. Installs dependencies in a clean environment
3. Compiles native iOS app
4. Signs with your distribution certificate
5. Creates an `.ipa` file
6. Provides download link when complete

**Build time**: Typically 10-20 minutes

### Monitor Build Progress

- **CLI**: Build status shows in terminal
- **Web Dashboard**: https://expo.dev/accounts/[your-account]/projects/chess-openings/builds
- **Notifications**: Email when build completes

### Download Build

After build completes:

```bash
# Build URL provided in CLI output
# Or download from web dashboard
```

The `.ipa` file can be:
- Submitted directly via EAS Submit
- Uploaded manually via Xcode/Transporter
- Installed on test devices via TestFlight

---

## Xcode Integration

### Generate Native iOS Project

For Xcode debugging, development, or local builds:

```bash
npx expo prebuild --platform ios
```

This creates the `ios/` directory with:
- `chessopenings.xcworkspace` - Xcode workspace (open this)
- `chessopenings.xcodeproj` - Xcode project
- `Podfile` - CocoaPods dependencies
- Native configuration files

### Open in Xcode

```bash
open ios/chessopenings.xcworkspace
```

**⚠️ Important**: Always open `.xcworkspace`, not `.xcodeproj` (required for CocoaPods)

### What You Can Do in Xcode

1. **Inspect Build Settings**
   - Project Navigator → chessopenings → Build Settings
   - View/modify code signing, capabilities, Info.plist

2. **Add Native Code**
   - Write Swift/Objective-C code in `ios/chessopenings/`
   - Integrate native iOS libraries

3. **Configure Capabilities**
   - Signing & Capabilities tab
   - Enable push notifications, iCloud, etc.

4. **Debug with Xcode Tools**
   - Set breakpoints in native code
   - Use Instruments for profiling
   - View native logs and console

5. **Build Locally**
   - Product → Archive
   - Distribute to App Store or TestFlight

### Regenerating Native Project

The `ios/` directory is **generated code** (excluded from git).

To regenerate after changes:
```bash
npx expo prebuild --platform ios --clean
```

**Note**: Custom native code will be overwritten. Use Expo config plugins for persistent customizations.

---

## App Store Connect Setup

### 1. Create App Record

1. Go to https://appstoreconnect.apple.com
2. Click **Apps** → **+** → **New App**
3. Fill in the form:

   | Field | Value |
   |-------|-------|
   | **Platform** | iOS |
   | **Name** | Chess Openings (or your choice) |
   | **Primary Language** | English |
   | **Bundle ID** | com.crackmac.chessopenings |
   | **SKU** | `chess-openings-001` (your internal ID) |
   | **User Access** | Full Access |

4. Click **Create**

### 2. Note Your App Store Connect ID

After creating the app, find your App Store Connect App ID:
- Format: 10-digit number (e.g., `6757377926`)
- Found in App Information → General Information → Apple ID

### 3. Update eas.json

Edit `eas.json` with your App Store Connect credentials:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "6757377926",
        "appleTeamId": "Q4Z44RNS54"
      }
    }
  }
}
```

**Where to find these values:**
- `appleId`: Your Apple ID email
- `ascAppId`: App Store Connect App ID (from step 2)
- `appleTeamId`: Apple Developer → Membership → Team ID

**Current values (already configured):**
- appleId: `crackmac@mac.com`
- ascAppId: `6757377926`
- appleTeamId: `Q4Z44RNS54`

### 4. Prepare App Metadata

In App Store Connect, fill out:

**App Information**
- Name: "Chess Openings"
- Subtitle: "Learn Chess Openings Through Practice"
- Category: Primary = Games, Secondary = Education

**Privacy**
- Privacy Policy URL: Required if collecting data
- Data usage: Declare what data you collect (if any)

**Pricing**
- Free or paid
- Available territories

**App Store Assets** (required)
- App icon: 1024x1024 PNG (no transparency)
- Screenshots: Various iPhone sizes (6.7", 6.5", 5.5")
  - Generate using iOS Simulator
  - Minimum: 5 screenshots per size
- App preview videos (optional)

**Description**
- Promotional text (170 chars)
- Description (4000 chars)
- Keywords (100 chars)
- Support URL
- Marketing URL (optional)

### 5. Age Rating

Complete the age rating questionnaire:
- Likely rating: **4+** (no objectionable content)
- Answer questions about violence, mature themes, etc.

---

## Submission Process

### Automated Submission (Recommended)

After a successful production build:

```bash
eas submit --platform ios --profile production
```

This command:
1. Prompts you to select a build (or specify `--latest`)
2. Uploads to App Store Connect
3. Completes compliance information
4. Submits for review (if metadata complete)

### Manual Submission

If you prefer manual control:

1. **Download .ipa file** from EAS build
2. **Open Transporter app** (from App Store)
3. **Drag .ipa file** to Transporter
4. **Deliver** to App Store Connect

Or via Xcode:
1. Open Xcode with workspace
2. Product → Archive
3. Distribute App → App Store Connect
4. Follow upload wizard

### Submit for Review

Once build is uploaded to App Store Connect:

1. Go to **App Store** tab
2. Click **+ Version** or select pending version
3. Complete all required metadata
4. Add build to this version
5. Complete **App Review Information**:
   - Contact information
   - Demo account (if app requires login)
   - Notes for reviewer
6. Complete **Version Release** options
7. Click **Submit for Review**

### Review Process

- **Review time**: Typically 1-3 days (can be 24 hours to 1 week)
- **Status updates**: Receive email notifications
- **Common rejections**:
  - Missing privacy policy
  - Incomplete metadata
  - Crashes during review
  - Guideline violations

---

## TestFlight Beta Testing

TestFlight allows you to distribute beta builds to testers before public release.

### 1. Create Preview Build

```bash
eas build --platform ios --profile preview
```

### 2. Submit to TestFlight

```bash
eas submit --platform ios --profile preview
```

Or submit via App Store Connect after production build.

### 3. Add Testers

In App Store Connect:
1. Go to **TestFlight** tab
2. Click **Internal Testing** or **External Testing**
3. Add testers by email
4. Testers receive invitation email with TestFlight link

**Internal Testing** (up to 100 testers)
- Instant availability (no review)
- Apple Developer team members only

**External Testing** (up to 10,000 testers)
- Requires beta app review (1-2 days)
- Public link option available

### 4. Distribute TestFlight Build

Testers:
1. Install TestFlight app from App Store
2. Open invitation email
3. Accept invitation
4. Install beta build

---

## Troubleshooting

### Build Failures

**Error: "Build failed with unknown error"**
- Check build logs in EAS dashboard
- Verify `package.json` dependencies are compatible
- Try clearing cache: `npx expo prebuild --clean`

**Error: "No valid code signing identity"**
- Run `eas credentials` to manage certificates
- Let EAS create new distribution certificate
- Verify Apple Developer account is active

**Error: "Bundle identifier mismatch"**
- Check `app.json` → `ios.bundleIdentifier` matches App Store Connect
- Regenerate native project: `npx expo prebuild --clean --platform ios`

### Submission Failures

**Error: "Missing compliance information"**
- Declare export compliance in app settings
- Already configured: `ITSAppUsesNonExemptEncryption: false`

**Error: "Invalid binary"**
- Build with production profile (not development)
- Verify code signing is correct
- Check for embedded provisioning profiles

**Error: "App Store Connect API authentication failed"**
- Update `eas.json` with correct credentials
- Verify Apple ID has App Manager role
- Check Team ID matches your developer account

### Xcode Issues

**Error: "No such module 'ExpoModulesCore'"**
- Run `pod install` in `ios/` directory
- Clean build folder: Product → Clean Build Folder
- Restart Xcode

**Error: "Command PhaseScriptExecution failed"**
- Check Metro bundler is running
- Clear cache: `npm start -- --clear`
- Verify `node_modules/` is complete

### Common Pitfalls

1. **Opening .xcodeproj instead of .xcworkspace**
   - Always use `.xcworkspace` (CocoaPods requirement)

2. **Forgetting to increment version**
   - Auto-increment enabled for production builds
   - Manually update `app.json` → `version` for major releases

3. **Build number conflicts**
   - Each submission needs unique build number
   - EAS auto-increments with `"autoIncrement": true`

4. **Missing App Store assets**
   - Screenshots required before submission
   - 1024x1024 icon required (no alpha channel)

---

## Version Management

### Version Numbering

The app uses semantic versioning:
- **Version** (`app.json` → `version`): User-facing version (e.g., "1.0.0")
- **Build Number** (`app.json` → `ios.buildNumber`): Internal build number (e.g., "1")

**Current configuration:**
```json
{
  "expo": {
    "version": "1.0.0",
    "ios": {
      "buildNumber": "1"
    }
  }
}
```

### Incrementing Versions

**For bug fixes (1.0.0 → 1.0.1):**
```json
{
  "version": "1.0.1"
}
```
Build number auto-increments via EAS.

**For new features (1.0.0 → 1.1.0):**
```json
{
  "version": "1.1.0",
  "ios": {
    "buildNumber": "1"  // Reset or continue
  }
}
```

**For major releases (1.0.0 → 2.0.0):**
```json
{
  "version": "2.0.0",
  "ios": {
    "buildNumber": "1"
  }
}
```

### Build Number Auto-Increment

EAS automatically increments build number with production profile:

```json
{
  "build": {
    "production": {
      "autoIncrement": true
    }
  }
}
```

You can disable this and manage manually if preferred.

### Release Notes

Maintain release notes in App Store Connect for each version:
- Bug fixes
- New features
- Improvements

Users see these when updating the app.

---

## Workflow Summary

### First-Time Submission

1. ✅ Apple Developer account created
2. ✅ EAS CLI installed and logged in
3. ✅ Apple credentials configured (`eas credentials`)
4. ✅ App Store Connect app record created
5. ✅ `eas.json` updated with App Store Connect IDs
6. Run `eas build --platform ios --profile production`
7. Wait for build completion (~15 minutes)
8. Run `eas submit --platform ios --profile production`
9. Complete metadata in App Store Connect
10. Submit for review

### Subsequent Updates

1. Make code changes and test locally
2. Update version in `app.json` (if major/minor release)
3. Commit changes to git
4. Run `eas build --platform ios --profile production`
5. Run `eas submit --platform ios --profile production`
6. Update "What's New" in App Store Connect
7. Submit for review

### Development Workflow

```bash
# Local development
npm start
npm run ios

# Test on device
eas build --platform ios --profile development
# Install via expo-dev-client

# Beta testing
eas build --platform ios --profile preview
eas submit --platform ios  # to TestFlight

# Production release
eas build --platform ios --profile production
eas submit --platform ios --profile production
```

---

## Additional Resources

### Official Documentation

- **Expo EAS Build**: https://docs.expo.dev/build/introduction/
- **Expo EAS Submit**: https://docs.expo.dev/submit/ios/
- **Expo Prebuild**: https://docs.expo.dev/workflow/prebuild/
- **App Store Connect Help**: https://help.apple.com/app-store-connect/

### Apple Guidelines

- **App Store Review Guidelines**: https://developer.apple.com/app-store/review/guidelines/
- **Human Interface Guidelines**: https://developer.apple.com/design/human-interface-guidelines/
- **App Store Connect**: https://appstoreconnect.apple.com

### Helpful Tools

- **Transporter** (App Store): Upload builds manually
- **Xcode** (App Store): Local builds and debugging
- **TestFlight** (App Store): Beta testing management
- **EAS Dashboard**: https://expo.dev - Monitor builds

---

## Support

### Getting Help

- **Expo Forums**: https://forums.expo.dev
- **Expo Discord**: https://chat.expo.dev
- **Stack Overflow**: Tag `expo` and `react-native`
- **Apple Developer Forums**: https://developer.apple.com/forums/

### Project-Specific Issues

For issues specific to this Chess Openings app:
1. Check `CLAUDE.md` for development patterns
2. Review `docs/PRD.md` for specifications
3. Check `docs/ARCHITECTURE.md` for design decisions

---

**Last Updated**: January 2025
**Project Version**: 1.0.0
**Expo SDK**: 54
**React Native**: 0.81.5
