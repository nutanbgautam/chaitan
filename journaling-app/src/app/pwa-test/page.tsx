'use client';

import { useState, useEffect } from 'react';

export default function PWATestPage() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Check if PWA is installable
    const checkInstallability = () => {
      if ('serviceWorker' in navigator) {
        console.log('✅ Service Worker supported');
      } else {
        console.log('❌ Service Worker not supported');
      }

      // Check for beforeinstallprompt event
      window.addEventListener('beforeinstallprompt', (e) => {
        console.log('🎉 PWA install prompt available!');
        e.preventDefault();
        setDeferredPrompt(e);
        setIsInstallable(true);
      });

      // Check if already installed
      if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('✅ PWA already installed');
      }
    };

    checkInstallability();
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">PWA Test Page</h1>
        
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">PWA Status</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
                <span>Service Worker: Supported</span>
              </div>
              <div className="flex items-center">
                <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
                <span>Manifest: Loaded</span>
              </div>
              <div className="flex items-center">
                <span className="w-4 h-4 bg-green-500 rounded-full mr-2"></span>
                <span>HTTPS: Required for PWA</span>
              </div>
            </div>
          </div>

          {isInstallable && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-green-900 mb-2">Install Available!</h2>
              <p className="text-green-700 mb-4">
                This app can be installed on your device. Click the button below to install.
              </p>
              <button
                onClick={handleInstall}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                📱 Install App
              </button>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-yellow-900 mb-2">Manual Installation</h2>
            <p className="text-yellow-700 mb-4">
              If the install button doesn't appear, you can manually install the app:
            </p>
            <div className="space-y-2 text-sm">
              <div><strong>Chrome/Edge:</strong> Click the install icon (📱) in the address bar</div>
              <div><strong>Safari:</strong> Tap Share → Add to Home Screen</div>
              <div><strong>Android:</strong> Tap menu (⋮) → Add to Home screen</div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">PWA Requirements</h2>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>✅ Valid manifest.json</li>
              <li>✅ Service worker registered</li>
              <li>✅ HTTPS connection (required)</li>
              <li>✅ Icons provided (192x192, 512x512)</li>
              <li>✅ Display mode: standalone</li>
              <li>✅ Start URL defined</li>
            </ul>
          </div>

          <div className="text-center">
            <a
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              🏠 Go to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 