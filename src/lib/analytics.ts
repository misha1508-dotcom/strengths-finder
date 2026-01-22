import { AnalyticsEvent } from '@/types/analytics';

const ANALYTICS_STORAGE_KEY = 'inversion_analytics_session';

// Generate or retrieve session ID
export function getSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = sessionStorage.getItem(ANALYTICS_STORAGE_KEY);
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    sessionStorage.setItem(ANALYTICS_STORAGE_KEY, sessionId);
  }
  return sessionId;
}

// Track event
export async function trackEvent(
  eventType: AnalyticsEvent['eventType'],
  data?: AnalyticsEvent['data']
): Promise<void> {
  try {
    const event: AnalyticsEvent = {
      eventType,
      timestamp: Date.now(),
      sessionId: getSessionId(),
      data,
    };

    // Send to backend
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event }),
    });
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

// Calculate median
export function calculateMedian(numbers: number[]): number {
  if (numbers.length === 0) return 0;

  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}
