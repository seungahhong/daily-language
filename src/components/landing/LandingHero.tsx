'use client';

import { useSession } from 'next-auth/react';
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
    <header
      className="relative flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{
        backgroundImage: bgImage
          ? `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${bgImage})`
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">{title}</h1>
      <p className="mb-8 max-w-md text-lg text-white/90">{subtitle}</p>

      <button
        onClick={() => router.push('/dashboard')}
        className="mb-12 rounded-full bg-white px-8 py-3 text-lg font-semibold text-gray-900 shadow-lg transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
        type="button"
      >
        {cta}
      </button>

      <ul className="flex flex-col gap-4 md:flex-row md:gap-8">
        {features.map((feature, i) => (
          <li
            key={i}
            className="rounded-xl bg-white/20 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm"
          >
            {feature}
          </li>
        ))}
      </ul>
    </header>
  );
}
