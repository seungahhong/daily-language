'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';

export default function Navigation() {
  const t = useTranslations('nav');
  const pathname = usePathname();

  const links = [
    { href: '/dashboard' as const, label: t('today'), icon: '📚' },
    { href: '/history' as const, label: t('history'), icon: '📋' },
    { href: '/statistics' as const, label: t('statistics'), icon: '📊' },
    { href: '/settings' as const, label: t('settings'), icon: '⚙️' },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--nav-bg)] backdrop-blur-md md:bottom-auto md:top-0 md:border-b md:border-t-0"
      aria-label="Main navigation"
    >
      <div className="mx-auto w-full max-w-5xl px-6 md:px-8">
        <ul className="flex items-center justify-around md:justify-start md:gap-1" role="list">
          {/* Logo / Brand - desktop only */}
          <li className="hidden md:flex md:mr-8">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 py-4 text-base font-semibold tracking-tight"
            >
              Daily Travel Talk
            </Link>
          </li>

          {links.map(({ href, label, icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex flex-col items-center gap-0.5 px-3 py-2.5 text-xs transition-colors md:flex-row md:gap-2 md:rounded-lg md:px-4 md:py-2 md:text-sm ${
                    isActive
                      ? 'text-[var(--foreground)] font-semibold md:bg-[var(--card-bg)]'
                      : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="text-lg md:text-base" aria-hidden="true">
                    {icon}
                  </span>
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
