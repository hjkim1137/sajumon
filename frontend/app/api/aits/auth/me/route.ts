// 세션 토큰 검증 + 사용자 데이터 반환.
// 복사 위치: sajumon.vercel.app/app/api/aits/auth/me/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  limiters,
  rateLimitByUserKey,
  tooManyRequests,
} from "@/lib/aits/ratelimit";
import { extractBearer, verifySession } from "@/lib/aits/session";

export const runtime = "nodejs";

// 미니앱 전용 Supabase 인스턴스 (B계정). 사주몬 웹 어드민용 A계정과 분리.
const supabase = createClient(
  process.env.AITS_SUPABASE_URL!,
  process.env.AITS_SUPABASE_SERVICE_ROLE_KEY!,
);

function corsHeaders(req: NextRequest): HeadersInit {
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
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

export async function GET(req: NextRequest) {
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

  const rl = await rateLimitByUserKey(limiters().authMe, userKey);
  if (!rl.ok) return tooManyRequests(rl.retryAfterMs, cors);

  const { data, error } = await supabase
    .from("sajumon_aits_users")
    .select(
      "toss_user_key, sajumon, points, unlocked_themes, total_tap_count, last_ad_reward_tap_count",
    )
    .eq("toss_user_key", userKey)
    .maybeSingle();

  if (error) {
    console.error("[aits/auth/me] supabase:", error);
    return NextResponse.json(
      { error: "db_error" },
      { status: 500, headers: cors },
    );
  }

  return NextResponse.json(
    {
      userKey,
      user: data,
    },
    { status: 200, headers: cors },
  );
}
