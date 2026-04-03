import type { Metadata } from 'next';
import './globals.css';

const BASE_URL = 'https://dailytraveltalk.app';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Daily Travel Talk - AI 여행 회화 학습 | Learn Travel Phrases Daily',
    template: '%s | Daily Travel Talk',
  },
  description:
    'AI 기반 여행 회화 학습 앱. 매일 새로운 여행 상황별 회화를 연습하고, 5개 언어(한국어, 영어, 일본어, 중국어, 독일어)로 실전 여행 표현을 익히세요. Practice essential travel phrases daily with AI.',
  keywords: [
    '여행 회화',
    '여행 영어',
    '여행 일본어',
    '여행 중국어',
    '여행 독일어',
    'travel phrases',
    'travel conversation',
    'AI language learning',
    '여행 표현',
    '해외여행 회화',
    '旅行会話',
    'Reisephrasen',
    '旅游会话',
  ],
  authors: [{ name: 'Daily Travel Talk' }],
  creator: 'Daily Travel Talk',
  publisher: 'Daily Travel Talk',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    siteName: 'Daily Travel Talk',
    title: 'Daily Travel Talk - AI 여행 회화 학습',
    description:
      '매일 새로운 여행 상황별 회화를 AI와 함께 연습하세요. 5개 언어 지원.',
    url: BASE_URL,
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Daily Travel Talk - AI 여행 회화 학습 앱',
      },
    ],
    locale: 'ko_KR',
    alternateLocale: ['en_US', 'ja_JP', 'zh_CN', 'de_DE'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daily Travel Talk - AI 여행 회화 학습',
    description:
      '매일 새로운 여행 상황별 회화를 AI와 함께 연습하세요. 5개 언어 지원.',
    images: [`${BASE_URL}/og-image.png`],
  },
  alternates: {
    canonical: BASE_URL,
    languages: {
      ko: `${BASE_URL}/ko`,
      en: `${BASE_URL}/en`,
      ja: `${BASE_URL}/ja`,
      zh: `${BASE_URL}/zh`,
      de: `${BASE_URL}/de`,
    },
  },
  verification: {
    google: 'GOOGLE_SITE_VERIFICATION_CODE',
  },
  category: 'education',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
