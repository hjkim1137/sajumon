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
                  document.write(
                    '<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>사주몬</title>' +
                    '<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#4b3ba0;min-height:100vh;display:flex;align-items:flex-end;justify-content:center;font-family:-apple-system,sans-serif}' +
                    '.overlay{position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:1}' +
                    '.sheet{position:fixed;bottom:0;left:0;right:0;background:#fff;border-radius:24px 24px 0 0;padding:32px 24px 40px;max-width:480px;margin:0 auto;z-index:2;' +
                    'animation:slideUp .3s ease-out}' +
                    '@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}' +
                    '.btn{width:100%;padding:14px;background:#7c3aed;color:#fff;border:none;border-radius:14px;font-size:16px;font-weight:700;cursor:pointer;margin-top:20px}' +
                    '.btn:active{background:#6d28d9}</style></head>' +
                    '<body><div class="overlay"></div><div class="sheet">' +
                    '<div style="text-align:center;font-size:48px;margin-bottom:12px">🔮</div>' +
                    '<h2 style="text-align:center;font-size:20px;font-weight:900;color:#1f1f1f;margin-bottom:12px">사주몬</h2>' +
                    '<p style="text-align:center;font-size:15px;color:#555;line-height:1.6;word-break:keep-all">앱 내 브라우저에서는 정상적인 이용이 어려워요.</p>' +
                    '<p style="text-align:center;font-size:14px;color:#888;line-height:1.5;word-break:keep-all;margin-top:6px">아래 버튼을 눌러 외부 브라우저에서 열어주세요!</p>' +
                    '<button class="btn" onclick="location.href=\\'intent://' + url.replace(/^https?:\\/\\//, '') + '#Intent;scheme=https;action=android.intent.action.VIEW;end\\'">외부 브라우저로 열기</button>' +
                    '<p style="text-align:center;font-size:12px;color:#aaa;margin-top:16px;line-height:1.5">또는 우측 상단 <b>⋮</b> 메뉴에서<br/><b>「다른 브라우저로 열기」</b>를 눌러주세요</p>' +
                    '</div></body></html>'
                  );
                  document.close();
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
