// 토스 로그인 — 인가 코드 → 세션 토큰 발급.
// 복사 위치: sajumon.vercel.app/app/api/aits/auth/login/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  tossGenerateToken,
  tossLoginMe,
} from "@/lib/aits/tossApi";
import { decryptPIINullable } from "@/lib/aits/pii";
import { limiters, rateLimitByIp, tooManyRequests } from "@/lib/aits/ratelimit";
import { signRefreshToken, signSession } from "@/lib/aits/session";
import { corsHeaders } from "@/lib/aits/userActions";

// mTLS 호출 위해 Node runtime 필수 (Edge 는 client cert 미지원).
export const runtime = "nodejs";

// 미니앱 전용 Supabase 인스턴스 (B계정). 사주몬 웹 어드민용 A계정과 분리.
const supabase = createClient(
  process.env.AITS_SUPABASE_URL!,
  process.env.AITS_SUPABASE_SERVICE_ROLE_KEY!,
);

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
}

interface LoginRequestBody {
  authorizationCode?: string;
  referrer?: string;
}

export async function POST(req: NextRequest) {
  const cors = corsHeaders(req);

  // 인증 전 라우트 — IP 단위 rate limit. 봇 로그인 폭주 방어.
  const rl = await rateLimitByIp(limiters().authLogin, req);
  if (!rl.ok) return tooManyRequests(rl.retryAfterMs, cors);

  let body: LoginRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json" },
      { status: 400, headers: cors },
    );
  }
  const { authorizationCode, referrer } = body;
  if (!authorizationCode || !referrer) {
    return NextResponse.json(
      { error: "missing_fields" },
      { status: 400, headers: cors },
    );
  }

  try {
    // 1) 토스 OAuth: 인가 코드 → 액세스 토큰
    const tokenRes = await tossGenerateToken(authorizationCode, referrer);
    if (tokenRes.resultType !== "SUCCESS") {
      return NextResponse.json(
        { error: "token_exchange_failed", detail: tokenRes.error },
        { status: 401, headers: cors },
      );
    }
    const { accessToken } = tokenRes.success;

    // 2) 토스 사용자 정보 조회
    const meRes = await tossLoginMe(accessToken);
    if (meRes.resultType !== "SUCCESS") {
      return NextResponse.json(
        { error: "login_me_failed", detail: meRes.error },
        { status: 401, headers: cors },
      );
    }
    const { userKey, name: encName, birthday: encBirthday } = meRes.success;

    // 3) PII 복호화 (이름·생년월일만 필요한 만큼)
    const name = decryptPIINullable(encName);
    const birthday = decryptPIINullable(encBirthday); // yyyyMMdd

    // 4) Supabase upsert — toss_user_key 기준
    const userKeyStr = String(userKey);
    const { error: upsertErr } = await supabase
      .from("sajumon_aits_users")
      .upsert(
        { toss_user_key: userKeyStr },
        { onConflict: "toss_user_key", ignoreDuplicates: false },
      );
    if (upsertErr) {
      console.error("[aits/auth/login] supabase upsert:", upsertErr);
      return NextResponse.json(
        { error: "db_error" },
        { status: 500, headers: cors },
      );
    }

    // 5) 자체 세션 JWT — access 1h + refresh 14d.
    const [sessionToken, refreshToken] = await Promise.all([
      signSession(userKeyStr),
      signRefreshToken(userKeyStr),
    ]);

    return NextResponse.json(
      {
        sessionToken,
        refreshToken,
        userKey: userKeyStr,
        profile: { name, birthday },
      },
      { status: 200, headers: cors },
    );
  } catch (e) {
    console.error("[aits/auth/login] internal:", e);
    return NextResponse.json(
      { error: "internal" },
      { status: 500, headers: cors },
    );
  }
}
