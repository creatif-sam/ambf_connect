# iOS PWA Installation Guide

## Overview
AMBF Connect is now fully optimized as a Progressive Web App (PWA) for iOS devices (iPhone and iPad). This means users can install it on their home screen for a native app-like experience.

## What's Been Implemented

### 1. iOS-Specific Meta Tags ✅
Added to `app/layout.tsx`:
- `apple-mobile-web-app-capable` - Enables full-screen mode
- `apple-mobile-web-app-status-bar-style` - Controls status bar appearance
- `apple-mobile-web-app-title` - Sets the app name on home screen

### 2. Apple Touch Icons ✅
Multiple sizes for different iOS devices:
- 180x180px (iPhone)
- 167x167px (iPad Pro)
- 152x152px (iPad)

### 3. iOS Splash Screens ✅
Full coverage for all iOS devices:
- **iPhones**: iPhone 15 Pro Max, 15 Pro, 14 Pro Max, 14 Pro, XS Max, XR, X, 8 Plus, 8, SE
- **iPads**: 12.9" iPad Pro, 11" iPad Pro, 10.9" iPad Air, 10.5" iPad Pro, 9.7" iPad

### 4. Smart Device Detection ✅
The app automatically detects:
- Whether user is on iOS device
- Whether app is already installed (standalone mode)
- Shows appropriate install instructions for iOS vs Android

### 5. Enhanced Manifest.json ✅
Added iOS-friendly features:
- App shortcuts (Events, Messages, Networking)
- Screenshots for app stores
- Orientation preferences
- Maskable icons support

## How to Generate iOS Assets

### Prerequisites
```bash
npm install --save-dev sharp
```

### Generate Icons and Splash Screens
```bash
node scripts/generate-ios-icons.js
```

This script will:
1. Read the base icon from `public/icons/logo-ambf.png`
2. Generate all required Apple touch icons
3. Generate all iOS splash screens with the Africamed brand color (#7c1d1d)

**Note**: Make sure you have a 1024x1024px PNG icon at `public/icons/logo-ambf.png` before running the script.

## User Installation Flow

### iOS (Safari)
When users visit the app on Safari:

1. **Automatic Detection**: App detects iOS device
2. **Install Prompt**: Shows after 2 seconds with iOS-specific instructions
3. **User Actions**:
   - Tap the Share button (⎙) at the bottom of Safari
   - Scroll and tap "Add to Home Screen" (➕)
   - Tap "Add" in the top-right corner
4. **Result**: App appears on home screen with icon and launches in full-screen mode

### Android/Chrome
Traditional PWA install flow with automatic "Install" button.

## Testing Checklist

### On iOS Device (iPhone/iPad)
- [ ] Open app in Safari
- [ ] Wait for install prompt to appear
- [ ] Verify iOS-specific instructions are shown
- [ ] Follow instructions to add to home screen
- [ ] Launch app from home screen
- [ ] Verify app runs in full-screen mode (no Safari UI)
- [ ] Check app icon appears correctly
- [ ] Test splash screen on app launch
- [ ] Verify status bar styling

### Features to Test in Installed App
- [ ] Navigation works without browser chrome
- [ ] Push notifications are functional
- [ ] Offline capabilities work (if implemented)
- [ ] Camera/file upload works
- [ ] Deep links open in the app

## Technical Details

### iOS Detection Logic
```typescript
function isIOS(): boolean {
  const userAgent = window.navigator.userAgent.toLowerCase()
  return /iphone|ipad|ipod/.test(userAgent)
}

function isIOSInstalled(): boolean {
  return isIOS() && (window.navigator as any).standalone === true
}
```

### Splash Screen Sizing
iOS requires exact pixel dimensions for splash screens. The generated images:
- Use Africamed brand color (#7c1d1d) as background
- Center the app icon at 30% of the smaller dimension
- Match exact device dimensions for proper display

### Viewport Configuration
iOS PWA requires:
```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
```

## Known iOS Limitations

1. **No Programmatic Install**: Unlike Chrome, Safari doesn't allow triggering install programmatically. Users must manually use "Add to Home Screen".

2. **No beforeinstallprompt**: The `beforeinstallprompt` event only works on Chrome/Android, not Safari.

3. **Limited Push Notifications**: iOS has restrictions on web push notifications. Full support requires iOS 16.4+ and user must explicitly enable notifications.

4. **Storage Limits**: iOS may clear app data if not used for extended periods.

5. **No Install Banner**: Safari doesn't show automatic install banners like Chrome.

## Production Deployment

### Environment Variables
Ensure these are set in Vercel/production:
```env
NEXT_PUBLIC_APP_URL=https://app.africamedforum.com
```

### HTTPS Requirement
PWA features only work over HTTPS (or localhost for development).

### Service Worker
Ensure service worker is registered:
- File: `public/sw.js`
- Registration: `lib/push/registerServiceWorker.ts`

### Testing in Production
1. Deploy to production (must be HTTPS)
2. Test on actual iOS device (simulators may not fully support PWA features)
3. Verify all icons and splash screens load correctly
4. Check Safari Web Inspector for any console errors

## Troubleshooting

### Install Prompt Not Showing on iOS
- Clear Safari cache and cookies
- Check that app is served over HTTPS
- Verify `manifest.json` is accessible
- Check localStorage for `pwa_install_dismissed` (may need to clear)

### Splash Screen Not Showing
- Verify splash screen images exist in `public/icons/`
- Check exact pixel dimensions match iOS device
- Clear iOS home screen and re-install app

### App Not Running in Full-Screen
- Verify `apple-mobile-web-app-capable` meta tag is set to "yes"
- Check that user added app via "Add to Home Screen" (not just bookmarked)

### Icons Not Displaying
- Verify Apple touch icons exist and are correct sizes
- Check file paths in `app/layout.tsx`
- Clear iOS home screen cache (restart device)

## Resources

- [Apple PWA Documentation](https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/ConfiguringWebApplications/ConfiguringWebApplications.html)
- [iOS PWA Best Practices](https://web.dev/learn/pwa/installation-prompt/)
- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)

## Support

For issues or questions:
- Email: it-support@africamedforum.com
- Check browser console for errors
- Verify all assets generated correctly
