import type { Metadata } from 'next';
import ResultContent from './_components/ResultContent';

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

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const params = await searchParams;
  const name = (params.name as string) || '사주몬';
  const animal = (params.animal as string) || '';
  const theme = (params.theme as string) || '';
  const title = (params.title as string) || '영험한';
  const ilju = (params.ilju as string) || '';

  const hasParams = animal && theme && ilju;
  const animalName = ANIMAL_NAMES[animal] || '';
  const themeName = THEME_NAMES[theme] || '운세';

  const pageTitle = hasParams
    ? `${title} ${name} - 사주몬`
    : '사주몬 - 당신의 사주몬을 소환하세요';

  const description = hasParams
    ? `${name}님의 2026 ${themeName} 사주몬 결과 | ${animalName} 사주몬이 당신의 운세를 알려드립니다`
    : '당신의 사주몬을 소환하세요! 2026년 운세를 확인해보세요.';

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://sajumon.vercel.app/';

  const ogImageParams = new URLSearchParams();
  if (hasParams) {
    ogImageParams.set('name', name);
    ogImageParams.set('animal', animal);
    ogImageParams.set('theme', theme);
    ogImageParams.set('title', title);
  }
  const ogImageUrl = `${siteUrl}/api/og?${ogImageParams.toString()}`;

  return {
    title: pageTitle,
    description,
    openGraph: {
      title: pageTitle,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${title} ${name} 사주몬`,
        },
      ],
      type: 'website',
      siteName: '사주몬',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
      images: [ogImageUrl],
    },
  };
}

export default function ResultPage() {
  return <ResultContent />;
}
