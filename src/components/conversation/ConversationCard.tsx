'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type { Conversation, Practice } from '@prisma/client';
import SpeakingMode from '@/components/practice/SpeakingMode';
import QuizMode from '@/components/practice/QuizMode';

/**
 * iOS Chrome에서는 webkitSpeechRecognition이 window에 존재하지만
 * 실제 start() 호출 시 에러가 발생함. 실제 동작 여부를 테스트해서 판별.
 */
function useSttSupported() {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const SpeechRecognition =
      (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    try {
      const recognition = new (SpeechRecognition as new () => { start: () => void; stop: () => void; abort: () => void; onerror: ((e: { error: string }) => void) | null; onend: (() => void) | null })();
      recognition.onerror = (e) => {
        // 'not-allowed' = 권한 거부 (사용자가 허용 가능), 'aborted' = 우리가 중단함
        // 이 외의 에러('service-not-available' 등)는 미지원으로 간주
        if (e.error === 'not-allowed' || e.error === 'aborted') {
          setSupported(true);
        } else {
          setSupported(false);
        }
      };
      recognition.onend = () => {};
      recognition.start();
      // 즉시 중단 — 테스트 목적
      setTimeout(() => {
        try { recognition.abort(); } catch {}
      }, 100);
      // start()가 throw 없이 실행되면 일단 지원으로 간주
      setSupported(true);
    } catch {
      setSupported(false);
    }
  }, []);

  return supported;
}

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
  const [showExplanation, setShowExplanation] = useState(false);
  const sttSupported = useSttSupported();

  const translation = (conversation.translation as Record<string, string>)?.[uiLanguage] || '';
  const situationLabel = (conversation.situationTranslation as Record<string, string> | null)?.[uiLanguage] || conversation.situation;
  const explanationWords = conversation.explanation as { word: string; meaning: Record<string, string> }[] | null;
  const grammarNote = (conversation.grammarNote as Record<string, string> | null)?.[uiLanguage] || '';
  const isCompleted = practice?.isCompleted || false;
  const speakingCount = practice?.speakingCount || 0;
  const quizCount = practice?.quizCount || 0;
  const quizGoal = sttSupported ? 2 : 5;

  // 원문과 번역이 동일한 경우(같은 언어) 번역 숨김
  const showTranslation = translation && translation.toLowerCase() !== conversation.original.toLowerCase();

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
            {situationLabel}
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
        {showTranslation && (
          <p className="text-sm text-[var(--muted)]">{translation}</p>
        )}
        {conversation.pronunciation && !['en', 'de'].includes(conversation.language) && (
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

        {/* 설명 더보기 */}
        {explanationWords && explanationWords.length > 0 && (
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowExplanation(!showExplanation)}
              className="flex items-center gap-1 py-2 text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition cursor-pointer"
              aria-expanded={showExplanation}
            >
              <span className={`inline-block transition-transform duration-200 ${showExplanation ? 'rotate-90' : ''}`}>▶</span>
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

      <div className="mb-4 flex gap-2 text-xs text-[var(--muted)]">
        {sttSupported && (
          <>
            <span>{tPractice('speakingCount', { count: speakingCount })}</span>
            <span>|</span>
          </>
        )}
        <span>{tPractice('quizCount', { count: quizCount })}</span>
      </div>

      {!isCompleted && (
        <div className="flex gap-3">
          {sttSupported && (
            <button
              type="button"
              onClick={() => setActiveMode(activeMode === 'speaking' ? null : 'speaking')}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition cursor-pointer ${
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
          )}
          <button
            type="button"
            onClick={() => setActiveMode(activeMode === 'quiz' ? null : 'quiz')}
            className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition cursor-pointer ${
              activeMode === 'quiz'
                ? 'bg-[var(--foreground)] text-[var(--background)]'
                : 'border border-[var(--border)] hover:bg-[var(--card-bg-hover)]'
            }`}
            disabled={quizCount >= quizGoal}
            aria-expanded={activeMode === 'quiz'}
            aria-label={
              quizCount >= quizGoal
                ? `${tPractice('quiz')} - ${t('situation')} ✓`
                : tPractice('quiz')
            }
          >
            {tPractice('quiz')}{' '}
            {quizCount >= quizGoal && <span aria-hidden="true">✓</span>}
          </button>
        </div>
      )}

      {sttSupported && activeMode === 'speaking' && (
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
