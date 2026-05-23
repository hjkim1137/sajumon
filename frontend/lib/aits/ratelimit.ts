// Upstash Redis 기반 rate limit — IP 또는 userKey 단위로 라우트별 임계치 적용.
// 복사 위치: sajumon.vercel.app/lib/aits/ratelimit.ts
//
// 의존성: `@upstash/ratelimit`, `@upstash/redis`
// 환경변수: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
//   → Upstash 콘솔에서 Redis 인스턴스 생성 후 발급. 무료 플랜은 10,000 commands/day 까지.
//
// 정책 — 각 라우트의 rate limit (모두 sliding window):
//   /auth/login          IP        10 req / 60s   봇 로그인 폭주 방지
//   /auth/me             userKey   60 req / 60s   세션 검증 — 정상 사용 충분
//   /user/tap            userKey   60 req / 60s   디바운스 1초 + 광고 도달 즉시 flush 고려
//   /user/ad-reward      userKey    5 req / 60s   광고 시청에 최소 30초 — 분당 2회가 정상 상한.
//                                                 광고 SDK 토큰 검증 들어오기 전까지 abuse 차단용으로 보수적 설정.
//   /user/unlock-theme   userKey   30 req / 60s
//   /user/init-sajumon   userKey    5 req / 60s   사주 (재)입력 자체가 드물어야 정상
//   /auth/disconnect     IP       100 req / 60s   Basic Auth secret 노출 시 enumerate 차단용
//   /api/saju/analyze    IP        10 req / 60s   사주 분석 비용·봇 abuse 보호 (사주몬 웹 라우트)
//
// Upstash 무료 한계가 신경 쓰이면 sajuAnalyze 만 enable 하고 나머지는 사용량 보면서 점진 enable.

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let _redis: Redis | null = null;
function getRedis(): Redis {
  if (_redis) return _redis;
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    throw new Error(
      "UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN 가 설정되지 않았어요.",
    );
  }
  _redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  return _redis;
}

function makeLimiter(opts: {
  prefix: string;
  limit: number;
  windowSeconds: number;
}): Ratelimit {
  return new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(opts.limit, `${opts.windowSeconds} s`),
    prefix: opts.prefix,
    analytics: false,
  });
}

// lazy singleton — 첫 import 시 Redis 미설정이어도 throw 안 함.
let _limiters: Record<string, Ratelimit> | null = null;
export function limiters() {
  if (_limiters) return _limiters;
  _limiters = {
    authLogin: makeLimiter({ prefix: "rl:authLogin", limit: 10, windowSeconds: 60 }),
    authMe: makeLimiter({ prefix: "rl:authMe", limit: 60, windowSeconds: 60 }),
    userTap: makeLimiter({ prefix: "rl:userTap", limit: 60, windowSeconds: 60 }),
    userAdReward: makeLimiter({ prefix: "rl:userAdReward", limit: 5, windowSeconds: 60 }),
    userUnlockTheme: makeLimiter({ prefix: "rl:userUnlockTheme", limit: 30, windowSeconds: 60 }),
    userInitSajumon: makeLimiter({ prefix: "rl:userInitSajumon", limit: 5, windowSeconds: 60 }),
    authDisconnect: makeLimiter({ prefix: "rl:authDisconnect", limit: 100, windowSeconds: 60 }),
    sajuAnalyze: makeLimiter({ prefix: "rl:sajuAnalyze", limit: 10, windowSeconds: 60 }),
  };
  return _limiters;
}

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterMs: number };

// userKey 기반 — 세션 검증 후 호출. 동일 사용자의 봇팅·연타 abuse 방어.
export async function rateLimitByUserKey(
  limiter: Ratelimit,
  userKey: string,
): Promise<RateLimitResult> {
  const { success, reset } = await limiter.limit(`u:${userKey}`);
  if (success) return { ok: true };
  return { ok: false, retryAfterMs: Math.max(0, reset - Date.now()) };
}

// IP 기반 — 인증 전 라우트(/auth/login)나 공개 라우트(/api/saju/analyze)용.
// Vercel/CDN 환경에서 클라이언트 IP 추출.
export async function rateLimitByIp(
  limiter: Ratelimit,
  req: Request,
): Promise<RateLimitResult> {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const { success, reset } = await limiter.limit(`ip:${ip}`);
  if (success) return { ok: true };
  return { ok: false, retryAfterMs: Math.max(0, reset - Date.now()) };
}

// 429 응답 헬퍼. CORS 헤더 합쳐서 반환.
export function tooManyRequests(
  retryAfterMs: number,
  cors: HeadersInit,
): Response {
  const retryAfterSec = Math.max(1, Math.ceil(retryAfterMs / 1000));
  return new Response(
    JSON.stringify({ error: "rate_limited", retryAfter: retryAfterSec }),
    {
      status: 429,
      headers: {
        ...cors,
        "Content-Type": "application/json",
        "Retry-After": String(retryAfterSec),
      },
    },
  );
}
