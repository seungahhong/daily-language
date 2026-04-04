import { getTranslations } from 'next-intl/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import StatisticsView from '@/components/statistics/StatisticsView';
import LoginPrompt from '@/components/ui/LoginPrompt';

export default async function StatisticsPage() {
  const session = await getServerSession(authOptions);
  const t = await getTranslations('statistics');

  if (!session?.user?.id) {
    return <LoginPrompt />;
  }

  return (
    <section aria-labelledby="statistics-title">
      <h1 id="statistics-title" className="mb-8 text-3xl font-bold tracking-tight">
        {t('title')}
      </h1>
      <StatisticsView />
    </section>
  );
}
