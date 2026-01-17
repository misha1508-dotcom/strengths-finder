export interface Situation {
  id: number;
  text: string;
  analysis?: SituationAnalysis;
}

export interface Quality {
  name: string;
  category: 'emotional' | 'behavioral' | 'cognitive' | 'willpower';
  isNegative: boolean;
}

export interface SituationAnalysis {
  shortDescription: string;
  qualities: Quality[];
  duals: {
    quality: string;
    positive: string;
    explanation: string;
  }[];
}

export interface QualityRating {
  quality: string;
  count: number;
  category: string;
}

export interface FeatherInsight {
  // Legacy fields (kept for backwards compatibility)
  summary: string;
  feathers: string[];
  activities: string[];
  // Structured feathers data
  feathersStructured?: {
    moment: string[];
    mindset: string[];
    regular: string[];
  };
  uniqueActions?: string[];
  // Structured activities data
  sortedWeakQualities?: string[];
  sortedStrongQualities?: string[];
  roles?: { role: string; type: string; whyComfortable: string }[];
  capitalizeAdvice?: { advice: string; explanation: string }[];
  hobbies?: string[];
  celebrities?: string[];
}

export type AppStep = 'intro' | 'input' | 'processing' | 'results';
