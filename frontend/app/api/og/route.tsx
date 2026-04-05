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

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const name = searchParams.get('name') || '사주몬';
  const animal = searchParams.get('animal') || 'dog';
  const theme = searchParams.get('theme') || 'health';
  const title = searchParams.get('title') || '영험한';

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://sajumon.vercel.app/';
  const imageUrl = `${siteUrl}/images/${theme}-${animal}.webp`;

  const animalName = ANIMAL_NAMES[animal] || animal;
  const themeName = THEME_NAMES[theme] || '운세';

  return new ImageResponse(
    <div
      style={{
        width: '1200px',
        height: '630px',
        display: 'flex',
        background: '#4b3ba0',
        position: 'relative',
      }}
    >
      {/* Main card */}
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
        {/* White card area */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            background: 'white',
            border: '6px solid black',
            borderRadius: '8px',
            padding: '40px 50px',
            gap: '40px',
            boxShadow: '10px 10px 0 rgba(0,0,0,0.15)',
          }}
        >
          {/* Character image */}
          <img
            src={imageUrl}
            width={240}
            height={240}
            style={{
              imageRendering: 'pixelated',
              objectFit: 'contain',
            }}
          />

          {/* Text area */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: 'black',
                lineHeight: 1.2,
              }}
            >
              {title} {name}
            </div>
            <div
              style={{
                fontSize: '28px',
                color: '#6b21a8',
                fontWeight: 'bold',
              }}
            >
              {animalName} | {themeName}
            </div>
            <div
              style={{
                fontSize: '22px',
                color: '#666',
                marginTop: '8px',
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
            fontSize: '24px',
            color: 'rgba(255,255,255,0.7)',
            marginTop: '24px',
            fontWeight: 'bold',
          }}
        >
          sajumon.com
        </div>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}
