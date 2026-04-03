'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { Practice } from '@prisma/client';

interface QuizModeProps {
  conversationId: string;
  original: string;
  keywords: string[];
  onUpdate: (practice: Practice) => void;
}

export default function QuizMode({ conversationId, original, keywords, onUpdate }: QuizModeProps) {
  const t = useTranslations('practice');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const [keywordIndex] = useState(() =>
    keywords.length > 0 ? Math.floor(Math.random() * keywords.length) : 0,
  );

  const { blankedText, correctAnswer } = useMemo(() => {
    if (keywords.length === 0) {
      return { blankedText: original, correctAnswer: '' };
    }

    const keyword = keywords[keywordIndex % keywords.length];
    const blanked = original.replace(new RegExp(escapeRegExp(keyword), 'i'), '______');
    return { blankedText: blanked, correctAnswer: keyword };
  }, [original, keywords, keywordIndex]);

  const handleCheck = async () => {
    const isCorrect = answer.trim().toLowerCase() === correctAnswer.toLowerCase();
    setFeedback(isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) {
      const res = await fetch('/api/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, type: 'quiz' }),
      });

      if (res.ok) {
        const data = await res.json();
        onUpdate(data.practice);
        setAnswer('');
        setFeedback(null);
      }
    }
  };

  return (
    <section
      className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--background)] p-5"
      aria-label={t('fillInBlank')}
    >
      <p className="mb-4 text-sm text-[var(--muted)]" id={`quiz-desc-${conversationId}`}>
        {t('fillInBlank')}
      </p>

      <p className="mb-5 text-xl font-medium tracking-tight" aria-label={blankedText}>
        {blankedText}
      </p>

      <div className="flex gap-3">
        <label className="sr-only" htmlFor={`quiz-${conversationId}`}>
          {t('fillInBlank')}
        </label>
        <input
          id={`quiz-${conversationId}`}
          type="text"
          value={answer}
          onChange={(e) => {
            setAnswer(e.target.value);
            setFeedback(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCheck();
          }}
          className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-2.5 text-sm focus:border-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
          placeholder={correctAnswer.charAt(0) + '...'}
          autoComplete="off"
          aria-describedby={`quiz-desc-${conversationId}`}
          aria-invalid={feedback === 'incorrect' ? true : undefined}
        />
        <button
          type="button"
          onClick={handleCheck}
          disabled={!answer.trim()}
          className="rounded-xl bg-[var(--foreground)] px-5 py-2.5 text-sm font-medium text-[var(--background)] transition hover:opacity-80 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
        >
          {t('checkAnswer')}
        </button>
      </div>

      {feedback && (
        <p
          className={`mt-3 text-sm font-medium ${
            feedback === 'correct' ? 'text-success' : 'text-danger'
          }`}
          role="alert"
          aria-live="assertive"
        >
          {feedback === 'correct' ? t('correct') : `${t('incorrect')} (${correctAnswer})`}
        </p>
      )}
    </section>
  );
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
