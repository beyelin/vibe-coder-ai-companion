
export enum Author {
  USER = 'user',
  BOT = 'bot',
  COMPANION = 'companion',
}

export interface Message {
  author: Author;
  content: string;
  avatar: string;
}

export enum CompanionState {
  IDLE = 'idle',
  THINKING = 'thinking',
  WORKING = 'working',
  HAPPY = 'happy',
}

export type ActiveTab = 'code' | 'preview' | 'humor';

// 情商助手相关类型定义
export interface SmartReplyRequest {
  input: string;
  context?: string;
  style?: 'humorous' | 'witty' | 'diplomatic';
}

export interface SmartReplyResponse {
  success: boolean;
  responses: string[];
  confidence: number;
}

export interface WorkplaceReplyRequest {
  input: string;
  scenario: 'meeting' | 'deadline' | 'feedback' | 'request';
  tone?: 'diplomatic' | 'humorous' | 'professional';
}

export interface DailyQuote {
  id: string;
  content: string;
  category: string;
  date: string;
}

export interface PhraseItem {
  id: string;
  category: string;
  content: string;
  tags: string[];
  usageCount: number;
}

export type PhraseCategory = '赞美型' | '打圆场' | '自黑型' | '委婉拒绝' | '幽默化解';

export type HumorTab = 'smart-reply' | 'workplace' | 'daily-quote' | 'phrase-library';

export interface UserPreferences {
  preferredStyle: 'humorous' | 'witty' | 'diplomatic';
  favoriteResponses: string[];
  lastUsed: string;
}
