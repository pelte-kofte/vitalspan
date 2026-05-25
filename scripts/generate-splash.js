// generate-splash.js — Generates the Vitalspan splash screen (1284×1284 PNG)
// Run: node scripts/generate-splash.js

const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const path = require('path');

// Register brand fonts if available (assets/fonts/ must exist)
const serifFontPath = path.join(__dirname, '..', 'assets', 'fonts', 'DMSerifDisplay-Regular.ttf');
const sansFontPath  = path.join(__dirname, '..', 'assets', 'fonts', 'DMSans-Regular.ttf');
if (fs.existsSync(serifFontPath)) {
  registerFont(serifFontPath, { family: 'DM Serif Display' });
}
if (fs.existsSync(sansFontPath)) {
  registerFont(sansFontPath, { family: 'DM Sans' });
}

const SIZE = 1284;
const canvas = createCanvas(SIZE, SIZE);
const ctx = canvas.getContext('2d');

// Fill background with warm off-white (#EDE8DC)
ctx.fillStyle = '#EDE8DC';
ctx.fillRect(0, 0, SIZE, SIZE);

// App name — light weight serif
ctx.fillStyle = '#1A1A18';
ctx.textAlign = 'center';
ctx.textBaseline = 'alphabetic';
ctx.font = '300 96px "DM Serif Display", serif';
ctx.fillText('Vitalspan', 642, 580);

// Tagline — regular sans-serif
ctx.fillStyle = '#4A4A45';
ctx.font = '400 36px "DM Sans", sans-serif';
ctx.fillText('Track your biological age', 642, 680);

// Pharmacist line — green
ctx.fillStyle = '#2D6A4F';
ctx.font = '400 28px "DM Sans", sans-serif';
ctx.fillText('⚕ Built by a licensed pharmacist', 642, 730);

// Write PNG to assets/splash.png
const outPath = path.join(__dirname, '..', 'assets', 'splash.png');
fs.writeFileSync(outPath, canvas.toBuffer('image/png'));

console.log('Splash generated: assets/splash.png (1284x1284)');
