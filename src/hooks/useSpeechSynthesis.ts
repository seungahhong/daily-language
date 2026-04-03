'use client';

import { useCallback } from 'react';

const LANGUAGE_VOICE_MAP: Record<string, string> = {
  en: 'en-US',
  ja: 'ja-JP',
  zh: 'zh-CN',
  de: 'de-DE',
  ko: 'ko-KR',
};

export function useSpeechSynthesis() {
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const speak = useCallback(
    (text: string, language: string) => {
      if (!isSupported) return;

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = LANGUAGE_VOICE_MAP[language] || language;
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    },
    [isSupported],
  );

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
    }
  }, [isSupported]);

  return { speak, stop, isSupported };
}
