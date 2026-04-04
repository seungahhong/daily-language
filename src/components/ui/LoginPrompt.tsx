'use client';

import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';

export default function LoginPrompt() {
  const t = useTranslations('dashboard');
  const tc = useTranslations('common');

  return (
    <section className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="mb-4 text-3xl font-bold tracking-tight">{tc('loginRequired')}</h1>
      <p className="mb-8 text-[var(--muted)]">{t('loginRequiredForFeature')}</p>
      <button
        onClick={() => signIn(undefined, { callbackUrl: '/dashboard' })}
        className="rounded-full bg-[var(--foreground)] px-10 py-3.5 text-base font-semibold text-[var(--background)] transition hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
        type="button"
      >
        {tc('signIn')}
      </button>
    </section>
  );
}
