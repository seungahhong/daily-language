# Daily Travel Conversation 기술 아키텍처 설계서

## 1. 시스템 아키텍처

### 전체 구성도

```
[Browser Client]
    │
    ├── NextAuth.js ──> [Google/GitHub OAuth]
    │
    ├── App Router (RSC) ──> [Vercel Postgres / Neon]
    │       │                       ▲
    │       ├── API Routes ─────────┘
    │       │
    │       └── Server Actions ─────┘
    │
    ├── Web Speech API (TTS/STT) ──> [Browser Native]
    │
    └── Unsplash API ──> [unsplash.com]

[Vercel Cron] ──07:00 KST──> [API Route: /api/cron/generate-conversations]
                                    │
                                    ├──> [Groq API] (회화 생성)
                                    │
                                    └──> [Vercel Postgres] (저장)
```

### 데이터 흐름

```
1. 회화 생성 흐름:
   Vercel Cron (07:00)
     → API Route
     → DB에서 활성 언어/난이도 조합 조회
     → 조합별 Groq API 호출 (병렬)
     → Conversation 테이블에 INSERT
     
2. 학습 흐름:
   사용자 접속
     → Server Component에서 오늘 회화 조회 (DB)
     → Client Component에서 따라 말하기/퀴즈 인터랙션
     → API Route로 Practice 업데이트 (speakingCount/quizCount)
     → 5회 완료 시 isCompleted = true
     
3. 통계 흐름:
   통계 페이지 접속
     → Server Component에서 Practice 집계 쿼리
     → Recharts Client Component에 데이터 전달
```

## 2. API 설계

### 인증 (NextAuth.js)

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| `GET/POST` | `/api/auth/[...nextauth]` | NextAuth 핸들러 | - |

### 설정

| Method | Path | 설명 | Request | Response |
|--------|------|------|---------|----------|
| `GET` | `/api/settings` | 사용자 설정 조회 | - | `{ settings: UserSettings }` |
| `PUT` | `/api/settings` | 사용자 설정 수정 | `{ learningLanguages, uiLanguage, difficulty, darkMode }` | `{ settings: UserSettings }` |

### 회화

| Method | Path | 설명 | Request | Response |
|--------|------|------|---------|----------|
| `GET` | `/api/conversations/today` | 오늘 추천 회화 조회 | Query: `language` | `{ conversations: ConversationWithPractice[] }` |
| `GET` | `/api/conversations/history` | 이전 회화 목록 | Query: `page, limit, language, startDate, endDate` | `{ conversations: [], total, page }` |
| `POST` | `/api/cron/generate-conversations` | Cron: 회화 생성 | Header: `Authorization: Bearer CRON_SECRET` | `{ generated: number }` |

### 연습

| Method | Path | 설명 | Request | Response |
|--------|------|------|---------|----------|
| `POST` | `/api/practice` | 연습 기록 생성/업데이트 | `{ conversationId, type: "speaking" \| "quiz" }` | `{ practice: Practice }` |
| `PATCH` | `/api/practice/[id]` | 완료 상태 토글 | `{ isCompleted: boolean }` | `{ practice: Practice }` |

### 통계

| Method | Path | 설명 | Request | Response |
|--------|------|------|---------|----------|
| `GET` | `/api/statistics` | 학습 통계 조회 | Query: `period: "week" \| "month"` | `{ weekly, monthly, byLanguage, streak, totalDays, completionRate }` |

### 에러 응답 형식

```typescript
{
  error: string;    // 사용자 표시용 메시지
  code: string;     // 에러 코드 (예: "UNAUTHORIZED", "NOT_FOUND")
}
```

### 인증 정책
- `/api/cron/*`: `CRON_SECRET` 헤더 검증 (Vercel 자동 설정)
- `/api/settings`, `/api/practice/*`, `/api/statistics`: NextAuth 세션 필수
- `/api/conversations/today`, `/api/conversations/history`: NextAuth 세션 필수

## 3. 데이터 모델 상세

### 인덱스 전략

```prisma
model Conversation {
  // ... 필드 생략
  
  @@index([date, language, difficulty])  // Cron 중복 체크 + 오늘 회화 조회
  @@index([language, date])              // 이전 회화 목록 조회
}

model Practice {
  // ... 필드 생략
  
  @@unique([userId, conversationId])     // 사용자별 회화당 1개 연습 레코드
  @@index([userId, isCompleted])         // 통계 집계용
}
```

### Cron 생성 범위 제한 + 중복 방지

Cron은 **실제 사용 중인 조합만** 생성한다:
```sql
-- 1. 활성 조합 조회
SELECT DISTINCT unnest("learningLanguages") as language, difficulty
FROM "UserSettings" WHERE "onboardingCompleted" = true

-- 2. 중복 체크 (이미 3개 이상 존재하면 스킵)
SELECT COUNT(*) FROM "Conversation"
WHERE date = CURRENT_DATE AND language = $1 AND difficulty = $2
```

최대 동시 Groq API 호출을 3-4개로 제한하여 10초 타임아웃 준수.

### 타임존 처리

"오늘" 회화 조회 시 사용자 타임존 기반으로 날짜 계산:
- UserSettings.timezone 사용
- Cron expression: `0 22 * * *` (UTC) = 07:00 KST
- 클라이언트 최초 접속 시 `Intl.DateTimeFormat().resolvedOptions().timeZone`을 서버에 전송하여 timezone 자동 설정

## 4. 컴포넌트 설계

### Server/Client Component 경계

```
RootLayout (Server) ─── ThemeProvider (Client)
  │
  ├── LandingPage (Server)
  │     └── HeroSection (Client) ── Unsplash 이미지 로드
  │
  ├── DashboardPage (Server) ── 오늘 회화 데이터 fetch
  │     ├── ConversationCard (Client) ── 인터랙션
  │     │     ├── SpeakingMode (Client) ── Web Speech API
  │     │     └── QuizMode (Client) ── 입력 + 검증
  │     └── ProgressIndicator (Client) ── 완료 상태
  │
  ├── HistoryPage (Server) ── 이전 회화 데이터 fetch
  │     └── HistoryList (Client) ── 필터링 + 토글
  │
  ├── StatisticsPage (Server) ── 통계 데이터 fetch
  │     ├── WeeklyChart (Client) ── Recharts
  │     ├── MonthlyChart (Client) ── Recharts
  │     └── LanguageChart (Client) ── Recharts
  │
  └── SettingsPage (Server)
        └── SettingsForm (Client) ── 폼 인터랙션
```

### 핵심 설계 결정

**Server Component 우선**: 데이터 fetch는 Server Component에서 수행하고, 인터랙션이 필요한 부분만 Client Component로 분리. 이유: 번들 크기 최소화 + DB 직접 접근 가능.

**데이터 fetch 전략**:
- Server Component: Prisma 직접 쿼리 (API Route 거치지 않음)
- Client Component → API Route: 연습 기록 업데이트 등 사용자 인터랙션

### 상태 관리

| 상태 | 관리 방식 | 이유 |
|------|----------|------|
| 인증 상태 | NextAuth `useSession` | 표준 솔루션 |
| 다크모드 | `next-themes` + DB 동기화 | SSR 깜빡임 방지 + 설정 영속화 |
| UI 언어 | next-intl (URL 기반 `[locale]`) | SEO + SSR 호환 |
| 연습 진행 상태 | React `useState` + API 동기화 | 로컬 즉시 반영 + 서버 저장 |
| 통계/회화 목록 | Server Component props | 서버에서 fetch 후 전달 |

## 5. 기술 선택 근거

### 다국어: next-intl

| 기준 | next-intl | react-i18next | next-translate |
|------|-----------|--------------|----------------|
| App Router 지원 | 네이티브 | 플러그인 필요 | 미지원 |
| RSC 지원 | 완전 지원 | 제한적 | 미지원 |
| 번들 크기 | ~8KB | ~25KB | ~15KB |

**선택 이유**: App Router + RSC 네이티브 지원. URL 기반 locale (`/ko/dashboard`) 패턴으로 SEO 친화적.

### 다크모드: next-themes

**선택 이유**: SSR에서 FOUC(Flash of Unstyled Content) 방지를 위한 script injection 기능 내장. Tailwind `dark:` 클래스와 자연스럽게 연동. DB의 `darkMode` 설정과 동기화하여 다기기 일관성 제공.

### 음성: Web Speech API

**트레이드오프**: 
- 장점: 추가 비용 없음, 설치 불필요
- 단점: 브라우저 지원 불균일 (Safari STT 미지원)
- 대응: STT 미지원 시 빈칸 채우기로 대체 (graceful degradation)

### Groq API 프롬프트 설계

```
시스템 프롬프트:
"여행 상황에서 사용하는 {language} 회화를 생성하세요.
난이도: {difficulty_description}
응답 형식: JSON { situation, original, translation, pronunciation, keywords[] }"

난이도별 지시:
- 최하 (초1-3): 단어 3-5개, 기본 인사/숫자
- 하 (초4-6): 문장 1-2개, 단순 현재형
- 중 (중학교): 문장 2-3개, 다양한 시제
- 상 (고등학교): 문장 3-5개, 관용 표현 포함
```

## 6. 동시성/안전성 전략

### Cron Job 안전성

- **중복 실행 방지**: 날짜 + 언어 + 난이도로 중복 체크 후 생성
- **타임아웃**: Vercel Hobby 10초 제한 → Groq API 병렬 호출로 시간 확보
- **실패 복구**: Cron 실패 시 사용자 접속 시점에 온디맨드 생성 fallback

### Practice 동시성

- `@@unique([userId, conversationId])`: DB 레벨 유니크 제약으로 중복 레코드 방지
- `upsert` 사용: 이미 존재하면 업데이트, 없으면 생성

### 캐싱 전략

| 대상 | 캐싱 방식 | TTL | 무효화 |
|------|----------|-----|--------|
| 오늘 회화 | ISR (revalidate) | 1시간 | Cron 실행 시 `revalidatePath` |
| 이전 회화 | 없음 (동적) | - | - |
| 통계 | 없음 (동적) | - | - |
| Unsplash 이미지 | 브라우저 캐시 | 24시간 | - |

## 7. 핵심 파일 목록

| 파일 | 역할 | 복잡도 |
|------|------|--------|
| `src/lib/groq.ts` | Groq API 연동, 프롬프트 관리, 응답 파싱 | 높음 |
| `src/app/api/cron/generate-conversations/route.ts` | Cron Job 핸들러, 중복 체크, 병렬 생성 | 높음 |
| `src/components/practice/SpeakingMode.tsx` | Web Speech API 통합, 유사도 비교, 진행 추적 | 높음 |
| `src/components/practice/QuizMode.tsx` | 빈칸 생성 로직, 입력 검증, 진행 추적 | 중간 |
| `prisma/schema.prisma` | 전체 데이터 모델, 인덱스, 관계 정의 | 중간 |

## 8. 환경 변수

```env
# Database
DATABASE_URL=                    # Vercel Postgres 연결 문자열

# Auth
NEXTAUTH_URL=                    # 배포 URL
NEXTAUTH_SECRET=                 # 세션 암호화 키
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_ID=
GITHUB_SECRET=

# AI
GROQ_API_KEY=                    # Groq API 키

# Image
UNSPLASH_ACCESS_KEY=             # Unsplash API 키

# Cron
CRON_SECRET=                     # Vercel Cron 인증 (자동 설정)
```
