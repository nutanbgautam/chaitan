'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js', {
            scope: '/',
            updateViaCache: 'none'
          })
          .then((registration) => {
            console.log('✅ Service Worker registered successfully:', registration);
            
            // Check for updates
            registration.addEventListener('updatefound', () => {
              console.log('🔄 Service Worker update found');
            });
          })
          .catch((registrationError) => {
            console.error('❌ Service Worker registration failed:', registrationError);
          });
      });
    } else {
      console.log('⚠️ Service Worker not supported');
    }
  }, []);

  return null;
} 