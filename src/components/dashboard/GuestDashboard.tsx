'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type { GeneratedConversation } from '@/lib/groq';

function GuestConversationCard({
  conversation,
  uiLanguage,
}: {
  conversation: GeneratedConversation;
  uiLanguage: string;
}) {
  const t = useTranslations('dashboard');
  const [showExplanation, setShowExplanation] = useState(false);

  const translation = (conversation.translation as Record<string, string>)?.[uiLanguage] || '';
  const situationLabel = (conversation.situationTranslation as Record<string, string> | undefined)?.[uiLanguage] || conversation.situation;
  const explanationWords = conversation.explanation as { word: string; meaning: Record<string, string> }[];
  const grammarNote = (conversation.grammarNote as Record<string, string> | undefined)?.[uiLanguage] || '';

  const showTranslation = translation && translation.toLowerCase() !== conversation.original.toLowerCase();

  return (
    <article className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-5 md:p-6">
      <header className="mb-4">
        <span className="rounded-full bg-[var(--foreground)]/8 px-3 py-1 text-xs font-medium">
          {situationLabel}
        </span>
      </header>
      <div className="space-y-2">
        <p className="text-xl font-semibold tracking-tight">{conversation.original}</p>
        {showTranslation && (
          <p className="text-sm text-[var(--muted)]">{translation}</p>
        )}
        {conversation.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {conversation.keywords.map((kw) => (
              <span
                key={kw}
                className="rounded-md bg-[var(--foreground)]/5 px-2 py-0.5 text-xs text-[var(--muted)]"
              >
                {kw}
              </span>
            ))}
          </div>
        )}

        {/* 설명 더보기 */}
        {explanationWords && explanationWords.length > 0 && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowExplanation(!showExplanation)}
              className="flex items-center gap-1 text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition"
              aria-expanded={showExplanation}
            >
              <span className={`inline-block transition-transform ${showExplanation ? 'rotate-90' : ''}`}>▶</span>
              {t('explanation')}
            </button>
            {showExplanation && (
              <div className="mt-3 rounded-xl bg-[var(--foreground)]/3 px-4 py-3 text-sm leading-relaxed">
                <ul className="space-y-1.5">
                  {explanationWords.map((item, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="font-semibold text-[var(--foreground)] shrink-0">{item.word}</span>
                      <span className="text-[var(--muted)]">—</span>
                      <span className="text-[var(--foreground)]/80">{item.meaning?.[uiLanguage] || ''}</span>
                    </li>
                  ))}
                </ul>
                {grammarNote && (
                  <p className="mt-3 pt-3 border-t border-[var(--border)] text-xs text-[var(--muted)]">
                    {grammarNote}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default function GuestDashboard() {
  const t = useTranslations('dashboard');
  const [conversations, setConversations] = useState<GeneratedConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [uiLanguage, setUiLanguage] = useState('ko');

  useEffect(() => {
    const locale = window.location.pathname.split('/')[1] || 'ko';
    setUiLanguage(locale);

    async function fetchConversations() {
      try {
        const res = await fetch('/api/guest-conversations?language=en&difficulty=low');
        if (res.ok) {
          const data = await res.json();
          setConversations(data.conversations || []);
        }
      } catch {
        // fail silently
      } finally {
        setLoading(false);
      }
    }
    fetchConversations();
  }, []);

  return (
    <section aria-labelledby="dashboard-title">
      <header className="mb-8">
        <h1 id="dashboard-title" className="text-3xl font-bold tracking-tight">
          {t('title')}
        </h1>
        <p className="mt-2 text-sm text-[var(--accent)]">
          {t('loginNotice')}
        </p>
      </header>

      {loading ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-12 text-center">
          <p className="text-[var(--muted)]">{t('loading')}</p>
        </div>
      ) : conversations.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-12 text-center">
          <p className="text-[var(--muted)]">{t('noConversations')}</p>
        </div>
      ) : (
        <ul className="space-y-5" role="list">
          {conversations.map((conversation, index) => (
            <li key={index}>
              <GuestConversationCard conversation={conversation} uiLanguage={uiLanguage} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
