# CLAUDE.md - Daily Travel Talk

## Project Overview

AI가 매일 여행 필수 회화 3개를 추천하고, 따라 말하기 + 빈칸 채우기로 반복 학습하는 웹앱.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4
- **DB**: Vercel Postgres (Neon) + Prisma 6
- **Auth**: NextAuth.js (Google, GitHub)
- **AI**: Groq API (Llama 3.3 70B)
- **i18n**: next-intl (ko, en, ja, zh, de)
- **Charts**: Recharts
- **Package Manager**: pnpm

## Commands

```bash
pnpm dev          # 개발 서버
pnpm build        # 프로덕션 빌드
pnpm lint         # ESLint
npx tsc --noEmit  # TypeScript 체크
npx prisma generate  # Prisma 클라이언트 생성
npx prisma db push   # DB 스키마 적용
```

## Architecture

### Routing

- `src/app/[locale]/` - 다국어 라우팅 (next-intl)
- `src/app/api/` - API Routes (인증 불필요한 cron 제외 모두 세션 필수)

### Key Patterns

- **Server Component 우선**: 데이터 fetch는 Server Component에서 Prisma 직접 쿼리
- **Client Component**: 인터랙션이 필요한 부분만 (폼, 차트, Speech API)
- **Groq API**: lazy initialization (`getGroqClient()`) - 빌드 시 API 키 불필요
- **다크모드**: `next-themes` + Tailwind `dark:` 클래스, DB와 동기화
- **Cron**: Vercel Cron → `/api/cron/generate-conversations` (UTC 22:00 = KST 07:00)

### Data Model

- `User` ← NextAuth 관리
- `UserSettings` ← 언어/난이도/다크모드/온보딩 상태
- `Conversation` ← AI 생성 회화 (translation은 JSON: {ko, en, ja, zh, de})
- `Practice` ← 사용자별 학습 기록 (speakingCount, quizCount, isCompleted)

### File Structure

```
src/
├── app/[locale]/     # 페이지: dashboard, history, statistics, settings
├── app/api/          # REST API
├── components/       # UI 컴포넌트
├── hooks/            # useSpeechSynthesis, useSpeechRecognition
├── i18n/             # routing, request config
├── lib/              # auth, db, groq, unsplash
└── types/            # TypeScript 타입
messages/             # 다국어 JSON (ko, en, ja, zh, de)
```

## Environment Variables

필수: `DATABASE_URL`, `NEXTAUTH_SECRET`, `GROQ_API_KEY`
OAuth: `GOOGLE_CLIENT_ID/SECRET`, `GITHUB_ID/SECRET`
선택: `UNSPLASH_ACCESS_KEY`, `CRON_SECRET`

@AGENTS.md
