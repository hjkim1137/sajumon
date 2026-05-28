// 세션 토큰 검증 + 사용자 데이터 반환.
// 복사 위치: sajumon.vercel.app/app/api/aits/auth/me/route.ts

import { NextRequest, NextResponse } from "next/server";
import {
  limiters,
  rateLimitByUserKey,
  tooManyRequests,
} from "@/lib/aits/ratelimit";
import { extractBearer, verifySession } from "@/lib/aits/session";
import { fetchRow } from "@/lib/aits/userActions";

export const runtime = "nodejs";

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

  // fetchRow 를 경유해야 KST 자정 lazy reset 이 트리거된다.
  // (auth/me 는 자정 이후 사용자가 앱을 켜면 가장 먼저 호출되는 라우트라 여기서
  // 안 거치면 운세 화면에 어제 해제 상태가 그대로 노출됨.)
  try {
    const row = await fetchRow(userKey);
    return NextResponse.json(
      { userKey, user: row },
      { status: 200, headers: cors },
    );
  } catch (err) {
    console.error("[aits/auth/me] fetchRow:", err);
    return NextResponse.json(
      { error: "db_error" },
      { status: 500, headers: cors },
    );
  }
}
