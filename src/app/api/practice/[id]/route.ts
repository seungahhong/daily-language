import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 });
  }

  const { id } = await params;
  const { isCompleted } = await request.json();

  const practice = await prisma.practice.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!practice) {
    return NextResponse.json(
      { error: 'Practice not found', code: 'NOT_FOUND' },
      { status: 404 },
    );
  }

  const updated = await prisma.practice.update({
    where: { id },
    data: {
      isCompleted,
      completedAt: isCompleted ? new Date() : null,
    },
  });

  return NextResponse.json({ practice: updated });
}
