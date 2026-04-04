'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import type { Practice } from '@prisma/client';

const TIMEOUT_SECONDS = 15;

interface SpeakingModeProps {
  conversationId: string;
  original: string;
  language: string;
  onUpdate: (practice: Practice) => void;
}

export default function SpeakingMode({
  conversationId,
  original,
  language,
  onUpdate,
}: SpeakingModeProps) {
  const t = useTranslations('practice');
  const { speak, isSupported: ttsSupported } = useSpeechSynthesis();
  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    isSupported: sttSupported,
  } = useSpeechRecognition();

  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(TIMEOUT_SECONDS);
  const hasAutoCompletedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const displayText = transcript || interimTranscript;
  const similarity = displayText
    ? calculateSimilarity(displayText.toLowerCase(), original.toLowerCase())
    : 0;

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  // 유사도 80% 이상이면 자동 완료
  useEffect(() => {
    if (transcript && similarity >= 80 && !hasAutoCompletedRef.current) {
      hasAutoCompletedRef.current = true;
      clearTimers();
      stopListening();
      handleComplete();
    }
  }, [transcript, similarity]); // eslint-disable-line react-hooks/exhaustive-deps

  // 15초 타이머 + 카운트다운
  useEffect(() => {
    if (isListening) {
      setTimedOut(false);
      setRemainingSeconds(TIMEOUT_SECONDS);

      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) return 0;
          return prev - 1;
        });
      }, 1000);

      timeoutRef.current = setTimeout(() => {
        clearTimers();
        stopListening();
        setTimedOut(true);
      }, TIMEOUT_SECONDS * 1000);
    } else {
      clearTimers();
    }

    return clearTimers;
  }, [isListening, stopListening, clearTimers]);

  const handlePlay = () => {
    speak(original, language);
  };

  const handleRecord = () => {
    if (isListening) {
      stopListening();
    } else {
      hasAutoCompletedRef.current = false;
      setCompleted(false);
      setTimedOut(false);
      startListening(language);
    }
  };

  const handleComplete = async () => {
    if (completing) return;
    setCompleting(true);

    try {
      const res = await fetch('/api/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, type: 'speaking' }),
      });

      if (res.ok) {
        const data = await res.json();
        setCompleted(true);
        onUpdate(data.practice);
      }
    } finally {
      setCompleting(false);
    }
  };

  return (
    <section
      className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--background)] p-5"
      aria-label={t('listenAndRepeat')}
    >
      <p className="mb-4 text-sm text-[var(--muted)]">{t('listenAndRepeat')}</p>

      <div className="flex gap-3 mb-5" role="group" aria-label={t('listenAndRepeat')}>
        {ttsSupported && (
          <button
            type="button"
            onClick={handlePlay}
            className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-medium transition hover:bg-[var(--card-bg-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
            aria-label={t('playAudio')}
          >
            <span aria-hidden="true">🔊 </span>{t('playAudio')}
          </button>
        )}

        {sttSupported ? (
          <button
            type="button"
            onClick={handleRecord}
            className={`rounded-xl px-4 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-offset-2 focus:ring-offset-[var(--background)] ${
              isListening
                ? 'bg-danger/10 text-danger animate-pulse'
                : 'border border-[var(--border)] hover:bg-[var(--card-bg-hover)]'
            }`}
            aria-label={isListening ? t('recording') : t('startRecording')}
            aria-pressed={isListening}
          >
            <span aria-hidden="true">🎤 </span>{isListening ? t('recording') : t('startRecording')}
          </button>
        ) : null}
      </div>

      {/* 카운트다운 타이머 */}
      {isListening && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-[var(--muted)]">{t('remainingTime')}</span>
            <span className={`text-xs font-semibold ${remainingSeconds <= 5 ? 'text-danger' : 'text-[var(--muted)]'}`}>
              {remainingSeconds}{t('seconds')}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--border)]">
            <div
              className={`h-1.5 rounded-full transition-all duration-1000 ease-linear ${
                remainingSeconds <= 5 ? 'bg-danger' : 'bg-[var(--foreground)]/30'
              }`}
              style={{ width: `${(remainingSeconds / TIMEOUT_SECONDS) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div aria-live="polite" aria-atomic="true">
        {displayText && (
          <div className="mb-5">
            <p className="text-sm">
              <span className="font-medium">{t('yourSpeech')}:</span>{' '}
              <span>{transcript}</span>
              {interimTranscript && (
                <span className="text-[var(--muted)] italic">{interimTranscript}</span>
              )}
            </p>
            <div className="mt-2 h-2 rounded-full bg-[var(--border)]">
              <div
                className={`h-2 rounded-full transition-all ${
                  similarity >= 80 ? 'bg-success' : similarity > 40 ? 'bg-warning' : 'bg-danger'
                }`}
                style={{ width: `${similarity}%` }}
                role="progressbar"
                aria-valuenow={similarity}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${t('similarity')}: ${similarity}%`}
              />
            </div>
            <p className="mt-1 text-xs text-[var(--muted)]">{t('similarity')}: {similarity}%</p>
          </div>
        )}
        {timedOut && !isListening && similarity < 100 && (
          <p className="mb-5 text-sm font-medium text-warning" role="alert">
            {t('timeout')}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => {
          if (completed && similarity < 100) {
            setCompleted(false);
            hasAutoCompletedRef.current = false;
            startListening(language);
          } else {
            handleComplete();
          }
        }}
        disabled={completing || (completed && similarity === 100)}
        className={`w-full rounded-xl px-4 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-offset-2 focus:ring-offset-[var(--background)] ${
          completed && similarity === 100
            ? 'bg-success/10 text-success border border-success/30'
            : completed && similarity > 0
              ? 'bg-warning/10 text-warning border border-warning/30 hover:opacity-80'
              : 'bg-[var(--foreground)] text-[var(--background)] hover:opacity-80'
        } disabled:opacity-60`}
      >
        {completing
          ? t('iReadIt') + '...'
          : completed && similarity === 100
            ? t('correct')
            : completed && similarity > 0
              ? t('tryAgain')
              : t('iReadIt')}
      </button>
    </section>
  );
}

function calculateSimilarity(a: string, b: string): number {
  if (a === b) return 100;
  if (!a || !b) return 0;

  // 구두점 제거 후 비교
  const clean = (s: string) => s.replace(/[.,!?;:'"()-]/g, '').trim();
  const cleanA = clean(a);
  const cleanB = clean(b);

  if (cleanA === cleanB) return 100;

  const aWords = cleanA.split(/\s+/);
  const bWords = cleanB.split(/\s+/);

  // 정확한 단어 매칭만 허용 (부분 문자열 매칭 제외)
  const bWordsCopy = [...bWords];
  let matches = 0;

  for (const word of aWords) {
    const idx = bWordsCopy.indexOf(word);
    if (idx !== -1) {
      matches++;
      bWordsCopy.splice(idx, 1); // 중복 매칭 방지
    }
  }

  return Math.round((matches / Math.max(aWords.length, bWords.length)) * 100);
}
