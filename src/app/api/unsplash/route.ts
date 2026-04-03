import { NextResponse } from 'next/server';
import { getRandomTravelPhoto } from '@/lib/unsplash';

export async function GET() {
  const photo = await getRandomTravelPhoto();

  if (!photo) {
    return NextResponse.json({ url: '', attribution: '' });
  }

  return NextResponse.json({
    url: photo.urls.regular,
    attribution: `Photo by ${photo.user.name} on Unsplash`,
    attributionUrl: photo.user.links.html,
  });
}
