import { getTranslations } from 'next-intl/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import HistoryList from '@/components/history/HistoryList';

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);
  const t = await getTranslations('history');

  if (!session?.user?.id) {
    redirect('/');
  }

  return (
    <section aria-labelledby="history-title">
      <h1 id="history-title" className="mb-8 text-3xl font-bold tracking-tight">
        {t('title')}
      </h1>
      <HistoryList />
    </section>
  );
}
