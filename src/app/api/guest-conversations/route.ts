import { NextRequest, NextResponse } from 'next/server';
import { generateConversations } from '@/lib/groq';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get('language') || 'en';
  const difficulty = searchParams.get('difficulty') || 'low';

  const validLanguages = ['en', 'ja', 'zh', 'de'];
  const validDifficulties = ['lowest', 'low', 'medium', 'high'];

  if (!validLanguages.includes(language) || !validDifficulties.includes(difficulty)) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  }

  try {
    const conversations = await generateConversations(language, difficulty, 3);
    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Guest conversation error:', error);
    return NextResponse.json({ error: 'Failed to generate conversations' }, { status: 500 });
  }
}
