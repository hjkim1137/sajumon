// 사주 (재)입력 → 사주몬 생성. sajumon 필드만 갈아끼우고 포인트·탭·해금은 전부 리셋.
// 복사 위치: sajumon.vercel.app/app/api/aits/user/init-sajumon/route.ts
//
// 비즈니스 규칙:
// - 사주 재입력 = 사주몬 새로 뽑기. 진행 상태(포인트/탭/해금)는 전부 초기화.
// - 클라이언트의 "사주 정보 수정" 흐름과 동일.
// - sajumon 객체 자체는 클라이언트가 analyzeSaju 응답으로 구성하므로 그대로 받는다
//   (서버에서 사주 재계산하지 않음 — 비용/응답시간 절감).
// - 단, 위조 가능한 수치 필드(guardianStat 등)는 추후 검증 강화 여지가 있다.

import { NextRequest, NextResponse } from "next/server";
import {
  limiters,
  rateLimitByUserKey,
  tooManyRequests,
} from "@/lib/aits/ratelimit";
import { extractBearer, verifySession } from "@/lib/aits/session";
import {
  applyInitSajumon,
  corsHeaders,
  fetchRow,
  type SavedSajumon,
  upsertRow,
} from "@/lib/aits/userActions";

export const runtime = "nodejs";

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

// 최소한의 SavedSajumon shape 검증.
function parseSajumon(v: unknown): SavedSajumon | null {
  if (v == null || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  if (typeof o.ilju !== "string") return null;
  if (typeof o.animal !== "string") return null;
  if (typeof o.name !== "string") return null;
  if (typeof o.birthDate !== "string") return null;
  if (typeof o.primaryTheme !== "string") return null;
  // 수치 필드는 toNumber 처리해 정상화.
  return {
    ilju: o.ilju,
    animal: o.animal,
    primaryTheme: o.primaryTheme as SavedSajumon["primaryTheme"],
    name: o.name,
    birthDate: o.birthDate,
    birthTime: typeof o.birthTime === "string" ? o.birthTime : "",
    modifier: typeof o.modifier === "string" ? o.modifier : "",
    speech: typeof o.speech === "string" ? o.speech : "",
    guardianStat: Math.max(0, Math.floor(Number(o.guardianStat) || 0)),
    themeStat: Math.max(0, Math.floor(Number(o.themeStat) || 0)),
    isSpecial: Boolean(o.isSpecial),
    createdAt:
      typeof o.createdAt === "number" && Number.isFinite(o.createdAt)
        ? o.createdAt
        : Date.now(),
  };
}

export async function POST(req: NextRequest) {
  const cors = corsHeaders(req);

  const token = extractBearer(req.headers.get("authorization"));
  if (!token) {
    return NextResponse.json(
      { error: "missing_token" },
      { status: 401, headers: cors },
    );
  }
  const payload = await verifySession(token);
  if (!payload) {
    return NextResponse.json(
      { error: "invalid_token" },
      { status: 401, headers: cors },
    );
  }
  const userKey = payload.sub;

  const rl = await rateLimitByUserKey(limiters().userInitSajumon, userKey);
  if (!rl.ok) return tooManyRequests(rl.retryAfterMs, cors);

  let body: { sajumon?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json" },
      { status: 400, headers: cors },
    );
  }

  const sajumon = parseSajumon(body.sajumon);
  if (sajumon == null) {
    return NextResponse.json(
      { error: "invalid_sajumon" },
      { status: 400, headers: cors },
    );
  }

  const row = await fetchRow(userKey);
  const next = applyInitSajumon(row, sajumon);
  await upsertRow(next);

  return NextResponse.json(
    {
      sajumon: next.sajumon,
      points: next.points,
      unlockedThemes: next.unlocked_themes,
      totalTapCount: next.total_tap_count,
      lastAdRewardTapCount: next.last_ad_reward_tap_count,
    },
    { status: 200, headers: cors },
  );
}
