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
    stopCrane: string[];
    mantra: string[];
    ritual: string[];
  };
  activities: string[];
  // Structured activities data
  sortedWeakQualities?: string[];
  sortedStrongQualities?: string[];
  roles?: { role: string; type: string; whyComfortable: string }[];
  capitalizeAdvice?: { advice: string; explanation: string }[];
  hobbies?: string[];
  celebrities?: { name: string; description: string; imageQuery: string }[] | string[];
}

export type AppStep = 'intro' | 'input' | 'processing' | 'results';
