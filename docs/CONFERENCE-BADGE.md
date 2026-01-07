# Conference Badge Feature

## Overview
Digital conference badges/cards that participants can view and download from their profile pages.

## Features

### ✨ What's Included

**1. Digital Conference Badge**
- Professional conference card design
- Displays participant name, role, company, and photo
- Africamed branding with gradient header (#7c1d1d to #d4af37)
- Decorative grid pattern background
- Conference information (AMBF 2026)
- QR code placeholder for future integration
- Download as PNG image

**2. Access Points**
- **Own Profile** (`/profile`) - View and download your own badge
- **Public Profiles** (`/profiles/[userId]`) - View other attendees' badges

**3. Design Elements**
- Gradient header with Africamed brand colors
- Centered profile photo with shadow
- Name and role prominently displayed
- Company badge with subtle gradient background
- Event details in grid format
- Tagline: "Connecting Africa & Mediterranean Businesses"
- QR code area (ready for future implementation)

## Usage

### For Users

**View Your Badge:**
1. Go to your profile page
2. Click "View Conference Badge" button (gold gradient)
3. Badge appears in a modal overlay
4. Click "Download Badge" to save as PNG
5. Share on social media or print

**View Others' Badges:**
1. Navigate to any attendee's profile
2. Click "View Conference Badge" button
3. View their conference credentials
4. Optionally download their badge

### For Developers

**Component Location:**
```
components/ConferenceCard.tsx
```

**Usage:**
```tsx
import ConferenceCard from "@/components/ConferenceCard"

const [showCard, setShowCard] = useState(false)

<ConferenceCard
  profile={{
    full_name: "John Doe",
    job_title: "CEO",
    company: "Acme Corp",
    avatar_url: "/path/to/image.jpg"
  }}
  onClose={() => setShowCard(false)}
/>
```

## Design Specifications

### Colors
- **Header Gradient**: `#7c1d1d` → `#a02828` → `#d4af37`
- **Button Gradient**: `#7c1d1d` → `#d4af37`
- **Company Badge**: 10% opacity gradient of brand colors
- **Background**: White (`#ffffff`)

### Dimensions
- **Card Width**: Max 384px (sm breakpoint)
- **Avatar Size**: 128px × 128px (rounded)
- **Header Height**: 128px
- **Border Radius**: 16px (rounded-2xl)

### Typography
- **Conference Name**: 24px, bold, tracking-wide
- **Attendee Name**: 24px, bold
- **Job Title**: 14px, medium, brand color
- **Company**: 14px, medium
- **Info Labels**: 12px, uppercase

### Layout
- Overlapping avatar design (50% above fold)
- Centered content alignment
- Decorative horizontal divider
- Grid layout for event info
- QR code section at bottom

## Technical Implementation

### Dependencies
```json
{
  "html2canvas": "^1.4.1",
  "@types/html2canvas": "^1.0.0"
}
```

### Features
1. **Dynamic Import**: html2canvas loaded only when downloading
2. **High Resolution**: 2x scale for retina displays
3. **Client-side Rendering**: Modal overlay with backdrop
4. **Error Handling**: Graceful fallback if download fails
5. **Filename**: Auto-generated with participant name

### Download Process
1. User clicks "Download Badge"
2. html2canvas converts div to canvas
3. Canvas converted to PNG blob
4. Blob downloaded with filename: `[Name]_africamed_2026.png`
5. Temporary URL cleaned up

## Future Enhancements

### Planned Features
- [ ] QR code integration (links to profile)
- [ ] Multiple badge templates (organizer, speaker, attendee)
- [ ] Custom badge backgrounds
- [ ] Social media sharing buttons
- [ ] Batch download for organizers
- [ ] Print-optimized version
- [ ] PDF export option
- [ ] Multiple language support

### QR Code Integration
When ready to add QR codes:
```bash
npm install qrcode.react
```

```tsx
import QRCode from "qrcode.react"

<QRCode
  value={`https://app.africamedforum.com/profiles/${userId}`}
  size={64}
  level="M"
/>
```

### Badge Variations
Consider adding role-based badge styles:
- **Attendee**: Standard (current design)
- **Organizer**: Red accent
- **Speaker**: Gold accent
- **VIP**: Premium design

## Testing Checklist

### Visual Tests
- [ ] Badge displays correctly on mobile
- [ ] Badge displays correctly on desktop
- [ ] Profile photo appears centered
- [ ] All text is readable
- [ ] Colors match brand guidelines
- [ ] Gradient renders smoothly

### Functional Tests
- [ ] Modal opens when button clicked
- [ ] Modal closes on backdrop click
- [ ] Modal closes on X button
- [ ] Download button generates PNG
- [ ] Filename includes participant name
- [ ] Downloaded image is high quality
- [ ] Works without profile photo
- [ ] Works with long names/titles

### Edge Cases
- [ ] Missing profile photo (shows initials)
- [ ] Missing job title
- [ ] Missing company
- [ ] Very long names (truncation)
- [ ] Special characters in name
- [ ] No internet (cached assets)

## User Benefits

1. **Professional Identity**: Digital conference credentials
2. **Easy Sharing**: Downloadable for social media
3. **Networking**: Quick reference for connections made
4. **Memorabilia**: Keepsake from the event
5. **Branding**: Promotes Africamed Connect
6. **Accessibility**: Always available from profile

## Screenshots

### Badge Design
```
┌─────────────────────────────────┐
│ ╔════════════════════════════╗  │
│ ║  AMBF CONNECT             ║  │ ← Gradient Header
│ ║  2026 CONFERENCE           ║  │
│ ╚════════════════════════════╝  │
│                                 │
│         ┌─────────┐            │
│         │ Photo   │            │ ← Overlapping Avatar
│         └─────────┘            │
│                                 │
│       John Doe                  │ ← Name (Large)
│       CEO                       │ ← Title (Brand color)
│     ┌─────────────┐            │
│     │ Acme Corp   │            │ ← Company Badge
│     └─────────────┘            │
│                                 │
│  ─────────────────────────────  │ ← Divider
│                                 │
│  EVENT: AMBF 2026 │ TYPE: ...  │ ← Event Info
│                                 │
│  Connecting Africa & Med...     │ ← Tagline
│                                 │
│       ┌──────┐                 │
│       │ QR   │                 │ ← QR Code
│       └──────┘                 │
└─────────────────────────────────┘
```

## Support

For issues or feature requests:
- **Email**: it-support@africamedforum.com
- **Check**: Browser console for errors
- **Required**: Modern browser with HTML5 Canvas support

---

**Status**: ✅ Production Ready  
**Version**: 1.0  
**Last Updated**: January 7, 2026
