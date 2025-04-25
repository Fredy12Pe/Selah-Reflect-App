/**
 * Splash Screen Generator for Selah PWA
 * 
 * Run this script to generate splash screen images for iOS:
 * node scripts/generate-splash.js
 */

const fs = require('fs');
const { createCanvas } = require('canvas');

// Create splash screen (1242x2688 for iPhone)
const canvasSplash = createCanvas(1242, 2688);
const ctxSplash = canvasSplash.getContext('2d');

// Create gradient background
const gradientSplash = ctxSplash.createLinearGradient(0, 0, 1242, 2688);
gradientSplash.addColorStop(0, '#000000');
gradientSplash.addColorStop(0.5, '#2a1a47');
gradientSplash.addColorStop(1, '#000000');
ctxSplash.fillStyle = gradientSplash;
ctxSplash.fillRect(0, 0, 1242, 2688);

// Draw 'S' letter
ctxSplash.fillStyle = 'white';
ctxSplash.font = 'bold 300px Arial';
ctxSplash.textAlign = 'center';
ctxSplash.textBaseline = 'middle';
ctxSplash.fillText('S', 1242/2, 2688/2 - 200);

// Draw app name
ctxSplash.fillStyle = 'white';
ctxSplash.font = '100px Arial';
ctxSplash.textAlign = 'center';
ctxSplash.textBaseline = 'middle';
ctxSplash.fillText('Selah', 1242/2, 2688/2 + 100);

// Draw tagline
ctxSplash.fillStyle = 'rgba(255,255,255,0.7)';
ctxSplash.font = '50px Arial';
ctxSplash.textAlign = 'center';
ctxSplash.textBaseline = 'middle';
ctxSplash.fillText('Daily Christian Devotional', 1242/2, 2688/2 + 200);

// Save the image
fs.writeFileSync('./public/splash.png', canvasSplash.toBuffer('image/png'));

console.log('Splash screen generated successfully!'); 