/**
 * 캐릭터 해석 문구 데이터
 * theme + animal 조합으로 해당하는 해석 텍스트 반환
 */

export type ThemeKey = "study" | "work" | "love" | "health" | "money";
export type AnimalKey =
  | "rat"
  | "ox"
  | "tiger"
  | "rabbit"
  | "dragon"
  | "snake"
  | "horse"
  | "goat"
  | "monkey"
  | "rooster"
  | "dog"
  | "pig";

export const CHARACTER_INTERPRETATIONS: Record<
  ThemeKey,
  Record<AnimalKey, string>
> = {
  health: {
    rat: "잔병 없이 가볍게 회복하는 타입",
    ox: "꾸준한 체력으로 건강을 지킴",
    tiger: "강한 기운으로 회복이 빠름",
    rabbit: "부드럽게 균형을 유지하는 건강형",
    dragon: "활력이 넘치는 에너지형",
    snake: "조용히 컨디션을 관리하는 타입",
    horse: "활동량으로 건강을 유지함",
    goat: "마음의 안정이 몸을 지켜줌",
    monkey: "유연하게 회복하는 타입",
    rooster: "규칙적인 생활로 컨디션 유지",
    dog: "기본 체력이 탄탄한 타입",
    pig: "잘 쉬며 회복하는 안정형",
  },
  money: {
    rat: "기회를 잘 잡아 재물이 늘어나는 타입",
    ox: "꾸준히 쌓아 큰 부를 이루는 타입",
    tiger: "돈복이 크고 스케일 있는 타입",
    rabbit: "즐겁게 돈이 들어오는 행복 타입",
    dragon: "큰 재물운이 열리는 성공 타입",
    snake: "재테크 감각으로 부자 되는 타입",
    horse: "활력 있게 돈길이 트이는 타입",
    goat: "따뜻한 복이 모여 재물 되는 타입",
    monkey: "재주로 돈복을 끌어오는 타입",
    rooster: "꼼꼼히 관리해 재산 늘리는 타입",
    dog: "안정적으로 재물을 지키는 타입",
    pig: "복이 가득 들어오는 부자 타입",
  },
  work: {
    rat: "기회 오면 빠르게 잡는 실행형",
    ox: "묵묵히 성과 쌓는 신뢰형",
    tiger: "존재감으로 인정받는 리더형",
    rabbit: "센스 있게 일 처리하는 타입",
    dragon: "판 크게 보는 성장 가속형",
    snake: "핵심만 찌르는 전략가형",
    horse: "추진력으로 길을 여는 타입",
    goat: "협업으로 성과 만드는 조율형",
    monkey: "눈치 빨라 기회 만드는 타입",
    rooster: "타이밍 좋게 성과 터뜨림",
    dog: "책임감으로 팀을 지키는 타입",
    pig: "여유 속 결과 만드는 안정형",
  },
  study: {
    rat: "머리 회전 빨라 성적 오르는 타입",
    ox: "꾸준히 노력해 실력 쌓이는 타입",
    tiger: "집중력 강해 크게 성장하는 타입",
    rabbit: "감각 좋고 센스 있게 배우는 타입",
    dragon: "목표 높고 성취 크게 이루는 타입",
    snake: "이해력 뛰어나 공부 잘 풀리는 타입",
    horse: "열정으로 실력 빠르게 오르는 타입",
    goat: "차분히 공부해 성과 나는 타입",
    monkey: "재치와 두뇌로 성적 빛나는 타입",
    rooster: "꼼꼼히 준비해 합격운 강한 타입",
    dog: "성실하게 끝까지 해내는 타입",
    pig: "편안히 공부해 복이 따라오는 타입",
  },
  love: {
    rat: "눈치 빠르게 인연을 잡는 타입",
    ox: "느리지만 진심으로 다가가는 연애형",
    tiger: "직진 매력으로 마음을 사로잡음",
    rabbit: "다정함으로 설레게 만드는 타입",
    dragon: "존재감만으로 시선을 끄는 연애운",
    snake: "은근한 말투로 플러팅하는 타입",
    horse: "활발한 에너지로 분위기 리드",
    goat: "편안함으로 오래 남는 인연형",
    monkey: "장난기 속 진심을 숨긴 매력러",
    rooster: "타이밍 좋게 고백하는 스타일",
    dog: "한 사람만 바라보는 직진형",
    pig: "자연스럽게 호감 얻는 연애운",
  },
};

const THEME_ALIASES: Record<string, ThemeKey> = {
  career: "work",
};

const ANIMAL_ALIASES: Record<string, AnimalKey> = {
  mouse: "rat",
};

/**
 * 테마와 일주 동물에 맞는 캐릭터 해석 문구 반환
 */
export function getCharacterInterpretation(
  theme: string,
  animal: string
): string {
  const themeKey = (THEME_ALIASES[theme] || theme) as ThemeKey;
  const animalKey = (ANIMAL_ALIASES[animal] || animal) as AnimalKey;

  const themeData = CHARACTER_INTERPRETATIONS[themeKey];
  if (!themeData) return "";

  const text = themeData[animalKey];
  return text ?? themeData.dog ?? "";
}
