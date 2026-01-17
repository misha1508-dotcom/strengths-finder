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
  summary: string;
  feathers: string[];
  feathersStructured?: {
    moment: string[];
    mindset: string[];
    regular: string[];
  };
  uniqueActions: string[];
  activities: string[];
  // New structured activities data
  sortedWeakQualities?: string[];
  sortedStrongQualities?: string[];
  roles?: { role: string; type: string; income: string }[];
  money?: { opportunity: string; probability: number }[];
  hobbies?: string[];
  celebrities?: string[];
}

export type AppStep = 'intro' | 'input' | 'processing' | 'results';
