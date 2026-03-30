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
                  document.addEventListener('DOMContentLoaded', function() {
                    document.body.innerHTML = '';
                    document.body.style.cssText = 'margin:0;background:#4b3ba0;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:-apple-system,sans-serif;';

                    var wrap = document.createElement('div');
                    wrap.style.cssText = 'background:#fff;border-radius:24px;padding:32px 24px;max-width:360px;width:90%;text-align:center;box-shadow:0 8px 30px rgba(0,0,0,0.2);';
                    wrap.innerHTML =
                      '<div style="font-size:48px;margin-bottom:16px;">🔮</div>' +
                      '<h2 style="font-size:20px;font-weight:900;color:#1f1f1f;margin:0 0 12px;">사주몬</h2>' +
                      '<p style="font-size:15px;color:#555;line-height:1.6;margin:0 0 8px;word-break:keep-all;">앱 내 브라우저에서는 정상적인 이용이 어려워요.</p>' +
                      '<p style="font-size:14px;color:#888;line-height:1.5;margin:0 0 24px;word-break:keep-all;">아래 버튼을 눌러 외부 브라우저에서 열어주세요!</p>' +
                      '<button id="openExternal" style="width:100%;padding:14px;background:#7c3aed;color:#fff;border:none;border-radius:14px;font-size:16px;font-weight:700;cursor:pointer;">외부 브라우저로 열기</button>' +
                      '<p style="font-size:12px;color:#aaa;margin-top:16px;line-height:1.5;">또는 우측 상단 <b>⋮</b> 메뉴에서<br/><b>"다른 브라우저로 열기"</b>를 눌러주세요</p>';

                    document.body.appendChild(wrap);

                    document.getElementById('openExternal').addEventListener('click', function() {
                      var url = location.href;
                      location.href = 'intent://' + url.replace(/^https?:\\/\\//, '') + '#Intent;scheme=https;action=android.intent.action.VIEW;end';
                    });
                  });
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
