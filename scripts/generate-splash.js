// generate-splash.js — Generates the Vitalspan splash screen (1284×2778 PNG)
// Run: node scripts/generate-splash.js

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const W = 1284;
const H = 2778;
const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

// Fill background with warm off-white (#EDE8DC)
ctx.fillStyle = '#EDE8DC';
ctx.fillRect(0, 0, W, H);

// App name — light weight serif
ctx.fillStyle = '#1A1A18';
ctx.textAlign = 'center';
ctx.textBaseline = 'alphabetic';
ctx.font = '300 96px serif';
ctx.fillText('Vitalspan', 642, 1350);

// Tagline — regular sans-serif
ctx.fillStyle = '#4A4A45';
ctx.font = '400 36px sans-serif';
ctx.fillText('Track your biological age', 642, 1414);

// Pharmacist line — green
ctx.fillStyle = '#2D6A4F';
ctx.font = '400 28px sans-serif';
ctx.fillText('⚕ Built by a licensed pharmacist', 642, 1478);

// Write PNG to assets/splash.png
const outPath = path.join(__dirname, '..', 'assets', 'splash.png');
fs.writeFileSync(outPath, canvas.toBuffer('image/png'));

console.log('Splash generated: assets/splash.png (1284x2778)');
