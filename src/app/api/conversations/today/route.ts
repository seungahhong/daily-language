import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
  }

  const language = request.nextUrl.searchParams.get('language');

  const settings = await prisma.userSettings.findUnique({
    where: { userId: session.user.id },
  });

  if (!settings) {
    return NextResponse.json({ conversations: [] });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const conversations = await prisma.conversation.findMany({
    where: {
      date: today,
      language: language || { in: settings.learningLanguages },
      difficulty: settings.difficulty,
    },
    include: {
      practices: {
        where: { userId: session.user.id },
      },
    },
    take: 3,
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({ conversations });
}
