const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

interface UnsplashPhoto {
  urls: {
    regular: string;
    small: string;
  };
  alt_description: string | null;
  user: {
    name: string;
    links: {
      html: string;
    };
  };
}

export async function getRandomTravelPhoto(): Promise<UnsplashPhoto | null> {
  if (!UNSPLASH_ACCESS_KEY) return null;

  try {
    const response = await fetch(
      `https://api.unsplash.com/photos/random?query=travel+landscape&orientation=landscape&client_id=${UNSPLASH_ACCESS_KEY}`,
      { next: { revalidate: 86400 } },
    );

    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}
