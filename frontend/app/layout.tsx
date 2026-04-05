import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import SessionTracker from './_components/SessionTracker';
import InAppBrowserGuide from './_components/InAppBrowserGuide';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '사주몬',
  description: '당신의 사주몬을 소환하세요! 2026년 운세를 확인해보세요.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://sajumon.vercel.app',
  ),
  openGraph: {
    title: '사주몬',
    description: '당신의 사주몬을 소환하세요! 2026년 운세를 확인해보세요.',
    images: [{ url: '/images/og-default.png', width: 1200, height: 630 }],
    type: 'website',
    siteName: '사주몬',
  },
  twitter: {
    card: 'summary_large_image',
    title: '사주몬',
    description: '당신의 사주몬을 소환하세요! 2026년 운세를 확인해보세요.',
    images: ['/images/og-default.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionTracker />
        <InAppBrowserGuide />
        {children}
      </body>
    </html>
  );
}
