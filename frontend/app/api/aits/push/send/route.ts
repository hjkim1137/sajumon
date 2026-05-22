// 푸시 발송 — Vercel Cron 또는 백엔드 내부에서만 호출.
// 복사 위치: sajumon.vercel.app/app/api/aits/push/send/route.ts
//
// 외부 클라이언트는 x-aits-push-secret 헤더가 없으므로 호출 불가.
// Vercel Cron 설정 시 `vercel.json` 의 `crons` 에 등록 + headers 에 시크릿 포함.

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { tossSendMessage } from "@/lib/aits/tossApi";

export const runtime = "nodejs";

// 미니앱 전용 Supabase 인스턴스 (B계정). 사주몬 웹 어드민용 A계정과 분리.
const supabase = createClient(
  process.env.AITS_SUPABASE_URL!,
  process.env.AITS_SUPABASE_SERVICE_ROLE_KEY!,
);

const PUSH_SECRET = process.env.AITS_PUSH_CRON_SECRET ?? "";

interface PushRequestBody {
  // 단건 또는 다건. 둘 다 없으면 모든 사용자 (cron 일일 운세 시나리오).
  userKey?: string;
  userKeys?: string[];
  title: string;
  body: string;
  deepLink?: string;
}

export async function POST(req: NextRequest) {
  // 외부 호출 차단 — 시크릿 헤더 검증.
  const provided = req.headers.get("x-aits-push-secret");
  if (!PUSH_SECRET || provided !== PUSH_SECRET) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let payload: PushRequestBody;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const { userKey, userKeys, title, body, deepLink } = payload;
  if (!title || !body) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  // 대상 userKey 결정.
  let targets: string[] = [];
  if (userKey) {
    targets = [userKey];
  } else if (userKeys && userKeys.length > 0) {
    targets = userKeys;
  } else {
    // 전체 — Supabase 에서 toss_user_key 가 있는 모든 사용자 조회.
    const { data, error } = await supabase
      .from("sajumon_aits_users")
      .select("toss_user_key")
      .not("toss_user_key", "is", null);
    if (error) {
      console.error("[aits/push/send] supabase:", error);
      return NextResponse.json({ error: "db_error" }, { status: 500 });
    }
    targets = (data ?? []).map((r) => r.toss_user_key).filter(Boolean) as string[];
  }

  // 발송 — 토스 sendMessage API 가 단건/벌크를 지원하는지에 따라 변경.
  // 정확한 endpoint·페이로드 형식은 토스 문서 `api/sendMessage.md` 와 `api/sendBulkMessage.md` 참고.
  const results: Array<{ userKey: string; ok: boolean; error?: string }> = [];
  for (const target of targets) {
    try {
      const res = await tossSendMessage({
        userKey: target,
        title,
        body,
        deepLink,
      });
      if (res.resultType === "SUCCESS") {
        results.push({ userKey: target, ok: true });
      } else {
        results.push({
          userKey: target,
          ok: false,
          error: res.error.reason,
        });
      }
    } catch (e) {
      results.push({
        userKey: target,
        ok: false,
        error: e instanceof Error ? e.message : "unknown",
      });
    }
  }

  return NextResponse.json({
    total: targets.length,
    succeeded: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results,
  });
}
