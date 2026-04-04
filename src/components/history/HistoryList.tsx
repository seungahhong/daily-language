'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import type { ConversationWithPractice } from '@/types';

const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  ja: '日本語',
  zh: '中文',
  de: 'Deutsch',
};

export default function HistoryList() {
  const t = useTranslations('history');
  const locale = useLocale();
  const [conversations, setConversations] = useState<ConversationWithPractice[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '10' });
    if (language) params.set('language', language);

    const res = await fetch(`/api/conversations/history?${params}`);
    if (res.ok) {
      const data = await res.json();
      setConversations(data.conversations);
      setTotal(data.total);
    }
    setLoading(false);
  }, [page, language]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (language) params.set('language', language);
      const res = await fetch(`/api/conversations/history?${params}`);
      if (res.ok && !cancelled) {
        const data = await res.json();
        setConversations(data.conversations);
        setTotal(data.total);
      }
      if (!cancelled) setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [page, language]);

  const toggleCompletion = async (practiceId: string, currentStatus: boolean) => {
    const res = await fetch(`/api/practice/${practiceId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isCompleted: !currentStatus }),
    });

    if (res.ok) {
      fetchHistory();
    }
  };

  const totalPages = Math.ceil(total / 10);

  return (
    <div>
      <fieldset className="mb-6">
        <label htmlFor="language-filter" className="sr-only">
          {t('filterByLanguage')}
        </label>
        <select
          id="language-filter"
          value={language}
          onChange={(e) => {
            setLanguage(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] px-4 py-2.5 text-sm focus:border-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
        >
          <option value="">{t('filterByLanguage')}</option>
          {Object.entries(LANGUAGE_LABELS).map(([code, label]) => (
            <option key={code} value={code}>
              {label}
            </option>
          ))}
        </select>
      </fieldset>

      {loading ? (
        <p className="text-center text-[var(--muted)]" role="status" aria-live="polite">
          {t('loading')}
        </p>
      ) : conversations.length === 0 ? (
        <p className="text-center text-[var(--muted)] py-12">{t('noHistory')}</p>
      ) : (
        <>
          <ul className="space-y-4" role="list">
            {conversations.map((conv) => {
              const practice = conv.practices[0];
              const isCompleted = practice?.isCompleted || false;

              return (
                <li
                  key={conv.id}
                >
                  <article
                    className={`rounded-2xl border p-5 transition ${
                      isCompleted
                        ? 'border-success/30 bg-success/5'
                        : 'border-[var(--border)] bg-[var(--card-bg)]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <header className="flex items-center gap-2 mb-2">
                          <span className="rounded-md bg-[var(--foreground)]/8 px-2 py-0.5 text-xs">
                            {LANGUAGE_LABELS[conv.language] || conv.language}
                          </span>
                          <time className="text-xs text-[var(--muted)]" dateTime={new Date(conv.date).toISOString()}>
                            {new Date(conv.date).toLocaleDateString()}
                          </time>
                        </header>
                        <p className="font-medium">{conv.original}</p>
                        <p className="text-sm text-[var(--muted)] mt-1">{(conv.situationTranslation as Record<string, string> | null)?.[locale] || conv.situation}</p>
                      </div>

                      {practice && (
                        <button
                          type="button"
                          onClick={() => toggleCompletion(practice.id, isCompleted)}
                          className={`shrink-0 rounded-xl px-4 py-2 text-xs font-medium transition ${
                            isCompleted
                              ? 'bg-success/10 text-success hover:bg-success/20'
                              : 'border border-[var(--border)] text-[var(--muted)] hover:bg-[var(--card-bg-hover)]'
                          }`}
                          aria-label={t('toggleStatus')}
                        >
                          {isCompleted ? t('completed') : t('notCompleted')}
                        </button>
                      )}
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>

          {totalPages > 1 && (
            <nav className="mt-8 flex justify-center gap-3" aria-label="Pagination">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-offset-2 focus:ring-offset-[var(--background)] hover:bg-[var(--card-bg-hover)]"
                aria-label={t('previousPage')}
              >
                <span aria-hidden="true">←</span>
              </button>
              <span className="flex items-center px-3 text-sm text-[var(--muted)]" aria-current="page">
                {t('pageInfo', { current: page, total: totalPages })}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-offset-2 focus:ring-offset-[var(--background)] hover:bg-[var(--card-bg-hover)]"
                aria-label={t('nextPage')}
              >
                <span aria-hidden="true">→</span>
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
