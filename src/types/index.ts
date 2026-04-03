import type { Conversation, Practice, UserSettings } from '@prisma/client';

export type ConversationWithPractice = Conversation & {
  practices: Practice[];
};

export type Locale = 'ko' | 'en' | 'ja' | 'zh' | 'de';

export type Difficulty = 'lowest' | 'low' | 'medium' | 'high';

export type LearningLanguage = 'en' | 'ja' | 'zh' | 'de';

export type PracticeType = 'speaking' | 'quiz';

export interface StatisticsData {
  weekly: { date: string; completed: number; total: number }[];
  monthly: { date: string; completed: number; total: number }[];
  byLanguage: { language: string; completed: number; total: number }[];
  streak: number;
  totalDays: number;
  completionRate: number;
}

export type { Conversation, Practice, UserSettings };
