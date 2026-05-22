// 사주몬 미니앱 비즈니스 로직 — 서버 권위 버전.
// 복사 위치: sajumon.vercel.app/lib/aits/userActions.ts
//
// 클라이언트 src/lib/userData.ts 와 동일한 규칙을 서버에서 다시 검증한다.
// 클라이언트는 optimistic UI 용으로 같은 로직을 가지고 있지만, 진위는 항상 이 파일.
// 상수가 두 곳에 분리돼 있으니 변경 시 양쪽을 함께 수정한다.

import { createClient } from "@supabase/supabase-js";

// `as const` 로 literal type 유지 → Supabase Database 제네릭이 테이블을 narrow 할 수 있게 함.
export const TABLE = "sajumon_aits_users" as const;

// 동물 카드 한 사이클의 탭 수. 클라이언트 userData.ts:TAPS_PER_AD_TRIGGER 와 일치해야 함.
export const TAPS_PER_AD_TRIGGER = 15;
// 광고 1회 시청 보상 포인트.
export const POINTS_PER_AD_REWARD = 3;
// 테마 1개 보기 비용.
export const POINTS_PER_THEME_UNLOCK = 2;

// 한 번의 /user/tap 요청에 허용되는 최대 delta. 디바운스 1초 동안 15탭이 정상 상한이지만,
// 네트워크 지연 누적을 고려해 약간의 여유를 둔다. 이를 초과하는 delta 는 abuse 시도로 간주하고 자른다.
export const MAX_TAP_DELTA_PER_REQUEST = 30;

export type ThemeKey = "study" | "career" | "love" | "health" | "money";

export interface SavedSajumon {
  ilju: string;
  animal: string;
  primaryTheme: ThemeKey;
  name: string;
  birthDate: string;
  birthTime: string;
  modifier: string;
  speech: string;
  guardianStat: number;
  themeStat: number;
  isSpecial: boolean;
  createdAt: number;
}

export interface UsersRow {
  toss_user_key: string;
  sajumon: SavedSajumon | null;
  points: number;
  unlocked_themes: ThemeKey[];
  total_tap_count: number;
  last_ad_reward_tap_count: number;
}

let _client: ReturnType<typeof createClient> | null = null;
export function getSupabase() {
  if (_client) return _client;
  // 미니앱 전용 Supabase 인스턴스 (B계정). 사주몬 웹 어드민용 A계정과 분리.
  _client = createClient(
    process.env.AITS_SUPABASE_URL!,
    process.env.AITS_SUPABASE_SERVICE_ROLE_KEY!,
  );
  return _client;
}

export function emptyRow(tossUserKey: string): UsersRow {
  return {
    toss_user_key: tossUserKey,
    sajumon: null,
    points: 0,
    unlocked_themes: [],
    total_tap_count: 0,
    last_ad_reward_tap_count: 0,
  };
}

// 현재 사이클 탭 수 (마지막 보상 이후).
export function currentCycleTaps(row: UsersRow): number {
  return Math.max(0, row.total_tap_count - row.last_ad_reward_tap_count);
}

export function canTriggerAd(row: UsersRow): boolean {
  return currentCycleTaps(row) >= TAPS_PER_AD_TRIGGER;
}

// Supabase v2 클라이언트가 Database 제네릭 없이 호출되면 .from() 결과가 `never` 로 추론됨.
// 스키마 타입을 전역으로 잡기보단 call site 에서 row 한 번만 캐스팅하는 게 가장 안전.
type RawRow = Record<string, unknown> | null;

// 사용자 row 를 select. 없으면 빈 row 를 반환(저장은 안 함).
export async function fetchRow(tossUserKey: string): Promise<UsersRow> {
  const { data, error } = await getSupabase()
    .from(TABLE)
    .select(
      "toss_user_key, sajumon, points, unlocked_themes, total_tap_count, last_ad_reward_tap_count",
    )
    .eq("toss_user_key", tossUserKey)
    .maybeSingle();
  if (error) throw new Error(`fetchRow failed: ${error.message}`);
  const raw = data as RawRow;
  if (raw == null) return emptyRow(tossUserKey);
  // bigint → string 폴백 처리 (클라이언트 rowToUserData 와 동일 패턴).
  const toNumber = (v: unknown): number => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  return {
    toss_user_key: String(raw.toss_user_key),
    sajumon: (raw.sajumon as SavedSajumon | null) ?? null,
    points: toNumber(raw.points),
    unlocked_themes: Array.isArray(raw.unlocked_themes)
      ? (raw.unlocked_themes as ThemeKey[])
      : [],
    total_tap_count: toNumber(raw.total_tap_count),
    last_ad_reward_tap_count: toNumber(raw.last_ad_reward_tap_count),
  };
}

export async function upsertRow(row: UsersRow): Promise<void> {
  // upsert payload 타입도 Database 제네릭 없으면 `never` 로 추론되므로 캐스팅 필요.
  const { error } = await getSupabase()
    .from(TABLE)
    .upsert(row as never, { onConflict: "toss_user_key" });
  if (error) throw new Error(`upsertRow failed: ${error.message}`);
}

// 탭 delta 적용. delta 가 cycle 잔여를 넘어가면 ad trigger 까지만 채우고 잘라낸다.
export function applyTapDelta(
  row: UsersRow,
  rawDelta: number,
): { next: UsersRow; reachedAdTrigger: boolean; appliedDelta: number } {
  // 음수·NaN·과도 delta 차단.
  const safeDelta = Math.max(
    0,
    Math.min(MAX_TAP_DELTA_PER_REQUEST, Math.floor(Number(rawDelta) || 0)),
  );
  const reached = canTriggerAd(row);
  if (safeDelta === 0 || reached) {
    return { next: row, reachedAdTrigger: reached, appliedDelta: 0 };
  }
  const remainingInCycle = TAPS_PER_AD_TRIGGER - currentCycleTaps(row);
  const applied = Math.min(safeDelta, remainingInCycle);
  const next: UsersRow = {
    ...row,
    total_tap_count: row.total_tap_count + applied,
  };
  return {
    next,
    reachedAdTrigger: canTriggerAd(next),
    appliedDelta: applied,
  };
}

// 광고 보상 적용. 사이클 미도달 시 null 반환 (라우트는 403 으로 응답).
export function applyAdReward(row: UsersRow): UsersRow | null {
  if (!canTriggerAd(row)) return null;
  return {
    ...row,
    points: row.points + POINTS_PER_AD_REWARD,
    last_ad_reward_tap_count: row.total_tap_count,
  };
}

// 테마 해금. 이미 해금이면 동일 row 반환. 포인트 부족이면 null.
export function tryUnlockTheme(
  row: UsersRow,
  theme: ThemeKey,
): UsersRow | null {
  if (row.unlocked_themes.includes(theme)) return row;
  if (row.points < POINTS_PER_THEME_UNLOCK) return null;
  return {
    ...row,
    points: row.points - POINTS_PER_THEME_UNLOCK,
    unlocked_themes: Array.from(new Set([...row.unlocked_themes, theme])),
  };
}

// 사주 (재)입력. sajumon 만 갈아끼우고 포인트/탭/해금은 모두 리셋한다.
// — 클라이언트의 "사주 정보 수정" 흐름과 동일.
export function applyInitSajumon(
  row: UsersRow,
  sajumon: SavedSajumon,
): UsersRow {
  return {
    ...row,
    sajumon,
    points: 0,
    unlocked_themes: [],
    total_tap_count: 0,
    last_ad_reward_tap_count: 0,
  };
}

// theme 문자열을 ThemeKey 로 검증.
export function parseTheme(v: unknown): ThemeKey | null {
  if (v === "study" || v === "career" || v === "love" || v === "health" || v === "money") {
    return v;
  }
  return null;
}

// CORS 헤더 공통 헬퍼.
export function corsHeaders(req: Request): HeadersInit {
  const origin = req.headers.get("origin") ?? "";
  const allowedRaw = process.env.AITS_ALLOWED_ORIGINS ?? "";
  const allowed = allowedRaw.split(",").map((s) => s.trim()).filter(Boolean);
  const isAllowed = allowed.some((pattern) => {
    if (pattern === origin) return true;
    if (pattern.includes("*")) {
      const re = new RegExp(
        "^" + pattern.replace(/\./g, "\\.").replace(/\*/g, ".*") + "$",
      );
      return re.test(origin);
    }
    return false;
  });
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}
