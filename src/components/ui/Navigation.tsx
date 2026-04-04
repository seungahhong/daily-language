'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useTheme } from 'next-themes';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useState, useEffect, useRef, useSyncExternalStore } from 'react';
import { routing } from '@/i18n/routing';

const LOCALE_LABELS: Record<string, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
  zh: '中文',
  de: 'Deutsch',
};

const emptySubscribe = () => () => {};

export default function Navigation() {
  const t = useTranslations('nav');
  const tc = useTranslations('common');
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const links = [
    { href: '/dashboard' as const, label: t('today'), icon: '📚' },
    { href: '/history' as const, label: t('history'), icon: '📋' },
    { href: '/statistics' as const, label: t('statistics'), icon: '📊' },
    { href: '/settings' as const, label: t('settings'), icon: '⚙️' },
  ];

  // Get current locale from the full pathname in the URL
  const currentLocale = typeof window !== 'undefined'
    ? window.location.pathname.split('/')[1] || 'ko'
    : 'ko';

  const handleLocaleChange = (locale: string) => {
    router.replace(pathname, { locale });
    setLangOpen(false);
  };

  return (
    <>
      {/* Top header bar - always visible on both mobile and desktop */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--border)] bg-[var(--nav-bg)] backdrop-blur-md">
        <div className="mx-auto w-full max-w-5xl px-4 md:px-8">
          <div className="flex h-14 items-center justify-between">
            {/* Left: Brand */}
            <Link
              href="/dashboard"
              className="text-base font-semibold tracking-tight"
            >
              Daily Travel Talk
            </Link>

            {/* Center: Nav links - desktop only */}
            <ul className="hidden md:flex md:items-center md:gap-1" role="list">
              {links.map(({ href, label, icon }) => {
                const isActive = pathname.startsWith(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors ${
                        isActive
                          ? 'text-[var(--foreground)] font-semibold bg-[var(--card-bg)]'
                          : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <span className="text-base" aria-hidden="true">{icon}</span>
                      <span>{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Right: Language + Dark mode + Login */}
            <div className="flex items-center gap-2">
              {/* Language selector */}
              <div className="relative" ref={langRef}>
                <button
                  type="button"
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg)] transition"
                  aria-label="Change language"
                  aria-expanded={langOpen}
                >
                  <span aria-hidden="true">🌐</span>
                  <span className="hidden sm:inline">{LOCALE_LABELS[currentLocale] || currentLocale}</span>
                </button>
                {langOpen && (
                  <div className="absolute right-0 top-full mt-1 w-32 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] py-1 shadow-lg">
                    {routing.locales.map((locale) => (
                      <button
                        key={locale}
                        type="button"
                        onClick={() => handleLocaleChange(locale)}
                        className={`w-full px-4 py-2 text-left text-sm transition hover:bg-[var(--card-bg-hover)] ${
                          currentLocale === locale ? 'font-semibold text-[var(--foreground)]' : 'text-[var(--muted)]'
                        }`}
                      >
                        {LOCALE_LABELS[locale]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Dark mode toggle */}
              {mounted && (
                <button
                  type="button"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="rounded-lg p-1.5 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg)] transition"
                  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {theme === 'dark' ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                  )}
                </button>
              )}

              {/* Login/Logout */}
              {session ? (
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg)] transition"
                >
                  {tc('signOut')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => signIn(undefined, { callbackUrl: '/dashboard' })}
                  className="rounded-lg bg-[var(--foreground)] px-3 py-1.5 text-xs font-medium text-[var(--background)] transition hover:opacity-80"
                >
                  {tc('signIn')}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Bottom nav - mobile only */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--nav-bg)] backdrop-blur-md md:hidden"
        aria-label="Main navigation"
      >
        <div className="mx-auto w-full max-w-5xl px-6">
          <ul className="flex items-center justify-around" role="list">
            {links.map(({ href, label, icon }) => {
              const isActive = pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={`flex flex-col items-center gap-0.5 px-3 py-2.5 text-xs transition-colors ${
                      isActive
                        ? 'text-[var(--foreground)] font-semibold'
                        : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <span className="text-lg" aria-hidden="true">{icon}</span>
                    <span>{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </>
  );
}
