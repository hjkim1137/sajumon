/**
 * 테마별 질문 및 답변 선택지
 * 이전 페이지에서 사용자가 선택한 테마에 따라 질문이 달라짐
 */

export type ThemeKey = "study" | "work" | "love" | "health" | "money";

export type QuestionItem = {
  q: string;
  a: [string, string];
};

export const THEME_QUESTIONS: Record<ThemeKey, QuestionItem[]> = {
  money: [
    {
      q: "예상치 못한 돈이 생기면",
      a: [
        "일단 써야 할 곳부터 떠오른다",
        "어떻게 나눌지/저금할지 생각한다",
      ],
    },
    {
      q: "소비를 결정할 때",
      a: ["지금의 만족도가 중요하다", "장기적인 효율을 따진다"],
    },
    {
      q: "재정 계획은",
      a: ["대략적인 방향만 잡는다", "구체적으로 세워두는 편이다"],
    },
  ],
  work: [
    {
      q: "새로운 기회가 생기면",
      a: ["일단 도전해본다", "준비가 됐는지 먼저 점검한다"],
    },
    {
      q: "일의 성취감은",
      a: ["결과가 좋을 때 느낀다", "과정이 만족스러울 때 느낀다"],
    },
    {
      q: "평가를 받을 때",
      a: ["피드백을 흘려듣지 않는다", "크게 개의치 않는 편이다"],
    },
  ],
  love: [
    {
      q: "호감 가는 사람이 생기면",
      a: [
        "자연스럽게 상황을 지켜본다",
        "먼저 행동으로 표현하는 편이다",
      ],
    },
    {
      q: "연애 초반에 당신은",
      a: ["상대의 반응을 살피는 편이다", "내 감정을 비교적 솔직히 드러낸다"],
    },
    {
      q: "연인과의 갈등이 생겼을 때",
      a: ["시간을 두고 정리한다", "바로 대화로 풀려고 한다"],
    },
  ],
  health: [
    {
      q: "몸이 조금 피곤하다고 느껴질 때 당신은",
      a: [
        "일단 하던 일을 마무리하고 나중에 쉰다",
        "지금 상태를 우선하고 바로 쉬는 편이다",
      ],
    },
    {
      q: "운동이나 건강 관리는",
      a: ["기분이 내킬 때 하는 편이다", "정해둔 날에는 웬만하면 지킨다"],
    },
    {
      q: "몸에 작은 이상이 느껴지면",
      a: ["며칠 지켜보는 편이다", "바로 원인을 찾으려 한다"],
    },
  ],
  study: [
    {
      q: "공부 계획을 세울 때 당신은",
      a: [
        "전체 일정만 대략 잡아두고 유동적으로 움직인다",
        "날짜별·분량별로 꽤 구체적으로 정리해둔다",
      ],
    },
    {
      q: "공부가 잘 안 풀리는 날에는",
      a: [
        "다른 과목으로 넘어가 분위기를 바꾼다",
        "오늘 할 분량은 어떻게든 채운다",
      ],
    },
    {
      q: "결과가 기대보다 낮게 나오면",
      a: [
        "다음 시험에서 만회하면 된다고 생각한다",
        "어디서 부족했는지 바로 분석한다",
      ],
    },
  ],
};

const THEME_ALIASES: Record<string, ThemeKey> = {
  career: "work",
  total: "health",
};

/**
 * 테마에 맞는 질문 목록 반환
 */
export function getQuestionsByTheme(theme: string): QuestionItem[] {
  const themeKey = (THEME_ALIASES[theme] || theme) as ThemeKey;
  const questions = THEME_QUESTIONS[themeKey];
  return questions ?? THEME_QUESTIONS.health;
}
