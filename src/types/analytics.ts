export interface AnalyticsEvent {
  eventType:
    | 'page_view'
    | 'situation_started'
    | 'situation_saved'
    | 'analysis_started'
    | 'analysis_completed'
    | 'feathers_clicked'
    | 'activities_clicked'
    | 'copy_clicked'
    | 'telegram_clicked';
  timestamp: number;
  sessionId: string;
  data?: {
    situationIndex?: number;
    situationLength?: number;
    situationsCount?: number;
  };
}

export interface SessionAnalytics {
  sessionId: string;
  startTime: number;
  events: AnalyticsEvent[];
  situations: {
    count: number;
    lengths: number[];
    medianLength?: number;
  };
  completedAnalysis: boolean;
}

export interface AggregatedAnalytics {
  totalSessions: number;
  uniqueVisitors: number;
  conversionFunnel: {
    pageViews: number;
    startedSituation: number;
    savedSituation: number;
    completedAnalysis: number;
    clickedFeathers: number;
    clickedActivities: number;
    clickedCopy: number;
    clickedTelegram: number;
  };
  medianSituationsPerUser: number;
  medianSituationLength: number;
}
