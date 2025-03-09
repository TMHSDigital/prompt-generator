/**
 * PWA Icon Generator Script
 * 
 * Instructions:
 * 1. Install Node.js if you don't have it: https://nodejs.org/
 * 2. Install sharp package: npm install sharp
 * 3. Place a high-resolution square image file (at least 512x512px) named "icon-source.png" in the project root
 * 4. Run this script with Node.js: node generate-icons.js
 * 
 * This will generate all the required PWA icons in the images/icons directory
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Icon sizes needed for PWA
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create directory if it doesn't exist
const iconsDir = path.join(__dirname, 'images', 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// Source image
const sourceImage = path.join(__dirname, 'icon-source.png');

// Generate each size
async function generateIcons() {
    try {
        if (!fs.existsSync(sourceImage)) {
            console.error('Error: Source image not found. Please place a file named "icon-source.png" in the project root.');
            return;
        }

        console.log('Generating PWA icons...');
        
        for (const size of sizes) {
            const outputFile = path.join(iconsDir, `icon-${size}x${size}.png`);
            
            await sharp(sourceImage)
                .resize(size, size)
                .png()
                .toFile(outputFile);
                
            console.log(`✓ Generated: ${outputFile}`);
        }
        
        console.log('\nAll icons generated successfully!');
        console.log('\nIf you don\'t have Node.js or sharp installed, you can also:');
        console.log('1. Use an online tool like https://app-manifest.firebaseapp.com/');
        console.log('2. Manually resize your icon using an image editor');
        console.log('3. Place the resized icons in the images/icons directory with the correct filenames');
    } catch (error) {
        console.error('Error generating icons:', error);
    }
}

generateIcons(); 