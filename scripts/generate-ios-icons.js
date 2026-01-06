/**
 * Generate iOS PWA Icons and Splash Screens
 * 
 * This script generates all required iOS icons and splash screens from a base icon.
 * 
 * PREREQUISITES:
 * 1. Install sharp: npm install --save-dev sharp
 * 2. Place your base icon (1024x1024 PNG) at public/icons/logo-ambf.png
 * 
 * USAGE:
 * node scripts/generate-ios-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ICONS_DIR = path.join(__dirname, '../public/icons');
const BASE_ICON = path.join(ICONS_DIR, 'logo-ambf.png');

// iOS Icon Sizes
const ICON_SIZES = [
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'apple-touch-icon-152x152.png', size: 152 },
  { name: 'apple-touch-icon-180x180.png', size: 180 },
  { name: 'apple-touch-icon-167x167.png', size: 167 },
];

// iOS Splash Screen Sizes
const SPLASH_SCREENS = [
  { name: 'apple-splash-2048-2732.png', width: 2048, height: 2732 }, // 12.9" iPad Pro
  { name: 'apple-splash-1668-2388.png', width: 1668, height: 2388 }, // 11" iPad Pro
  { name: 'apple-splash-1536-2048.png', width: 1536, height: 2048 }, // 9.7" iPad
  { name: 'apple-splash-1668-2224.png', width: 1668, height: 2224 }, // 10.5" iPad Pro
  { name: 'apple-splash-1620-2160.png', width: 1620, height: 2160 }, // 10.9" iPad Air
  { name: 'apple-splash-1290-2796.png', width: 1290, height: 2796 }, // iPhone 15 Pro Max
  { name: 'apple-splash-1179-2556.png', width: 1179, height: 2556 }, // iPhone 15 Pro
  { name: 'apple-splash-1284-2778.png', width: 1284, height: 2778 }, // iPhone 14 Pro Max
  { name: 'apple-splash-1170-2532.png', width: 1170, height: 2532 }, // iPhone 14 Pro
  { name: 'apple-splash-1125-2436.png', width: 1125, height: 2436 }, // iPhone X/XS/11 Pro
  { name: 'apple-splash-1242-2688.png', width: 1242, height: 2688 }, // iPhone XS Max/11 Pro Max
  { name: 'apple-splash-828-1792.png', width: 828, height: 1792 },   // iPhone XR/11
  { name: 'apple-splash-1242-2208.png', width: 1242, height: 2208 }, // iPhone 8 Plus
  { name: 'apple-splash-750-1334.png', width: 750, height: 1334 },   // iPhone 8
  { name: 'apple-splash-640-1136.png', width: 640, height: 1136 },   // iPhone 5/SE
];

const BRAND_COLOR = '#7c1d1d'; // Africamed brand color

async function generateIcons() {
  console.log('🎨 Generating iOS PWA icons...\n');

  // Check if base icon exists
  if (!fs.existsSync(BASE_ICON)) {
    console.error('❌ Base icon not found at:', BASE_ICON);
    console.log('Please place a 1024x1024 PNG at public/icons/logo-ambf.png');
    process.exit(1);
  }

  // Generate Apple Touch Icons
  for (const icon of ICON_SIZES) {
    const outputPath = path.join(ICONS_DIR, icon.name);
    await sharp(BASE_ICON)
      .resize(icon.size, icon.size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .png()
      .toFile(outputPath);
    console.log(`✅ Created ${icon.name} (${icon.size}x${icon.size})`);
  }

  console.log('\n🖼️  Generating iOS splash screens...\n');

  // Generate Splash Screens
  for (const splash of SPLASH_SCREENS) {
    const outputPath = path.join(ICONS_DIR, splash.name);
    
    // Create splash screen with centered icon and brand color background
    const iconSize = Math.min(splash.width, splash.height) * 0.3; // Icon is 30% of smaller dimension
    
    await sharp({
      create: {
        width: splash.width,
        height: splash.height,
        channels: 4,
        background: BRAND_COLOR
      }
    })
    .composite([
      {
        input: await sharp(BASE_ICON)
          .resize(Math.round(iconSize), Math.round(iconSize), {
            fit: 'contain',
            background: { r: 0, g: 0, b: 0, alpha: 0 }
          })
          .png()
          .toBuffer(),
        gravity: 'center'
      }
    ])
    .png()
    .toFile(outputPath);
    
    console.log(`✅ Created ${splash.name} (${splash.width}x${splash.height})`);
  }

  console.log('\n🎉 All iOS PWA assets generated successfully!');
  console.log('\n📱 Test on iOS:');
  console.log('1. Open Safari on your iPhone/iPad');
  console.log('2. Navigate to your app URL');
  console.log('3. Tap the Share button');
  console.log('4. Select "Add to Home Screen"');
}

generateIcons().catch(err => {
  console.error('❌ Error generating icons:', err);
  process.exit(1);
});
