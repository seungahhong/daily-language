import Groq from 'groq-sdk';
import { z } from 'zod';

function getGroqClient() {
  return new Groq({
    apiKey: process.env.GROQ_API_KEY!,
  });
}

const ConversationSchema = z.object({
  situation: z.string(),
  original: z.string(),
  translation: z.object({
    ko: z.string(),
    en: z.string(),
    ja: z.string(),
    zh: z.string(),
    de: z.string(),
  }),
  pronunciation: z.string().optional(),
  keywords: z.array(z.string()),
});

const ConversationsResponseSchema = z.object({
  conversations: z.array(ConversationSchema),
});

export type GeneratedConversation = z.infer<typeof ConversationSchema>;

const DIFFICULTY_PROMPTS: Record<string, string> = {
  lowest:
    'Elementary level (grades 1-3): Use only 3-5 simple words. Basic greetings, numbers, and single words.',
  low: 'Elementary level (grades 4-6): Use 1-2 short sentences. Simple present tense only.',
  medium: 'Middle school level: Use 2-3 sentences. Include various tenses and common expressions.',
  high: 'High school level: Use 3-5 sentences. Include idiomatic expressions and complex grammar.',
};

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  ja: 'Japanese',
  zh: 'Chinese (Simplified)',
  de: 'German',
};

export async function generateConversations(
  language: string,
  difficulty: string,
  count: number = 3,
  maxRetries: number = 2,
): Promise<GeneratedConversation[]> {
  const langName = LANGUAGE_NAMES[language] || language;
  const difficultyPrompt = DIFFICULTY_PROMPTS[difficulty] || DIFFICULTY_PROMPTS.low;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const groq = getGroqClient();
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `You are a travel conversation generator. Generate exactly ${count} travel conversation phrases in ${langName}.

Difficulty: ${difficultyPrompt}

Travel situations include: hotel check-in, asking for directions, ordering food, shopping, taking transportation, at the airport, emergencies, sightseeing, etc.

Respond in JSON format:
{
  "conversations": [
    {
      "situation": "Brief situation description in English",
      "original": "The phrase in ${langName}",
      "translation": {
        "ko": "Korean translation",
        "en": "English translation",
        "ja": "Japanese translation",
        "zh": "Chinese Simplified translation",
        "de": "German translation"
      },
      "pronunciation": "Romanized pronunciation guide for the original phrase",
      "keywords": ["key", "words", "from", "the", "phrase"]
    }
  ]
}`,
          },
          {
            role: 'user',
            content: `Generate ${count} unique travel conversation phrases in ${langName} at ${difficulty} difficulty level. Each should be for a different travel situation.`,
          },
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.8,
        max_tokens: 2048,
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) throw new Error('Empty response from Groq');

      const parsed = JSON.parse(content);
      const validated = ConversationsResponseSchema.parse(parsed);
      return validated.conversations;
    } catch (error) {
      if (attempt === maxRetries) {
        throw new Error(
          `Failed to generate conversations after ${maxRetries + 1} attempts: ${error}`,
        );
      }
    }
  }

  return [];
}
