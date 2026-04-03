import { getTranslations } from 'next-intl/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import SettingsForm from '@/components/settings/SettingsForm';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  const t = await getTranslations('settings');

  if (!session?.user?.id) {
    redirect('/');
  }

  const settings = await prisma.userSettings.findUnique({
    where: { userId: session.user.id },
  });

  const isOnboarding = !settings?.onboardingCompleted;

  return (
    <section aria-labelledby="settings-title">
      <h1 id="settings-title" className="mb-8 text-3xl font-bold tracking-tight">
        {isOnboarding ? t('onboarding.welcome') : t('title')}
      </h1>
      {isOnboarding && (
        <p className="mb-6 text-[var(--muted)]">{t('onboarding.setupMessage')}</p>
      )}
      <SettingsForm
        initialSettings={
          settings || {
            learningLanguages: [],
            uiLanguage: 'ko',
            difficulty: 'low',
            darkMode: false,
          }
        }
        isOnboarding={isOnboarding}
      />
    </section>
  );
}
