/**
 * iOS에서는 Safari만 SpeechRecognition을 지원함.
 * iOS Chrome(CriOS), Firefox(FxiOS), Edge(EdgiOS) 등은
 * WebKit 엔진을 사용하지만 STT API가 동작하지 않음.
 */
function isIosNonSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (!isIos) return false;
  // iOS Safari UA에는 "Safari"가 있지만 "CriOS", "FxiOS", "EdgiOS" 등이 없음
  return /CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
}

export function isSttSupported(): boolean {
  if (typeof window === 'undefined') return false;
  if (isIosNonSafari()) return false;
  return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}
