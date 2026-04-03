'use client';

import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';

export default function LoginPrompt() {
  const t = useTranslations('dashboard');
  const tc = useTranslations('common');

  return (
    <section className="flex flex-col items-center justify-center py-20 text-center">
      <h1 className="mb-4 text-2xl font-bold">{t('title')}</h1>
      <p className="mb-6 text-[var(--muted)]">{tc('loginRequired')}</p>
      <button
        onClick={() => signIn()}
        className="rounded-full bg-primary px-8 py-3 text-lg font-semibold text-white shadow-lg transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        type="button"
      >
        {tc('signIn')}
      </button>
    </section>
  );
}
