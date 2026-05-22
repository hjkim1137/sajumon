// 탭 누적 — 클라이언트가 디바운스로 모은 delta 를 보내면 서버가 cap 적용해 누적.
// 복사 위치: sajumon.vercel.app/app/api/aits/user/tap/route.ts
//
// 비즈니스 규칙:
// - delta 는 MAX_TAP_DELTA_PER_REQUEST 로 캡.
// - 현재 사이클이 이미 ad trigger 도달이면 누적 안 함 (광고 시청 후에만 다음 사이클 시작).
// - 사이클 잔여 탭 수를 넘어가는 delta 는 trigger 까지만 채우고 잘라낸다.
// - 따라서 클라이언트가 임의 큰 delta 를 보내도 광고 없이 cycle 을 끝낼 수 없음.

import { NextRequest, NextResponse } from "next/server";
import {
  limiters,
  rateLimitByUserKey,
  tooManyRequests,
} from "@/lib/aits/ratelimit";
import { extractBearer, verifySession } from "@/lib/aits/session";
import {
  applyTapDelta,
  corsHeaders,
  currentCycleTaps,
  fetchRow,
  upsertRow,
} from "@/lib/aits/userActions";

export const runtime = "nodejs";

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
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

  const rl = await rateLimitByUserKey(limiters().userTap, userKey);
  if (!rl.ok) return tooManyRequests(rl.retryAfterMs, cors);

  let body: { delta?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json" },
      { status: 400, headers: cors },
    );
  }

  let row = await fetchRow(userKey);
  const { next, reachedAdTrigger, appliedDelta } = applyTapDelta(
    row,
    typeof body.delta === "number" ? body.delta : 1,
  );
  if (appliedDelta > 0) {
    row = next;
    await upsertRow(row);
  }

  return NextResponse.json(
    {
      totalTapCount: row.total_tap_count,
      lastAdRewardTapCount: row.last_ad_reward_tap_count,
      currentCycleTaps: currentCycleTaps(row),
      reachedAdTrigger,
      appliedDelta,
    },
    { status: 200, headers: cors },
  );
}
