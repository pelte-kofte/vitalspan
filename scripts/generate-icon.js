// generate-icon.js — Generates the Vitalspan app icon (1024×1024 PNG)
// Run: node scripts/generate-icon.js

const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const SIZE = 1024;
const canvas = createCanvas(SIZE, SIZE);
const ctx = canvas.getContext('2d');

// Fill background with Colors.primary (#2D6A4F)
ctx.fillStyle = '#2D6A4F';
ctx.fillRect(0, 0, SIZE, SIZE);

// Draw white "V" lettermark centered
ctx.fillStyle = '#FFFFFF';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.font = '480px serif';
ctx.fillText('V', 512, 512);

// Write PNG to assets/icon.png
const outPath = path.join(__dirname, '..', 'assets', 'icon.png');
fs.writeFileSync(outPath, canvas.toBuffer('image/png'));

console.log('Icon generated: assets/icon.png (1024x1024)');
