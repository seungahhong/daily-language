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
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-[var(--background)] border-[var(--border)]"
      aria-label="Main navigation"
    >
      <ul className="flex justify-around items-center h-16 max-w-lg mx-auto" role="list">
        {links.map(({ href, label, icon }) => {
          const isActive = pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg ${
                  isActive ? 'text-primary font-semibold' : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="text-xl" aria-hidden="true">
                  {icon}
                </span>
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
