/**
 * 테마별 캐릭터 수식어 데이터
 * - animal이 지정된 수식어: 해당 일주 동물일 때만 선택 가능
 * - animal이 없으면: 모든 동물에서 랜덤 선택 가능
 */

export type ThemeKey = "study" | "work" | "love" | "health" | "money";

export type ModifierItem = {
  text: string;
  animal?: string; // 일주 동물 제한 (영문: rooster, ox, pig, horse, dragon)
};

export const MODIFIERS: Record<ThemeKey, ModifierItem[]> = {
  study: [
    { text: "합격했 '닭'", animal: "rooster" },
    { text: "암기 천재" },
    { text: "대충해도 A+" },
    { text: "집중력 만렙" },
  ],
  work: [
    { text: "승진했 '소'", animal: "ox" },
    { text: "합격 문자 받는" },
    { text: "얼떨결에 성공하는" },
    { text: "출근만 해도 칭찬받는" },
  ],
  love: [
    { text: "결국 최커 '돼지'", animal: "pig" },
    { text: "인연을 부르는" },
    { text: "고백 주파수 흐르는" },
    { text: "플러팅 장인" },
  ],
  health: [
    { text: "병원가지 '마'", animal: "horse" },
    { text: "기운 솟는" },
    { text: "들숨에 건강" },
    { text: "1년 병원비 0원" },
  ],
  money: [
    { text: "왔다 내 아기 이재 '용'", animal: "dragon" },
    { text: "현금 복사하는" },
    { text: "계좌 녹색불" },
    { text: "지갑 두툼해지는" },
  ],
};

/**
 * 테마와 일주 동물에 맞는 수식어 중 하나를 랜덤으로 반환
 * - animal 제한이 있는 수식어: 해당 동물일 때만 후보에 포함
 * - animal 제한이 없는 수식어: 항상 후보에 포함
 */
const THEME_ALIASES: Record<string, ThemeKey> = {
  career: "work",
};

export function getRandomModifier(theme: string, animal: string): string {
  const themeKey = (THEME_ALIASES[theme] || theme) as ThemeKey;
  const items = MODIFIERS[themeKey];

  if (!items || items.length === 0) {
    return "";
  }

  const candidates = items.filter(
    (item) => !item.animal || item.animal === animal,
  );

  if (candidates.length === 0) {
    // 동물 제한 수식어만 있고 매칭 안 되면, 제한 없는 것 중 fallback
    const fallbacks = items.filter((item) => !item.animal);
    if (fallbacks.length > 0) {
      return fallbacks[Math.floor(Math.random() * fallbacks.length)].text;
    }
    return items[0].text;
  }

  const selected = candidates[Math.floor(Math.random() * candidates.length)];
  return selected.text;
}
