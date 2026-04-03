'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Conversation, Practice } from '@prisma/client';
import SpeakingMode from '@/components/practice/SpeakingMode';
import QuizMode from '@/components/practice/QuizMode';

interface ConversationCardProps {
  conversation: Conversation;
  practice: Practice | null;
  uiLanguage: string;
}

export default function ConversationCard({
  conversation,
  practice: initialPractice,
  uiLanguage,
}: ConversationCardProps) {
  const t = useTranslations('dashboard');
  const tPractice = useTranslations('practice');
  const [practice, setPractice] = useState(initialPractice);
  const [activeMode, setActiveMode] = useState<'speaking' | 'quiz' | null>(null);

  const translation = (conversation.translation as Record<string, string>)?.[uiLanguage] || '';
  const isCompleted = practice?.isCompleted || false;
  const speakingCount = practice?.speakingCount || 0;
  const quizCount = practice?.quizCount || 0;

  const handlePracticeUpdate = (updated: Practice) => {
    setPractice(updated);
  };

  return (
    <article
      className={`rounded-2xl border p-5 md:p-6 transition ${
        isCompleted
          ? 'border-success/30 bg-success/5'
          : 'border-[var(--border)] bg-[var(--card-bg)]'
      }`}
    >
      <header className="mb-4">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-[var(--foreground)]/8 px-3 py-1 text-xs font-medium">
            {conversation.situation}
          </span>
          {isCompleted && (
            <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success" role="status">
              {t('situation')} <span aria-hidden="true">✓</span>
              <span className="sr-only">{t('situation')} completed</span>
            </span>
          )}
        </div>
      </header>

      <div className="mb-5 space-y-2">
        <p className="text-xl font-semibold tracking-tight">{conversation.original}</p>
        <p className="text-sm text-[var(--muted)]">{translation}</p>
        {conversation.pronunciation && (
          <p className="text-xs text-[var(--muted)] italic">{conversation.pronunciation}</p>
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
      </div>

      <div className="mb-4 flex gap-2 text-xs text-[var(--muted)]">
        <span>{tPractice('speakingCount', { count: speakingCount })}</span>
        <span>|</span>
        <span>{tPractice('quizCount', { count: quizCount })}</span>
      </div>

      {!isCompleted && (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setActiveMode(activeMode === 'speaking' ? null : 'speaking')}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
              activeMode === 'speaking'
                ? 'bg-[var(--foreground)] text-[var(--background)]'
                : 'border border-[var(--border)] hover:bg-[var(--card-bg-hover)]'
            }`}
            disabled={speakingCount >= 3}
            aria-expanded={activeMode === 'speaking'}
            aria-label={
              speakingCount >= 3
                ? `${tPractice('speaking')} - ${t('situation')} ✓`
                : tPractice('speaking')
            }
          >
            {tPractice('speaking')}{' '}
            {speakingCount >= 3 && <span aria-hidden="true">✓</span>}
          </button>
          <button
            type="button"
            onClick={() => setActiveMode(activeMode === 'quiz' ? null : 'quiz')}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
              activeMode === 'quiz'
                ? 'bg-[var(--foreground)] text-[var(--background)]'
                : 'border border-[var(--border)] hover:bg-[var(--card-bg-hover)]'
            }`}
            disabled={quizCount >= 2}
            aria-expanded={activeMode === 'quiz'}
            aria-label={
              quizCount >= 2
                ? `${tPractice('quiz')} - ${t('situation')} ✓`
                : tPractice('quiz')
            }
          >
            {tPractice('quiz')}{' '}
            {quizCount >= 2 && <span aria-hidden="true">✓</span>}
          </button>
        </div>
      )}

      {activeMode === 'speaking' && (
        <SpeakingMode
          conversationId={conversation.id}
          original={conversation.original}
          language={conversation.language}
          onUpdate={handlePracticeUpdate}
        />
      )}

      {activeMode === 'quiz' && (
        <QuizMode
          conversationId={conversation.id}
          original={conversation.original}
          keywords={conversation.keywords}
          onUpdate={handlePracticeUpdate}
        />
      )}
    </article>
  );
}
