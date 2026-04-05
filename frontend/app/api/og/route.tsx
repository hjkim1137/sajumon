import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

const ANIMAL_NAMES: Record<string, string> = {
  rat: '쥐',
  ox: '소',
  tiger: '호랑이',
  rabbit: '토끼',
  dragon: '용',
  snake: '뱀',
  horse: '말',
  goat: '양',
  monkey: '원숭이',
  rooster: '닭',
  dog: '개',
  pig: '돼지',
};

const THEME_NAMES: Record<string, string> = {
  love: '애정운',
  money: '금전운',
  health: '건강운',
  study: '학업운',
  career: '커리어운',
};

const THEME_EMOJI: Record<string, string> = {
  love: '💕',
  money: '💰',
  health: '💪',
  study: '📚',
  career: '🚀',
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const name = searchParams.get('name') || '사주몬';
  const animal = searchParams.get('animal') || 'dog';
  const theme = searchParams.get('theme') || 'health';
  const title = searchParams.get('title') || '영험한';

  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || 'https://sajumon.vercel.app'
  ).replace(/\/+$/, '');
  const imageUrl = `${siteUrl}/images/${theme}-${animal}.webp`;

  const animalName = ANIMAL_NAMES[animal] || animal;
  const themeName = THEME_NAMES[theme] || '운세';
  const themeEmoji = THEME_EMOJI[theme] || '🔮';

  // Fetch character image and convert to base64 data URL
  let imgSrc = '';
  try {
    const res = await fetch(imageUrl);
    if (res.ok) {
      const buffer = await res.arrayBuffer();
      const base64 = btoa(
        String.fromCharCode(...new Uint8Array(buffer)),
      );
      imgSrc = `data:image/webp;base64,${base64}`;
    }
  } catch {
    // image fetch failed — render without it
  }

  return new ImageResponse(
    <div
      style={{
        width: '1200px',
        height: '630px',
        display: 'flex',
        background: 'linear-gradient(135deg, #4b3ba0 0%, #7c3aed 50%, #a855f7 100%)',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          padding: '40px',
        }}
      >
        {/* White card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            background: 'white',
            border: '6px solid black',
            borderRadius: '16px',
            padding: '40px 60px',
            gap: '50px',
            boxShadow: '12px 12px 0 rgba(0,0,0,0.2)',
            maxWidth: '1000px',
          }}
        >
          {/* Character image or fallback */}
          {imgSrc ? (
            <img
              src={imgSrc}
              width={220}
              height={220}
              style={{ objectFit: 'contain' }}
            />
          ) : (
            <div
              style={{
                width: '220px',
                height: '220px',
                background: '#f3e8ff',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '80px',
                border: '4px dashed #a855f7',
              }}
            >
              {themeEmoji}
            </div>
          )}

          {/* Text area */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              flex: 1,
            }}
          >
            <div
              style={{
                fontSize: '52px',
                fontWeight: 'bold',
                color: 'black',
                lineHeight: 1.2,
              }}
            >
              {title} {name}
            </div>
            <div
              style={{
                fontSize: '30px',
                color: '#7c3aed',
                fontWeight: 'bold',
              }}
            >
              {themeEmoji} {animalName} | {themeName}
            </div>
            <div
              style={{
                fontSize: '22px',
                color: '#888',
                marginTop: '4px',
              }}
            >
              2026 사주몬 운세
            </div>
          </div>
        </div>

        {/* Bottom branding */}
        <div
          style={{
            display: 'flex',
            fontSize: '22px',
            color: 'rgba(255,255,255,0.8)',
            marginTop: '20px',
            fontWeight: 'bold',
            letterSpacing: '1px',
          }}
        >
          sajumon.vercel.app
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}
