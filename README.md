# Daily Travel Talk

AI가 매일 추천하는 여행 필수 회화로 외국어를 학습하는 웹앱입니다.

## 주요 기능

- **매일 3개 회화 추천**: Groq AI가 매일 오전 7시(KST)에 여행 상황별 회화를 자동 생성
- **따라 말하기 + 빈칸 채우기**: 따라 말하기 3회 + 빈칸 채우기 2회 = 5회 반복 학습
- **다국어 지원**: 한국어, 영어, 일본어, 중국어(간체), 독일어 UI
- **학습 언어 선택**: 영어, 일본어, 중국어, 독일어 중 다중 선택
- **4단계 난이도**: 최하(초1-3) / 하(초4-6) / 중(중학교) / 상(고등학교)
- **학습 통계**: 주간/월간 진행률, 언어별 현황, 연속 학습일 차트
- **다크 모드**: 라이트/다크 테마 전환 (기본: 라이트)

## 기술 스택

| 영역 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) + TypeScript |
| 스타일링 | Tailwind CSS |
| DB | Vercel Postgres (Neon) + Prisma ORM |
| 인증 | NextAuth.js (Google, GitHub) |
| AI | Groq API (Llama 3.3 70B) |
| 차트 | Recharts |
| 이미지 | Unsplash API |
| 음성 | Web Speech API (TTS + STT) |
| 다국어 | next-intl |
| 배포 | Vercel |

## 시작하기

### 환경 변수 설정

```bash
cp .env.example .env
```

`.env` 파일에 다음 값들을 설정하세요:

```env
DATABASE_URL=             # Vercel Postgres 연결 문자열
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=          # openssl rand -base64 32
GOOGLE_CLIENT_ID=         # Google OAuth
GOOGLE_CLIENT_SECRET=
GITHUB_ID=                # GitHub OAuth
GITHUB_SECRET=
GROQ_API_KEY=             # Groq API 키
UNSPLASH_ACCESS_KEY=      # Unsplash API 키
```

### 설치 및 실행

```bash
# 패키지 설치
pnpm install

# Prisma 클라이언트 생성
npx prisma generate

# DB 마이그레이션
npx prisma db push

# 개발 서버 실행
pnpm dev
```

[http://localhost:3000](http://localhost:3000)에서 확인하세요.

### Cron Job 테스트

```bash
curl -X POST http://localhost:3000/api/cron/generate-conversations \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## 프로젝트 구조

```
src/
├── app/
│   ├── [locale]/          # 다국어 라우팅
│   │   ├── dashboard/     # 오늘 추천 회화
│   │   ├── history/       # 이전 회화
│   │   ├── statistics/    # 학습 통계
│   │   └── settings/      # 설정
│   └── api/               # API Routes
├── components/            # UI 컴포넌트
├── hooks/                 # Custom Hooks (Speech API)
├── i18n/                  # 다국어 설정
├── lib/                   # 유틸리티 (auth, db, groq)
└── types/                 # TypeScript 타입
messages/                  # 다국어 번역 파일
prisma/                    # DB 스키마
```

## 배포

Vercel에 배포 시 환경 변수를 설정하고, Vercel Postgres를 연결하세요.
Cron Job은 `vercel.json`에 설정되어 매일 UTC 22:00 (KST 07:00)에 실행됩니다.

## 라이선스

MIT
