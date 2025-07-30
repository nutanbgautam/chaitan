const fs = require('fs');
const path = require('path');

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Create a simple SVG icon
const svgIcon = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="100" fill="url(#grad)"/>
  <circle cx="256" cy="256" r="120" fill="white" opacity="0.9"/>
  <path d="M256 140 L280 200 L340 200 L290 240 L310 320 L256 280 L202 320 L222 240 L172 200 L232 200 Z" fill="#667eea"/>
  <text x="256" y="400" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="white">📱</text>
</svg>`;

// Convert SVG to PNG using a simple approach (create placeholder files)
const createPlaceholderIcon = (size, filename) => {
  const svgContent = svgIcon.replace('width="512"', `width="${size}"`).replace('height="512"', `height="${size}"`);
  const svgPath = path.join(publicDir, filename.replace('.png', '.svg'));
  fs.writeFileSync(svgPath, svgContent);
  console.log(`✅ Created ${filename.replace('.png', '.svg')}`);
};

// Create icons
createPlaceholderIcon(192, 'icon-192x192.png');
createPlaceholderIcon(512, 'icon-512x512.png');

// Create favicon
const faviconSvg = `<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" rx="6" fill="#667eea"/>
  <text x="16" y="22" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="white">📱</text>
</svg>`;
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg);

// Create apple touch icon
const appleTouchSvg = `<svg width="180" height="180" viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
  <rect width="180" height="180" rx="40" fill="#667eea"/>
  <text x="90" y="110" text-anchor="middle" font-family="Arial, sans-serif" font-size="80" fill="white">📱</text>
</svg>`;
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.svg'), appleTouchSvg);

console.log('✅ PWA assets created successfully!');
console.log('📱 Icons are now available for PWA installation');
console.log('');
console.log('Note: For production, replace these SVG files with actual PNG icons');
console.log('You can use tools like:');
console.log('- https://realfavicongenerator.net/');
console.log('- https://www.pwabuilder.com/imageGenerator');
console.log('- https://favicon.io/'); 