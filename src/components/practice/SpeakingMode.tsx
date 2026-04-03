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

  // Calculate similarity between transcript and original
  const similarity =
    transcript && original
      ? calculateSimilarity(transcript.toLowerCase(), original.toLowerCase())
      : 0;

  return (
    <section
      className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
      aria-label={t('listenAndRepeat')}
    >
      <p className="mb-3 text-sm text-[var(--muted)]">{t('listenAndRepeat')}</p>

      <div className="flex gap-2 mb-4" role="group" aria-label={t('listenAndRepeat')}>
        {ttsSupported && (
          <button
            type="button"
            onClick={handlePlay}
            className="rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20 transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label={t('playAudio')}
          >
            <span aria-hidden="true">🔊 </span>{t('playAudio')}
          </button>
        )}

        {sttSupported ? (
          <button
            type="button"
            onClick={handleRecord}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
              isListening
                ? 'bg-danger/10 text-danger animate-pulse'
                : 'bg-primary/10 text-primary hover:bg-primary/20'
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
          <div className="mb-4">
            <p className="text-sm">
              <span className="font-medium">{t('yourSpeech')}:</span> {transcript}
            </p>
            <div className="mt-1 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
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
        className="w-full rounded-lg border border-primary bg-primary/5 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
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
