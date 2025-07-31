import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import SessionProvider from '@/components/SessionProvider';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Chaitan Journal - Your Personal Wellness Companion',
  description: 'Track your life, journal your thoughts, and discover insights about yourself with AI-powered analysis.',
  keywords: 'journaling, wellness, personal growth, mindfulness, self-reflection, mental health, life tracking',
  authors: [{ name: 'Chaitan Journal Team' }],
  creator: 'Chaitan Journal',
  publisher: 'Chaitan Journal',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://chaitan-journal.vercel.app'),
  openGraph: {
    title: 'Chaitan Journal - Your Personal Wellness Companion',
    description: 'Track your life, journal your thoughts, and discover insights about yourself.',
    url: 'https://chaitan-journal.vercel.app',
    siteName: 'Chaitan Journal',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Chaitan Journal - Personal Wellness Companion',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chaitan Journal - Your Personal Wellness Companion',
    description: 'Track your life, journal your thoughts, and discover insights about yourself.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#667eea" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Chaitan Journal" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className={inter.className}>
        <SessionProvider>
          {children}
        </SessionProvider>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
