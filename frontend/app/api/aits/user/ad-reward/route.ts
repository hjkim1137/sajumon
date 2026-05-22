// 광고 보상 수령 — 사이클 도달 시 +POINTS_PER_AD_REWARD 포인트 + 사이클 리셋.
// 복사 위치: sajumon.vercel.app/app/api/aits/user/ad-reward/route.ts
//
// 보안:
// - canTriggerAd 를 서버에서 다시 검증. 클라이언트가 임의 호출해도 cycle 미도달이면 403.
// - 향후 강화: 토스 광고 SDK 가 시청 완료 시 발급하는 콜백 토큰을 검증해 "실제로 광고를
//   봤는지" 확인하는 게 ideal. 지금은 cycle 검증만으로도 무한 +P 는 막힘.

import { NextRequest, NextResponse } from "next/server";
import {
  limiters,
  rateLimitByUserKey,
  tooManyRequests,
} from "@/lib/aits/ratelimit";
import { extractBearer, verifySession } from "@/lib/aits/session";
import {
  applyAdReward,
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

  const rl = await rateLimitByUserKey(limiters().userAdReward, userKey);
  if (!rl.ok) return tooManyRequests(rl.retryAfterMs, cors);

  const row = await fetchRow(userKey);
  const next = applyAdReward(row);
  if (next == null) {
    return NextResponse.json(
      {
        error: "cycle_not_reached",
        currentCycleTaps: currentCycleTaps(row),
      },
      { status: 403, headers: cors },
    );
  }
  await upsertRow(next);

  return NextResponse.json(
    {
      points: next.points,
      lastAdRewardTapCount: next.last_ad_reward_tap_count,
      totalTapCount: next.total_tap_count,
    },
    { status: 200, headers: cors },
  );
}
