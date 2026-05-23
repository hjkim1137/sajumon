// 토스 연결 끊기 콜백 — 사용자가 토스 설정에서 사주몬 연결 해제 시 토스가 호출.
// 토스 콘솔에 등록 시: 메서드 POST, Basic Auth 사용.
// 복사 위치: sajumon.vercel.app/app/api/aits/auth/disconnect/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// 외부 webhook 이라 Node runtime 사용 (timingSafeEqual 등 활용 가능).
export const runtime = "nodejs";

// 미니앱 전용 Supabase 인스턴스 (B계정).
const supabase = createClient(
  process.env.AITS_SUPABASE_URL!,
  process.env.AITS_SUPABASE_SERVICE_ROLE_KEY!,
);

// 상수 시간 비교 — timing attack 방어.
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function verifyBasicAuth(req: NextRequest): boolean {
  const header = req.headers.get("authorization") ?? "";
  if (!header.startsWith("Basic ")) return false;
  const expectedUser = process.env.AITS_DISCONNECT_BASIC_USER ?? "";
  const expectedPass = process.env.AITS_DISCONNECT_BASIC_PASS ?? "";
  if (!expectedUser || !expectedPass) return false;
  try {
    const decoded = Buffer.from(header.slice(6), "base64").toString("utf-8");
    const idx = decoded.indexOf(":");
    if (idx < 0) return false;
    const user = decoded.slice(0, idx);
    const pass = decoded.slice(idx + 1);
    return safeEqual(user, expectedUser) && safeEqual(pass, expectedPass);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  // 1) Basic Auth 검증 — 실패 시 401 + WWW-Authenticate 헤더.
  if (!verifyBasicAuth(req)) {
    return new NextResponse(
      JSON.stringify({ error: "unauthorized" }),
      {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "WWW-Authenticate": 'Basic realm="aits-disconnect"',
        },
      },
    );
  }

  // 2) 페이로드 파싱 — 토스가 보내는 정확한 스키마는 콘솔/문서에서 확인 필요.
  //    일반적으로 userKey 또는 accessToken 중 하나가 포함됨.
  let body: Record<string, unknown> = {};
  try {
    const text = await req.text();
    if (text) body = JSON.parse(text);
  } catch {
    // body 없거나 JSON 아니어도 진행 — 토스가 form 형식으로 보낼 수도 있음.
  }

  const userKey =
    (body.userKey as string | undefined) ??
    (body.user_key as string | undefined) ??
    (body.tossUserKey as string | undefined);

  if (!userKey) {
    // 식별자 없으면 200 으로 회신 (재시도 방지) + 로그만 남김.
    console.warn("[aits/disconnect] missing userKey in payload", body);
    return NextResponse.json({ ok: true, deleted: 0 });
  }

  // 3) Supabase row 삭제 — toss_user_key 기준.
  const { error, count } = await supabase
    .from("sajumon_aits_users")
    .delete({ count: "exact" })
    .eq("toss_user_key", userKey);

  if (error) {
    console.error("[aits/disconnect] supabase delete failed", { userKey, error });
    // 5xx 반환 → 토스가 재시도하도록 함.
    return NextResponse.json(
      { error: "delete_failed" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, deleted: count ?? 0 });
}
