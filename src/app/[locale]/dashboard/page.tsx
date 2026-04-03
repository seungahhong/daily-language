import { getTranslations } from 'next-intl/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import ConversationCard from '@/components/conversation/ConversationCard';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'View your daily travel conversations and track your learning progress.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const t = await getTranslations('dashboard');

  if (!session?.user?.id) {
    redirect('/');
  }

  const settings = await prisma.userSettings.findUnique({
    where: { userId: session.user.id },
  });

  if (!settings?.onboardingCompleted) {
    redirect('/settings');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const conversations = await prisma.conversation.findMany({
    where: {
      date: today,
      language: { in: settings.learningLanguages },
      difficulty: settings.difficulty,
    },
    include: {
      practices: {
        where: { userId: session.user.id },
      },
    },
    take: 3,
    orderBy: { createdAt: 'asc' },
  });

  const completedCount = conversations.filter(
    (c) => c.practices.length > 0 && c.practices[0].isCompleted,
  ).length;

  return (
    <section aria-labelledby="dashboard-title">
      <header className="mb-6">
        <h1 id="dashboard-title" className="text-2xl font-bold">
          {t('title')}
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {completedCount === conversations.length && conversations.length > 0
            ? t('allCompleted')
            : t('progress', { current: completedCount, total: conversations.length })}
        </p>
      </header>

      {conversations.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-8 text-center">
          <p className="text-[var(--muted)]">{t('noConversations')}</p>
        </div>
      ) : (
        <ul className="space-y-4" role="list">
          {conversations.map((conversation) => (
            <li key={conversation.id}>
              <ConversationCard
                conversation={conversation}
                practice={conversation.practices[0] || null}
                uiLanguage={settings.uiLanguage}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
