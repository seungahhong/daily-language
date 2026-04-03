import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Providers from '@/components/ui/Providers';
import Navigation from '@/components/ui/Navigation';
import type { Metadata } from 'next';

const BASE_URL = 'https://dailytraveltalk.app';

const localeMetadata: Record<string, { title: string; description: string }> = {
  ko: {
    title: 'Daily Travel Talk - AI 여행 회화 학습',
    description:
      '매일 새로운 여행 상황별 회화를 AI와 함께 연습하세요. 한국어, 영어, 일본어, 중국어, 독일어 5개 언어를 지원합니다.',
  },
  en: {
    title: 'Daily Travel Talk - Learn Travel Phrases with AI',
    description:
      'Practice essential travel conversations daily with AI. Supports 5 languages: Korean, English, Japanese, Chinese, and German.',
  },
  ja: {
    title: 'Daily Travel Talk - AI旅行会話学習',
    description:
      'AIと一緒に毎日新しい旅行シーン別の会話を練習しましょう。韓国語、英語、日本語、中国語、ドイツ語の5言語に対応。',
  },
  zh: {
    title: 'Daily Travel Talk - AI旅游会话学习',
    description:
      '每天与AI一起练习新的旅行场景对话。支持韩语、英语、日语、中文、德语5种语言。',
  },
  de: {
    title: 'Daily Travel Talk - Reisephrasen mit KI lernen',
    description:
      'Üben Sie täglich wichtige Reisekonversationen mit KI. Unterstützt 5 Sprachen: Koreanisch, Englisch, Japanisch, Chinesisch und Deutsch.',
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const meta = localeMetadata[locale] ?? localeMetadata.ko;

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        ko: `${BASE_URL}/ko`,
        en: `${BASE_URL}/en`,
        ja: `${BASE_URL}/ja`,
        zh: `${BASE_URL}/zh`,
        de: `${BASE_URL}/de`,
        'x-default': `${BASE_URL}/ko`,
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${BASE_URL}/${locale}`,
      siteName: 'Daily Travel Talk',
      locale:
        locale === 'ko'
          ? 'ko_KR'
          : locale === 'en'
            ? 'en_US'
            : locale === 'ja'
              ? 'ja_JP'
              : locale === 'zh'
                ? 'zh_CN'
                : 'de_DE',
      type: 'website',
      images: [
        {
          url: `${BASE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: meta.title,
        },
      ],
    },
  };
}

function JsonLd({ locale }: { locale: string }) {
  const meta = localeMetadata[locale] ?? localeMetadata.ko;

  const webApplicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Daily Travel Talk',
    description: meta.description,
    url: `${BASE_URL}/${locale}`,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    inLanguage: ['ko', 'en', 'ja', 'zh', 'de'],
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    author: {
      '@type': 'Organization',
      name: 'Daily Travel Talk',
      url: BASE_URL,
    },
  };

  const educationalOrgSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Daily Travel Talk',
    url: BASE_URL,
    description:
      'AI-powered daily travel conversation learning platform supporting 5 languages.',
    sameAs: [],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name:
          locale === 'ko'
            ? 'Daily Travel Talk은 어떤 앱인가요?'
            : 'What is Daily Travel Talk?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            locale === 'ko'
              ? 'Daily Travel Talk은 AI 기반 여행 회화 학습 앱입니다. 매일 새로운 여행 상황별 회화를 제공하며, 한국어, 영어, 일본어, 중국어, 독일어 5개 언어를 지원합니다.'
              : 'Daily Travel Talk is an AI-powered travel conversation learning app. It provides daily travel scenario-based conversations and supports 5 languages: Korean, English, Japanese, Chinese, and German.',
        },
      },
      {
        '@type': 'Question',
        name:
          locale === 'ko'
            ? '어떤 언어를 학습할 수 있나요?'
            : 'What languages can I learn?',
        acceptedAnswer: {
          '@type': 'Answer',
          text:
            locale === 'ko'
              ? '한국어, 영어, 일본어, 중국어, 독일어 총 5개 언어의 여행 회화를 학습할 수 있습니다. AI가 매일 실전 여행 상황에 맞는 새로운 회화를 생성합니다.'
              : 'You can learn travel conversations in 5 languages: Korean, English, Japanese, Chinese, and German. AI generates new conversations daily based on real travel scenarios.',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(educationalOrgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="min-h-screen pb-16 md:pb-0 md:pt-16">
        <JsonLd locale={locale} />
        <Providers>
          <NextIntlClientProvider messages={messages}>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-[var(--foreground)] focus:px-4 focus:py-2 focus:text-[var(--background)] focus:shadow-lg"
            >
              Skip to main content
            </a>
            <Navigation />
            <main id="main-content" className="mx-auto w-full max-w-5xl px-6 py-8 md:px-8 md:py-10">
              {children}
            </main>
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
