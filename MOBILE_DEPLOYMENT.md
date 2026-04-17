# TESLYS Mobile App Deployment Guide

This guide will help you build and deploy the TESLYS carshare app to iOS and Android devices.

## Prerequisites

### For iOS Development:
- macOS computer with Xcode installed
- Apple Developer Account (for App Store deployment)

### For Android Development:
- Android Studio installed
- Java Development Kit (JDK) 11 or higher

## Step-by-Step Deployment Process

### 1. Export and Clone the Project
1. Click the "Export to Github" button in Lovable to transfer the project to your GitHub repository
2. Clone the project locally:
   ```bash
   git clone <your-github-repo-url>
   cd <project-folder>
   ```

### 2. Install Dependencies
```bash
npm install
```

### 3. Add Mobile Platforms

For iOS:
```bash
npm run mobile:add-ios
```

For Android:
```bash
npm run mobile:add-android
```

### 4. Build and Sync the Project

Build the web assets and sync to native platforms:
```bash
npm run mobile:build
```

Or sync only (if you've already built):
```bash
npm run mobile:sync
```

### 5. Run on Devices/Emulators

For iOS (requires macOS with Xcode):
```bash
npm run mobile:ios
```

For Android:
```bash
npm run mobile:android
```

## Native Features Included

Your TESLYS app includes these native capabilities:

### ✅ Already Configured:
- **Push Notifications**: Real-time notifications for bookings, maintenance, etc.
- **Status Bar**: Configured for dark theme matching your brand
- **Splash Screen**: 2-second branded loading screen
- **Keyboard Handling**: Native keyboard resize behavior
- **Safe Areas**: Proper spacing for device notches and home indicators

### 🔧 Ready to Add:
- **Camera Access**: For car damage documentation
- **File Uploads**: Native file picker integration
- **Geolocation**: For car location tracking
- **Offline Mode**: Service worker for offline functionality

## Customization Options

### App Icons and Splash Screens
1. Replace icons in respective platform folders:
   - iOS: `ios/App/App/Assets.xcassets/`
   - Android: `android/app/src/main/res/`

### App Store Configuration
1. Update app metadata in `capacitor.config.ts`
2. Configure signing certificates in Xcode (iOS) or Android Studio
3. Set up app store listings

## Troubleshooting

### Common Issues:

**Build Errors:**
```bash
# Clean and rebuild
npm run build
npx cap sync
```

**iOS Signing Issues:**
- Ensure your Apple Developer Account is configured in Xcode
- Check Bundle Identifier matches your provisioning profile

**Android Build Issues:**
- Ensure Java JDK 11+ is installed
- Update Android SDK tools in Android Studio

### Getting Help:
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Lovable Mobile Blog Post](https://lovable.dev/blogs/TODO)
- [TESLYS Discord Community](https://discord.gg/your-link)

## Production Deployment

### iOS App Store:
1. Archive in Xcode
2. Upload to App Store Connect
3. Submit for review

### Google Play Store:
1. Generate signed APK/AAB in Android Studio
2. Upload to Google Play Console
3. Submit for review

## Security Notes

- All user data remains secure with Row Level Security (RLS)
- API keys and sensitive data are handled securely
- Push notifications are properly authenticated
- No sensitive data is exposed to unauthorized access

Your TESLYS mobile app maintains the same high security standards as the web version!