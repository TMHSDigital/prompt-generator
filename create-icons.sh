#!/bin/bash
# Simple PWA icon generator using ImageMagick
# This is an alternative to the Node.js script

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "ImageMagick is not installed. Please install it first:"
    echo "  - Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "  - macOS: brew install imagemagick"
    echo "  - Windows: Download from https://imagemagick.org/script/download.php"
    exit 1
fi

# Check if source image exists
if [ ! -f "icon-source.png" ]; then
    echo "Error: icon-source.png not found!"
    echo "Please create a square PNG image (at least 512x512 pixels) and name it 'icon-source.png'"
    exit 1
fi

# Create directory if it doesn't exist
mkdir -p images/icons

# Generate icons for various sizes
echo "Generating PWA icons..."

# Sizes needed for PWA
sizes=(72 96 128 144 152 192 384 512)

for size in "${sizes[@]}"; do
    echo "Creating icon-${size}x${size}.png"
    convert icon-source.png -resize ${size}x${size} images/icons/icon-${size}x${size}.png
done

echo "Icons generated successfully!"
echo "You can now deploy your PWA to GitHub Pages." 