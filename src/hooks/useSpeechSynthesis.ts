'use client';

import { useCallback, useEffect, useRef } from 'react';

const LANGUAGE_VOICE_MAP: Record<string, string> = {
  en: 'en-US',
  ja: 'ja-JP',
  zh: 'zh-CN',
  de: 'de-DE',
  ko: 'ko-KR',
};

// 자연스러운 음성을 우선 선택하기 위한 키워드
const PREFERRED_VOICE_KEYWORDS = ['samantha', 'karen', 'alex', 'daniel', 'google', 'natural', 'enhanced'];

export function useSpeechSynthesis() {
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const voicesCacheRef = useRef<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      voicesCacheRef.current = window.speechSynthesis.getVoices();
    };

    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
  }, [isSupported]);

  const findBestVoice = useCallback((lang: string): SpeechSynthesisVoice | undefined => {
    const voices = voicesCacheRef.current;
    const targetLang = LANGUAGE_VOICE_MAP[lang] || lang;

    const matchingVoices = voices.filter((v) => v.lang.startsWith(targetLang.split('-')[0]));
    if (matchingVoices.length === 0) return undefined;

    // 자연스러운 음성 우선 선택
    for (const keyword of PREFERRED_VOICE_KEYWORDS) {
      const found = matchingVoices.find((v) => v.name.toLowerCase().includes(keyword));
      if (found) return found;
    }

    // 로컬 음성 우선 (네트워크 음성보다 품질이 좋은 경우가 많음)
    const localVoice = matchingVoices.find((v) => v.localService);
    if (localVoice) return localVoice;

    return matchingVoices[0];
  }, []);

  const speak = useCallback(
    (text: string, language: string) => {
      if (!isSupported) return;

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = LANGUAGE_VOICE_MAP[language] || language;
      utterance.rate = 0.85;
      utterance.pitch = 1.0;

      const voice = findBestVoice(language);
      if (voice) {
        utterance.voice = voice;
      }

      window.speechSynthesis.speak(utterance);
    },
    [isSupported, findBestVoice],
  );

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
    }
  }, [isSupported]);

  return { speak, stop, isSupported };
}
