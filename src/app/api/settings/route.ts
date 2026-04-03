import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
  }

  const settings = await prisma.userSettings.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json({ settings });
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
  }

  const body = await request.json();
  const { learningLanguages, uiLanguage, difficulty, darkMode, onboardingCompleted } = body;

  const settings = await prisma.userSettings.upsert({
    where: { userId: session.user.id },
    update: {
      ...(learningLanguages !== undefined && { learningLanguages }),
      ...(uiLanguage !== undefined && { uiLanguage }),
      ...(difficulty !== undefined && { difficulty }),
      ...(darkMode !== undefined && { darkMode }),
      ...(onboardingCompleted !== undefined && { onboardingCompleted }),
    },
    create: {
      userId: session.user.id,
      learningLanguages: learningLanguages || [],
      uiLanguage: uiLanguage || 'ko',
      difficulty: difficulty || 'low',
      darkMode: darkMode || false,
      onboardingCompleted: onboardingCompleted || false,
    },
  });

  return NextResponse.json({ settings });
}
