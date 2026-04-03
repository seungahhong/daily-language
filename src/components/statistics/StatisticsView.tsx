'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type { StatisticsData } from '@/types';
import WeeklyChart from './WeeklyChart';
import MonthlyChart from './MonthlyChart';
import LanguageChart from './LanguageChart';

export default function StatisticsView() {
  const t = useTranslations('statistics');
  const [data, setData] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const res = await fetch('/api/statistics');
      if (res.ok) {
        setData(await res.json());
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <p className="text-center text-[var(--muted)]" role="status" aria-live="polite">
        {t('loading')}
      </p>
    );
  }

  if (!data) {
    return <p className="text-center text-[var(--muted)]">{t('noData')}</p>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <section aria-label={t('summary') || 'Summary'}>
        <dl className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4 text-center">
            <dd className="text-2xl font-bold text-primary">{data.streak}</dd>
            <dt className="mt-1 text-xs text-[var(--muted)]">{t('streak')}</dt>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4 text-center">
            <dd className="text-2xl font-bold text-primary">{data.totalDays}</dd>
            <dt className="mt-1 text-xs text-[var(--muted)]">{t('totalDays')}</dt>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4 text-center">
            <dd className="text-2xl font-bold text-primary">{data.completionRate}%</dd>
            <dt className="mt-1 text-xs text-[var(--muted)]">{t('completionRate')}</dt>
          </div>
        </dl>
      </section>

      {/* Weekly Chart */}
      <section className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4">
        <h2 className="mb-4 text-lg font-semibold">{t('weeklyProgress')}</h2>
        <figure>
          <WeeklyChart data={data.weekly} />
          <figcaption className="sr-only">{t('weeklyProgress')}</figcaption>
        </figure>
      </section>

      {/* Monthly Chart */}
      <section className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4">
        <h2 className="mb-4 text-lg font-semibold">{t('monthlyProgress')}</h2>
        <figure>
          <MonthlyChart data={data.monthly} />
          <figcaption className="sr-only">{t('monthlyProgress')}</figcaption>
        </figure>
      </section>

      {/* Language Chart */}
      {data.byLanguage.length > 0 && (
        <section className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] p-4">
          <h2 className="mb-4 text-lg font-semibold">{t('byLanguage')}</h2>
          <figure>
            <LanguageChart data={data.byLanguage} />
            <figcaption className="sr-only">{t('byLanguage')}</figcaption>
          </figure>
        </section>
      )}
    </div>
  );
}
