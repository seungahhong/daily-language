import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import LandingHero from '@/components/landing/LandingHero';

const BASE_URL = 'https://dailytraveltalk.app';

const pageMeta: Record<string, { title: string; description: string }> = {
  ko: {
    title: 'Daily Travel Talk - AI와 매일 여행 회화 학습',
    description:
      'AI 기반 여행 회화 학습 앱. 매일 새로운 여행 상황별 회화를 연습하고 5개 언어로 실전 표현을 익히세요. 무료로 시작하세요.',
  },
  en: {
    title: 'Daily Travel Talk - Practice Travel Phrases Daily with AI',
    description:
      'AI-powered travel conversation app. Practice new travel scenarios daily and learn practical phrases in 5 languages. Start for free.',
  },
  ja: {
    title: 'Daily Travel Talk - AIで毎日旅行会話を練習',
    description:
      'AI搭載の旅行会話学習アプリ。毎日新しい旅行シーンの会話を練習し、5言語で実践的な表現を学びましょう。無料で始められます。',
  },
  zh: {
    title: 'Daily Travel Talk - 每天与AI练习旅游会话',
    description:
      'AI旅游会话学习应用。每天练习新的旅行场景对话，学习5种语言的实用表达。免费开始使用。',
  },
  de: {
    title: 'Daily Travel Talk - Täglich Reisephrasen mit KI üben',
    description:
      'KI-gestützte Reisekonversations-App. Üben Sie täglich neue Reiseszenarien und lernen Sie praktische Phrasen in 5 Sprachen. Kostenlos starten.',
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const meta = pageMeta[locale] ?? pageMeta.ko;

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `${BASE_URL}/${locale}`,
    },
  };
}

export default async function LandingPage() {
  const t = await getTranslations('landing');

  return (
    <section className="-mx-4 -mt-6">
      <LandingHero
        title={t('title')}
        subtitle={t('subtitle')}
        cta={t('cta')}
        features={[t('feature1'), t('feature2'), t('feature3')]}
      />
    </section>
  );
}
