'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useRouter } from '@/i18n/routing';

interface SettingsFormProps {
  initialSettings: {
    learningLanguages: string[];
    uiLanguage: string;
    difficulty: string;
    darkMode: boolean;
  };
  isOnboarding: boolean;
}

const LEARNING_LANGUAGES = ['en', 'ja', 'zh', 'de'] as const;
const DIFFICULTIES = ['lowest', 'low', 'medium', 'high'] as const;

export default function SettingsForm({ initialSettings, isOnboarding }: SettingsFormProps) {
  const t = useTranslations('settings');
  const tCommon = useTranslations('common');
  const { setTheme } = useTheme();
  const router = useRouter();

  const [learningLanguages, setLearningLanguages] = useState<string[]>(
    initialSettings.learningLanguages,
  );
  const [difficulty, setDifficulty] = useState(initialSettings.difficulty);
  const [darkMode, setDarkMode] = useState(initialSettings.darkMode);
  const [saving, setSaving] = useState(false);

  const toggleLanguage = (lang: string) => {
    setLearningLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang],
    );
  };

  const handleSave = async () => {
    if (learningLanguages.length === 0) return;

    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learningLanguages,
          difficulty,
          darkMode,
          onboardingCompleted: true,
        }),
      });

      if (res.ok) {
        setTheme(darkMode ? 'dark' : 'light');
        router.push('/dashboard');
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSave();
      }}
      className="space-y-8"
    >
      <fieldset>
        <legend className="mb-3 text-lg font-semibold">{t('learningLanguages')}</legend>
        <div className="flex flex-wrap gap-3">
          {LEARNING_LANGUAGES.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => toggleLanguage(lang)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                learningLanguages.includes(lang)
                  ? 'border-primary bg-primary text-white'
                  : 'border-[var(--border)] bg-[var(--card-bg)] hover:border-primary'
              }`}
              aria-pressed={learningLanguages.includes(lang)}
            >
              {t(`languages.${lang}`)}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-lg font-semibold">{t('difficulty')}</legend>
        <div className="flex flex-col gap-2">
          {DIFFICULTIES.map((diff) => (
            <label
              key={diff}
              className={`flex cursor-pointer items-center rounded-lg border px-4 py-3 transition ${
                difficulty === diff
                  ? 'border-primary bg-primary/5'
                  : 'border-[var(--border)] bg-[var(--card-bg)] hover:border-primary'
              }`}
            >
              <input
                type="radio"
                name="difficulty"
                value={diff}
                checked={difficulty === diff}
                onChange={() => setDifficulty(diff)}
                className="mr-3"
              />
              <span className="text-sm font-medium">{t(`difficultyLevels.${diff}`)}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-lg font-semibold">{t('darkMode')}</legend>
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={darkMode}
            onChange={(e) => setDarkMode(e.target.checked)}
            className="h-5 w-5 rounded"
          />
          <span className="text-sm">{t('darkMode')}</span>
        </label>
      </fieldset>

      <button
        type="submit"
        disabled={saving || learningLanguages.length === 0}
        className="w-full rounded-lg bg-primary px-6 py-3 text-base font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-disabled={saving || learningLanguages.length === 0}
        aria-busy={saving}
      >
        {saving
          ? tCommon('loading')
          : isOnboarding
            ? t('onboarding.startLearning')
            : tCommon('save')}
      </button>

      {learningLanguages.length === 0 && (
        <p className="text-sm text-danger" role="alert">
          {t('selectAtLeastOneLanguage')}
        </p>
      )}
    </form>
  );
}
