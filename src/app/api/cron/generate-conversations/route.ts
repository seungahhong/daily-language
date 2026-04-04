import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateConversations } from '@/lib/groq';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Get distinct active language/difficulty combinations
  const activeSettings = await prisma.userSettings.findMany({
    where: { onboardingCompleted: true },
    select: { learningLanguages: true, difficulty: true },
  });

  const combinations = new Set<string>();
  for (const setting of activeSettings) {
    for (const lang of setting.learningLanguages) {
      combinations.add(`${lang}:${setting.difficulty}`);
    }
  }

  let generated = 0;

  // Process up to 4 combinations to stay within 10s timeout
  const combArray = Array.from(combinations).slice(0, 4);

  const results = await Promise.allSettled(
    combArray.map(async (combo) => {
      const [language, difficulty] = combo.split(':');

      // Check if already generated today
      const existing = await prisma.conversation.count({
        where: { date: today, language, difficulty },
      });

      if (existing >= 3) return 0;

      const conversations = await generateConversations(language, difficulty, 3);

      await prisma.conversation.createMany({
        data: conversations.map((conv) => ({
          date: today,
          language,
          difficulty,
          situation: conv.situation,
          situationTranslation: conv.situationTranslation,
          original: conv.original,
          translation: conv.translation,
          explanation: JSON.parse(JSON.stringify(conv.explanation)),
          grammarNote: conv.grammarNote,
          pronunciation: conv.pronunciation || null,
          keywords: conv.keywords,
        })),
      });

      return conversations.length;
    }),
  );

  for (const result of results) {
    if (result.status === 'fulfilled') {
      generated += result.value;
    }
  }

  return NextResponse.json({ generated, combinations: combArray.length });
}
