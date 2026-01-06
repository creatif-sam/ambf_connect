# iOS PWA Testing Guide

## Pre-Testing Setup

### 1. Deploy to Production
The app must be served over HTTPS for PWA features to work on iOS.

```bash
# Push to production
git add .
git commit -m "Add iOS PWA support"
git push origin main
```

### 2. Verify Deployment
- URL: https://app.africamedforum.com
- Check that all assets are accessible:
  - https://app.africamedforum.com/manifest.json
  - https://app.africamedforum.com/icons/apple-touch-icon.png
  - https://app.africamedforum.com/icons/apple-splash-1290-2796.png

## Testing on iOS Device (Required)

**⚠️ IMPORTANT**: iOS PWA features cannot be fully tested in:
- iOS Simulator (limited PWA support)
- Desktop Safari (different behavior)
- Chrome on iOS (uses Safari engine but different UI)

**You MUST test on a real iPhone or iPad.**

## Test Scenarios

### Scenario 1: First-Time User on iPhone (Safari)

**Expected Behavior:**
1. Open Safari on iPhone
2. Navigate to https://app.africamedforum.com
3. After 2 seconds, golden install prompt appears at bottom
4. Prompt shows iOS-specific instructions with icons
5. User can tap "Got it" to dismiss

**Steps to Install:**
1. Tap the Share button (⎙) at the bottom of Safari
2. Scroll down in the share sheet
3. Find and tap "Add to Home Screen" (with + icon)
4. Tap "Add" in the top-right corner
5. App icon appears on home screen

**Verification:**
- [ ] Install prompt appeared automatically
- [ ] Instructions were clear and iOS-specific
- [ ] Share button location was correct
- [ ] "Add to Home Screen" option was visible
- [ ] App name shows as "AMBF Connect"
- [ ] Icon displays correctly on home screen

### Scenario 2: Launch Installed App

**Steps:**
1. Tap the AMBF Connect icon on home screen
2. App should launch with splash screen
3. App opens in full-screen (no Safari UI)

**Verification:**
- [ ] Splash screen displays with Africamed branding
- [ ] No Safari address bar or navigation visible
- [ ] Status bar color matches theme (#7c1d1d)
- [ ] App loads to correct start page (/)

### Scenario 3: Test App Functionality

**Core Features:**
- [ ] Login/Registration works
- [ ] Navigation between pages works
- [ ] Bottom navigation tabs function
- [ ] Messages can be sent/received
- [ ] Notifications appear (if enabled)
- [ ] Camera/file upload works
- [ ] App doesn't redirect to Safari

**Special Tests:**
- [ ] Close app and reopen (should resume where left off)
- [ ] Lock device and unlock (app state persists)
- [ ] Receive notification (if push enabled)
- [ ] App works offline (cached pages load)

### Scenario 4: Different iOS Devices

Test on various devices to verify splash screens:

**iPhones:**
- [ ] iPhone 15 Pro Max (1290x2796)
- [ ] iPhone 15 Pro (1179x2556)
- [ ] iPhone 14 Pro (1170x2532)
- [ ] iPhone XR/11 (828x1792)
- [ ] iPhone 8 (750x1334)

**iPads:**
- [ ] 12.9" iPad Pro (2048x2732)
- [ ] 11" iPad Pro (1668x2388)
- [ ] 9.7" iPad (1536x2048)

**For each device:**
- [ ] Splash screen fills entire screen
- [ ] Icon is centered and properly sized
- [ ] Background color is Africamed brand (#7c1d1d)

### Scenario 5: Install Prompt Behavior

**Test Dismissal:**
1. Open app in Safari (not installed)
2. Wait for prompt to appear
3. Tap "Got it" to dismiss
4. Close Safari and reopen app
5. Prompt should NOT appear again (dismissed is stored)

**Reset Test:**
1. Open Safari Developer tools or clear website data
2. Clear localStorage for the domain
3. Reload page
4. Prompt should appear again

**Verification:**
- [ ] Prompt shows only once after dismissal
- [ ] Dismissal state persists across sessions
- [ ] Clearing storage resets prompt

### Scenario 6: Already Installed Detection

**Steps:**
1. Install app to home screen (if not already)
2. Open Safari and navigate to app URL
3. Observe that install prompt does NOT appear

**Verification:**
- [ ] No install prompt when app is already installed
- [ ] App detects standalone mode correctly
- [ ] Console shows "✅ App is installed on iOS home screen"

## Testing Checklist

### Visual Elements
- [ ] App icon (180x180) appears sharp on home screen
- [ ] Splash screen displays correctly on launch
- [ ] Status bar color matches theme
- [ ] No Safari UI visible in installed app
- [ ] Text and images are crisp (retina optimized)

### Functionality
- [ ] All navigation works (no broken links)
- [ ] Forms can be filled and submitted
- [ ] Media uploads work (photos, files)
- [ ] Push notifications work (if enabled)
- [ ] Deep links open in the app (not Safari)
- [ ] External links open in Safari (as intended)

### Performance
- [ ] App loads quickly from home screen
- [ ] Splash screen doesn't flash or flicker
- [ ] No lag when switching between tabs
- [ ] Smooth scrolling and animations
- [ ] No memory leaks (test extended usage)

### Edge Cases
- [ ] App works on cellular data (not just WiFi)
- [ ] App works in airplane mode (for cached content)
- [ ] App handles network errors gracefully
- [ ] App survives device restart
- [ ] Multiple app instances can run (if supported)

## Debugging iOS PWA Issues

### Check Console Logs
1. Connect iPhone to Mac
2. Open Safari on Mac
3. Go to Develop > [Your iPhone] > [AMBF Connect]
4. View console for errors

### Common Issues and Fixes

**Issue: Install prompt not showing**
- Clear Safari cache: Settings > Safari > Clear History and Website Data
- Check console for errors
- Verify `manifest.json` is accessible
- Check that site is HTTPS

**Issue: Splash screen not appearing**
- Verify splash screen files exist in `public/icons/`
- Check file names match exactly in `app/layout.tsx`
- Try force-closing and relaunching app
- Restart iPhone and reinstall app

**Issue: App opens in Safari instead of full-screen**
- Ensure added via "Add to Home Screen" (not bookmarked)
- Check `apple-mobile-web-app-capable` meta tag is set
- Reinstall app from Safari

**Issue: Icons look blurry**
- Verify icon files are high resolution (2x/3x)
- Check that correct icon sizes were generated
- Regenerate icons with higher quality base image

**Issue: Status bar wrong color**
- Verify `theme_color` in manifest.json
- Check `apple-mobile-web-app-status-bar-style` meta tag
- Try changing status bar style to "black" or "black-translucent"

### iOS Version Compatibility

**iOS 16.4+** (Released March 2023)
- ✅ Full PWA support
- ✅ Web Push Notifications
- ✅ Badging API
- ✅ Install prompts

**iOS 15.0 - 16.3**
- ✅ Basic PWA support
- ❌ Limited push notifications
- ⚠️  Some APIs restricted

**iOS 14 and below**
- ⚠️  Limited PWA support
- ❌ No push notifications
- ⚠️  May have compatibility issues

**Minimum Recommended: iOS 15.0**

## Production Deployment Checklist

Before going live:

- [ ] All assets generated and committed
- [ ] HTTPS enabled on production domain
- [ ] manifest.json accessible at root
- [ ] Service worker registered
- [ ] Apple touch icons in correct paths
- [ ] Splash screens generated for all devices
- [ ] Meta tags present in layout.tsx
- [ ] Install prompt tested on real iOS device
- [ ] App installed and tested from home screen
- [ ] All core features work in installed mode
- [ ] Analytics tracking PWA installs (optional)
- [ ] Documentation updated for users

## User Documentation

Create a help article for users:

**Title**: "How to Install AMBF Connect on Your iPhone"

**Content**:
1. Open Safari on your iPhone
2. Go to https://app.africamedforum.com
3. Tap the Share button (⎙) at the bottom
4. Scroll and tap "Add to Home Screen"
5. Tap "Add" in the top-right
6. The app icon will appear on your home screen
7. Tap the icon to launch the app

**Benefits of Installing**:
- Faster access (no need to open Safari)
- Works offline for cached content
- Receive push notifications
- Feels like a native app
- Saves data by caching resources

## Monitoring and Analytics

Track these metrics:

1. **Install Rate**: % of iOS users who install PWA
2. **Launch Source**: Home screen vs Safari
3. **Retention**: % who keep app installed
4. **Device Distribution**: iPhone vs iPad models
5. **iOS Versions**: Which versions users have

## Support Resources

- iOS PWA Documentation: https://developer.apple.com/library/archive/documentation/AppleApplications/Reference/SafariWebContent/
- Web.dev PWA Guide: https://web.dev/learn/pwa/
- Can I Use PWA: https://caniuse.com/web-app-manifest

## Questions?

Contact: it-support@africamedforum.com
