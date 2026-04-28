# 사주몬 (Sajumon)

> 당신의 사주몬을 소환하세요! 생년월일과 관심 테마를 기반으로 12지신 캐릭터 부적을 뽑아주는 픽셀 아트 웹앱.

배포: https://sajumon.vercel.app

---

## 소개

사주몬은 사용자의 생년월일·태어난 시간·관심 테마를 입력받아, 만세력 기반의 **일주(日柱)** 를 계산해 12지신 동물 캐릭터에 매핑하고, 포켓몬 스타일의 픽셀 부적 이미지를 생성해주는 웹 서비스입니다.

- **테마별 운세**: 건강 / 공부 / 직업 / 연애 / 재물 5가지 테마 중 선택
- **간단한 설문**: 테마별 5문항으로 캐릭터 해석에 가중치 부여
- **부적 이미지 다운로드 & 공유**: `html-to-image`로 캡처해 OS에 맞춰 저장 (iOS/Android/PC 분기 처리)
- **인앱 브라우저 대응**: 카카오톡·인스타그램 등 인앱에서 접속 시 외부 브라우저로 유도
- **어드민 대시보드**: 누적 방문자, 시간대 트래픽, 디바이스/브라우저, 연령대, 테마 전환율, 인기 문구, 에러 로그 등 운영 지표 수집·시각화

---

## 기술 스택

- **Framework**: Next.js 16 (App Router) / React 19 / TypeScript
- **Styling**: Tailwind CSS v4, 픽셀 폰트(Galmuri11)
- **DB / Auth / RPC**: Supabase (Postgres)
- **이미지 생성**: `html-to-image`
- **빌드 최적화**: React Compiler (`babel-plugin-react-compiler`)
- **배포**: Vercel

---

## 프로젝트 구조

```
sajumon/
├── frontend/
│   ├── app/
│   │   ├── page.tsx                  # 메인 (로고 / 부적 뽑기 / 누적 방문자 카운터)
│   │   ├── input/                    # 생년월일·시간·테마 입력
│   │   ├── question/                 # 테마별 설문
│   │   ├── result/                   # 부적 결과 + 이미지 다운로드/공유
│   │   ├── admin/                    # 운영자 대시보드 (로그인 보호)
│   │   ├── api/
│   │   │   ├── saju/analyze/         # 일주 계산 + 캐릭터 매칭
│   │   │   ├── stats/                # 누적 방문자 등 공개 통계
│   │   │   ├── track/                # pageview / session / share / download / speech
│   │   │   └── admin/                # 어드민 통계, 에러 로그, 인증
│   │   └── _components/              # SessionTracker / PageTracker / InAppBrowserGuide
│   ├── lib/
│   │   ├── dayPillarCalculator.ts    # 만세력 일주 계산 (Julian Day 기반)
│   │   ├── characterInterpretations.ts
│   │   ├── themeQuestions.ts         # 테마별 설문 정의
│   │   ├── speechTexts.ts            # 결과 화면 럭키 멘트
│   │   ├── fortuneData.ts
│   │   ├── modifiers.ts
│   │   ├── tracking.ts               # 클라이언트 트래킹 유틸
│   │   ├── useSessionDuration.ts
│   │   └── supabase.ts               # 빌드타임 stub 포함 Supabase 클라이언트
│   ├── public/images/                # 12지신 × 5테마 픽셀 일러스트
│   ├── supabase-schema.sql           # DB 스키마 (테이블 + RPC)
│   └── package.json
└── README.md
```

---

## 주요 기능 구현 포인트

- **만세력 일주 계산** — Julian Day Number 기반 계산기를 Java에서 TypeScript로 1:1 포팅 (`lib/dayPillarCalculator.ts`).
- **클라이언트/서버 분리 트래킹** — 페이지뷰·세션 길이·다운로드·공유·럭키문구 노출을 별도 엔드포인트(`/api/track/*`)로 분리, fire-and-forget 패턴으로 응답 지연 없이 적재.
- **빌드타임 안전 Supabase 클라이언트** — `Proxy`로 감싸 ENV 미설정 환경(빌드)에서도 stub 응답을 반환해 Next.js 정적 생성이 깨지지 않도록 처리 (`lib/supabase.ts`).
- **인앱 브라우저 우회** — 카카오톡·인스타그램 등 WebView 환경 감지 후 외부 브라우저로 리다이렉트 또는 가이드 노출 (`InAppBrowserGuide`).
- **이미지 저장 OS 분기** — iOS Safari, Android WebView, 데스크톱별 `Blob` / `data URL` / 새 탭 다운로드 방식을 분기.
- **누적 방문자 슬롯머신 카운터** — 마지막 자릿수만 0~9 띠를 회전시켜 정착하는 슬롯머신 애니메이션 (`app/page.tsx` `SlotDigit`).

---

## 시작하기

### 1. 의존성 설치

```bash
cd frontend
npm install
```

### 2. 환경변수 설정

`frontend/.env.local`을 생성:

```env
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_PASSWORD=your-admin-password
```

### 3. Supabase 스키마 적용

Supabase 프로젝트의 SQL Editor에서 `frontend/supabase-schema.sql`을 실행해 다음 테이블·RPC를 생성합니다.

| 테이블 | 용도 |
|---|---|
| `page_views` | 페이지뷰 적재 (세션·디바이스·리퍼러 포함) |
| `analyses` | 사주 분석 결과 로그 (테마, 동물, 일주, 처리시간) |
| `downloads` | 부적 다운로드 트래킹 |
| `shares` | 부적 공유 트래킹 |
| `session_durations` | 세션 체류 시간 |
| `speech_views` | 럭키 문구 노출 횟수 (인기 문구 집계용) |
| `error_logs` | 서버 에러 로그 |
| `count_unique_visitors()` | 고유 방문자 수 RPC |

### 4. 개발 서버

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인.

### 5. 프로덕션 빌드

```bash
npm run build
npm start
```

---

## 어드민 대시보드

`/admin` 경로에서 비밀번호 인증 후 접근. 다음 카드들로 구성:

- 누적/일일 방문자, 분석 수, 다운로드 수, 전환율
- 시간대별 트래픽 차트, 일별 트렌드 차트
- 디바이스 비율, 브라우저/OS 분포, 리퍼러
- 테마별 분포, 동물별 / 동물×테마 조합 인기 순위
- 연령대 분포, 인기 럭키 문구, 엔드포인트 응답 성능
- 에러 로그 테이블, 퍼널 차트

---

## 라이선스

© 2026 TTSY. All rights reserved.
