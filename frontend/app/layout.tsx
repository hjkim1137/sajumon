import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import SessionTracker from './_components/SessionTracker';

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
  description: '당신의 사주몬을 소환하세요',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var ua = navigator.userAgent || '';
                var isInApp = /Instagram|FBAN|FBAV/i.test(ua);
                var isAndroid = /Android/i.test(ua);
                if (isInApp && isAndroid) {
                  var url = location.href;
                  location.href = 'intent://' + url.replace(/^https?:\\/\\//, '') + '#Intent;scheme=https;action=android.intent.action.VIEW;end';
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionTracker />
        {children}
      </body>
    </html>
  );
}
