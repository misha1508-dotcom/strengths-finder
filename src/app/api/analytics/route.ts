import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsEvent, SessionAnalytics, AggregatedAnalytics } from '@/types/analytics';
import { sendTelegramNotification } from '@/lib/telegram';
import { calculateMedian } from '@/lib/analytics';
import { promises as fs } from 'fs';
import path from 'path';

const ANALYTICS_FILE = path.join(process.cwd(), 'analytics-data.json');

interface AnalyticsData {
  sessions: Record<string, SessionAnalytics>;
  lastUpdated: number;
}

async function loadAnalyticsData(): Promise<AnalyticsData> {
  try {
    const data = await fs.readFile(ANALYTICS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { sessions: {}, lastUpdated: Date.now() };
  }
}

async function saveAnalyticsData(data: AnalyticsData): Promise<void> {
  await fs.writeFile(ANALYTICS_FILE, JSON.stringify(data, null, 2));
}

function calculateAggregatedStats(data: AnalyticsData): AggregatedAnalytics {
  const sessions = Object.values(data.sessions);
  const uniqueVisitors = new Set(sessions.map(s => s.sessionId)).size;

  const funnel = {
    pageViews: 0,
    startedSituation: 0,
    savedSituation: 0,
    completedAnalysis: 0,
    clickedFeathers: 0,
    clickedActivities: 0,
    clickedCopy: 0,
    clickedTelegram: 0,
  };

  const situationCounts: number[] = [];
  const situationLengths: number[] = [];

  sessions.forEach(session => {
    session.events.forEach(event => {
      switch (event.eventType) {
        case 'page_view':
          funnel.pageViews++;
          break;
        case 'situation_started':
          funnel.startedSituation++;
          break;
        case 'situation_saved':
          funnel.savedSituation++;
          if (event.data?.situationLength) {
            situationLengths.push(event.data.situationLength);
          }
          break;
        case 'analysis_completed':
          funnel.completedAnalysis++;
          break;
        case 'feathers_clicked':
          funnel.clickedFeathers++;
          break;
        case 'activities_clicked':
          funnel.clickedActivities++;
          break;
        case 'copy_clicked':
          funnel.clickedCopy++;
          break;
        case 'telegram_clicked':
          funnel.clickedTelegram++;
          break;
      }
    });

    if (session.situations.count > 0) {
      situationCounts.push(session.situations.count);
    }
  });

  return {
    totalSessions: sessions.length,
    uniqueVisitors,
    conversionFunnel: funnel,
    medianSituationsPerUser: calculateMedian(situationCounts),
    medianSituationLength: calculateMedian(situationLengths),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event } = body as { event: AnalyticsEvent };

    if (!event || !event.sessionId) {
      return NextResponse.json({ error: 'Invalid event data' }, { status: 400 });
    }

    const data = await loadAnalyticsData();

    // Initialize session if not exists
    if (!data.sessions[event.sessionId]) {
      data.sessions[event.sessionId] = {
        sessionId: event.sessionId,
        startTime: event.timestamp,
        events: [],
        situations: {
          count: 0,
          lengths: [],
        },
        completedAnalysis: false,
      };
    }

    const session = data.sessions[event.sessionId];
    session.events.push(event);

    // Update session data based on event
    if (event.eventType === 'situation_saved' && event.data?.situationLength) {
      session.situations.lengths.push(event.data.situationLength);
      session.situations.count = Math.max(
        session.situations.count,
        (event.data.situationIndex || 0) + 1
      );
    }

    if (event.eventType === 'analysis_completed') {
      session.completedAnalysis = true;

      // Send Telegram notification about new analysis
      await sendTelegramNotification({
        type: 'new_analysis',
        data: {
          situationsCount: session.situations.count,
          sessionId: event.sessionId,
          timestamp: event.timestamp,
        },
      });
    }

    data.lastUpdated = Date.now();
    await saveAnalyticsData(data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to process analytics' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secretKey = searchParams.get('key');

    // Simple authentication
    if (secretKey !== process.env.ANALYTICS_SECRET_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await loadAnalyticsData();
    const aggregated = calculateAggregatedStats(data);

    return NextResponse.json({
      aggregated,
      sessions: Object.values(data.sessions),
      lastUpdated: data.lastUpdated,
    });
  } catch (error) {
    console.error('Analytics retrieval error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve analytics' },
      { status: 500 }
    );
  }
}
