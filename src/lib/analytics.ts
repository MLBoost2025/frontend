export interface AnalyticsEvent {
  name: string;
  payload?: Record<string, unknown>;
  timestamp?: string;
}

const ANALYTICS_ENDPOINT = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT;

function enrichEvent(event: AnalyticsEvent): AnalyticsEvent {
  return {
    ...event,
    timestamp: event.timestamp ?? new Date().toISOString(),
  };
}

export async function trackEvent(event: AnalyticsEvent): Promise<void> {
  const enriched = enrichEvent(event);

  if (typeof window !== "undefined") {
    let parsed: AnalyticsEvent[] = [];
    try {
      const history = window.localStorage.getItem("katalume.analytics.events");
      if (history) {
        const decoded = JSON.parse(history);
        if (Array.isArray(decoded)) {
          parsed = decoded as AnalyticsEvent[];
        }
      }
    } catch {
      // Corrupt analytics history — start fresh rather than throwing.
      parsed = [];
    }
    parsed.unshift(enriched);
    try {
      window.localStorage.setItem(
        "katalume.analytics.events",
        JSON.stringify(parsed.slice(0, 150))
      );
    } catch {
      // Storage full or unavailable — ignore.
    }
  }

  if (!ANALYTICS_ENDPOINT) {
    return;
  }

  try {
    await fetch(ANALYTICS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(enriched),
      keepalive: true,
    });
  } catch {
    // No-op for analytics failures.
  }
}
