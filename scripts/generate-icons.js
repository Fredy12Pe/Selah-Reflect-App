/**
 * Icon Generator for Selah PWA
 * 
 * Run this script to generate the necessary icon files for the PWA:
 * node scripts/generate-icons.js
 */

const fs = require('fs');
const { createCanvas } = require('canvas');

// Create 192x192 icon
const canvas192 = createCanvas(192, 192);
const ctx192 = canvas192.getContext('2d');

// Create gradient background
const gradient192 = ctx192.createLinearGradient(0, 0, 192, 192);
gradient192.addColorStop(0, '#000000');
gradient192.addColorStop(1, '#473678');
ctx192.fillStyle = gradient192;

// Draw rounded rectangle
ctx192.beginPath();
ctx192.moveTo(24, 0);
ctx192.lineTo(168, 0);
ctx192.quadraticCurveTo(192, 0, 192, 24);
ctx192.lineTo(192, 168);
ctx192.quadraticCurveTo(192, 192, 168, 192);
ctx192.lineTo(24, 192);
ctx192.quadraticCurveTo(0, 192, 0, 168);
ctx192.lineTo(0, 24);
ctx192.quadraticCurveTo(0, 0, 24, 0);
ctx192.fill();

// Draw 'S' letter
ctx192.fillStyle = 'white';
ctx192.font = 'bold 120px Arial';
ctx192.textAlign = 'center';
ctx192.textBaseline = 'middle';
ctx192.fillText('S', 96, 96);

// Create 512x512 icon
const canvas512 = createCanvas(512, 512);
const ctx512 = canvas512.getContext('2d');

// Create gradient background
const gradient512 = ctx512.createLinearGradient(0, 0, 512, 512);
gradient512.addColorStop(0, '#000000');
gradient512.addColorStop(1, '#473678');
ctx512.fillStyle = gradient512;

// Draw rounded rectangle
ctx512.beginPath();
ctx512.moveTo(64, 0);
ctx512.lineTo(448, 0);
ctx512.quadraticCurveTo(512, 0, 512, 64);
ctx512.lineTo(512, 448);
ctx512.quadraticCurveTo(512, 512, 448, 512);
ctx512.lineTo(64, 512);
ctx512.quadraticCurveTo(0, 512, 0, 448);
ctx512.lineTo(0, 64);
ctx512.quadraticCurveTo(0, 0, 64, 0);
ctx512.fill();

// Draw 'S' letter
ctx512.fillStyle = 'white';
ctx512.font = 'bold 300px Arial';
ctx512.textAlign = 'center';
ctx512.textBaseline = 'middle';
ctx512.fillText('S', 256, 256);

// Save the images
fs.writeFileSync('./public/icon-192.png', canvas192.toBuffer('image/png'));
fs.writeFileSync('./public/icon-512.png', canvas512.toBuffer('image/png'));

console.log('Icons generated successfully!'); 