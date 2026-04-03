# Daily Travel Conversation (여행 회화 학습 앱) 구현 계획

## 개요
- **목적**: 매일 Groq AI가 여행 필수 회화 3개를 추천하고, 따라 말하기 + 빈칸 채우기로 반복 학습하여 회화 실력을 향상시키는 웹앱
- **범위**:
  - 포함: 초기 화면, 세팅(언어/난이도/다크모드/다국어), 오늘 추천 회화 탭, 이전 회화 탭, 통계 탭
  - 제외: 모바일 네이티브 앱, 유료 결제, 커뮤니티 기능

## 기술 스택
| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 14 (App Router) + TypeScript |
| 스타일링 | Tailwind CSS |
| DB | Vercel Postgres (Neon) + Prisma ORM |
| 인증 | NextAuth.js (Google/GitHub 소셜 로그인) |
| AI | Groq API (회화 생성) |
| 차트 | Recharts |
| 이미지 | Unsplash API |
| 음성 | Web Speech API (TTS + STT) |
| 스케줄링 | Vercel Cron Jobs |
| 린트/포맷 | ESLint, Stylelint, Prettier |
| 배포 | Vercel Hobby |
| 다국어 | next-intl (한/영/일/중간체/독) |

## 데이터 모델

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]
  settings      UserSettings?
  practices     Practice[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model UserSettings {
  id              String   @id @default(cuid())
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  learningLanguages String[] // ["en", "ja", "zh", "de"]
  uiLanguage      String   @default("ko")
  difficulty      String   @default("low") // lowest, low, medium, high
  darkMode        Boolean  @default(false)
  timezone        String   @default("Asia/Seoul")
  onboardingCompleted Boolean @default(false)
}

model Conversation {
  id            String     @id @default(cuid())
  date          DateTime   @db.Date
  language      String     // 학습 대상 언어 코드
  difficulty    String     // 난이도
  situation     String     // 여행 상황 (호텔 체크인, 길 묻기 등)
  original      String     // 원문 (학습 언어)
  translation   Json       // 다국어 번역 { "ko": "...", "en": "...", "ja": "...", "zh": "...", "de": "..." }
  pronunciation String?    // 발음 가이드
  keywords      String[]   // 핵심 단어 목록
  practices     Practice[]
  createdAt     DateTime   @default(now())

  @@index([date, language, difficulty])
  @@index([language, date])
}

model Practice {
  id              String       @id @default(cuid())
  userId          String
  user            User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  conversationId  String
  conversation    Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  speakingCount   Int          @default(0) // 따라 말하기 횟수 (목표: 3)
  quizCount       Int          @default(0) // 빈칸 채우기 횟수 (목표: 2)
  isCompleted     Boolean      @default(false)
  completedAt     DateTime?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  @@unique([userId, conversationId])
}
```

## 구현 단계

### Phase 1: 프로젝트 초기 설정
- **작업 내용**:
  - Next.js 14 프로젝트 생성 (App Router, TypeScript)
  - Tailwind CSS 설정
  - ESLint, Stylelint, Prettier 설정
  - Prisma 초기 설정 + Vercel Postgres 연결
  - NextAuth.js 설정 (Google, GitHub 프로바이더)
  - next-intl 다국어 설정 (ko, en, ja, zh, de)
  - 프로젝트 디렉토리 구조 수립
- **산출물**: 빌드 성공, 로그인/로그아웃 동작, DB 마이그레이션 완료
- **의존성**: 없음

### Phase 2: 초기 화면 + 세팅
- **작업 내용**:
  - 랜딩 페이지 (Unsplash 여행 배경 + 환영 문구)
  - 온보딩 가드 미들웨어 (설정 미완료 시 /settings로 리다이렉트)
  - 온보딩 세팅 페이지
    - 학습 언어 선택 (다중 선택: 영어, 일본어, 중국어 간체, 독일어)
    - 난이도 선택 (최하/하/중/상)
    - UI 언어 선택
    - 다크모드 토글 (기본값: 라이트)
  - UserSettings CRUD API
  - 다크모드 전역 상태 관리
- **수정 파일**:
  - `src/app/page.tsx` (생성)
  - `src/app/settings/page.tsx` (생성)
  - `src/app/api/settings/route.ts` (생성)
  - `src/components/landing/` (생성)
  - `src/components/settings/` (생성)
- **산출물**: 랜딩 페이지 렌더링, 세팅 저장/조회 동작
- **의존성**: Phase 1

### Phase 3: Groq AI 회화 생성 + Cron Job
- **작업 내용**:
  - Groq API 연동 모듈 개발
  - 프롬프트 설계: 여행 상황별 회화 생성 (난이도별 어휘/문법 차이)
  - Vercel Cron Job 설정 (매일 07:00 KST)
  - Cron API Route: 실제 사용 중인 언어×난이도 조합만 회화 3개씩 생성 (10초 제한 준수)
  - Groq API JSON mode + Zod 스키마 검증 + 실패 시 재시도 (최대 2회)
  - Conversation 테이블 저장
  - 발음 가이드 + 핵심 단어 추출
- **수정 파일**:
  - `src/lib/groq.ts` (생성)
  - `src/app/api/cron/generate-conversations/route.ts` (생성)
  - `vercel.json` (생성)
- **산출물**: Cron 실행 시 DB에 회화 데이터 생성 확인
- **의존성**: Phase 1

### Phase 4: 오늘 추천 회화 탭
- **작업 내용**:
  - 오늘의 회화 3개 조회 API
  - 회화 카드 UI (상황, 원문, 번역, 발음 가이드)
  - 따라 말하기 모드 (Web Speech API TTS + STT)
    - TTS로 원문 재생
    - STT로 사용자 발화 녹음 + 텍스트 변환
    - 유사도 비교 후 피드백
    - 3회 완료 추적
    - STT 미지원 브라우저: TTS 재생 + "따라 읽었습니다" 자가 확인 버튼으로 대체
  - 빈칸 채우기 퀴즈 모드
    - 핵심 단어를 빈칸으로 변환
    - 사용자 입력 검증
    - 2회 완료 추적
  - 5회 완료 시 완료 표시 + Practice 레코드 업데이트
- **수정 파일**:
  - `src/app/dashboard/page.tsx` (생성)
  - `src/components/conversation/ConversationCard.tsx` (생성)
  - `src/components/practice/SpeakingMode.tsx` (생성)
  - `src/components/practice/QuizMode.tsx` (생성)
  - `src/app/api/conversations/today/route.ts` (생성)
  - `src/app/api/practice/route.ts` (생성)
- **산출물**: 오늘 회화 조회, 따라 말하기/퀴즈 동작, 완료 상태 저장
- **의존성**: Phase 2, Phase 3

### Phase 5: 이전 회화 탭
- **작업 내용**:
  - 날짜별 이전 회화 목록 조회 API (페이지네이션)
  - 완료/미완료 상태 표시
  - 완료 상태 토글 기능 (완료 ↔ 미완료 변경 가능)
  - 날짜 필터링 UI
  - 이전 회화 재학습 기능
- **수정 파일**:
  - `src/app/history/page.tsx` (생성)
  - `src/components/history/HistoryList.tsx` (생성)
  - `src/app/api/conversations/history/route.ts` (생성)
  - `src/app/api/practice/[id]/route.ts` (생성)
- **산출물**: 이전 회화 목록 조회, 완료 상태 토글 동작
- **의존성**: Phase 4

### Phase 6: 통계 탭
- **작업 내용**:
  - 통계 데이터 집계 API
    - 일별/주별/월별 완료율
    - 언어별 학습 현황
    - 연속 학습일 (streak)
  - Recharts 차트 컴포넌트
    - 주간 완료율 막대 차트
    - 월간 학습 추이 라인 차트
    - 언어별 도넛 차트
  - 학습 요약 카드 (총 학습일, 완료율, streak)
- **수정 파일**:
  - `src/app/statistics/page.tsx` (생성)
  - `src/components/statistics/WeeklyChart.tsx` (생성)
  - `src/components/statistics/MonthlyChart.tsx` (생성)
  - `src/components/statistics/LanguageChart.tsx` (생성)
  - `src/app/api/statistics/route.ts` (생성)
- **산출물**: 통계 차트 렌더링, 데이터 정확성 검증
- **의존성**: Phase 5

### Phase 7: 웹접근성 + 시맨틱 HTML + SEO/GEO
- **작업 내용**:
  - 전체 페이지 시맨틱 HTML 태그 적용 (header, main, nav, section, article)
  - ARIA 속성, 키보드 내비게이션, 포커스 관리
  - 메타태그, Open Graph, JSON-LD 구조화 데이터
  - 다국어 SEO (hreflang 태그)
- **산출물**: Lighthouse 접근성 90+ 점수
- **의존성**: Phase 6

### Phase 8: 최종 검증 + 배포
- **작업 내용**:
  - 전체 린트 검사 (ESLint, Stylelint, Prettier)
  - TypeScript 타입 체크
  - E2E 테스트 (Chrome MCP 활용)
  - Vercel 배포 설정
  - README.md, CLAUDE.md 작성
- **산출물**: 프로덕션 배포 완료, 모든 테스트 통과
- **의존성**: Phase 7

## 수정 대상 파일 요약

| 파일/디렉토리 | 변경 유형 | 설명 |
|--------------|----------|------|
| `src/app/` | 생성 | App Router 페이지들 |
| `src/components/` | 생성 | UI 컴포넌트 |
| `src/lib/` | 생성 | 유틸리티 (groq, auth, db) |
| `prisma/schema.prisma` | 생성 | DB 스키마 |
| `messages/` | 생성 | 다국어 번역 파일 (ko, en, ja, zh, de) |
| `vercel.json` | 생성 | Cron Job 설정 |
| `.env.example` | 생성 | 환경변수 템플릿 |
| `tailwind.config.ts` | 생성 | Tailwind + 다크모드 설정 |
| `next.config.ts` | 생성 | Next.js + next-intl 설정 |

## 인수 조건 (Acceptance Criteria)

- [ ] 소셜 로그인(Google/GitHub)으로 인증 후 대시보드 접근 가능
- [ ] 학습 언어, 난이도, UI 언어, 다크모드 설정 저장/조회 동작
- [ ] 매일 오전 7시 Cron으로 언어별 회화 3개 자동 생성
- [ ] 오늘 추천 회화 3개가 카드 형태로 표시
- [ ] 따라 말하기 3회 + 빈칸 채우기 2회 완료 시 완료 표시
- [ ] 이전 회화 목록에서 완료/미완료 상태 확인 및 토글 가능
- [ ] 통계 차트(주간/월간/언어별)가 정확한 데이터로 렌더링
- [ ] 다국어(한/영/일/중/독) UI 전환 동작
- [ ] 다크모드/라이트모드 전환 동작 (기본: 라이트)
- [ ] 랜딩 페이지에 Unsplash 여행 배경 + 환영 문구 표시
- [ ] Lighthouse 접근성 점수 90 이상
- [ ] ESLint, Stylelint, Prettier, TypeScript 에러 0개
- [ ] 주요 사용자 시나리오 E2E 테스트 통과

## 의존성 그래프

```
Phase 1 (초기 설정)
├── Phase 2 (초기 화면 + 세팅)
│   └── Phase 4 (오늘 추천 회화) ─┐
│                                  ├── Phase 5 (이전 회화)
├── Phase 3 (Groq + Cron) ────────┘       │
                                          Phase 6 (통계)
                                              │
                                          Phase 7 (a11y + SEO)
                                              │
                                          Phase 8 (검증 + 배포)
```

## 디렉토리 구조

```
daily-language/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── page.tsx              # 랜딩 페이지
│   │   │   ├── layout.tsx            # 루트 레이아웃
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx          # 오늘 추천 회화
│   │   │   ├── history/
│   │   │   │   └── page.tsx          # 이전 회화
│   │   │   ├── statistics/
│   │   │   │   └── page.tsx          # 통계
│   │   │   └── settings/
│   │   │       └── page.tsx          # 설정
│   │   └── api/
│   │       ├── auth/[...nextauth]/
│   │       │   └── route.ts
│   │       ├── cron/
│   │       │   └── generate-conversations/
│   │       │       └── route.ts
│   │       ├── conversations/
│   │       │   ├── today/route.ts
│   │       │   └── history/route.ts
│   │       ├── practice/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── settings/route.ts
│   │       └── statistics/route.ts
│   ├── components/
│   │   ├── landing/
│   │   ├── settings/
│   │   ├── conversation/
│   │   ├── practice/
│   │   ├── history/
│   │   ├── statistics/
│   │   └── ui/                       # 공통 UI 컴포넌트
│   ├── lib/
│   │   ├── auth.ts                   # NextAuth 설정
│   │   ├── db.ts                     # Prisma 클라이언트
│   │   ├── groq.ts                   # Groq API 클라이언트
│   │   └── unsplash.ts              # Unsplash API
│   ├── hooks/
│   │   ├── useSpeechSynthesis.ts
│   │   ├── useSpeechRecognition.ts
│   │   └── useTheme.ts
│   └── types/
│       └── index.ts
├── prisma/
│   └── schema.prisma
├── messages/
│   ├── ko.json
│   ├── en.json
│   ├── ja.json
│   ├── zh.json
│   └── de.json
├── public/
├── vercel.json
├── tailwind.config.ts
├── next.config.ts
├── .env.example
├── README.md
└── CLAUDE.md
```
