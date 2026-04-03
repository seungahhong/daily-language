'use client';

import { useTranslations } from 'next-intl';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import type { Practice } from '@prisma/client';

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
    startListening,
    stopListening,
    isSupported: sttSupported,
  } = useSpeechRecognition();

  const handlePlay = () => {
    speak(original, language);
  };

  const handleRecord = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening(language);
    }
  };

  const handleComplete = async () => {
    const res = await fetch('/api/practice', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conversationId, type: 'speaking' }),
    });

    if (res.ok) {
      const data = await res.json();
      onUpdate(data.practice);
    }
  };

  const similarity =
    transcript && original
      ? calculateSimilarity(transcript.toLowerCase(), original.toLowerCase())
      : 0;

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

      <div aria-live="polite" aria-atomic="true">
        {transcript && (
          <div className="mb-5">
            <p className="text-sm">
              <span className="font-medium">{t('yourSpeech')}:</span> {transcript}
            </p>
            <div className="mt-2 h-2 rounded-full bg-[var(--border)]">
              <div
                className={`h-2 rounded-full transition-all ${
                  similarity > 70 ? 'bg-success' : similarity > 40 ? 'bg-warning' : 'bg-danger'
                }`}
                style={{ width: `${similarity}%` }}
                role="progressbar"
                aria-valuenow={similarity}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${t('similarity')}: ${similarity}%`}
              />
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleComplete}
        className="w-full rounded-xl bg-[var(--foreground)] px-4 py-2.5 text-sm font-medium text-[var(--background)] transition hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
      >
        {t('iReadIt')}
      </button>
    </section>
  );
}

function calculateSimilarity(a: string, b: string): number {
  if (a === b) return 100;
  if (!a || !b) return 0;

  const aWords = a.split(/\s+/);
  const bWords = b.split(/\s+/);
  let matches = 0;

  for (const word of aWords) {
    if (bWords.some((bw) => bw.includes(word) || word.includes(bw))) {
      matches++;
    }
  }

  return Math.round((matches / Math.max(aWords.length, bWords.length)) * 100);
}
