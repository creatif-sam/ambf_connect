# iOS PWA - Quick Reference Card

## 🚀 Deployment Checklist

### Before Deployment
- [x] iOS meta tags added to layout
- [x] Apple touch icons generated (4 sizes)
- [x] iOS splash screens generated (15 devices)
- [x] iOS detection logic implemented
- [x] Install prompt with iOS instructions
- [x] Manifest.json enhanced
- [x] Generate script created
- [x] Documentation complete

### After Deployment
- [ ] Test on real iPhone/iPad
- [ ] Verify HTTPS working
- [ ] Check all assets load
- [ ] Test install flow
- [ ] Verify splash screens
- [ ] Test full-screen mode
- [ ] Check push notifications

## 📱 Testing on iOS

### Requirements
- **Real device required** (not simulator)
- **iOS 15.0+** (iOS 16.4+ recommended)
- **Safari browser** (required for install)
- **HTTPS enabled** (production only)

### Install Steps
1. Open Safari on iPhone/iPad
2. Go to app.africamedforum.com
3. Tap Share button (⎙)
4. Select "Add to Home Screen"
5. Tap "Add"

### What to Check
- ✅ Install prompt appears (2 sec delay)
- ✅ iOS-specific instructions shown
- ✅ App adds to home screen
- ✅ Splash screen displays on launch
- ✅ Full-screen (no Safari UI)
- ✅ Status bar matches theme (#7c1d1d)
- ✅ Icon displays correctly
- ✅ All features work

## 🛠️ Common Commands

```bash
# Generate/regenerate iOS assets
npm run generate:ios-icons

# Start dev server
npm run dev

# Build for production
npm run build

# Deploy
git push origin main
```

## 🎨 Generated Assets

**Apple Touch Icons** (4 files)
- apple-touch-icon.png (180×180)
- apple-touch-icon-180x180.png
- apple-touch-icon-167x167.png (iPad)
- apple-touch-icon-152x152.png (iPad)

**iOS Splash Screens** (15 files)
- Covers all iPhones from SE to 15 Pro Max
- Covers all iPads from 9.7" to 12.9" Pro
- Burgundy background (#7c1d1d)
- Centered app icon

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| Prompt not showing | Clear Safari cache, check localStorage |
| Can't find "Add to Home Screen" | Use Safari (not Chrome), update iOS |
| Icon blurry | Regenerate with higher quality base image |
| Splash not showing | Check file paths, reinstall app |
| Opens in Safari | Add via "Add to Home Screen", not bookmark |
| Wrong status bar | Check theme_color in manifest.json |

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `iOS-PWA-SETUP.md` | Technical setup guide |
| `iOS-PWA-TESTING.md` | Comprehensive testing checklist |
| `iOS-INSTALL-GUIDE-USER.md` | User-facing instructions |
| `iOS-PWA-IMPLEMENTATION.md` | Complete summary |
| `iOS-PWA-VISUAL-GUIDE.md` | Visual flow diagrams |

## 🎯 Key Technical Details

### iOS Detection
```typescript
isIOS() // Returns true on iPhone/iPad
isIOSInstalled() // Returns true if running standalone
```

### Meta Tags
```html
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-title" content="AMBF Connect" />
```

### Manifest Features
- Display: standalone
- Orientation: portrait-primary
- Shortcuts: Events, Messages, Networking
- Theme color: #7c1d1d

## 📊 Success Metrics

Track these KPIs:
- Install rate (% of iOS users)
- Launch rate (daily active from home screen)
- Retention (30-day)
- Device distribution
- iOS version spread

## 🔄 Maintenance Tasks

### When Logo Changes
1. Update `public/icons/logo-ambf.png` (1024×1024)
2. Run `npm run generate:ios-icons`
3. Commit and deploy

### Regular Checks
- Test on new iOS versions
- Update splash screens for new devices
- Monitor install rates
- Keep documentation current

## 🆘 Support

**Technical Issues**: it-support@africamedforum.com  
**Documentation**: Check `docs/` folder  
**Console Errors**: Safari DevTools (Mac required)

## 📝 Notes

- **Test on real device** - Simulators have limited PWA support
- **HTTPS required** - PWA features don't work on HTTP
- **Safari only** - Chrome on iOS uses Safari engine but different install flow
- **No programmatic install** - iOS requires manual "Add to Home Screen"
- **iOS 16.4+** - Full push notification support
- **Clear cache** - When testing install prompt changes

---

**Status**: ✅ Production Ready  
**Last Updated**: January 7, 2026  
**Version**: 1.0
