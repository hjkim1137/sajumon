/**
 * 만세력 기반 일주(日柱) 계산기.
 * Julian Day Number를 이용하여 육십갑자 일주를 정확히 계산한다.
 * Java → TypeScript 1:1 포팅
 */

const HEAVENLY_STEMS = [
  '갑', '을', '병', '정', '무', '기', '경', '신', '임', '계',
];

const EARTHLY_BRANCHES = [
  '자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해',
];

const ANIMALS = [
  'rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake',
  'horse', 'goat', 'monkey', 'rooster', 'dog', 'pig',
];

const SIXTY_PILLARS: string[] = [];
for (let i = 0; i < 60; i++) {
  SIXTY_PILLARS[i] = HEAVENLY_STEMS[i % 10] + EARTHLY_BRANCHES[i % 12];
}

function calculateJDN(year: number, month: number, day: number): number {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;

  return (
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045
  );
}

function getDayPillarIndex(year: number, month: number, day: number): number {
  const jdn = calculateJDN(year, month, day);
  const index = (jdn + 49) % 60;
  return index < 0 ? index + 60 : index;
}

export function getDayPillarName(year: number, month: number, day: number): string {
  return SIXTY_PILLARS[getDayPillarIndex(year, month, day)];
}

export function getAnimal(year: number, month: number, day: number): string {
  const pillarIndex = getDayPillarIndex(year, month, day);
  const branchIndex = pillarIndex % 12;
  return ANIMALS[branchIndex];
}

export function calculate(birthDate: string, birthTime: string): { ilju: string; animal: string } {
  const year = parseInt(birthDate.substring(0, 4), 10);
  const month = parseInt(birthDate.substring(4, 6), 10);
  const day = parseInt(birthDate.substring(6, 8), 10);

  return {
    ilju: getDayPillarName(year, month, day),
    animal: getAnimal(year, month, day),
  };
}
