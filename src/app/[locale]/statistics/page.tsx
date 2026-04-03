import { getTranslations } from 'next-intl/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import StatisticsView from '@/components/statistics/StatisticsView';

export default async function StatisticsPage() {
  const session = await getServerSession(authOptions);
  const t = await getTranslations('statistics');

  if (!session?.user?.id) {
    redirect('/');
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
