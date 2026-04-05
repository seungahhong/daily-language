import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { conversationId, type } = await request.json();

  if (!conversationId || !['speaking', 'quiz'].includes(type)) {
    return NextResponse.json(
      { error: 'Invalid request', code: 'BAD_REQUEST' },
      { status: 400 },
    );
  }

  const practice = await prisma.practice.upsert({
    where: {
      userId_conversationId: {
        userId: session.user.id,
        conversationId,
      },
    },
    update: {
      ...(type === 'speaking' && { speakingCount: { increment: 1 } }),
      ...(type === 'quiz' && { quizCount: { increment: 1 } }),
    },
    create: {
      userId: session.user.id,
      conversationId,
      speakingCount: type === 'speaking' ? 1 : 0,
      quizCount: type === 'quiz' ? 1 : 0,
    },
  });

  // Auto-complete: (speaking >= 3 AND quiz >= 2) OR (quiz-only mode: quiz >= 5)
  const completedNormal = practice.speakingCount >= 3 && practice.quizCount >= 2;
  const completedQuizOnly = practice.quizCount >= 5;
  if ((completedNormal || completedQuizOnly) && !practice.isCompleted) {
    const updated = await prisma.practice.update({
      where: { id: practice.id },
      data: { isCompleted: true, completedAt: new Date() },
    });
    return NextResponse.json({ practice: updated });
  }

  return NextResponse.json({ practice });
}
