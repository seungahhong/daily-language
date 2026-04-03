import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
  }

  const userId = session.user.id;

  // Get all practices for this user
  const practices = await prisma.practice.findMany({
    where: { userId },
    include: { conversation: true },
    orderBy: { conversation: { date: 'desc' } },
  });

  // Weekly data (last 7 days)
  const weekly = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    const dateStr = date.toISOString().split('T')[0];

    const dayPractices = practices.filter((p) => {
      const pDate = new Date(p.conversation.date);
      pDate.setHours(0, 0, 0, 0);
      return pDate.getTime() === date.getTime();
    });

    weekly.push({
      date: dateStr,
      completed: dayPractices.filter((p) => p.isCompleted).length,
      total: dayPractices.length,
    });
  }

  // Monthly data (last 30 days, grouped by week)
  const monthly = [];
  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() - i * 7);

    const weekPractices = practices.filter((p) => {
      const pDate = new Date(p.conversation.date);
      return pDate >= weekStart && pDate < weekEnd;
    });

    monthly.push({
      date: `Week ${4 - i}`,
      completed: weekPractices.filter((p) => p.isCompleted).length,
      total: weekPractices.length,
    });
  }

  // By language
  const languageMap = new Map<string, { completed: number; total: number }>();
  for (const p of practices) {
    const lang = p.conversation.language;
    const current = languageMap.get(lang) || { completed: 0, total: 0 };
    current.total++;
    if (p.isCompleted) current.completed++;
    languageMap.set(lang, current);
  }

  const byLanguage = Array.from(languageMap.entries()).map(([language, data]) => ({
    language,
    ...data,
  }));

  // Streak calculation
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    checkDate.setHours(0, 0, 0, 0);

    const hasCompleted = practices.some((p) => {
      const pDate = new Date(p.conversation.date);
      pDate.setHours(0, 0, 0, 0);
      return pDate.getTime() === checkDate.getTime() && p.isCompleted;
    });

    if (hasCompleted) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  // Total unique days with practices
  const uniqueDays = new Set(
    practices.map((p) => new Date(p.conversation.date).toISOString().split('T')[0]),
  );

  const completedCount = practices.filter((p) => p.isCompleted).length;
  const completionRate = practices.length > 0 ? Math.round((completedCount / practices.length) * 100) : 0;

  return NextResponse.json({
    weekly,
    monthly,
    byLanguage,
    streak,
    totalDays: uniqueDays.size,
    completionRate,
  });
}
