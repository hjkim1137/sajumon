// 테마 해금 — POINTS_PER_THEME_UNLOCK 포인트 차감 후 unlocked_themes 에 추가.
// 복사 위치: sajumon.vercel.app/app/api/aits/user/unlock-theme/route.ts
//
// 보안:
// - theme 값은 ThemeKey 화이트리스트로 검증.
// - 포인트 부족이면 402 (Payment Required). 이미 해금이면 200 + 현재 상태(noop).
// - 포인트 차감/추가는 서버에서만 수행 — 클라이언트가 임의 unlocked_themes 변경 불가.

import { NextRequest, NextResponse } from "next/server";
import {
  limiters,
  rateLimitByUserKey,
  tooManyRequests,
} from "@/lib/aits/ratelimit";
import { extractBearer, verifySession } from "@/lib/aits/session";
import {
  corsHeaders,
  fetchRow,
  parseTheme,
  POINTS_PER_THEME_UNLOCK,
  tryUnlockTheme,
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

  const rl = await rateLimitByUserKey(limiters().userUnlockTheme, userKey);
  if (!rl.ok) return tooManyRequests(rl.retryAfterMs, cors);

  let body: { theme?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "invalid_json" },
      { status: 400, headers: cors },
    );
  }

  const theme = parseTheme(body.theme);
  if (theme == null) {
    return NextResponse.json(
      { error: "invalid_theme" },
      { status: 400, headers: cors },
    );
  }

  const row = await fetchRow(userKey);
  const next = tryUnlockTheme(row, theme);
  if (next == null) {
    return NextResponse.json(
      {
        error: "insufficient_points",
        required: POINTS_PER_THEME_UNLOCK,
        current: row.points,
      },
      { status: 402, headers: cors },
    );
  }
  // 이미 해금이면 row 자체 동일 — DB 쓰기 생략.
  if (next !== row) {
    await upsertRow(next);
  }

  return NextResponse.json(
    {
      points: next.points,
      unlockedThemes: next.unlocked_themes,
    },
    { status: 200, headers: cors },
  );
}
