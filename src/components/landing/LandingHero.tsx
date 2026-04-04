'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from '@/i18n/routing';
import { useEffect, useState } from 'react';

interface LandingHeroProps {
  title: string;
  subtitle: string;
  cta: string;
  features: string[];
}

export default function LandingHero({ title, subtitle, cta, features }: LandingHeroProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [bgImage, setBgImage] = useState('');

  useEffect(() => {
    if (session) {
      router.push('/dashboard');
    }
  }, [session, router]);

  useEffect(() => {
    async function loadImage() {
      try {
        const res = await fetch('/api/unsplash');
        if (res.ok) {
          const data = await res.json();
          setBgImage(data.url);
        }
      } catch {
        // Fallback to gradient
      }
    }
    loadImage();
  }, []);

  return (
    <header className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-7xl">{title}</h1>
      <p className="mb-10 max-w-lg text-lg text-[var(--muted)]">{subtitle}</p>

      <button
        onClick={() => session ? router.push('/dashboard') : signIn(undefined, { callbackUrl: '/dashboard' })}
        className="mb-16 rounded-full bg-[var(--foreground)] px-10 py-4 text-base font-semibold text-[var(--background)] transition hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-[var(--foreground)] focus:ring-offset-2 focus:ring-offset-[var(--background)]"
        type="button"
      >
        {cta}
      </button>

      <ul className="flex flex-col gap-4 md:flex-row md:gap-6">
        {features.map((feature, i) => (
          <li
            key={i}
            className="rounded-xl border border-[var(--border)] bg-[var(--card-bg)] px-6 py-3 text-sm font-medium"
          >
            {feature}
          </li>
        ))}
      </ul>
    </header>
  );
}
