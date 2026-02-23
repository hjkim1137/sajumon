/**
 * 말풍선(speech) 문구 데이터
 * - speech에 테마 접두사가 있으면: 해당 테마일 때만 사용 (예: "love: 내가 최애에게로 간다" → love 전용)
 * - 접두사가 없으면: theme 열에 적힌 테마에서만 사용 (예: "둥근해 미친거 또 떴네" → career, study)
 */

export type ThemeKey = "study" | "work" | "love" | "health" | "money";

type SpeechEntry = {
  text: string;
  themes: ThemeKey[]; // 이 테마일 때만 후보에 포함
};

export const SPEECH_ENTRIES: SpeechEntry[] = [
  // 테마 접두사 있는 문구 (해당 테마 전용)
  { text: "반포자이통 온다", themes: ["money"] },
  { text: "하극상통 온다", themes: ["work"] },
  { text: "사귐통 온다", themes: ["love"] },
  { text: "내가 방학에게로 간다", themes: ["study"] },
  { text: "내가 주치의에게로 간다", themes: ["health"] },
  { text: "내가 완치에게로 간다", themes: ["health"] },
  { text: "내가 최합에게로 간다", themes: ["work", "study"] },
  { text: "내가 최애에게로 간다", themes: ["love"] },
  { text: "내가 퇴사에게로 간다", themes: ["work"] },
  { text: "포브스 선정 올해 제일 애정운 좋은 사람", themes: ["love"] },
  { text: "포브스 선정 올해 제일 커리어운 좋은 사람", themes: ["work"] },
  { text: "포브스 선정 올해 제일 학업운 좋은 사람", themes: ["study"] },
  { text: "포브스 선정 올해 제일 금전운 좋은 사람", themes: ["money"] },
  { text: "포브스 선정 올해 제일 건강운 좋은 사람", themes: ["health"] },
  { text: "이직 갈테야 테야", themes: ["work"] },
  { text: "퇴사 갈테야 테야", themes: ["work"] },
  { text: "헬스장 갈테야 테야", themes: ["health"] },
  { text: "멘탈 찾으로 갈테야 테야", themes: ["health", "work", "study"] },
  { text: "하룰라라 간다", themes: ["money", "work", "study"] },
  {
    text: "얼마나 성공하고 싶은지 감도 안옴",
    themes: ["money", "work", "study"],
  },
  { text: "둥근해 미친거 또 떴네", themes: ["work", "study"] },
  {
    text: "Queen Never Cry",
    themes: ["love", "work", "study", "money", "health"],
  },
  {
    text: "그래도 어떡해 해야지",
    themes: ["love", "work", "study", "money", "health"],
  },
  {
    text: "다 군만두고 싶다",
    themes: ["love", "work", "study", "money", "health"],
  },
  { text: "가챠 결과 나쁘지 않음", themes: ["money", "work", "study"] },
  { text: "이 정도면 핵심을 찔렀다", themes: ["work", "study", "health"] },
  { text: "HMH(하면해)", themes: ["love", "work", "study", "money", "health"] },
  {
    text: "다 울었니 이제 할 일을 하자",
    themes: ["love", "work", "study", "money", "health"],
  },
  {
    text: "오늘도 무탈 클리어",
    themes: ["health", "work", "study", "love", "money"],
  },
];

const THEME_ALIASES: Record<string, ThemeKey> = {
  career: "work",
};

/**
 * 테마에 맞는 말풍선 문구 중 하나를 랜덤으로 반환
 */
export function getSpeechText(theme: string): string {
  const themeKey = (THEME_ALIASES[theme] || theme) as ThemeKey;
  const candidates = SPEECH_ENTRIES.filter((entry) =>
    entry.themes.includes(themeKey),
  );

  if (candidates.length === 0) {
    const fallback = SPEECH_ENTRIES.filter((e) => e.themes.includes("health"));
    if (fallback.length > 0) {
      return fallback[Math.floor(Math.random() * fallback.length)].text;
    }
    return SPEECH_ENTRIES[0]?.text ?? "";
  }

  const selected = candidates[Math.floor(Math.random() * candidates.length)];
  return selected.text;
}
