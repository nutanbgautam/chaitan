const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create out directory if it doesn't exist
const outDir = path.join(__dirname, '..', 'out');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Create a simple index.html for the mobile app
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chaitan Journal</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            text-align: center;
            color: white;
            padding: 2rem;
        }
        .logo {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        .title {
            font-size: 2rem;
            margin-bottom: 1rem;
            font-weight: bold;
        }
        .subtitle {
            font-size: 1.2rem;
            opacity: 0.9;
            margin-bottom: 2rem;
        }
        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255,255,255,.3);
            border-radius: 50%;
            border-top-color: #fff;
            animation: spin 1s ease-in-out infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .message {
            margin-top: 2rem;
            font-size: 1rem;
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">📱</div>
        <div class="title">Chaitan Journal</div>
        <div class="subtitle">Your Personal Wellness Companion</div>
        <div class="loading"></div>
        <div class="message">
            Loading your mobile experience...
        </div>
    </div>
    <script>
        // Redirect to the web app
        setTimeout(() => {
            window.location.href = 'https://your-app-domain.com';
        }, 2000);
    </script>
</body>
</html>`;

fs.writeFileSync(path.join(outDir, 'index.html'), indexHtml);

console.log('✅ Static build created successfully!');
console.log('📁 Output directory: out/');
console.log('📱 Ready for mobile app generation'); 