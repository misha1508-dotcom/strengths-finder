export interface Situation {
  id: number;
  text: string;
  analysis?: SituationAnalysis;
}

export interface SituationAnalysis {
  shortDescription: string;
  negativeQuality: string;
  positiveQuality: string;
  explanation: string;
}

export interface FeatherInsight {
  summary: string;
  microHabits: string[];
  suitableRoles: string[];
  finalMessage: string;
}

export type AppStep = 'intro' | 'input' | 'processing' | 'results';
